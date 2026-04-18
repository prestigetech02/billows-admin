import api from '../api'

export interface UserTag {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  payment_tag: string | null
  payment_tag_set_at: string | null
  payment_tag_changed: boolean
  is_active: boolean
  kyc_status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  wallet_balance: number
  created_at: string
}

export interface TagsResponse {
  tags: UserTag[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TagStats {
  total_users: number
  users_with_tag: number
  users_without_tag: number
  tags_changed: number
  active_users_with_tag: number
  tag_adoption_rate: string
}

export interface TagFilters {
  page?: number
  limit?: number
  search?: string
  has_tag?: 'true' | 'false'
  tag_changed?: 'true' | 'false'
  status?: 'active' | 'suspended'
  date_from?: string
  date_to?: string
}

export const tagsService = {
  /**
   * Get all users with payment tags (with filters)
   */
  async getTags(filters: TagFilters = {}): Promise<TagsResponse> {
    const response = await api.get('/admin/tags', { params: filters })
    return response.data.data
  },

  /**
   * Get tag statistics
   */
  async getTagStats(): Promise<TagStats> {
    const response = await api.get('/admin/tags/stats')
    return response.data.data
  },

  /**
   * Lookup user by tag
   */
  async lookupTag(tag: string): Promise<UserTag> {
    const response = await api.get(`/admin/tags/lookup/${tag}`)
    return response.data.data
  },

  /**
   * Check tag availability
   */
  async checkTagAvailability(tag: string): Promise<{ available: boolean; tag: string; error: string | null }> {
    const response = await api.get(`/admin/tags/check-availability/${tag}`)
    return response.data.data
  }
}

