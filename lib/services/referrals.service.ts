import api from '../api'

export interface Referral {
  id: number
  referrer_user_id: number
  referred_user_id: number
  referral_code: string
  status: 'pending' | 'completed' | 'rewarded' | 'cancelled'
  completed_at?: string
  rewarded_at?: string
  created_at: string
  referrer?: {
    email: string
    first_name: string
    last_name: string
  }
  referred?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface ReferralStats {
  total_referrals: number
  completed_referrals: number
  pending_referrals: number
  total_earnings: number
  total_withdrawn: number
  available_to_withdraw: number
  pending_withdrawals: {
    count: number
    total: number
  }
  active_referrers?: number
}

export interface ReferralFilters {
  page?: number
  limit?: number
  status?: string
  referrer_user_id?: number
  date_from?: string
  date_to?: string
  search?: string
}

export interface ReferralsResponse {
  referrals: Referral[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const referralsService = {
  /**
   * Get referral statistics
   */
  async getStats(): Promise<ReferralStats> {
    const response = await api.get('/admin/referrals/stats')
    return response.data.data
  },

  /**
   * Get all referrals
   */
  async getReferrals(filters: ReferralFilters = {}): Promise<ReferralsResponse> {
    const response = await api.get('/admin/referrals', { params: filters })
    return response.data.data
  },

  /**
   * Get referral by ID
   */
  async getReferralById(id: number): Promise<Referral> {
    const response = await api.get(`/admin/referrals/${id}`)
    return response.data.data
  },

  /**
   * Complete referral manually
   */
  async completeReferral(id: number) {
    const response = await api.post(`/admin/referrals/${id}/complete`)
    return response.data.data
  },

  /**
   * Award referral earnings
   */
  async awardEarnings(id: number) {
    const response = await api.post(`/admin/referrals/${id}/award`)
    return response.data.data
  },

  /**
   * Get earnings list
   */
  async getEarningsList(filters: any = {}) {
    const response = await api.get('/admin/referrals/earnings/list', { params: filters })
    return response.data.data
  },

  /**
   * Get withdrawal requests
   */
  async getWithdrawalRequests(filters: any = {}) {
    const response = await api.get('/admin/referrals/withdrawals', { params: filters })
    return response.data.data
  },

  /**
   * Approve withdrawal
   */
  async approveWithdrawal(id: number) {
    const response = await api.post(`/admin/referrals/withdrawals/${id}/approve`)
    return response.data.data
  },

  /**
   * Reject withdrawal
   */
  async rejectWithdrawal(id: number, reason?: string) {
    const response = await api.post(`/admin/referrals/withdrawals/${id}/reject`, { reason })
    return response.data.data
  },
}

