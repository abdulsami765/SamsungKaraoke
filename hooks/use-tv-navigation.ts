"use client"

import { useEffect, useCallback, useRef } from "react"

export interface TVNavigationOptions {
  onReturn?: () => void
  onExit?: () => void
  onHome?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onPlayPause?: () => void
  onVolumeUp?: () => void
  onVolumeDown?: () => void
  onMute?: () => void
  disabled?: boolean
}

export function useTVNavigation(options: TVNavigationOptions = {}) {
  const {
    onReturn,
    onExit,
    onHome,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onPlayPause,
    onVolumeUp,
    onVolumeDown,
    onMute,
    disabled = false,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      // Prevent default behavior for TV remote keys
      const tvKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Enter",
        "Return",
        "Escape",
        "Exit",
        "Home",
        " ", // Space for play/pause
        "MediaPlayPause",
        "AudioVolumeUp",
        "AudioVolumeDown",
        "AudioVolumeMute",
      ]

      if (tvKeys.includes(event.key)) {
        event.preventDefault()
      }

      switch (event.key) {
        case "Return":
        case "Escape":
          onReturn?.()
          break
        case "Exit":
          onExit?.()
          break
        case "Home":
          onHome?.()
          break
        case "Enter":
          onEnter?.()
          break
        case "ArrowUp":
          onArrowUp?.()
          break
        case "ArrowDown":
          onArrowDown?.()
          break
        case "ArrowLeft":
          onArrowLeft?.()
          break
        case "ArrowRight":
          onArrowRight?.()
          break
        case " ":
        case "MediaPlayPause":
          onPlayPause?.()
          break
        case "AudioVolumeUp":
        case "+":
          onVolumeUp?.()
          break
        case "AudioVolumeDown":
        case "-":
          onVolumeDown?.()
          break
        case "AudioVolumeMute":
        case "m":
        case "M":
          onMute?.()
          break
      }
    },
    [
      disabled,
      onReturn,
      onExit,
      onHome,
      onEnter,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onPlayPause,
      onVolumeUp,
      onVolumeDown,
      onMute,
    ],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return { handleKeyDown }
}

// Focus management for TV navigation
export function useTVFocus() {
  const focusableElements = useRef<HTMLElement[]>([])
  const currentFocusIndex = useRef(0)

  const registerFocusableElement = useCallback((element: HTMLElement | null) => {
    if (element && !focusableElements.current.includes(element)) {
      focusableElements.current.push(element)
    }
  }, [])

  const unregisterFocusableElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      const index = focusableElements.current.indexOf(element)
      if (index > -1) {
        focusableElements.current.splice(index, 1)
      }
    }
  }, [])

  const focusNext = useCallback(() => {
    if (focusableElements.current.length === 0) return

    currentFocusIndex.current = (currentFocusIndex.current + 1) % focusableElements.current.length
    focusableElements.current[currentFocusIndex.current]?.focus()
  }, [])

  const focusPrevious = useCallback(() => {
    if (focusableElements.current.length === 0) return

    currentFocusIndex.current =
      (currentFocusIndex.current - 1 + focusableElements.current.length) % focusableElements.current.length
    focusableElements.current[currentFocusIndex.current]?.focus()
  }, [])

  const focusCurrent = useCallback(() => {
    if (focusableElements.current.length > 0) {
      focusableElements.current[currentFocusIndex.current]?.focus()
    }
  }, [])

  return {
    registerFocusableElement,
    unregisterFocusableElement,
    focusNext,
    focusPrevious,
    focusCurrent,
  }
}
