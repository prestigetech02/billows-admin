'use client'

import { useEffect, useRef, useState } from 'react'
import { UserCheck, UserX, Key, Eye } from 'lucide-react'
import { User } from '@/lib/services/users.service'
import { useToast } from '@/lib/hooks/useToast'

interface UserActionsMenuProps {
  user: User
  anchor: HTMLElement
  onClose: () => void
  onAction: (action: string, userId: number, data?: any) => void
}

export default function UserActionsMenu({
  user,
  anchor,
  onClose,
  onAction
}: UserActionsMenuProps) {
  const { showWarning } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const rect = anchor.getBoundingClientRect()
    const menuWidth = 200 // min-w-[200px] from className
    const viewportWidth = window.innerWidth
    const padding = 16 // Padding from viewport edge
    
    // Calculate if menu would overflow to the right
    const wouldOverflowRight = rect.left + menuWidth > viewportWidth - padding
    
    // Position menu: align right edge with anchor's right edge if it would overflow
    // Otherwise, align left edge with anchor's left edge
    const left = wouldOverflowRight 
      ? rect.right - menuWidth
      : rect.left
    
    // Ensure menu doesn't go off the left edge either
    const finalLeft = Math.max(padding, left)
    
    setPosition({
      top: rect.bottom + 8,
      left: finalLeft
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !anchor.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [anchor, onClose])

  const handleAction = (action: string) => {
    if (action === 'resetPassword') {
      const newPassword = prompt('Enter new password:')
      if (newPassword && newPassword.length >= 6) {
        onAction(action, user.id, { newPassword })
      } else if (newPassword) {
        showWarning('Password must be at least 6 characters')
      }
    } else {
      onAction(action, user.id)
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => {
          handleAction('view')
          onClose()
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
      {user.is_active ? (
        <button
          onClick={() => {
            handleAction('suspend')
            onClose()
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          Suspend User
        </button>
      ) : (
        <button
          onClick={() => {
            handleAction('activate')
            onClose()
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          Activate User
        </button>
      )}
      <button
        onClick={() => {
          handleAction('resetPassword')
          onClose()
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Key className="w-4 h-4" />
        Reset Password
      </button>
    </div>
  )
}
