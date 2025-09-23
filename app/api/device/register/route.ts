import { NextResponse } from 'next/server';
import { allSessions, saveSessions, uuid } from '@/lib/store';
import type { ApiEnvelope, DeviceInfo } from '@/types';
import { safeName } from '@/lib/device';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_DEVICES = 3;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { sessionId, deviceName, userAgent } = body as { sessionId?: string; deviceName?: string; userAgent?: string };
  const sessions = await allSessions();
  const s = sessions.find(x => x.sessionId === (sessionId || ''));
  if (!s) return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'SESSION_NOT_FOUND' }, { status: 404 });

  // prune devices older than 24h (optional hardening)
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  s.devices = s.devices.filter(d => !d.lastActive || (now - d.lastActive) < DAY);

  // de-duplicate: same userAgent or same normalized device name => reuse existing device
  const normName = safeName(deviceName);
  const existing = s.devices.find(d => (userAgent && d.userAgent === userAgent) || d.name === normName);
  if (existing) {
    existing.lastActive = now;
    s.updatedAt = now;
    await saveSessions(sessions);
    return NextResponse.json<ApiEnvelope<DeviceInfo>>({ ok: true, data: existing });
  }

  if (s.devices.length >= MAX_DEVICES) {
    return NextResponse.json<ApiEnvelope<null>>({ ok: false, error: 'Device limit reached (max 3). Please remove a device or log out properly.' }, { status: 403 });
  }

  const device: DeviceInfo = {
    id: uuid(),
    name: normName,
    userAgent,
    createdAt: now,
    lastActive: now,
  };
  s.devices.push(device);
  s.updatedAt = now;
  await saveSessions(sessions);

  return NextResponse.json<ApiEnvelope<DeviceInfo>>({ ok: true, data: device });
}
