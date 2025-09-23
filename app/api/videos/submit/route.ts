import { NextResponse } from 'next/server';
import { allSessions, saveSessions } from '@/lib/store';
import type { ApiEnvelope, VideoItem, UserMessage } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Body: { sessionId, video: { id, title? }, user?: { username, photoUrl?, message? } }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { sessionId, video, user } = body as { sessionId: string; video: VideoItem; user?: UserMessage };
  const sessions = await allSessions();
  const s = sessions.find(x => x.sessionId === (sessionId || ''));
  if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });

  if (!video?.id) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'VIDEO_ID_REQUIRED' }, { status: 400 });
  const item: VideoItem = { id: String(video.id), title: video.title || '', submittedBy: user };
  s.queue.push(item);
  s.updatedAt = Date.now();
  await saveSessions(sessions);

  return NextResponse.json<ApiEnvelope<VideoItem>>({ ok: true, data: item });
}
