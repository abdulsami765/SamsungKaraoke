import { NextResponse } from 'next/server';
import { allSessions, getRandomIds, saveSessions } from '@/lib/store';
import type { ApiEnvelope, VideoItem } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { sessionId } = body as { sessionId: string };
  const sessions = await allSessions();
  const s = sessions.find(x => x.sessionId === (sessionId || ''));
  if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });

  let next: VideoItem | null = null;
  if (s.queue.length) {
    next = s.queue.shift()!;
  }
  s.updatedAt = Date.now();
  await saveSessions(sessions);

  if (next) {
    return NextResponse.json<ApiEnvelope<{ source: 'queue'; item: VideoItem }>>({
      ok: true, data: { source: 'queue', item: next }
    });
  }

  const pool = await getRandomIds();
  const id = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.json<ApiEnvelope<{ source: 'random'; id: string }>>({
    ok: true, data: { source: 'random', id }
  });
}
