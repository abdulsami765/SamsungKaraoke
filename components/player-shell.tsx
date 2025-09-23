"use client";
import { useCallback, useEffect, useState } from 'react';
import type { ApiEnvelope, DeviceInfo, UserMessage } from '@/types';
import YouTubePlayer from '@/components/YouTubePlayer';
import Marquee from '@/components/Marquee';

type BusinessPublic = {
  businessName: string;
  slogan?: string;
  flyerUrl?: string;
};

type NextFromApi =
  | { ok: true; data: { source: 'queue'; item: { id: string; submittedBy?: UserMessage } } }
  | { ok: true; data: { source: 'random'; id: string } }
  | { ok: false; error: string };

type Props = { sid: string; business: BusinessPublic };

type Current = { source: 'queue' | 'random'; id: string; user?: UserMessage } | null;

export default function PlayerShell({ sid, business }: Props) {
  const [current, setCurrent] = useState<Current>(null);
  const [showAd, setShowAd] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const slogan = business?.slogan || '';
  const flyerUrl = business?.flyerUrl || '';

  const applyNext = useCallback((j: NextFromApi) => {
    if (!j.ok) return;
    if (j.data.source === 'queue') {
      const item = j.data.item;
      setCurrent({ source: 'queue', id: item.id, user: item.submittedBy });
    } else {
      setCurrent({ source: 'random', id: j.data.id });
    }
  }, []);

  const loadNext = useCallback(async () => {
    try {
      setErr(null);
      const r = await fetch('/api/video/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid })
      });
      const j = (await r.json()) as NextFromApi;
      if (!j.ok) { setErr(j.error || 'NEXT_FAILED'); return; }

      if (flyerUrl) {
        setShowAd(true);
        const timer = setTimeout(() => {
          setShowAd(false);
          applyNext(j);
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        applyNext(j);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'NEXT_FAILED';
      setErr(msg);
    }
    return undefined;
  }, [sid, flyerUrl, applyNext]);

  useEffect(() => { void loadNext(); }, [loadNext]);

  // key handling: enter toggles fullscreen; esc/back returns
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setFullscreen((f: boolean) => !f);
      }
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (fullscreen) setFullscreen(false);
        else window.location.href = '/';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  async function playNext(): Promise<void> { await loadNext(); }
  function goHome(): void { if (fullscreen) setFullscreen(false); else window.location.href = '/'; }
  async function logout(): Promise<void> {
    try {
      const deviceId = localStorage.getItem('deviceId') || sessionStorage.getItem('deviceId');
      if (deviceId) {
        await fetch('/api/device/remove', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, deviceId })
        }).catch(() => {});
      }
    } catch { /* ignore */ }
    try {
      localStorage.removeItem('deviceId');
      sessionStorage.removeItem('deviceId');
    } catch { /* ignore */ }
    window.location.href = '/';
  }

  async function removeDevice(devId: string): Promise<void> {
    // keep using POST /api/device/remove for compatibility
    await fetch('/api/device/remove', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, deviceId: devId })
    });
  }

  return (
    <main className="min-h-screen bg-black text-white grid grid-rows-[auto_1fr_auto]">
      {/* Header brand + actions */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold">{business?.businessName || 'MiTV'}</h1>
          {slogan && <p className="text-sm opacity-80">{slogan}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goHome} className="px-3 py-1 rounded bg-white/10 cursor-pointer hover:bg-white/20 transition">Home</button>
          <button onClick={playNext} className="px-3 py-1 rounded bg-white/10 cursor-pointer hover:bg-white/20 transition">Play Next Video</button>
          <button onClick={() => setFullscreen((f) => !f)} className="px-3 py-1 rounded bg-white/10 cursor-pointer hover:bg-white/20 transition">
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <DeviceDropdown sid={sid} onRemove={removeDevice} />
          <button onClick={logout} className="px-3 py-1 rounded bg-red-500 text-white cursor-pointer hover:bg-red-600 transition">Logout</button>
        </div>
      </header>

      {/* Player area */}
      <section className="relative">
        {showAd && flyerUrl ? (
          <div className="absolute inset-0 grid place-items-center bg-black">
            <img src={flyerUrl} alt="Ad" className="max-h-full max-w-full object-contain" />
            {/* Subtle intermission spinner */}
            <div className="absolute bottom-6 right-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
            </div>
          </div>
        ) : current ? (
          <YouTubePlayer videoId={current.id} onEnded={playNext} fullscreen={fullscreen} />
        ) : (
          <div className="h-full grid place-items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white"></div>
          </div>
        )}
      </section>

      {/* User message location depends on fullscreen */}
      {current?.source === 'queue' && (
        fullscreen ? (
          <div className="p-2 border-t border-white/10">
            <Marquee user={current.user} />
          </div>
        ) : (
          <div className="absolute left-0 right-0 bottom-0">
            <Marquee user={current.user} />
          </div>
        )
      )}

      {err && <div className="absolute top-2 right-2 text-xs bg-red-600 px-2 py-1 rounded">{err}</div>}
    </main>
  );
}

function DeviceDropdown({ sid, onRemove }: { sid: string; onRemove: (id: string) => Promise<void> }) {
  const [devices, setDevices] = useState<Array<Pick<DeviceInfo, 'id' | 'name'>>>([]);

  async function refresh(): Promise<void> {
    const r = await fetch(`/api/device?sessionId=${encodeURIComponent(sid)}`);
    const j = (await r.json()) as ApiEnvelope<Array<Pick<DeviceInfo, 'id' | 'name'>>>;
    if (j.ok && Array.isArray(j.data)) setDevices(j.data);
  }
  useEffect(() => {
    void refresh();
    const t = setInterval(() => { void refresh(); }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative group">
      <button className="px-3 py-1 rounded bg-white/10 cursor-pointer hover:bg-white/20 transition">Remove device ▾</button>
      <div className="absolute right-0 mt-1 hidden group-hover:block bg-zinc-800 border border-white/10 rounded min-w-[220px] z-10">
        {devices.length === 0 && <div className="px-3 py-2 text-sm opacity-70">No devices</div>}
        {devices.map((d) => (
          <button
            key={d.id}
            onClick={async () => { await onRemove(d.id); await refresh(); }}
            className="w-full text-left px-3 py-2 hover:bg-white/10 cursor-pointer transition"
          >
            Remove “{d.name}”
          </button>
        ))}
      </div>
    </div>
  );
}
