'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import PageLoader from './ui/PageLoader'

export default function NavigationLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [loaderVariant, setLoaderVariant] = useState<'dashboard' | 'table' | 'form' | 'card'>('dashboard')

  useEffect(() => {
    // Determine loader variant based on route
    if (pathname?.includes('/users') || pathname?.includes('/transactions') || pathname?.includes('/kyc')) {
      setLoaderVariant('table')
    } else if (pathname?.includes('/settings')) {
      setLoaderVariant('form')
    } else if (pathname === '/dashboard') {
      setLoaderVariant('dashboard')
    } else {
      setLoaderVariant('card')
    }

    // Show loader briefly during navigation
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300) // Hide after 300ms (smooth transition)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <PageLoader variant={loaderVariant} />
      </div>
    </div>
  )
}
