'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingVariant: 'dashboard' | 'table' | 'form' | 'card'
  setLoadingVariant: (variant: 'dashboard' | 'table' | 'form' | 'card') => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingVariant, setLoadingVariant] = useState<'dashboard' | 'table' | 'form' | 'card'>('dashboard')

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingVariant,
        setLoadingVariant
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
