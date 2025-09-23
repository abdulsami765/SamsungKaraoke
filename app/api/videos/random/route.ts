import { NextResponse } from 'next/server';
import { getRandomIds } from '@/lib/store';
import type { ApiEnvelope } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const ids = await getRandomIds();
  // return first 20 randomized
  const shuffled = [...ids].sort(() => Math.random() - 0.5).slice(0, 20);
  return NextResponse.json<ApiEnvelope<string[]>>({ ok: true, data: shuffled });
}
