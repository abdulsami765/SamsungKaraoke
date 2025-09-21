"use client"

import type React from "react"

import { forwardRef, useEffect, useRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useTVRemoteContext } from "@/components/tv-remote-provider"
import { cn } from "@/lib/utils"

interface TVButtonProps extends ButtonProps {
  tvFocusable?: boolean
  onTVSelect?: () => void
}

export const TVButton = forwardRef<HTMLButtonElement, TVButtonProps>(
  ({ className, tvFocusable = true, onTVSelect, onClick, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { registerFocusableElement, unregisterFocusableElement } = useTVRemoteContext()

    useEffect(() => {
      const element = buttonRef.current
      if (tvFocusable && element) {
        registerFocusableElement(element)
        return () => unregisterFocusableElement(element)
      }
    }, [tvFocusable, registerFocusableElement, unregisterFocusableElement])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onTVSelect?.()
      onClick?.(event)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        onTVSelect?.()
        onClick?.(event as any)
      }
    }

    return (
      <Button
        ref={ref || buttonRef}
        className={cn(
          "focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200",
          "hover:scale-105 active:scale-95",
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)

TVButton.displayName = "TVButton"
