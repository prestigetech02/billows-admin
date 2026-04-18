import api from '../api'

export interface ScheduledAirtime {
  id: number
  user_id: number
  network: string
  phone_number: string
  amount: number
  scheduled_date: string
  scheduled_time: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused'
  transaction_id?: number
  last_execution_attempt?: string
  next_execution_attempt?: string
  failure_reason?: string
  created_at: string
  updated_at: string
  user?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface ScheduledAirtimeStats {
  totalScheduled: number
  activeScheduled: number
  completedCount: number
  failedCount: number
  totalAmount: number
}

export interface ScheduledAirtimeFilters {
  page?: number
  limit?: number
  status?: string
  user_id?: number
  network?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface ScheduledAirtimeResponse {
  schedules: ScheduledAirtime[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const scheduledAirtimeService = {
  async getStats(): Promise<ScheduledAirtimeStats> {
    const response = await api.get('/admin/scheduled-airtime/stats')
    return response.data.data || {
      totalScheduled: 0,
      activeScheduled: 0,
      completedCount: 0,
      failedCount: 0,
      totalAmount: 0,
    }
  },

  async getScheduledAirtime(filters: ScheduledAirtimeFilters = {}): Promise<ScheduledAirtimeResponse> {
    const response = await api.get('/admin/scheduled-airtime', { params: filters })
    return {
      schedules: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  async getScheduledAirtimeById(id: number): Promise<ScheduledAirtime> {
    const response = await api.get(`/admin/scheduled-airtime/${id}`)
    return response.data.data
  },

  async cancelScheduledAirtime(id: number) {
    const response = await api.put(`/admin/scheduled-airtime/${id}/cancel`)
    return response.data.data
  },

  async pauseScheduledAirtime(id: number) {
    const response = await api.put(`/admin/scheduled-airtime/${id}/pause`)
    return response.data.data
  },

  async resumeScheduledAirtime(id: number) {
    const response = await api.put(`/admin/scheduled-airtime/${id}/resume`)
    return response.data.data
  },

  async getExecutionHistory(filters: any = {}) {
    const response = await api.get('/admin/scheduled-airtime/history', { params: filters })
    return response.data.data
  },
}

