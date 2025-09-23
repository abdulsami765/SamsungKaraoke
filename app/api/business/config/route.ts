import { NextResponse } from 'next/server';
import { allSessions } from '@/lib/store';
import type { ApiEnvelope } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get('sessionId') || '';
  const sessions = await allSessions();
  const s = sessions.find(x => x.sessionId === sid);
  if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });
  return NextResponse.json<ApiEnvelope<{ businessName: string; slogan?: string; flyerUrl?: string }>>({
    ok: true,
    data: s.business
  });
}
