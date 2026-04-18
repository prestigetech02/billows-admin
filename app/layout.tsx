import type { Metadata } from 'next'
import './globals.css'
import { LoadingProvider } from '@/lib/contexts/LoadingContext'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'

export const metadata: Metadata = {
  title: 'Billows Admin',
  description: 'Admin dashboard for Billows',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <LoadingProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
            </ToastProvider>
          </LoadingProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

