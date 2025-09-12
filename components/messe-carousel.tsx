import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ReadingCard } from "./reading-card"

import type { AelfReading } from "@/lib/api"

interface Messe {
  id: string
  nom: string
  lectures: Array<AelfReading & {
    id?: string
    type?: string
  }>
}

interface MesseCarouselProps {
  messes: Messe[]
}

export function MesseCarousel({ messes }: MesseCarouselProps) {
  const [messeIndex, setMesseIndex] = useState(0)
  const currentMesse = messes[messeIndex]

  const goPrev = () => setMesseIndex((i) => (i > 0 ? i - 1 : messes.length - 1))
  const goNext = () => setMesseIndex((i) => (i < messes.length - 1 ? i + 1 : 0))

  // État pour afficher le commentaire ou la prière universelle
  const [showComment, setShowComment] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [localNews, setLocalNews] = useState<string | null>(null);

  // Récupération de la géolocalisation au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

  // Simuler l'actualité locale (à remplacer par un vrai appel API)
  useEffect(() => {
    if (location) {
      setLocalNews(`Actualité locale pour lat: ${location.lat.toFixed(2)}, lon: ${location.lon.toFixed(2)}`);
    }
  }, [location]);

  // Simuler un commentaire bref et une prière universelle contextualisés
  const commentaireBref = `Résumé des lectures du jour : Dieu nous invite à l'amour fraternel et à la confiance, même dans l'épreuve. (Exemple, à contextualiser selon la localisation)`;
  const priereUniverselle = `Seigneur, nous te prions pour notre communauté locale, pour la paix et la solidarité dans notre région. (Exemple, à contextualiser selon la localisation)`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
          onClick={goPrev}
          aria-label="Messe précédente"
        >
          <ChevronLeft className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </button>
        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
          {currentMesse.nom}
        </div>
        <button
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
          onClick={goNext}
          aria-label="Messe suivante"
        >
          <ChevronRight className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </button>
      </div>
      <div className="w-full flex justify-center">
        {/* Carousel horizontal des lectures de la messe courante */}
        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {currentMesse.lectures.map((lecture, idx) => {
            return (
              <div key={lecture.id || idx} className="min-w-[340px] max-w-[480px]">
                <ReadingCard reading={lecture} />
                {/* On affiche les boutons après la dernière lecture de type évangile, ou à la fin si aucune n'est trouvée */}
                {(() => {
                  const isLastEvangile =
                    lecture.type === 'evangile' &&
                    currentMesse.lectures.findLastIndex?.(l => l.type === 'evangile') === idx;
                  const isLastLecture = idx === currentMesse.lectures.length - 1;
                  if (isLastEvangile || (!currentMesse.lectures.some(l => l.type === 'evangile') && isLastLecture)) {
                    return (
                      <>
                        <div className="flex gap-4 mt-6">
                          <button
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                            onClick={() => { setShowComment((v) => !v); setShowPrayer(false); }}
                          >
                            Commentaire
                          </button>
                          <button
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                            onClick={() => { setShowPrayer((v) => !v); setShowComment(false); }}
                          >
                            Prière universelle
                          </button>
                        </div>
                        {/* Bloc d'affichage contextuel */}
                        {showComment && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded shadow max-w-xl text-blue-900 dark:text-blue-100">
                            <strong>Commentaire bref :</strong>
                            <div className="mt-2">{commentaireBref}</div>
                            {localNews && <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">{localNews}</div>}
                          </div>
                        )}
                        {showPrayer && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded shadow max-w-xl text-green-900 dark:text-green-100">
                            <strong>Prière universelle :</strong>
                            <div className="mt-2">{priereUniverselle}</div>
                            {localNews && <div className="mt-2 text-xs text-green-700 dark:text-green-300">{localNews}</div>}
                          </div>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

// CSS pour masquer la scrollbar
// .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
// .hide-scrollbar::-webkit-scrollbar { display: none; }
