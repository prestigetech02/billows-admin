import api from '../api'

export interface DashboardStats {
  users: {
    total: number
    active: number
    new_today: number
    new_this_week: number
    growth_percentage: number
  }
  kyc: {
    pending: number
    approved_today: number
    rejected_today: number
  }
  revenue: {
    total: number
    today: number
    this_week: number
    this_month: number
    growth_percentage: number
  }
  transactions: {
    total: number
    today: number
    success_rate: number
    average_value: number
  }
  transfers: {
    total: number
    today: number
    total_volume: number
    total_fees: number
    pending: number
    failed: number
  }
  qr_payments: {
    total: number
    today: number
    completed: number
    pending: number
    expired: number
    total_amount: number
  }
  rewards: {
    total: number
    today: number
    pending: number
  }
  pending_actions: {
    total: number
    kyc: number
    transfers: number
    qr_payments: number
  }
}

export interface RevenueChartData {
  date: string
  revenue: number
  fees: number
}

export interface TransactionChartData {
  date: string
  count: number
  success: number
  failed: number
}

export interface RecentActivity {
  id: string
  type: 'transaction' | 'kyc' | 'user' | 'transfer' | 'qr_payment'
  action: string
  user: {
    id: number
    email: string
    name: string
  }
  details: any
  created_at: string
}

export interface RecentActivityResponse {
  activities: RecentActivity[]
  transactions: any[]
  kyc_submissions: any[]
  new_users: any[]
}

export interface PendingActions {
  kyc: number
  transfers: number
  qr_payments: number
  total: number
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats')
    return response.data.data
  },

  /**
   * Get revenue chart data
   */
  async getRevenueChart(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<RevenueChartData[]> {
    const response = await api.get('/admin/dashboard/revenue-chart', {
      params: { period }
    })
    return response.data.data
  },

  /**
   * Get transaction chart data
   */
  async getTransactionChart(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<TransactionChartData[]> {
    const response = await api.get('/admin/dashboard/transaction-chart', {
      params: { period }
    })
    return response.data.data
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 50): Promise<RecentActivityResponse> {
    const response = await api.get('/admin/dashboard/recent-activity', {
      params: { limit }
    })
    return response.data.data
  },

  /**
   * Get pending actions
   */
  async getPendingActions(): Promise<PendingActions> {
    const response = await api.get('/admin/dashboard/pending-actions')
    return response.data.data
  }
}





















