"use client";
import { useEffect, useMemo, useState } from "react";

export default function ConnectCard() {
  const [hostcode, setHostcode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isTv = useMemo(() => {
    const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
    return /tizen|smart-tv|smarttv|samsungtv|mi tv|mitv|mibox|android tv/.test(ua);
  }, []);

  useEffect(() => {
    if (isTv) setDeviceName("TV");
  }, [isTv]);

  async function connect() {
    try {
      setBusy(true);
      setErr(null);
      const r = await fetch("/api/auth/hostcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostcode: hostcode.trim() })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "INVALID_HOSTCODE");

      const sessionId = j.data.sessionId as string;

      const rn = await fetch("/api/device/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, deviceName: isTv ? "TV" : deviceName, userAgent: navigator.userAgent })
      });
      const jr = await rn.json();
      if (!jr.ok) throw new Error(jr.error || "DEVICE_REGISTER_FAILED");

      try {
        const deviceId: string | undefined = jr?.data?.id;
        if (deviceId) {
          localStorage.setItem('deviceId', deviceId);
          sessionStorage.setItem('deviceId', deviceId);
        }
      } catch { /* ignore storage errors */ }

      window.location.href = `/main?sid=${encodeURIComponent(sessionId)}`;
    } catch (e: any) {
      setErr(e?.message || "FAILED");
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") connect();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Enter Host Code</h1>
      <input
        className="w-full px-3 py-2 rounded bg-black/40 border border-white/20"
        placeholder="e.g. 919190"
        value={hostcode}
        onChange={e => setHostcode(e.target.value)}
        onKeyDown={onKey}
        inputMode="numeric"
      />
      {!isTv && (
        <input
          className="w-full px-3 py-2 rounded bg-black/40 border border-white/20"
          placeholder="Device name (optional)"
          value={deviceName}
          onChange={e => setDeviceName(e.target.value)}
          onKeyDown={onKey}
        />
      )}
      <button
        onClick={connect}
        disabled={busy || !hostcode.trim()}
        className="w-full py-2 rounded bg-white text-black font-semibold disabled:opacity-50"
      >
        {busy ? "Connecting…" : "Connect"}
      </button>
      {err && <p className="text-red-400 text-sm">{err}</p>}
    </div>
  );
}
