// API Next.js pour gérer les paramètres utilisateur (CRUD, persistance JSON)
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
const SETTINGS_PATH = 'data/settings.json';

async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeSettings(settings) {
  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function POST(req) {
  const body = await req.json();
  const settings = await readSettings();
  const updated = { ...settings, ...body };
  await writeSettings(updated);
  return NextResponse.json(updated);
}

export async function DELETE() {
  await writeSettings({});
  return NextResponse.json({ success: true });
}
