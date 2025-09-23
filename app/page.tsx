import Link from 'next/link';
import Rotator from './rotator';
import ConnectCard from './connect-card';

export const dynamic = 'force-dynamic';

async function getRandomIds() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/videos/random`, { cache: 'no-store' });
  const json = await res.json();
  return (json?.data ?? []) as string[];
}

export default async function LandingPage() {
  const ids = await getRandomIds();

  return (
    <main className="min-h-screen bg-black text-white grid grid-cols-12">
      {/* Left: rotating preview */}
      <section className="col-span-8 p-4">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Rotator ids={ids} seconds={15} />
        </div>
        <p className="mt-2 text-sm opacity-70">Rotating random videos every 15s (autoplay).</p>
      </section>

      {/* Right: hostcode connect */}
      <section className="col-span-4 p-6 bg-zinc-900">
        <ConnectCard />
        <div className="mt-6">
          <Link className="underline opacity-80" href="https://www.jukeboxkaraoke.net/" target="_blank">
            What is MiTV?
          </Link>
        </div>
      </section>
    </main>
  );
}
