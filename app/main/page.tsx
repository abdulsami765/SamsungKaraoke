import PlayerShell from '@/components/player-shell';

export const dynamic = 'force-dynamic';

async function getConfig(sid: string) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/business/config?sessionId=${sid}`, { cache: 'no-store' });
  return await r.json();
}
async function getNext(sid: string) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/video/next`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: sid })
  });
  return await r.json();
}

export default async function MainPage({ searchParams }: { searchParams: Promise<{ sid?: string }> }) {
  const sp = await searchParams;
  const sid = sp?.sid || '';
  const conf = await getConfig(sid);
  if (!conf?.ok) {
    return <div className="min-h-screen bg-black text-white grid place-items-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Session not found</h1>
        <a className="underline block mt-4" href="/">Go Home</a>
      </div>
    </div>;
  }
  return <PlayerShell sid={sid} business={conf.data} />;
}
