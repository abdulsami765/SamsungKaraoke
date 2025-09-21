"use client";

import { useState, useEffect } from "react";
import MainPage from "@/components/main-page";
import { LandingPage } from "@/components/landing-page";
import { TVRemoteProvider } from "@/components/tv-remote-provider";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("tv-karaoke-session");
    const savedBusiness = localStorage.getItem("tv-karaoke-business");

    if (savedSession && savedBusiness) {
      setSessionId(savedSession);
      setBusinessInfo(JSON.parse(savedBusiness));
    }
  }, []);

  const handleConnect = (session: string, business: any) => {
    setSessionId(session);
    setBusinessInfo(business);
    localStorage.setItem("tv-karaoke-session", session);
    localStorage.setItem("tv-karaoke-business", JSON.stringify(business));
  };

  const handleLogout = () => {
    setSessionId(null);
    setBusinessInfo(null);
    localStorage.removeItem("tv-karaoke-session");
    localStorage.removeItem("tv-karaoke-business");
  };

  const handleGlobalExit = () => {
    if (confirm("Exit Samsung TV Jukebox Karaoke?")) {
      window.close();
    }
  };

  if (sessionId && businessInfo) {
    return (
      <TVRemoteProvider onGlobalExit={handleGlobalExit} onGlobalHome={handleLogout}>
        <MainPage sessionId={sessionId} businessInfo={businessInfo} onLogout={handleLogout} />
      </TVRemoteProvider>
    );
  }

  return (
    <TVRemoteProvider onGlobalExit={handleGlobalExit}>
      <LandingPage onConnect={handleConnect} />
    </TVRemoteProvider>
  );
}
