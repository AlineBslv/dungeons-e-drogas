"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface NavigationHistoryItem {
  path: string
  title: string
  timestamp: number
}

interface NavigationContextType {
  history: NavigationHistoryItem[]
  addToHistory: (path: string, title: string) => void
  goBack: () => void
  canGoBack: boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([])
  const router = useRouter()

  const addToHistory = useCallback((path: string, title: string) => {
    setHistory((prev) => {
      const lastItem = prev[prev.length - 1]

      // Evitar duplicatas consecutivas
      if (lastItem?.path === path) {
        return prev
      }

      return [
        ...prev,
        {
          path,
          title,
          timestamp: Date.now(),
        },
      ]
    })
  }, [])

  const goBack = useCallback(() => {
    if (history.length > 1) {
      // Remove o item atual
      const newHistory = history.slice(0, -1)
      const previousItem = newHistory[newHistory.length - 1]

      setHistory(newHistory)

      if (previousItem) {
        router.push(previousItem.path)
      } else {
        router.back()
      }
    } else {
      router.back()
    }
  }, [history, router])

  const canGoBack = history.length > 1

  return (
    <NavigationContext.Provider
      value={{
        history,
        addToHistory,
        goBack,
        canGoBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
