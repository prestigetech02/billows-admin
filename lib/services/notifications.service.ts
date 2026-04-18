import api from '../api'

export interface Notification {
  id: number
  user_id?: number
  title: string
  body: string
  notification_type: 'general' | 'transaction' | 'wallet_funding' | 'kyc_status' | 'security_alert' | 'admin_broadcast'
  status: 'pending' | 'sent' | 'failed' | 'scheduled'
  scheduled_at?: string
  sent_at?: string
  delivery_status: 'pending' | 'delivered' | 'failed' | 'opened'
  opened_at?: string
  device_tokens_count: number
  success_count: number
  failure_count: number
  template_id?: number
  metadata?: any
  created_by?: number
  created_at: string
  updated_at: string
  // Flattened user fields
  email?: string
  first_name?: string
  last_name?: string
  // Creator fields
  creator_email?: string
  creator_first_name?: string
  creator_last_name?: string
  // Template fields
  template_name?: string
}

export interface NotificationTemplate {
  id: number
  name: string
  title_template: string
  body_template: string
  notification_type: string
  is_active: boolean
  variables?: string[]
  description?: string
  created_by?: number
  created_at: string
  updated_at: string
  // Creator fields
  creator_email?: string
  creator_first_name?: string
  creator_last_name?: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface NotificationFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'sent' | 'failed' | 'scheduled'
  notification_type?: string
  user_id?: number
  date_from?: string
  date_to?: string
}

export interface NotificationAnalytics {
  overview: {
    total_notifications: number
    total_sent: number
    total_failed: number
    total_device_tokens: number
    delivery_rate: number
    open_rate: number
    unique_users: number
    opened_count: number
  }
  status_breakdown: Array<{
    status: string
    count: number
    total_sent: number
    total_failed: number
  }>
  type_breakdown: Array<{
    notification_type: string
    count: number
    total_sent: number
    total_failed: number
    opened_count: number
  }>
  daily_stats: Array<{
    date: string
    sent_count: number
    success_count: number
    failure_count: number
    opened_count: number
  }>
}

export const notificationsService = {
  /**
   * Get all notifications with filters
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsResponse> {
    const response = await api.get('/admin/notifications', { params: filters })
    const data = response.data.data

    return {
      notifications: data.notifications || [],
      pagination: data.pagination
    }
  },

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await api.get(`/admin/notifications/${id}`)
    return response.data.data
  },

  /**
   * Send notification
   */
  async sendNotification(data: {
    user_id?: number
    title: string
    body: string
    notification_type?: string
    scheduled_at?: string
    template_id?: number
    template_variables?: any
    metadata?: any
  }): Promise<any> {
    const response = await api.post('/admin/notifications/send', data)
    return response.data.data
  },

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(filters: { date_from?: string; date_to?: string; notification_type?: string } = {}): Promise<NotificationAnalytics> {
    const response = await api.get('/admin/notifications/analytics', { params: filters })
    return response.data.data
  },

  /**
   * Get all templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await api.get('/admin/notifications/templates')
    return response.data.data.templates
  },

  /**
   * Create template
   */
  async createTemplate(data: {
    name: string
    title_template: string
    body_template: string
    notification_type?: string
    variables?: string[]
    description?: string
    is_active?: boolean
  }): Promise<any> {
    const response = await api.post('/admin/notifications/templates', data)
    return response.data.data
  },

  /**
   * Update template
   */
  async updateTemplate(id: number, data: {
    name?: string
    title_template?: string
    body_template?: string
    notification_type?: string
    variables?: string[]
    description?: string
    is_active?: boolean
  }): Promise<any> {
    const response = await api.put(`/admin/notifications/templates/${id}`, data)
    return response.data
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: number): Promise<any> {
    const response = await api.delete(`/admin/notifications/templates/${id}`)
    return response.data
  }
}

// Note: Mark notification as opened is handled by the mobile app via /api/notifications/:id/mark-opened

