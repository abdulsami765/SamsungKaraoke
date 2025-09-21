"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, LogOut, SkipForward, SkipBack, Maximize } from "lucide-react"

interface TVControlsProps {
  onHome: () => void
  onLogout: () => void
  onNextVideo: () => void
  onPreviousVideo: () => void
  onToggleFullscreen: () => void
}

export function TVControls({ onHome, onLogout, onNextVideo, onPreviousVideo, onToggleFullscreen }: TVControlsProps) {
  return (
    <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Home Button */}
        <Button
          variant="ghost"
          onClick={onHome}
          className="text-white hover:bg-white/20 p-3 flex flex-col items-center space-y-1"
          title="Go to Home"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Button>

        {/* Previous Video */}
        <Button
          variant="ghost"
          onClick={onPreviousVideo}
          className="text-white hover:bg-white/20 p-3 flex flex-col items-center space-y-1"
          title="Previous Video"
        >
          <SkipBack className="w-6 h-6" />
          <span className="text-xs">Previous</span>
        </Button>

        {/* Next Video */}
        <Button
          variant="ghost"
          onClick={onNextVideo}
          className="text-white hover:bg-white/20 p-3 flex flex-col items-center space-y-1"
          title="Next Video"
        >
          <SkipForward className="w-6 h-6" />
          <span className="text-xs">Next</span>
        </Button>

        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          onClick={onToggleFullscreen}
          className="text-white hover:bg-white/20 p-3 flex flex-col items-center space-y-1"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-6 h-6" />
          <span className="text-xs">Fullscreen</span>
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-3 flex flex-col items-center space-y-1"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>

      {/* Control Instructions */}
      <div className="mt-3 text-center">
        <p className="text-white/60 text-xs">
          Use TV remote: Arrow keys to navigate • Enter to select • Return to go back
        </p>
      </div>
    </Card>
  )
}
