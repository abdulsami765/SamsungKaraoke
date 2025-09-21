"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Video } from "@/types"

interface LandingPageProps {
  onConnect: (sessionId: string, businessInfo: any) => void
}

export function LandingPage({ onConnect }: LandingPageProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [hostcode, setHostcode] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [isTvClient, setIsTvClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchRandomVideos = async () => {
      try {
        const response = await fetch("/api/videos/random")
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setVideos(result.data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch random videos:", error)
        setVideos([
          {
            id: "1",
            title: "Popular Song 1",
            thumbnail: "/karaoke-stage.jpg",
            url: "/karaoke-performance.jpg",
            duration: 15,
          },
          { id: "2", title: "Hit Song 2", thumbnail: "/vibrant-music-concert.png", url: "/singing-performance.jpg", duration: 15 },
          {
            id: "3",
            title: "Classic Hit 3",
            thumbnail: "/karaoke-night.png",
            url: "/live-music-stage.png",
            duration: 15,
          },
          {
            id: "4",
            title: "Dance Track 4",
            thumbnail: "/vibrant-dance-party.png",
            url: "/vibrant-party-scene.png",
            duration: 15,
          },
        ])
      }
    }

    fetchRandomVideos()
  }, [])

  useEffect(() => {
    if (videos.length === 0) return

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  }, [videos.length])

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
    const isTv = /SMART-TV|SMARTTV|TV|Tizen|Web0S|AppleTV|BRAVIA|SMART_TV|NetCast/i.test(ua)
    setIsTvClient(isTv)

    // Show popup only on non-TV clients
    if (!isTv) {
      const timer = setTimeout(() => setShowPopup(true), 3000)
      return () => clearTimeout(timer)
    }
    // if TV client, don't auto show popup
    return
  }, [])

  // Handle keyboard navigation for TV remote
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
          event.preventDefault()
          if (hostcode.trim()) {
            handleConnect()
          }
          break
        case "Escape":
        case "Return":
          if (hostcode) {
            setHostcode("")
            setError("")
          }
          break
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault()
          inputRef.current?.focus()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hostcode])

  const handleConnect = async () => {
    if (!hostcode.trim()) {
      setError("Please enter a hostcode")
      return
    }

    setIsConnecting(true)
    setError("")

    const cleanHostcode = hostcode.trim()
    console.log("[v0] Attempting to connect with hostcode:", cleanHostcode)

    try {
      const response = await fetch("/api/auth/hostcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostcode: cleanHostcode }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        setError("Invalid hostcode. Please check and try again.")
        return
      }

      const result = await response.json()
      console.log("[v0] Hostcode validation result:", result)

      if (result.success && result.data) {
        const deviceResponse = await fetch("/api/device/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
              sessionId: result.data.sessionId,
              deviceName: isTvClient ? `Samsung TV ${new Date().toISOString()}` : `Web Client ${Date.now()}`,
            }),
        })

        if (deviceResponse.ok) {
          const deviceResult = await deviceResponse.json()
          if (deviceResult.success) {
            onConnect(result.data.sessionId, result.data.business)
          } else {
            setError("Device registration failed. Please try again.")
          }
        } else {
          setError("Device registration failed. Please try again.")
        }
      } else {
        setError(result.message || "Invalid hostcode")
      }
    } catch (error) {
      console.error("[v0] Connection error:", error)
      setError("Connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const currentVideo = videos[currentVideoIndex]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 gap-1 p-4">
        {videos.slice(0, 9).map((video, index) => (
          <div key={video.id} className="relative aspect-video bg-gray-900 rounded overflow-hidden">
            <img
              src={video.thumbnail || "/placeholder.svg?height=180&width=320&query=karaoke+video"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-medium truncate">{video.title}</p>
            </div>
            {index === currentVideoIndex && (
              <div className="absolute inset-0 ring-2 ring-yellow-400">
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-20 p-8">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">MiTV</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white text-xl font-medium">Enter Host Code</span>
            <Input
              ref={inputRef}
              type="text"
              placeholder=""
              value={hostcode}
              onChange={(e) => setHostcode(e.target.value)}
              className="w-48 h-12 text-lg text-center font-mono bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"
              autoFocus
              maxLength={10}
            />
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !hostcode.trim()}
              className="h-12 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-center">
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-medium">{error}</div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-2xl max-w-md mx-4 text-center">
            <div className="text-black mb-6">
              <div className="text-6xl font-bold mb-2">MiTV</div>
              <div className="text-sm font-medium uppercase tracking-wider">MUSICALLY INTERACTIVE TELEVISION</div>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-black text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              CLICK HERE TO CONTINUE
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-8 right-8 z-20">
        <div className="text-center text-white/80 text-lg">
          <p className="italic">MiTV allows your audience to use the 'MiTV Connect app' to connect to your TV</p>
        </div>

        <div className="mt-4 text-center text-white/60 text-sm">
          <p>Test codes: 266279, 319720, DEMO123, SING456, MUSIC789</p>
        </div>
      </div>
    </div>
  )
}
