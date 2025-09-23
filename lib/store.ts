import { promises as fs } from 'fs';
import path from 'path';
import { Session, BusinessConfig } from '@/types';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS = path.join(DATA_DIR, 'sessions.json');
const HOSTCODES = path.join(DATA_DIR, 'hostcodes.json');
const RANDOMS = path.join(DATA_DIR, 'randomVideos.json');

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(SESSIONS); } catch { await fs.writeFile(SESSIONS, '[]', 'utf8'); }
  try { await fs.access(HOSTCODES); } catch {
    // Example hostcodes for local testing; edit to your real codes
    const examples: BusinessConfig[] = [
      { hostcode: '919190', businessName: 'Scret Lounge', slogan: 'Let’s Have Some Fun', flyerUrl: '/flyers/default.jpg' },
      { hostcode: '777777', businessName: 'BoatHouse Cafe', slogan: 'Da BoatHouse Cafe', flyerUrl: '/flyers/boathouse.jpg' },
    ];
    await fs.writeFile(HOSTCODES, JSON.stringify(examples, null, 2), 'utf8');
  }
  try { await fs.access(RANDOMS); } catch {
    // ~25 safe YouTube IDs (music videos/instrumentals as examples – replace with your licensed list)
    const ids = [
      'dQw4w9WgXcQ','hTWKbfoikeg','fJ9rUzIMcZQ','ktvTqknDobU','Zi_XLOBDo_Y',
      '3JZ4pnNtyxQ','kXYiU_JCYtU','CevxZvSJLk8','09R8_2nJtjg','RubBzkZzpUA',
      'QDYfEBY9NM4','ioNng23DkIM','JwYX52BP2Sk','oRdxUFDoQe0','ktvTqknDobU',
      'Eo-KmOd3i7s','pXRviuL6vMY','2Vv-BfVoq4g','YykjpeuMNEk','hLQl3WQQoQ0',
      'kxopViU98Xo','Cwkej79U3ek','4NRXx6U8ABQ','09R8_2nJtjg','fLexgOxsZu0'
    ];
    await fs.writeFile(RANDOMS, JSON.stringify(ids, null, 2), 'utf8');
  }
}

export async function readJson<T>(file: string): Promise<T> {
  await ensureFiles();
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    // This project stores arrays in JSON files; fail-safe to [] if corrupted or wrong shape.
    // This prevents errors like "sessions.find is not a function".
    if (Array.isArray(parsed)) return parsed as T;
    return [] as unknown as T;
  } catch {
    // On parse or read error, return empty array fallback
    return [] as unknown as T;
  }
}

export async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureFiles();
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

export async function getHostcodes(): Promise<BusinessConfig[]> {
  return readJson<BusinessConfig[]>(HOSTCODES);
}

export async function getRandomIds(): Promise<string[]> {
  return readJson<string[]>(RANDOMS);
}

export async function allSessions(): Promise<Session[]> {
  return readJson<Session[]>(SESSIONS);
}

export async function saveSessions(list: Session[]): Promise<void> {
  await writeJson(SESSIONS, list);
}

export function uuid() {
  return crypto.randomUUID();
}

// Legacy compatibility for modules importing default `store` with disk helpers.
// These are no-ops so they don't interfere with the array-based JSON files used elsewhere.
export default {
  loadSessionsFromDisk(): Record<string, unknown> { return {}; },
  saveSessionsToDisk(_data: Record<string, unknown>): void { /* noop */ },
};
