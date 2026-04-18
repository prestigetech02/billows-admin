'use client'

import { Toast, ToastComponent } from './Toast'
import { useToast } from '@/lib/hooks/useToast'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  )
}

