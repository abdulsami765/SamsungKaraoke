'use client';
import { useEffect, useRef, useState } from 'react';
import { UserMessage } from '@/types';

export default function Marquee({ user }: { user?: UserMessage }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) { setText(''); return; }
    const parts = [
      user.username ? `@${user.username}` : '',
      user.message || ''
    ].filter(Boolean);
    setText(parts.join(' — '));
  }, [user]);

  if (!text) return null;
  return (
    <div className="w-full overflow-hidden bg-black/60 text-white py-2">
      <div
        ref={ref}
        className="whitespace-nowrap animate-[marquee_16s_linear_infinite]"
        style={{ paddingLeft: '100%' }}
      >
        {text}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
