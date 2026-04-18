import api from '../api'

export interface DailyStreak {
  id: number
  user_id: number
  current_streak: number
  last_login_date?: string
  last_claim_date?: string
  total_billpoints_earned: number
  created_at: string
  updated_at: string
  user?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface DailyStreakStats {
  totalActiveStreaks: number
  averageStreak: number
  longestStreak: number
  totalBillpointsAwarded: number
  totalClaims: number
}

export interface DailyStreakFilters {
  page?: number
  limit?: number
  user_id?: number
  min_streak?: number
  date_from?: string
  date_to?: string
  search?: string
}

export interface DailyStreaksResponse {
  streaks: DailyStreak[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const dailyStreakService = {
  /**
   * Get daily streak statistics
   */
  async getStats(): Promise<DailyStreakStats> {
    try {
      const response = await api.get('/admin/daily-streak/stats')
      const data = response.data.data
      
      // Map backend snake_case to frontend camelCase
      return {
        totalActiveStreaks: data?.active_streaks ?? 0,
        averageStreak: parseFloat(data?.average_streak ?? 0),
        longestStreak: data?.longest_streak ?? 0,
        totalBillpointsAwarded: data?.total_billpoints_earned ?? 0,
        totalClaims: data?.total_claims ?? 0,
      }
    } catch (error) {
      // Return defaults on error
      return {
        totalActiveStreaks: 0,
        averageStreak: 0,
        longestStreak: 0,
        totalBillpointsAwarded: 0,
        totalClaims: 0,
      }
    }
  },

  /**
   * Get all user streaks
   */
  async getUserStreaks(filters: DailyStreakFilters = {}): Promise<DailyStreaksResponse> {
    const response = await api.get('/admin/daily-streak/users', { params: filters })
    return {
      streaks: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  /**
   * Get user streak details
   */
  async getUserStreakDetails(userId: number) {
    const response = await api.get(`/admin/daily-streak/users/${userId}`)
    return response.data.data
  },

  /**
   * Get streak claims
   */
  async getStreakClaims(filters: any = {}) {
    const response = await api.get('/admin/daily-streak/claims', { params: filters })
    return response.data.data
  },

  /**
   * Reset user streak
   */
  async resetUserStreak(userId: number) {
    const response = await api.post(`/admin/daily-streak/users/${userId}/reset`)
    return response.data.data
  },
}

