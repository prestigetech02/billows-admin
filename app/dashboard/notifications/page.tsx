'use client'

import { useState, useEffect } from 'react'
import { Filter, Eye, Bell, Send, FileText, BarChart3, Plus, Edit, Trash2, Clock, Users } from 'lucide-react'
import { notificationsService, Notification, NotificationFilters, NotificationAnalytics, NotificationTemplate } from '@/lib/services/notifications.service'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'

type TabType = 'all' | 'send' | 'templates' | 'analytics'

export default function NotificationsPage() {
  const { showError, showSuccess, showWarning } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [sending, setSending] = useState(false)
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set())

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    user_id: '',
    title: '',
    body: '',
    notification_type: 'general' as string,
    scheduled_at: '',
    template_id: ''
  })

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    title_template: '',
    body_template: '',
    notification_type: 'general',
    variables: [] as string[],
    description: '',
    is_active: true
  })

  useEffect(() => {
    if (activeTab === 'all') {
      fetchNotifications()
    } else if (activeTab === 'templates') {
      fetchTemplates()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab])

  // Real-time updates via Socket.IO (when on notifications page)
  useEffect(() => {
    if (activeTab !== 'all') return

    // Only set up socket connection if we're in the browser
    if (typeof window === 'undefined') return

    let socket: any = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connectSocket = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const io = (await import('socket.io-client')).default
        const { authService } = await import('@/lib/auth')
        
        const token = authService.getToken()
        if (!token) return

        // Socket.IO connects to the server root, not /api endpoint
        // Extract base URL from API URL (remove /api if present)
        let socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        // Remove /api from the end if present
        if (socketUrl.endsWith('/api')) {
          socketUrl = socketUrl.replace(/\/api$/, '')
        } else if (socketUrl.endsWith('/api/')) {
          socketUrl = socketUrl.replace(/\/api\/$/, '')
        }
        // Fallback for localhost
        if (!socketUrl || socketUrl === 'http://localhost:3000') {
          socketUrl = 'http://localhost:4000'
        }
        
        socket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling']
        })

        socket.on('connect', () => {
          console.log('Socket connected for notifications')
          reconnectAttempts = 0
        })

        socket.on('disconnect', () => {
          console.log('Socket disconnected')
        })

        socket.on('notification_status_update', (data: any) => {
          console.log('Notification status update received:', data)
          
          // Update the notifications list if we're viewing it
          if (activeTab === 'all') {
            setNotifications(prev => prev.map(notif => {
              if (notif.id === data.notification_id) {
                return {
                  ...notif,
                  delivery_status: data.delivery_status || notif.delivery_status,
                  opened_at: data.opened_at || notif.opened_at,
                  success_count: data.sent_count !== undefined ? data.sent_count : notif.success_count,
                  failure_count: data.failed_count !== undefined ? data.failed_count : notif.failure_count
                }
              }
              return notif
            }))

            // If it's a new notification, refresh the list
            if (data.status === 'sent' && !notifications.find(n => n.id === data.notification_id)) {
              fetchNotifications()
            }

            // Refresh analytics if we have it loaded
            if (analytics) {
              fetchAnalytics()
            }
          }
        })

        socket.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error)
          reconnectAttempts++
          if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(connectSocket, 2000 * reconnectAttempts)
          }
        })
      } catch (error) {
        console.error('Error setting up socket connection:', error)
      }
    }

    connectSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsService.getNotifications(filters)
      setNotifications(response.notifications)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      showError(error.response?.data?.error || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getTemplates()
      setTemplates(data)
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      showError(error.response?.data?.error || 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getNotificationAnalytics({
        date_from: filters.date_from,
        date_to: filters.date_to,
        notification_type: filters.notification_type
      })
      setAnalytics(data)
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      showError(error.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewNotification = async (notification: Notification) => {
    try {
      // Mark as read when viewing
      setReadNotifications(prev => {
        const newSet = new Set(prev)
        newSet.add(notification.id)
        return newSet
      })
      
      const fullNotification = await notificationsService.getNotificationById(notification.id)
      setSelectedNotification(fullNotification)
      setShowDetail(true)
    } catch (error: any) {
      console.error('Error fetching notification details:', error)
      showError(error.response?.data?.error || 'Failed to fetch notification details')
    }
  }

  const handleMarkAllAsRead = () => {
    const allNotificationIds = notifications.map(n => n.id)
    setReadNotifications(prev => {
      const newSet = new Set(prev)
      allNotificationIds.forEach(id => newSet.add(id))
      return newSet
    })
  }

  const isNotificationRead = (notificationId: number) => {
    return readNotifications.has(notificationId)
  }

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.body) {
      showWarning('Title and body are required')
      return
    }

    try {
      setSending(true)
      await notificationsService.sendNotification({
        user_id: sendForm.user_id ? parseInt(sendForm.user_id) : undefined,
        title: sendForm.title,
        body: sendForm.body,
        notification_type: sendForm.notification_type,
        scheduled_at: sendForm.scheduled_at || undefined,
        template_id: sendForm.template_id ? parseInt(sendForm.template_id) : undefined
      })
      showSuccess('Notification sent successfully')
      setShowSendModal(false)
      setSendForm({
        user_id: '',
        title: '',
        body: '',
        notification_type: 'general',
        scheduled_at: '',
        template_id: ''
      })
      if (activeTab === 'all') {
        await fetchNotifications()
      }
    } catch (error: any) {
      console.error('Error sending notification:', error)
      showError(error.response?.data?.error || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.title_template || !templateForm.body_template) {
      showWarning('Name, title template, and body template are required')
      return
    }

    try {
      if (editingTemplate) {
        await notificationsService.updateTemplate(editingTemplate.id, templateForm)
        showSuccess('Template updated successfully')
      } else {
        await notificationsService.createTemplate(templateForm)
        showSuccess('Template created successfully')
      }
      setShowTemplateModal(false)
      setEditingTemplate(null)
      setTemplateForm({
        name: '',
        title_template: '',
        body_template: '',
        notification_type: 'general',
        variables: [],
        description: '',
        is_active: true
      })
      await fetchTemplates()
    } catch (error: any) {
      console.error('Error saving template:', error)
      showError(error.response?.data?.error || 'Failed to save template')
    }
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      title_template: template.title_template,
      body_template: template.body_template,
      notification_type: template.notification_type,
      variables: template.variables || [],
      description: template.description || '',
      is_active: template.is_active
    })
    setShowTemplateModal(true)
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await notificationsService.deleteTemplate(id)
      showSuccess('Template deleted successfully')
      await fetchTemplates()
    } catch (error: any) {
      console.error('Error deleting template:', error)
      showError(error.response?.data?.error || 'Failed to delete template')
    }
  }

  const handleUseTemplate = (template: NotificationTemplate) => {
    setSendForm(prev => ({
      ...prev,
      template_id: template.id.toString(),
      notification_type: template.notification_type
    }))
    setShowSendModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'opened': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading && notifications.length === 0 && templates.length === 0 && !analytics) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage and monitor push notifications</p>
        </div>
        {activeTab === 'all' && (
          <div className="flex items-center gap-2">
            {notifications.length > 0 && notifications.some(n => !isNotificationRead(n.id)) && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                <Eye className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              All Notifications
            </div>
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Notification
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Filters Panel */}
      {showFilters && activeTab === 'all' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.notification_type || ''}
                onChange={(e) => handleFilterChange({ notification_type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="transaction">Transaction</option>
                <option value="wallet_funding">Wallet Funding</option>
                <option value="kyc_status">KYC Status</option>
                <option value="security_alert">Security Alert</option>
                <option value="admin_broadcast">Admin Broadcast</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                type="number"
                value={filters.user_id || ''}
                onChange={(e) => handleFilterChange({ user_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Filter by user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ date_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange({ date_to: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Tab */}
      {activeTab === 'all' && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success/Failed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const isRead = isNotificationRead(notification.id)
                    return (
                    <tr key={notification.id} className={`hover:bg-gray-50 ${isRead ? 'opacity-75' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          #{notification.id}
                          {!isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.user_id ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {notification.first_name} {notification.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{notification.email}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            All Users
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{notification.body.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getNotificationTypeLabel(notification.notification_type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDeliveryStatusColor(notification.delivery_status)}`}>
                          {notification.delivery_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-green-600">{notification.success_count}</div>
                        <div className="text-red-600">{notification.failure_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.sent_at ? new Date(notification.sent_at).toLocaleDateString() : notification.scheduled_at ? new Date(notification.scheduled_at).toLocaleDateString() : new Date(notification.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewNotification(notification)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (leave empty for broadcast to all users)</label>
              <input
                type="number"
                value={sendForm.user_id}
                onChange={(e) => setSendForm(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty to send to all users"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template (optional)</label>
              <select
                value={sendForm.template_id}
                onChange={(e) => {
                  const template = templates.find(t => t.id.toString() === e.target.value)
                  setSendForm(prev => ({
                    ...prev,
                    template_id: e.target.value,
                    notification_type: template?.notification_type || prev.notification_type
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a template (optional)</option>
                {templates.filter(t => t.is_active).map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
              <select
                value={sendForm.notification_type}
                onChange={(e) => setSendForm(prev => ({ ...prev, notification_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General</option>
                <option value="transaction">Transaction</option>
                <option value="wallet_funding">Wallet Funding</option>
                <option value="kyc_status">KYC Status</option>
                <option value="security_alert">Security Alert</option>
                <option value="admin_broadcast">Admin Broadcast</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={sendForm.title}
                onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body *</label>
              <textarea
                value={sendForm.body}
                onChange={(e) => setSendForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Notification message"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={sendForm.scheduled_at}
                onChange={(e) => setSendForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSendNotification}
                disabled={sending || !sendForm.title || !sendForm.body}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : sendForm.scheduled_at ? 'Schedule' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingTemplate(null)
                setTemplateForm({
                  name: '',
                  title_template: '',
                  body_template: '',
                  notification_type: 'general',
                  variables: [],
                  description: '',
                  is_active: true
                })
                setShowTemplateModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getNotificationTypeLabel(template.notification_type)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{template.title_template}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(template.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Use template"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading && !analytics ? (
            <PageLoader variant="card" />
          ) : analytics ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Notifications</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.overview.total_notifications}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Delivery Rate</div>
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.delivery_rate}%</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Open Rate</div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.overview.open_rate}%</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Sent</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.overview.total_sent}</div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Sent</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Failed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.status_breakdown.map((status) => (
                        <tr key={status.status}>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{status.count}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{status.total_sent}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{status.total_failed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Type Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Type Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Sent</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Failed</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.type_breakdown.map((type) => (
                        <tr key={type.notification_type}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {getNotificationTypeLabel(type.notification_type)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{type.count}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{type.total_sent}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{type.total_failed}</td>
                          <td className="px-4 py-3 text-sm text-blue-600">{type.opened_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Statistics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Statistics (Last 30 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sent</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Success</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Failed</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.daily_stats.map((day) => (
                        <tr key={day.date}>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{day.sent_count}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{day.success_count}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{day.failure_count}</td>
                          <td className="px-4 py-3 text-sm text-blue-600">{day.opened_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">No analytics data available</div>
          )}
        </div>
      )}

      {/* Notification Detail Modal */}
      {showDetail && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedNotification(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm text-gray-900">#{selectedNotification.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedNotification.status)}`}>
                    {selectedNotification.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm text-gray-900">{getNotificationTypeLabel(selectedNotification.notification_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Status</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDeliveryStatusColor(selectedNotification.delivery_status)}`}>
                    {selectedNotification.delivery_status}
                  </span>
                </div>
                {selectedNotification.user_id ? (
                  <div>
                    <label className="text-sm font-medium text-gray-500">User</label>
                    <p className="text-sm text-gray-900">{selectedNotification.first_name} {selectedNotification.last_name}</p>
                    <p className="text-xs text-gray-500">{selectedNotification.email}</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Recipient</label>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      All Users (Broadcast)
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm text-gray-900 font-medium">{selectedNotification.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Success Count</label>
                  <p className="text-sm text-green-600 font-medium">{selectedNotification.success_count}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Failure Count</label>
                  <p className="text-sm text-red-600 font-medium">{selectedNotification.failure_count}</p>
                </div>
                {selectedNotification.scheduled_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedNotification.scheduled_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedNotification.sent_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sent At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedNotification.sent_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedNotification.opened_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Opened At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedNotification.opened_at).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Body</label>
                <p className="text-sm text-gray-900 mt-1">{selectedNotification.body}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingTemplate ? 'Edit Template' : 'Create Template'}</h2>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                <select
                  value={templateForm.notification_type}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, notification_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="transaction">Transaction</option>
                  <option value="wallet_funding">Wallet Funding</option>
                  <option value="kyc_status">KYC Status</option>
                  <option value="security_alert">Security Alert</option>
                  <option value="admin_broadcast">Admin Broadcast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title Template *</label>
                <input
                  type="text"
                  value={templateForm.title_template}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, title_template: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Use {{variable}} for placeholders"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Template *</label>
                <textarea
                  value={templateForm.body_template}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, body_template: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Use {{variable}} for placeholders"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={templateForm.is_active}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false)
                    setEditingTemplate(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

