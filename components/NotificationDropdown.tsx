'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, X, Loader2 } from 'lucide-react'
import { notificationsService } from '@/lib/services/notifications.service'
import { Notification } from '@/lib/services/notifications.service'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onNotificationClick?: (notification: Notification) => void
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  onNotificationClick
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
      // Close dropdown when clicking outside
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          onClose()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const result = await notificationsService.getNotifications({
        page: 1,
        limit: 10
      })

      if (result) {
        setNotifications(result.notifications || [])
        // Count unread notifications (delivery_status !== 'opened')
        const unread = (result.notifications || []).filter(
          (n: Notification) => n.delivery_status !== 'opened'
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
    onClose()
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const isUnread = notification.delivery_status !== 'opened'
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      isUnread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium truncate ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatTime(notification.created_at)}</span>
                          {notification.notification_type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">
                                {notification.notification_type.replace('_', ' ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <a
              href="/dashboard/notifications"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              onClick={onClose}
            >
              View all notifications
            </a>
          </div>
        )}
      </div>
    </>
  )
}

// Export hook for getting unread count
export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await notificationsService.getNotifications({
          page: 1,
          limit: 50
        })
        if (result) {
          const unread = (result.notifications || []).filter(
            (n: Notification) => n.delivery_status !== 'opened'
          ).length
          setUnreadCount(unread)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return unreadCount
}

