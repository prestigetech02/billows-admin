'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Safely read from localStorage with error handling for iPad Safari
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('sidebarCollapsed')
        if (saved !== null) {
          setIsCollapsed(JSON.parse(saved))
        }
      }
    } catch (error) {
      // localStorage not available or blocked (e.g., iPad Safari private mode)
      // Use default state (collapsed = false)
      console.warn('localStorage not available, using default sidebar state:', error)
    }
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      // Safely write to localStorage with error handling
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
        }
      } catch (error) {
        // localStorage not available or blocked - continue with state update
        // State will still work, just won't persist across page reloads
        console.warn('Could not save sidebar state to localStorage:', error)
      }
      return newState
    })
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

