import api from '../api'

export interface Transfer {
  id: number
  user_id: number
  amount: number
  currency: string
  fee: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  provider?: string
  provider_reference?: string
  description?: string
  created_at: string
  updated_at: string
  // Flattened user fields
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  // Remittance details
  recipient_name?: string
  recipient_account?: string
  recipient_bank?: string
  recipient_country?: string
  // Metadata
  metadata?: any
  provider_response?: any
}

export interface TransfersResponse {
  transfers: Transfer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TransferFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  user_id?: number
  provider?: string
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
  is_bulk?: boolean
}

export interface BulkTransferBatch {
  batch_code: string
  user_id: number
  user_email?: string
  user_name?: string
  transfers: Transfer[]
  total_amount: number
  total_fee: number
  created_at: string
  statuses: Record<string, number>
}

export interface BulkTransfersResponse {
  batches: BulkTransferBatch[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TransferAnalytics {
  overview: {
    total_transfers: number
    total_volume: number
    total_fees: number
    completed_count: number
    failed_count: number
    pending_count: number
    processing_count: number
    success_rate: number
    average_amount: number
    average_fee: number
    completed_volume: number
    completed_fees: number
  }
  status_breakdown: Array<{
    status: string
    count: number
    total_amount: number
    total_fee: number
  }>
  daily_volume: Array<{
    date: string
    count: number
    volume: number
    fees: number
    completed: number
  }>
}

export const transfersService = {
  /**
   * Get all transfers with filters
   */
  async getTransfers(filters: TransferFilters = {}): Promise<TransfersResponse> {
    const response = await api.get('/admin/transfers', { params: filters })
    const data = response.data.data

    return {
      transfers: data.transfers || [],
      pagination: data.pagination
    }
  },

  /**
   * Get transfer by ID
   */
  async getTransferById(id: number): Promise<Transfer> {
    const response = await api.get(`/admin/transfers/${id}`)
    return response.data.data
  },

  /**
   * Refund a transfer
   */
  async refundTransfer(id: number, reason?: string, amount?: number): Promise<any> {
    const response = await api.post(`/admin/transfers/${id}/refund`, {
      reason,
      amount
    })
    return response.data.data
  },

  /**
   * Get bulk transfers
   */
  async getBulkTransfers(filters: { page?: number; limit?: number; batch_code?: string; user_id?: number; date_from?: string; date_to?: string } = {}): Promise<BulkTransfersResponse> {
    const response = await api.get('/admin/transfers/bulk', { params: filters })
    return response.data.data
  },

  /**
   * Get transfer analytics
   */
  async getTransferAnalytics(filters: { date_from?: string; date_to?: string; user_id?: number } = {}): Promise<TransferAnalytics> {
    const response = await api.get('/admin/transfers/analytics', { params: filters })
    return response.data.data
  }
}

