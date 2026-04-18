import { useToastContext } from '@/lib/contexts/ToastContext'

export function useToast() {
  const context = useToastContext()
  return context
}

