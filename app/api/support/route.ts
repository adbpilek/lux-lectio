// API Next.js pour gérer les messages de soutien/contact (persistance JSON, endpoints puissants)
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
const SUPPORT_PATH = 'data/support.json';

async function readSupport() {
  try {
    const data = await fs.readFile(SUPPORT_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSupport(messages) {
  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(SUPPORT_PATH, JSON.stringify(messages, null, 2), 'utf-8');
}

export async function GET() {
  const messages = await readSupport();
  return NextResponse.json(messages);
}

export async function POST(req) {
  const body = await req.json();
  const messages = await readSupport();
  const newMsg = { ...body, id: Date.now(), date: new Date().toISOString() };
  messages.unshift(newMsg);
  await writeSupport(messages);
  return NextResponse.json(newMsg);
}

export async function DELETE(req) {
  const { id } = await req.json();
  let messages = await readSupport();
  messages = messages.filter(m => m.id !== id);
  await writeSupport(messages);
  return NextResponse.json({ success: true });
}
