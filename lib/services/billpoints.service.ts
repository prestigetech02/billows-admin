import api from '../api'

export interface BillpointTransaction {
  id: number
  user_id: number
  transaction_type: 'earned' | 'used' | 'expired'
  transaction_subtype?: string
  amount: number
  balance_before: number
  balance_after: number
  transaction_id?: number
  description: string
  created_at: string
  user?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface BillpointStats {
  total_earned: number
  total_used: number
  total_balance: number
  active_users: number
  total_transactions: number
  transactions_by_type?: any[]
  transactions_by_subtype?: any[]
  recent_activity?: any[]
}

export interface BillpointFilters {
  page?: number
  limit?: number
  user_id?: number
  transaction_type?: 'earned' | 'used' | 'expired'
  transaction_subtype?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface BillpointsResponse {
  transactions: BillpointTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const billpointsService = {
  /**
   * Get billpoints statistics
   */
  async getStats(): Promise<BillpointStats> {
    const response = await api.get('/admin/billpoints/stats')
    return response.data.data
  },

  /**
   * Get billpoints transactions
   */
  async getTransactions(filters: BillpointFilters = {}): Promise<BillpointsResponse> {
    const response = await api.get('/admin/billpoints/transactions', { params: filters })
    return response.data.data
  },

  /**
   * Get user's billpoints details
   */
  async getUserBillpoints(userId: number) {
    const response = await api.get(`/admin/billpoints/users/${userId}`)
    return response.data.data
  },

  /**
   * Adjust user's billpoints
   */
  async adjustBillpoints(userId: number, amount: number, type: 'add' | 'subtract', description?: string) {
    const response = await api.post(`/admin/billpoints/users/${userId}/adjust`, {
      amount,
      type: type === 'add' ? 'credit' : 'debit',
      description,
    })
    return response.data.data
  },

  /**
   * Get billpoints leaderboard
   */
  async getLeaderboard(filters: { limit?: number; order_by?: string; order?: string } = {}): Promise<any[]> {
    const response = await api.get('/admin/billpoints/leaderboard', { params: filters })
    return Array.isArray(response.data.data) ? response.data.data : []
  },
}

