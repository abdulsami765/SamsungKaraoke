'use client';
import { useEffect, useRef } from 'react';

type Props = {
  videoId: string;
  onEnded?: () => void;
  fullscreen?: boolean;
};

export default function YouTubePlayer({ videoId, onEnded, fullscreen }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  // Simple end detection: use YouTube autoplay + fixed 4m max fallback if API not available
  useEffect(() => {
    let timer: any;
    if (onEnded) {
      timer = setTimeout(() => onEnded(), 4 * 60 * 1000); // fallback
    }
    return () => clearTimeout(timer);
  }, [videoId, onEnded]);

  useEffect(() => {
    if (!ref.current) return;
    if (fullscreen) {
      ref.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [fullscreen]);

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1`;
  return (
    <div className="w-full h-full">
      <iframe
        ref={ref}
        className="w-full h-full"
        src={src}
        title="MiTV Player"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        frameBorder={0}
      />
    </div>
  );
}
