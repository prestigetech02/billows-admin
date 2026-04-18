'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/lib/contexts/LoadingContext'

export default function NavigationProgress() {
  const pathname = usePathname()
  const { setLoading, setLoadingVariant } = useLoading()
  const [prevPathname, setPrevPathname] = useState(pathname)

  useEffect(() => {
    // Only show loader if pathname actually changed
    if (pathname !== prevPathname) {
      // Determine loader variant based on route
      const determineVariant = (path: string): 'dashboard' | 'table' | 'form' | 'card' => {
        if (path?.includes('/users') || path?.includes('/transactions') || path?.includes('/kyc')) {
          return 'table'
        }
        if (path?.includes('/settings')) {
          return 'form'
        }
        if (path === '/dashboard') {
          return 'dashboard'
        }
        return 'card'
      }

      // Set loading state during navigation
      setLoadingVariant(determineVariant(pathname || ''))
      setLoading(true)
      
      // Clear loading after navigation completes
      const timer = setTimeout(() => {
        setLoading(false)
        setPrevPathname(pathname)
      }, 400)

      return () => {
        clearTimeout(timer)
        setPrevPathname(pathname)
      }
    }
  }, [pathname, prevPathname, setLoading, setLoadingVariant])

  return null
}
