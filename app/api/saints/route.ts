// API Next.js pour fusionner les données du saint du jour depuis Nominis et catholic.org
import { NextResponse } from 'next/server';
import { getSaintOfTheDayNominis } from '../../../scripts/scrape-saint-of-day-nominis.js';
import { getSaintOfTheDay } from '../../../scripts/scrape-saint-of-day.js';

export async function GET() {
  try {
    const [nominis, catholic] = await Promise.all([
      getSaintOfTheDayNominis(),
      getSaintOfTheDay()
    ]);
    return NextResponse.json({
      sources: [
        { source: 'Nominis', ...nominis },
        { source: 'Catholic.org', ...catholic }
      ]
    });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de la fusion des sources', details: e?.message }, { status: 500 });
  }
}
