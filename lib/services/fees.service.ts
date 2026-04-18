import api from '../api'

export interface FeeConfiguration {
  id: number
  transaction_type: string
  fee_type: 'percentage' | 'fixed' | 'tiered'
  fee_value: number
  min_fee: number | null
  max_fee: number | null
  amount_min: number | null
  amount_max: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateFeeData {
  transaction_type: string
  fee_type: 'percentage' | 'fixed' | 'tiered'
  fee_value: number
  min_fee?: number | null
  max_fee?: number | null
  amount_min?: number | null
  amount_max?: number | null
  is_active?: boolean
}

export interface UpdateFeeData {
  fee_value?: number
  min_fee?: number | null
  max_fee?: number | null
  amount_min?: number | null
  amount_max?: number | null
  is_active?: boolean
}

export const feesService = {
  // Get all fee configurations
  async getFees(): Promise<FeeConfiguration[]> {
    try {
      const response = await api.get('/admin/settings/fees')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to fetch fees')
    } catch (error: any) {
      console.error('Error fetching fees:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch fees')
    }
  },

  // Create a new fee configuration
  async createFee(data: CreateFeeData): Promise<FeeConfiguration> {
    try {
      const response = await api.post('/admin/settings/fees', data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to create fee configuration')
    } catch (error: any) {
      console.error('Error creating fee:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to create fee configuration')
    }
  },

  // Update a fee configuration
  async updateFee(id: number, data: UpdateFeeData): Promise<FeeConfiguration> {
    try {
      const response = await api.put(`/admin/settings/fees/${id}`, data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to update fee configuration')
    } catch (error: any) {
      console.error('Error updating fee:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to update fee configuration')
    }
  },

  // Get fee configuration by ID
  async getFeeById(id: number): Promise<FeeConfiguration> {
    try {
      const response = await api.get(`/admin/settings/fees/${id}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to fetch fee configuration')
    } catch (error: any) {
      console.error('Error fetching fee:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch fee configuration')
    }
  }
}
