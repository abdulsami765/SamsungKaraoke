import { NextResponse } from 'next/server';
import { allSessions, saveSessions } from '@/lib/store';
import type { ApiEnvelope } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string = (body.sessionId || '').toString();
    if (!sessionId) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_ID_REQUIRED' }, { status: 400 });
    }

    const sessions = await allSessions();
    const idx = sessions.findIndex(s => s.sessionId === sessionId);
    if (idx === -1) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });
    }

    // remove the session (or mark inactive if preferred)
    sessions.splice(idx, 1);
    await saveSessions(sessions);

    return NextResponse.json<ApiEnvelope<{ message: string }>>({ ok: true, data: { message: 'Logged out' } });
  } catch (e: any) {
    return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
