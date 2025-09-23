"use client";
import { useEffect, useRef, useState } from "react";

export default function Rotator({ ids, seconds }: { ids: string[]; seconds: number }) {
  const [idx, setIdx] = useState<number>(0);
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!ids || ids.length === 0) return;
    const t = setInterval(() => setIdx((i: number) => ((i + 1) % ids.length)), seconds * 1000);
    return () => clearInterval(t);
  }, [ids.length, seconds]);

  if (!ids || ids.length === 0) {
    return <div className="w-full h-full grid place-items-center text-sm opacity-70">No videos available</div>;
  }

  const safeId = ids[Math.max(0, Math.min(idx, ids.length - 1))];
  const src = `https://www.youtube.com/embed/${safeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`;
  return <iframe ref={iframe} className="w-full h-full" src={src} allow="autoplay; encrypted-media" />;
}
