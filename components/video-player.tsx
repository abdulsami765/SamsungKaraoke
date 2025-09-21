"use client"

import React, { memo, useCallback, useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Video, UserVideo } from "@/types"

interface VideoPlayerProps {
  video: Video | UserVideo | null
  isFullscreen: boolean
  onVideoEnd: () => void
  onToggleFullscreen: () => void
}

const VideoPlayer = memo(function VideoPlayer({ video: initialVideo, isFullscreen, onVideoEnd, onToggleFullscreen }: VideoPlayerProps) {
  const [video, setVideo] = useState<Video | UserVideo | null>(initialVideo);
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMetadata, setShowMetadata] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const playbackTimerRef = useRef<NodeJS.Timeout>()

  // Auto-play when video changes: prefer using the native video element when possible.
  useEffect(() => {
    if (!video) return

    console.log("[v0] Loading video:", video.title)
    setIsLoading(true)
    setCurrentTime(0)

    // Clear any existing timer/interval
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current as any)
      clearInterval(playbackTimerRef.current as any)
      playbackTimerRef.current = undefined
    }

    if (video.isAd) {
      // Ads are image-based flyers for a fixed 5s duration
      setDuration(5)
      setIsLoading(false)
      setIsPlaying(true)

      playbackTimerRef.current = setTimeout(() => {
        console.log("[v0] Ad finished, moving to next video")
        onVideoEnd()
      }, 5000)
    } else {
      // If the video has a playable URL (mp4/webm), we'll let the <video> element drive timing.
      const isPlayable = !!video.url && /\.(mp4|webm|ogg)(\?|$)/i.test(video.url)
      if (!isPlayable) {
        // Fallback: treat non-playable URL as an image preview with a default duration
        const videoDuration = video.duration || 180
        setDuration(videoDuration)
        setIsLoading(false)
        setIsPlaying(true)

        let currentTimeLocal = 0
        const playbackInterval = setInterval(() => {
          currentTimeLocal += 1
          setCurrentTime(currentTimeLocal)
          if (currentTimeLocal >= videoDuration) {
            clearInterval(playbackInterval)
            onVideoEnd()
          }
        }, 1000)

        playbackTimerRef.current = playbackInterval as any
      } else {
        // Use native video element; ensure metadata/loading handled separately
        setIsLoading(true)
        setIsPlaying(true)
        // duration will be set on loadedmetadata event
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current as any)
        clearInterval(playbackTimerRef.current as any)
        playbackTimerRef.current = undefined
      }
    }
  }, [video, onVideoEnd])

  useEffect(() => {
    if (!video || video.isAd) return

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current as any)
    }

    if (isPlaying) {
      const playbackInterval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1
          if (newTime >= duration) {
            console.log("[v0] Video finished, moving to next")
            clearInterval(playbackInterval)
            onVideoEnd()
            return duration
          }
          return newTime
        })
      }, 1000)

      playbackTimerRef.current = playbackInterval as any
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current as any)
      }
    }
  }, [isPlaying, video, duration, onVideoEnd])

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleLoadedData = () => {
      setIsLoading(false)
      if (isPlaying) {
        videoElement.play().catch(console.error)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handleEnded = () => {
      onVideoEnd()
    }

    const handleLoadedMetadata = () => {
      if (!video?.isAd) {
        setDuration(videoElement.duration)
      }
    }

    videoElement.addEventListener("loadeddata", handleLoadedData)
    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("ended", handleEnded)
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      videoElement.removeEventListener("loadeddata", handleLoadedData)
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("ended", handleEnded)
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [video, isPlaying, onVideoEnd])

  // Handle play/pause
  const togglePlayPause = () => {
    console.log("[v0] Toggle play/pause, currently playing:", isPlaying)
    const next = !isPlaying
    setIsPlaying(next)
    if (videoRef.current) {
      if (next) videoRef.current.play().catch(console.error)
      else videoRef.current.pause()
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return
    const next = !isMuted
    videoRef.current.muted = next
    setIsMuted(next)
  }

  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    if (!isFullscreen) return
    showControlsTemporarily()
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const fetchNextVideo = async () => {
    try {
      const response = await fetch('/api/video/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionStorage.getItem('sessionId') || '',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch next video:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data?.data?.nextVideo || null;
    } catch (error) {
      console.error('Error fetching next video:', error);
      return null;
    }
  };

  const handleVideoEnd = async () => {
    const nextVideo = await fetchNextVideo();
    if (nextVideo) {
      setVideo(nextVideo);
    } else {
      console.warn('No next video available.');
    }
  };

  useEffect(() => {
    // Hide metadata overlay after 3 seconds
    if (showMetadata) {
      const timer = setTimeout(() => setShowMetadata(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMetadata]);

  // Enhanced metadata overlays and remote control handling
  useEffect(() => {
    if (!video) return;

    // Show metadata overlay for 5 seconds when video starts
    setShowMetadata(true);
    const timer = setTimeout(() => setShowMetadata(false), 5000);

    return () => clearTimeout(timer);
  }, [video]);

  const handleRemoteControl = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowUp":
        setIsMuted(false);
        break;
      case "ArrowDown":
        setIsMuted(true);
        break;
      case "ArrowLeft":
        videoRef.current && (videoRef.current.currentTime -= 10);
        break;
      case "ArrowRight":
        videoRef.current && (videoRef.current.currentTime += 10);
        break;
      case "Enter":
        setIsPlaying((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleRemoteControl);
    return () => window.removeEventListener("keydown", handleRemoteControl);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${isFullscreen ? "fixed inset-0 z-50" : "w-full h-96 md:h-[500px]"}`}
      onMouseMove={handleMouseMove}
    >
      <div className="w-full h-full relative">
        <div className="w-full h-full relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          {/* If a playable video URL exists, render a native video element. Otherwise show an image fallback. */}
          {video.url && /\.(mp4|webm|ogg)(\?|$)/i.test(video.url) ? (
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full object-cover opacity-100"
              playsInline
              muted={isMuted}
              autoPlay={isPlaying}
              onCanPlay={() => setIsLoading(false)}
              onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
              onEnded={() => onVideoEnd()}
            />
          ) : (
            <img
              src={video.url || video.thumbnail || "/placeholder.svg?height=720&width=1280&query=karaoke video"}
              alt={video.title}
              className="w-full h-full object-cover opacity-80"
            />
          )}

          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
          )}
        </div>

        {/* Play Overlay - only show when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-6">
              <Play className="w-16 h-16 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Playing Indicator */}
        {isPlaying && !video.isAd && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Now Playing</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Ad Indicator */}
      {video.isAd && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Advertisement</span>
          </div>
        </div>
      )}

      {/* Video Controls */}
      {(showControls || !isFullscreen) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  video.isAd ? "bg-red-500" : "bg-purple-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <Button variant="ghost" size="sm" onClick={togglePlayPause} className="text-white hover:bg-white/20 p-2">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              {/* Volume */}
              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20 p-2">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>

              {/* Video Info */}
              <div className="text-white">
                <p className="font-medium">{video.title}</p>
                {"username" in video && <p className="text-sm text-purple-300">by {video.username}</p>}
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="text-white hover:bg-white/20 p-2">
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Instructions */}
      {isFullscreen && !showControls && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm">Move mouse to show controls</p>
          </div>
        </div>
      )}

      {/* Video Title Overlay (Non-fullscreen) */}
      {!isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-white font-semibold text-lg">{video.title}</h3>
            {"username" in video && <p className="text-purple-300 text-sm">Requested by {video.username}</p>}
            {video.isAd && <p className="text-red-300 text-sm font-medium">Business Advertisement</p>}
          </div>
        </div>
      )}

      {/* Skip Ad Button */}
      {video.isAd && currentTime > 3 && (
        <div className="absolute bottom-20 right-4 z-10">
          <Button onClick={onVideoEnd} className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
            Skip Ad
          </Button>
        </div>
      )}

      {/* User Message Scrolling (for user videos) */}
      {"message" in video && video.message && !isFullscreen && (
        <div className="absolute bottom-20 left-0 right-0 z-10">
          <div className="bg-black/60 backdrop-blur-sm py-2">
            <div className="animate-scroll whitespace-nowrap">
              <span className="text-white text-lg px-4">💬 {video.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* User Message (fullscreen) */}
      {"message" in video && video.message && isFullscreen && (
        <div className="absolute bottom-32 left-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white text-center">💬 {video.message}</p>
          </div>
        </div>
      )}

      {/* Metadata Overlay */}
      {showMetadata && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/70 p-4 rounded-b-lg">
          <p className="text-white text-sm">
            Now Playing: <span className="font-semibold">{video.title}</span>
          </p>
          {"username" in video && (
            <p className="text-purple-300 text-xs">
              Requested by {video.username}
            </p>
          )}
        </div>
      )}
    </div>
  )
});

export default VideoPlayer;
