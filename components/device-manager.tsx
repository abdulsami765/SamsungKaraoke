"use client"

import React, { memo, useCallback, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Tv, ChevronDown, ChevronUp } from "lucide-react"
import type { Device } from "@/types"

interface DeviceManagerProps {
  sessionId: string
}

const DeviceManager = memo(function DeviceManager({ sessionId }: DeviceManagerProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch current devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`/api/device`, {
          headers: { "x-session-id": sessionId },
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setDevices(result.data || [])
          }
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
  }, [sessionId])

  // Handle keyboard navigation for TV remote
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          setSelectedDeviceIndex((prev) => Math.max(0, prev - 1))
          break
        case "ArrowDown":
          event.preventDefault()
          setSelectedDeviceIndex((prev) => Math.min(devices.length - 1, prev + 1))
          break
        case "Enter":
          event.preventDefault()
          if (devices[selectedDeviceIndex]) {
            handleRemoveDevice(devices[selectedDeviceIndex].id)
          }
          break
        case "Escape":
        case "Return":
          event.preventDefault()
          setIsOpen(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedDeviceIndex, devices])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/device/${deviceId}`, {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
      })

      const result = await response.json()

      if (result.success) {
        setDevices((prev) => prev.filter((device) => device.id !== deviceId))
        setIsOpen(false)
        setSelectedDeviceIndex(0)
      } else {
        console.error("Failed to remove device:", result.error)
      }
    } catch (error) {
      console.error("Error removing device:", error)
    }
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Active now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="relative">
        <Button variant="ghost" className="text-white hover:bg-white/20 p-2" disabled>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-white/20 p-3 flex items-center space-x-2"
      >
        <Tv className="w-5 h-5" />
        <span className="hidden md:inline">Devices ({devices.length}/3)</span>
        <span className="md:hidden">{devices.length}/3</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border-white/20 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Connected Devices</h3>
              <span className="text-white/60 text-sm">{devices.length}/3 devices</span>
            </div>

            {devices.length === 0 ? (
              <div className="text-center py-6">
                <Tv className="w-12 h-12 text-white/40 mx-auto mb-2" />
                <p className="text-white/60">No devices connected</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {devices.map((device, index) => (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      index === selectedDeviceIndex
                        ? "bg-purple-600/30 border border-purple-400/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Tv className="w-5 h-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{device.name}</p>
                        <p className="text-white/60 text-sm">{formatLastActive(device.lastActive)}</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDevice(device.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 flex-shrink-0"
                      title="Remove device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Device Limit Warning */}
            {devices.length >= 3 && (
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                <p className="text-yellow-300 text-sm font-medium">Device limit reached</p>
                <p className="text-yellow-200/80 text-xs mt-1">Remove a device to connect a new one</p>
              </div>
            )}

            {/* Instructions */}
            <div className="border-t border-white/20 pt-3">
              <p className="text-white/60 text-xs text-center">
                Use arrow keys to navigate • Enter to remove • Return to close
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Device Count Badge */}
      {devices.length > 0 && !isOpen && (
        <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {devices.length}
        </div>
      )}
    </div>
  )
})

export { DeviceManager }
