import { NextResponse } from 'next/server';
import { allSessions, getHostcodes, saveSessions, uuid } from '@/lib/store';
import type { ApiEnvelope, Session } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // tolerate hostcode or hostCode keys; trim & strip spaces
    let hostcode: string = (body.hostcode ?? body.hostCode ?? '').toString().trim();
    if (!hostcode) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'HOSTCODE_REQUIRED' }, { status: 400 });
    }

    // allow leading zeros: compare as string only
    const configs = await getHostcodes();
    const found = configs.find(c => c.hostcode.trim() === hostcode);
    if (!found) {
      return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'INVALID_HOSTCODE' }, { status: 401 });
    }

    const sessions = await allSessions();

    // reuse existing session for same hostcode if you want (or create new each time)
    const existing = sessions.find(s => s.hostcode === hostcode);
    const session: Session = existing ?? {
      sessionId: uuid(),
      hostcode,
      business: {
        businessName: found.businessName,
        slogan: found.slogan || '',
        flyerUrl: found.flyerUrl || '',
      },
      devices: [],
      queue: [],
      lastPlayed: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!existing) {
      sessions.push(session);
      await saveSessions(sessions);
    }

    return NextResponse.json<ApiEnvelope<Session>>({ ok: true, data: session });
  } catch (e: any) {
    return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: e?.message || 'UNKNOWN' }, { status: 500 });
  }
}
