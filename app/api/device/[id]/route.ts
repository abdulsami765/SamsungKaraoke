import { NextResponse } from 'next/server';
import { allSessions, saveSessions } from '@/lib/store';
import type { ApiEnvelope } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(_req: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    // Support both direct params and Promise-wrapped params (Next.js type variance)
    const resolved = 'params' in context && typeof (context as any).params?.then === 'function'
      ? await (context as { params: Promise<{ id: string }> }).params
      : (context as { params: { id: string } }).params;
    // Expect sessionId via query string for simplicity in REST delete
    // e.g. /api/device/{id}?sessionId=...
    const url = new URL(_req.url);
    let sessionId = url.searchParams.get('sessionId') || '';
    if (!sessionId) {
      const hdr = (_req.headers.get('x-session-id') || '').toString();
      if (hdr) sessionId = hdr;
    }
    if (!sessionId) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_ID_REQUIRED' }, { status: 400 });
    }
    const deviceId = resolved.id;

    const sessions = await allSessions();
    const s = sessions.find(x => x.sessionId === sessionId);
    if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });

    const before = s.devices.length;
    s.devices = s.devices.filter(d => d.id !== deviceId);
    if (s.devices.length === before) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'DEVICE_NOT_FOUND' }, { status: 404 });
    }
    s.updatedAt = Date.now();
    await saveSessions(sessions);

    return NextResponse.json<ApiEnvelope<{ message: string }>>({ ok: true, data: { message: 'Device removed' } });
  } catch (e: any) {
    return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
