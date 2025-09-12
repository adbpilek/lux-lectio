// API route Next.js pour exposer le saint du jour (scraping)
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  return new Promise((resolve) => {
    exec('node scripts/scrape-saint-of-day.js', { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Erreur scraping', details: stderr }, { status: 500 }));
        return;
      }
      try {
        const data = JSON.parse(stdout);
        resolve(NextResponse.json(data));
      } catch (e) {
        // stdout peut être un objet JS, pas du JSON
        try {
          // Essayer d'évaluer comme JS
          // eslint-disable-next-line no-eval
          const data = eval('(' + stdout + ')');
          resolve(NextResponse.json(data));
        } catch (e2) {
          resolve(NextResponse.json({ error: 'Erreur parsing', raw: stdout }, { status: 500 }));
        }
      }
    });
  });
}
