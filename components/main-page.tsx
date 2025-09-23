"use client"

import React, { memo, useCallback, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { VideoPlayer } from "@/components/video-player"
import { DeviceManager } from "@/components/device-manager";
import { TVControls } from "@/components/tv-controls"
import type { Video, UserVideo } from "@/types"

interface MainPageProps {
  sessionId: string
  businessInfo: {
    id: string
    name: string
    slogan: string
  }
  onLogout: () => void
}

interface VideoQueue {
  userVideos: UserVideo[]
  businessAds: Video[]
  business: {
    name: string
    slogan: string
  }
}

// Memoize the MainPage component to prevent unnecessary re-renders
const MainPage = memo(function MainPage({ sessionId, businessInfo, onLogout }: MainPageProps) {
  const [videoQueue, setVideoQueue] = useState<VideoQueue | null>(null)
  const [randomVideos, setRandomVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlayingAd, setIsPlayingAd] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch video queue and random videos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch video queue
        const queueResponse = await fetch("/api/videos/queue", {
          headers: {
            "x-session-id": sessionId,
          },
        })
  const queueResult = (await queueResponse.json()) as any

        // Fetch random videos as fallback
        const randomResponse = await fetch("/api/videos/random")
  const randomResult = (await randomResponse.json()) as any

        if (queueResult && queueResult.success) {
          setVideoQueue(queueResult.data as VideoQueue)
        }
        if (randomResult && randomResult.success) {
          setRandomVideos(randomResult.data as Video[])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  // Handle keyboard navigation for TV remote
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
        case "Return":
          event.preventDefault()
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            // Go back to landing page
            onLogout()
          }
          break
        case "Exit":
          // Close app (in real Samsung TV, this would exit the app)
          event.preventDefault()
          if (confirm("Exit Karaoke App?")) {
            window.close()
          }
          break
        case "ArrowRight":
          event.preventDefault()
          handleNextVideo()
          break
        case "ArrowLeft":
          event.preventDefault()
          handlePreviousVideo()
          break
        case "Enter":
          event.preventDefault()
          setIsFullscreen(!isFullscreen)
          break
        case " ":
          event.preventDefault()
          // Space bar to toggle controls visibility
          setShowControls(!showControls)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, showControls])

  const handleNextVideo = async () => {
    try {
      await fetch("/api/video/next", {
        method: "POST",
        headers:
         {
          "x-session-id": sessionId,
        },
      })

      // Move to next video in queue
      const totalVideos = getCurrentVideoList().length
      setCurrentVideoIndex((prev) => (prev + 1) % totalVideos)
    } catch (error) {
      console.error("Failed to skip video:", error)
    }
  }

  const handlePreviousVideo = () => {
    const totalVideos = getCurrentVideoList().length
    setCurrentVideoIndex((prev) => (prev - 1 + totalVideos) % totalVideos)
  }

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      onLogout()
    }
  }, [onLogout, sessionId])

  const getCurrentVideoList = () => {
    if (!videoQueue) return randomVideos

    // Interleave user videos with ads
    const videos: (Video | UserVideo)[] = []
    const userVideos = videoQueue.userVideos || []
    const ads = videoQueue.businessAds || []

    if (userVideos.length === 0) {
      return randomVideos
    }

    userVideos.forEach((video, index) => {
      videos.push(video)
      // Add ad after each user video (except the last one)
      if (index < userVideos.length - 1 && ads.length > 0) {
        videos.push(ads[index % ads.length])
      }
    })

    return videos
  }

  const currentVideoList = getCurrentVideoList()
  const currentVideo = currentVideoList[currentVideoIndex] as Video | UserVideo | undefined
  const isCurrentVideoAd = currentVideo?.isAd || false

  const isUserVideo = (v: Video | UserVideo | undefined): v is UserVideo => {
    return !!v && Object.prototype.hasOwnProperty.call(v, "username")
  }

  // Batch state updates to minimize re-renders
  const updateVideoState = (newIndex: number, isAdPlaying: boolean) => {
    setCurrentVideoIndex(newIndex);
    setIsPlayingAd(isAdPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Karaoke...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Video Player */}
      <VideoPlayer
        video={currentVideo ?? null}
        isFullscreen={isFullscreen}
        onVideoEnd={() => handleNextVideo()}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* Controls Overlay */}
      {showControls && !isFullscreen && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Top Bar */}
          <div className="flex justify-between items-start p-6 pointer-events-auto">
            {/* Business Info */}
            <div className="bg-black/60 backdrop-blur-lg rounded-lg p-4 max-w-md">
              <h1 className="text-2xl font-bold text-white mb-1">{videoQueue?.business.name || businessInfo.name}</h1>
              <p className="text-purple-300 text-lg">{videoQueue?.business.slogan || businessInfo.slogan}</p>
            </div>

            {/* Device Manager */}
            <DeviceManager sessionId={sessionId} />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            <TVControls
              onHome={() => onLogout()}
              onLogout={handleLogout}
              onNextVideo={handleNextVideo}
              onPreviousVideo={handlePreviousVideo}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
        </div>
      )}

      {/* Current Video Info Overlay */}
      {!isFullscreen && currentVideo && (
        <div className="absolute bottom-24 left-6 right-6 z-10">
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-4">
            <div className="flex items-center space-x-4">
              {/* Video Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={currentVideo.thumbnail || "/placeholder.svg"}
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">{currentVideo.title}</h3>

                {/* User Video Info */}
                {"username" in currentVideo && (
                  <div className="flex items-center space-x-2 mt-1">
                    {currentVideo.userPhoto && (
                      <img
                        src={currentVideo.userPhoto || "/placeholder.svg"}
                        alt={currentVideo.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-purple-300 text-sm">by {currentVideo.username}</span>
                  </div>
                )}

                {/* Ad Indicator */}
                {isCurrentVideoAd && (
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-300 text-sm font-medium">Advertisement</span>
                  </div>
                )}
              </div>

              {/* Queue Position */}
              <div className="text-right text-white/80">
                <div className="text-sm">
                  {currentVideoIndex + 1} / {currentVideoList.length}
                </div>
                <div className="text-xs text-white/60">{isCurrentVideoAd ? "Ad" : "Song"}</div>
              </div>
            </div>

            {/* Scrolling Message for User Videos */}
            {"message" in currentVideo && currentVideo.message && (
              <div className="mt-3 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap text-yellow-300">{currentVideo.message}</div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Fullscreen Message Overlay */}
      {isFullscreen && currentVideo && "message" in currentVideo && currentVideo.message && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-black/80 backdrop-blur-lg rounded-lg p-4 text-center">
            <p className="text-yellow-300 text-xl font-medium">{currentVideo.message}</p>
          </div>
        </div>
      )}

      {/* Queue Preview */}
      {!isFullscreen && showControls && (
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-4 w-64">
            <h3 className="text-white font-semibold mb-3">Up Next</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentVideoList.slice(currentVideoIndex + 1, currentVideoIndex + 6).map((video, index) => (
                <div key={`${video.id}-${index}`} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{video.title}</p>
                    {Object.prototype.hasOwnProperty.call(video, "username") && (
                      <p className="text-purple-300 text-xs">by {(video as any).username}</p>
                    )}
                    {video.isAd && <p className="text-red-300 text-xs">Advertisement</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {showControls && !isFullscreen && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur-lg rounded-lg px-4 py-2">
            <p className="text-white/80 text-sm text-center">
              Enter: Fullscreen • Return: Back • Exit: Close App • Space: Hide Controls
            </p>
          </div>
        </div>
      )}
    </div>
  )
})

export default MainPage
