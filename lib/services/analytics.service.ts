import api from '../api'

export interface AnalyticsOverview {
  overview: {
    total_users: number
    total_transactions: number
    completed_transactions: number
    failed_transactions: number
    pending_transactions: number
    total_volume: number
    total_revenue: number
    avg_transaction_amount: number
    success_rate: string
    total_wallet_funding: number
    total_bill_payments: number
    total_remittances: number
  }
  transaction_type_breakdown: Array<{
    transaction_type: string
    count: number
    total_amount: number
    total_fees: number
    completed_count: number
    failed_count: number
  }>
  status_breakdown: Array<{
    status: string
    count: number
    total_amount: number
    total_fees: number
  }>
}

export interface RevenueAnalytics {
  period: 'day' | 'week' | 'month'
  total_revenue: number
  total_volume: number
  total_transactions: number
  revenue_trends: Array<{
    period: string
    date: string
    total_revenue: number
    transaction_count: number
    total_volume: number
    avg_fee: number
  }>
  revenue_by_type: Array<{
    transaction_type: string
    total_revenue: number
    transaction_count: number
    total_volume: number
    avg_fee: number
    percentage: string
  }>
}

export interface UserActivityAnalytics {
  period: 'day' | 'week' | 'month'
  user_statistics: {
    total_users: number
    active_users_count: number
    deleted_users_count: number
    verified_users: number
    pending_kyc_users: number
    rejected_kyc_users: number
  }
  new_users_trend: Array<{
    period: string
    date: string
    new_users: number
  }>
  active_users_trend: Array<{
    period: string
    date: string
    active_users: number
  }>
  top_active_users: Array<{
    user_id: number
    email: string
    first_name: string
    last_name: string
    transaction_count: number
    total_volume: number
    total_fees_paid: number
  }>
}

export interface TransactionTrends {
  period: 'day' | 'week' | 'month'
  transaction_trends: Array<{
    period: string
    date: string
    transaction_count: number
    total_volume: number
    total_revenue: number
    completed_count: number
    failed_count: number
    pending_count: number
    avg_amount: number
    success_rate: string
  }>
  type_trends: Record<string, Record<string, {
    transaction_count: number
    total_volume: number
  }>>
}

export interface AnalyticsFilters {
  date_from?: string
  date_to?: string
  period?: 'day' | 'week' | 'month'
  transaction_type?: string
  status?: string
}

export const analyticsService = {
  /**
   * Get analytics overview
   */
  async getOverview(filters: AnalyticsFilters = {}): Promise<AnalyticsOverview> {
    const response = await api.get('/admin/analytics/overview', { params: filters })
    return response.data.data
  },

  /**
   * Get revenue analytics
   */
  async getRevenue(filters: AnalyticsFilters = {}): Promise<RevenueAnalytics> {
    const response = await api.get('/admin/analytics/revenue', { params: filters })
    return response.data.data
  },

  /**
   * Get user activity analytics
   */
  async getUserActivity(filters: AnalyticsFilters = {}): Promise<UserActivityAnalytics> {
    const response = await api.get('/admin/analytics/user-activity', { params: filters })
    return response.data.data
  },

  /**
   * Get transaction trends
   */
  async getTransactionTrends(filters: AnalyticsFilters = {}): Promise<TransactionTrends> {
    const response = await api.get('/admin/analytics/transaction-trends', { params: filters })
    return response.data.data
  },

  /**
   * Export analytics data as CSV
   */
  async exportAnalytics(type: 'revenue' | 'transactions' | 'users' | 'overview', filters: AnalyticsFilters = {}): Promise<Blob> {
    const response = await api.get('/admin/analytics/export', {
      params: { type, ...filters, format: 'csv' },
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Get provider metrics (Phase 5B)
   */
  async getProviderMetrics(provider: 'paystack' | 'flutterwave', currency: string = 'NGN', days?: number) {
    const response = await api.get(`/admin/analytics/metrics/${provider}`, {
      params: { currency, days },
    })
    return response.data
  },

  /**
   * Compare providers (Phase 5B)
   */
  async compareProviders(currency: string = 'NGN', days?: number) {
    const response = await api.get('/admin/analytics/compare', {
      params: { currency, days },
    })
    return response.data
  },

  /**
   * Get balance utilization report (Phase 5B)
   */
  async getBalanceUtilization(provider: 'paystack' | 'flutterwave', currency: string = 'NGN', days?: number) {
    const response = await api.get(`/admin/analytics/utilization/${provider}`, {
      params: { currency, days },
    })
    return response.data
  },
}








