import api from '../api'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  role: 'user' | 'admin'
  kyc_status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  tier?: number
  is_active: boolean
  created_at: string
  updated_at: string
  wallet_balance?: number
  total_transactions?: number
  virtual_account?: {
    account_number: string
    bank_name: string
    account_name?: string
    is_active: boolean
  }
  wallet?: {
    balance: number
    currency: string
  }
}

export interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: 'user' | 'admin'
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  status?: 'active' | 'suspended'
  date_from?: string
  date_to?: string
}

export const usersService = {
  /**
   * Get all users with filters
   */
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const response = await api.get('/admin/users', { params: filters })
    const data = response.data.data

    // Backend returns phone_number – map it into phone for the frontend type
    return {
      users: (data.users || []).map((u: any) => ({
        ...u,
        phone: u.phone ?? u.phone_number ?? ''
      })),
      pagination: data.pagination
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`)
    const u = response.data.data as any
    return {
      ...u,
      phone: u.phone ?? u.phone_number ?? ''
    }
  },

  /**
   * Update user
   */
  async updateUser(id: number, updates: { is_active?: boolean; role?: 'user' | 'admin' }): Promise<User> {
    const response = await api.put(`/admin/users/${id}`, updates)
    return response.data.data
  },

  /**
   * Suspend user
   */
  async suspendUser(id: number): Promise<User> {
    const response = await api.post(`/admin/users/${id}/suspend`)
    return response.data.data
  },

  /**
   * Activate user
   */
  async activateUser(id: number): Promise<User> {
    const response = await api.post(`/admin/users/${id}/activate`)
    return response.data.data
  },

  /**
   * Reset user password
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    await api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword })
  },

  /**
   * Export users to CSV
   */
  async exportUsers(filters: Omit<UserFilters, 'page' | 'limit'> = {}): Promise<Blob> {
    const response = await api.get('/admin/users/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Get user billpoints balance (if available)
   */
  async getUserBillpoints(userId: number): Promise<{ balance: number; total_earned: number; total_used: number } | null> {
    try {
      const response = await api.get(`/admin/users/${userId}/billpoints`)
      return response.data.data
    } catch (error: any) {
      // If endpoint doesn't exist or fails, return null
      return null
    }
  },

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: number, filters: { page?: number; limit?: number } = {}): Promise<{ transactions: any[]; pagination: any }> {
    const response = await api.get(`/admin/users/${userId}/transactions`, { params: filters })
    return response.data.data
  },

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: number, limit: number = 100): Promise<{ activities: any[] }> {
    const response = await api.get(`/admin/users/${userId}/activity-timeline`, { params: { limit } })
    return response.data.data
  },

  /**
   * Adjust user balance
   */
  async adjustUserBalance(userId: number, amount: number, currency: string, reason: string): Promise<any> {
    const response = await api.post(`/admin/users/${userId}/balance/adjust`, {
      amount,
      currency,
      reason
    })
    return response.data.data
  },

  /**
   * Get user balance for a specific currency
   */
  async getUserBalance(userId: number, currency: string): Promise<{ balance: number; currency: string } | null> {
    try {
      const response = await api.get(`/admin/users/${userId}/balance`, {
        params: { currency }
      })
      return response.data.data
    } catch (error: any) {
      // If endpoint doesn't exist or fails, return null
      return null
    }
  }
}
