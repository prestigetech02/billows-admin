import api from '../api'

export interface AutoTopup {
  id: number
  user_id: number
  network: string
  phone_number: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'when_balance_low'
  threshold_amount?: number
  status: 'active' | 'paused' | 'cancelled'
  next_topup_date?: string
  last_topup_date?: string
  created_at: string
  updated_at: string
  user?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface AutoTopupStats {
  totalTopups: number
  activeTopups: number
  pausedTopups: number
  totalAmount: number
  totalExecutions: number
}

export interface AutoTopupFilters {
  page?: number
  limit?: number
  status?: string
  user_id?: number
  network?: string
  frequency?: string
  search?: string
}

export interface AutoTopupResponse {
  topups: AutoTopup[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const autoTopupService = {
  async getStats(): Promise<AutoTopupStats> {
    const response = await api.get('/admin/auto-topup/stats')
    return response.data.data || {
      totalTopups: 0,
      activeTopups: 0,
      pausedTopups: 0,
      totalAmount: 0,
      totalExecutions: 0,
    }
  },

  async getAutoTopups(filters: AutoTopupFilters = {}): Promise<AutoTopupResponse> {
    const response = await api.get('/admin/auto-topup', { params: filters })
    return {
      topups: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  async getAutoTopupById(id: number): Promise<AutoTopup> {
    const response = await api.get(`/admin/auto-topup/${id}`)
    return response.data.data
  },

  async pauseAutoTopup(id: number) {
    const response = await api.put(`/admin/auto-topup/${id}/pause`)
    return response.data.data
  },

  async resumeAutoTopup(id: number) {
    const response = await api.put(`/admin/auto-topup/${id}/resume`)
    return response.data.data
  },

  async cancelAutoTopup(id: number) {
    const response = await api.put(`/admin/auto-topup/${id}/cancel`)
    return response.data.data
  },

  async getExecutionHistory(filters: any = {}) {
    const response = await api.get('/admin/auto-topup/history', { params: filters })
    return response.data.data
  },
}

