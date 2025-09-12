import { type NextRequest, NextResponse } from "next/server"

// Fonction utilitaire pour générer une réponse d'erreur
function errorResponse(message: string, status: number = 500) {
  console.error(message);
  return NextResponse.json(
    { error: true, message },
    { 
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      }
    }
  );
}

export const dynamic = 'force-dynamic'; // Désactive la mise en cache de la route

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }) {
  const { timeout = 5000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  console.log('--- [API /api/aelf] Route exécutée ---', new Date().toISOString());
  const { searchParams } = new URL(request.url)
  let date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const zone = searchParams.get("zone") || "france"

  // Fallback dates : [date, date-1, date+1, today]
  const today = new Date().toISOString().split("T")[0]
  const dateObj = new Date(date)
  const fallbackDates = [
    date,
    new Date(dateObj.getTime() - 86400000).toISOString().split("T")[0],
    new Date(dateObj.getTime() + 86400000).toISOString().split("T")[0],
    today
  ]

  let lastError = null;
  try {
    for (const tryDate of fallbackDates) {
      console.log(`📅 Requête lectures pour ${tryDate} (zone: ${zone})`)
      try {
        console.log(`Récupération des lectures AELF pour ${tryDate}`)
        const endpoints = [
          `https://api.aelf.org/v1/messes/${tryDate}/${zone}`,
          `https://api.aelf.org/v1/messes/${tryDate}`,
          `https://www.aelf.org/api/v1/messes/${tryDate}`
        ];
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Tentative avec ${endpoint}`);
            const response = await fetchWithTimeout(endpoint, {
              method: "GET",
              headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Origin": "https://www.aelf.org",
                "Referer": "https://www.aelf.org/",
              },
              cache: 'no-store',
              next: { revalidate: 3600 },
            })
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const responseText = await response.text();
            if (!responseText) {
              throw new Error('Réponse vide');
            }
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (e) {
              console.error('Erreur de parsing JSON:', e);
              throw new Error('Réponse invalide: ' + responseText.substring(0, 100));
            }
            if (!data || Object.keys(data).length === 0) {
              throw new Error('Données vides');
            }
            console.log('✅ Succès avec', endpoint);
            const normalizedData = {
              informations: {
                ...data.informations,
                date: data.informations?.date || tryDate,
                jour_liturgique_nom: data.informations?.jour_liturgique_nom || data.informations?.nom || "Jour liturgique",
                couleur: data.informations?.couleur || "vert",
                temps_liturgique: data.informations?.temps_liturgique || "ordinaire",
                semaine: data.informations?.semaine || "",
                fete: data.informations?.fete || data.informations?.ligne2 || "",
              },
              messes: data.messes || [],
              lectures: {} as { [key: string]: any },
            }
            if (normalizedData.messes?.length > 0) {
              normalizedData.messes.forEach((messe: any, messeIndex: number) => {
                if (messe.lectures) {
                  const lecturesByType: { [key: string]: any[] } = {}
                  messe.lectures.forEach((lecture: any, lectureIndex: number) => {
                    if (lecture.type) {
                      if (!lecturesByType[lecture.type]) {
                        lecturesByType[lecture.type] = []
                      }
                      lecturesByType[lecture.type].push({
                        type: lecture.type,
                        titre: lecture.titre || "",
                        contenu: lecture.contenu || "",
                        reference: lecture.reference || lecture.ref || "",
                        ref: lecture.ref || lecture.reference || "",
                        refrain_psalmique: lecture.refrain_psalmique || null,
                        verset_evangile: lecture.verset_evangile || null,
                        intro_lue: lecture.intro_lue || null,
                        ref_refrain: lecture.ref_refrain || null,
                        ref_verset: lecture.ref_verset || null,
                        messe_nom: messe.nom || `Messe ${messeIndex + 1}`,
                        messe_index: messeIndex,
                        lecture_index: lectureIndex,
                        version_index: lecturesByType[lecture.type].length,
                      })
                    }
                  })
                  Object.keys(lecturesByType).forEach(type => {
                    const lecturesOfType = lecturesByType[type]
                    if (lecturesOfType.length === 1) {
                      const lectureKey = normalizedData.messes.length > 1 
                        ? `${type}_messe${messeIndex}` 
                        : type
                      normalizedData.lectures[lectureKey] = lecturesOfType[0]
                    } else {
                      const lectureKey = normalizedData.messes.length > 1 
                        ? `${type}_messe${messeIndex}` 
                        : type
                      normalizedData.lectures[lectureKey] = {
                        type: type,
                        versions: lecturesOfType,
                        messe_nom: messe.nom || `Messe ${messeIndex + 1}`,
                        messe_index: messeIndex,
                        has_multiple_versions: true,
                      }
                    }
                  })
                }
              })
            }
            if (!normalizedData.messes?.length && !Object.keys(normalizedData.lectures || {}).length) {
              throw new Error('Aucune lecture disponible');
            }
            return NextResponse.json(normalizedData, {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
              },
            });
          } catch (error) {
            console.error(`❌ Échec avec ${endpoint}:`, error);
            lastError = error;
            continue;
          }
        }
      } catch (error) {
        console.error(`❌ Fallback sur la date ${tryDate} échoué:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Erreur inattendue dans la route /api/aelf:', error);
  }
  // Fallback unique à la fin
  console.log('⚠️ Aucune donnée AELF disponible, utilisation des données de fallback');
  return NextResponse.json({
    informations: {
      date: fallbackDates[0],
      jour_liturgique_nom: "Jour liturgique",
      couleur: "vert",
      temps_liturgique: "ordinaire",
      semaine: "",
      fete: "",
    },
    messes: [],
    lectures: {
      premiere_lecture: {
        type: "premiere_lecture",
        titre: "Première lecture",
        contenu: "Lecture non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 0,
        version_index: 1,
      },
      psaume: {
        type: "psaume",
        titre: "Psaume",
        contenu: "Psaume non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 1,
        version_index: 1,
      },
      deuxieme_lecture: {
        type: "deuxieme_lecture",
        titre: "Deuxième lecture",
        contenu: "Deuxième lecture non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 2,
        version_index: 1,
      },
      evangile: {
        type: "evangile",
        titre: "Évangile",
        contenu: "Évangile non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 3,
        version_index: 1,
      }
    }
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
  // Si aucun fallback n'a marché, retourner des données de base
  console.log('⚠️ Aucune donnée AELF disponible, utilisation des données de fallback');
  
  const fallbackData = {
    informations: {
      date: date,
      jour_liturgique_nom: "Jour liturgique",
      couleur: "vert",
      temps_liturgique: "ordinaire",
      semaine: "",
      fete: "",
    },
    messes: [],
    lectures: {
      premiere_lecture: {
        type: "premiere_lecture",
        titre: "Première lecture",
        contenu: "Lecture non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 0,
        version_index: 1,
      },
      psaume: {
        type: "psaume",
        titre: "Psaume",
        contenu: "Psaume non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 1,
        version_index: 1,
      },
      deuxieme_lecture: {
        type: "deuxieme_lecture",
        titre: "Deuxième lecture",
        contenu: "Deuxième lecture non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 2,
        version_index: 1,
      },
      evangile: {
        type: "evangile",
        titre: "Évangile",
        contenu: "Évangile non disponible pour cette date.",
        reference: "",
        ref: "",
        refrain_psalmique: null,
        verset_evangile: null,
        intro_lue: null,
        messe_nom: "Messe du jour",
        messe_index: 0,
        lecture_index: 3,
        version_index: 1,
      }
    }
  };

  return NextResponse.json(fallbackData, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

