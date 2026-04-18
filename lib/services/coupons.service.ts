import api from '../api'

export interface Coupon {
  id: number
  code: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_item'
  discount_value: number
  discount_label?: string
  minimum_purchase_amount: number
  maximum_discount_amount?: number
  applicable_to: 'all' | 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'transfer' | 'bills'
  usage_limit?: number
  usage_count: number
  per_user_limit: number
  valid_from?: string
  valid_until: string
  is_active: boolean
  created_by?: number
  created_at: string
  updated_at: string
  created_by_email?: string
  assigned_count?: number
  used_count?: number
}

export interface CouponStats {
  totalCoupons: number
  activeCoupons: number
  totalUsage: number
  totalDiscountsGiven: number
  activeUserCoupons: number
}

export interface CouponFilters {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
  applicable_to?: string
  date_from?: string
  date_to?: string
}

export interface CouponsResponse {
  coupons: Coupon[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const couponsService = {
  /**
   * Get coupon statistics
   */
  async getStats(): Promise<CouponStats> {
    const response = await api.get('/admin/coupons/stats')
    return response.data.data || {
      totalCoupons: 0,
      activeCoupons: 0,
      totalUsage: 0,
      totalDiscountsGiven: 0,
      activeUserCoupons: 0,
    }
  },

  /**
   * Get all coupons
   */
  async getCoupons(filters: CouponFilters = {}): Promise<CouponsResponse> {
    const response = await api.get('/admin/coupons', { params: filters })
    return {
      coupons: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  },

  /**
   * Get coupon by ID
   */
  async getCouponById(id: number): Promise<Coupon> {
    const response = await api.get(`/admin/coupons/${id}`)
    return response.data.data
  },

  /**
   * Create coupon
   */
  async createCoupon(couponData: Partial<Coupon>) {
    const response = await api.post('/admin/coupons', couponData)
    return response.data.data
  },

  /**
   * Update coupon
   */
  async updateCoupon(id: number, couponData: Partial<Coupon>) {
    const response = await api.put(`/admin/coupons/${id}`, couponData)
    return response.data
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(id: number) {
    const response = await api.delete(`/admin/coupons/${id}`)
    return response.data
  },

  /**
   * Get coupon usage history
   */
  async getUsageHistory(filters: any = {}) {
    const response = await api.get('/admin/coupons/usage-history', { params: filters })
    return response.data.data
  },

  /**
   * Assign coupon to users
   */
  async assignToUsers(couponId: number, userIds: number[]) {
    const response = await api.post(`/admin/coupons/${couponId}/assign`, { user_ids: userIds })
    return response.data.data
  },
}

