import { NextRequest, NextResponse } from 'next/server';

// Exemple de logique : retourne un commentaire et une prière universelle selon la date et la localisation
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const date = searchParams.get('date');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Ici, tu pourrais brancher une vraie API, une base de données, ou une logique métier
  // Pour la démo, on adapte le contenu selon la localisation
  let country = 'votre pays';
  if (lat && lon) {
    try {
      // Appel à l'API Nominatim pour reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`;
      const geoRes = await fetch(url, { headers: { 'User-Agent': 'lux-lectio/1.0' } });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        country = geoData.address?.country || country;
      }
    } catch (e) {
      // fallback
      country = 'votre pays';
    }
  }

  // Appel à une API d'actualités (exemple avec NewsAPI, nécessite une clé API)
  let news: string[] = [];
  try {
    const apiKey = process.env.NEWSAPI_KEY || '';
    if (apiKey && country && country !== 'votre pays') {
      // On tente de deviner le code pays (ex: France -> fr)
      const countryCode = country.toLowerCase().slice(0,2);
      const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=3&apiKey=${apiKey}`);
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        news = (newsData.articles || []).map((a: any) => a.title).filter(Boolean);
      }
    }
  } catch {}

  // Exemple de contenu dynamique plus riche
  const commentary = [
    `En ce ${date || 'jour'}, la Parole nous invite à la miséricorde et à la conversion.`,
    `Contexte géographique : ${country}.`,
  ];

  const prayer = [
    `Seigneur, nous te confions les habitants de ${country}, accorde-leur paix et espérance.`,
    `Pour les personnes isolées ou en difficulté dans ce pays, nous te prions.`,
    `Pour la paix dans le monde et dans nos familles, nous te prions.`
  ];

  return NextResponse.json({
    commentary,
    prayer,
    news,
  });
}
