'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ProtectedRoute from '@/components/ProtectedRoute'
import PageLoader from '@/components/ui/PageLoader'
import NavigationProgress from '@/components/NavigationProgress'
import { SidebarProvider, useSidebar } from '@/lib/contexts/SidebarContext'
import { authService } from '@/lib/auth'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check authentication
        if (!authService.isAuthenticated()) {
          router.push('/login')
          return
        }

        // Verify admin role
        const user = authService.getCurrentUser()
        if (!user || user.role !== 'admin') {
          authService.logout()
          return
        }

        // Initialize auth token in API
        const token = authService.getToken()
        if (token) {
          const api = require('@/lib/api').default
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        setAuthLoading(false)
      } catch (error) {
        console.error('Auth initialization error:', error)
        router.push('/login')
      }
    }

    initializeAuth()
  }, [router])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <NavigationProgress />
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <Header toggleSidebar={toggleSidebar} />
          <main className="p-4 lg:p-6">
            <Suspense fallback={<PageLoader variant="dashboard" />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}

