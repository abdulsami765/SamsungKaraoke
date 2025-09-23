import { NextResponse } from 'next/server';
import { allSessions, saveSessions } from '@/lib/store';
import type { ApiEnvelope } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { sessionId, deviceId } = body as { sessionId?: string; deviceId?: string };
  const sessions = await allSessions();
  const s = sessions.find(x => x.sessionId === (sessionId || ''));
  if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });

  if (!deviceId) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'DEVICE_ID_REQUIRED' }, { status: 400 });
  const before = s.devices.length;
  s.devices = s.devices.filter(d => d.id !== deviceId);
  s.updatedAt = Date.now();
  await saveSessions(sessions);
  // Return ok even if device was not found; client logout should still proceed
  const removed = s.devices.length < before;
  return NextResponse.json<ApiEnvelope<{ removed: boolean }>>({ ok: true, data: { removed } });
}
