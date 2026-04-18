import api from '../api'

export interface Transaction {
  id: number
  user_id: number
  transaction_type: string
  category?: string
  amount: number
  currency: string
  fee: number
  provider_fee?: number
  markup_fee?: number
  provider_commission?: number
  net_profit?: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  provider?: string
  provider_reference?: string
  description?: string
  created_at: string
  updated_at: string
  // Flattened user fields for convenience
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  // Raw nested user object from backend (if needed)
  user?: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number?: string
  }
  // Provider / metadata
  metadata?: any
  provider_response?: any
  // Transaction-type specific details
  bill_payment?: any
  currency_conversion?: any
  waec_pin?: any
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TransactionFilters {
  page?: number
  limit?: number
  type?: string
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  user_id?: number
  category?: string
  provider?: string
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
}

export const transactionsService = {
  /**
   * Get all transactions with filters
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    const response = await api.get('/admin/transactions', { params: filters })
    const data = response.data.data

    // Backend returns { transactions: [...], pagination, stats }
    // Flatten user object into top-level fields for easier consumption
    const mapped = {
      transactions: (data.transactions || []).map((t: any) => ({
        ...t,
        email: t.user?.email ?? t.email,
        first_name: t.user?.first_name ?? t.first_name,
        last_name: t.user?.last_name ?? t.last_name,
        phone_number: t.user?.phone_number ?? t.phone_number
      })),
      pagination: data.pagination
    }

    return mapped
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: number): Promise<Transaction> {
    const response = await api.get(`/admin/transactions/${id}`)
    const t = response.data.data

    // Flatten user object and keep type-specific details
    const mapped: Transaction = {
      ...t,
      email: t.user?.email ?? t.email,
      first_name: t.user?.first_name ?? t.first_name,
      last_name: t.user?.last_name ?? t.last_name,
      phone_number: t.user?.phone_number ?? t.phone_number,
      user: t.user,
      metadata: t.metadata,
      provider_response: t.provider_response,
      bill_payment: t.bill_payment,
      currency_conversion: t.currency_conversion,
      waec_pin: t.waec_pin
    }

    return mapped
  },

  /**
   * Refund transaction
   */
  async refundTransaction(id: number): Promise<Transaction> {
    const response = await api.post(`/admin/transactions/${id}/refund`)
    return response.data.data
  },

  /**
   * Retry transaction
   */
  async retryTransaction(id: number): Promise<Transaction> {
    const response = await api.post(`/admin/transactions/${id}/retry`)
    return response.data.data
  },

  /**
   * Export transactions to CSV
   */
  async exportTransactions(filters: Omit<TransactionFilters, 'page' | 'limit'> = {}): Promise<Blob> {
    const response = await api.get('/admin/transactions/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }
}
