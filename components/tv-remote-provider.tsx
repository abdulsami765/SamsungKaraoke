"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTVNavigation, useTVFocus } from "@/hooks/use-tv-navigation"

interface TVRemoteContextType {
  registerFocusableElement: (element: HTMLElement | null) => void
  unregisterFocusableElement: (element: HTMLElement | null) => void
  focusNext: () => void
  focusPrevious: () => void
  focusCurrent: () => void
}

const TVRemoteContext = createContext<TVRemoteContextType | null>(null)

interface TVRemoteProviderProps {
  children: ReactNode
  onGlobalReturn?: () => void
  onGlobalExit?: () => void
  onGlobalHome?: () => void
}

export function TVRemoteProvider({ children, onGlobalReturn, onGlobalExit, onGlobalHome }: TVRemoteProviderProps) {
  const { registerFocusableElement, unregisterFocusableElement, focusNext, focusPrevious, focusCurrent } = useTVFocus()

  // Global TV remote navigation
  useTVNavigation({
    onReturn: onGlobalReturn,
    onExit: onGlobalExit,
    onHome: onGlobalHome,
    onArrowDown: focusNext,
    onArrowUp: focusPrevious,
  })

  return (
    <TVRemoteContext.Provider
      value={{
        registerFocusableElement,
        unregisterFocusableElement,
        focusNext,
        focusPrevious,
        focusCurrent,
      }}
    >
      {children}
    </TVRemoteContext.Provider>
  )
}

export function useTVRemoteContext() {
  const context = useContext(TVRemoteContext)
  if (!context) {
    throw new Error("useTVRemoteContext must be used within a TVRemoteProvider")
  }
  return context
}
