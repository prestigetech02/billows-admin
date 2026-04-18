import api from '../api'

export interface QRPaymentContribution {
  id: number
  payer_id: number
  amount: number
  currency: string
  transaction_id?: number
  payer_name?: string
  created_at: string
  payer_email?: string
  payer_first_name?: string
  payer_last_name?: string
}

export interface QRPayment {
  id: number
  qr_code: string
  user_id: number
  qr_type: 'static_merchant' | 'dynamic_p2p'
  amount?: number
  currency: string
  status: 'pending' | 'completed' | 'expired' | 'cancelled'
  transaction_id?: number
  payer_id?: number
  metadata?: any
  expires_at?: string
  target_amount?: number
  amount_collected?: number
  allow_multiple_payments: boolean
  created_at: string
  updated_at: string
  // Flattened user fields
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  // Payer fields
  payer_email?: string
  payer_first_name?: string
  payer_last_name?: string
  // Contribution count
  contribution_count?: number
  // Contributions (for split bills)
  contributions?: QRPaymentContribution[]
}

export interface QRPaymentsResponse {
  qrPayments: QRPayment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface QRPaymentFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'completed' | 'expired' | 'cancelled'
  qr_type?: 'static_merchant' | 'dynamic_p2p'
  user_id?: number
  date_from?: string
  date_to?: string
}

export const qrPaymentsService = {
  /**
   * Get all QR payments with filters
   */
  async getQRPayments(filters: QRPaymentFilters = {}): Promise<QRPaymentsResponse> {
    const response = await api.get('/admin/qr-payments', { params: filters })
    const data = response.data.data

    return {
      qrPayments: data.qrPayments || [],
      pagination: data.pagination
    }
  },

  /**
   * Get QR payment by ID
   */
  async getQRPaymentById(id: number): Promise<QRPayment> {
    const response = await api.get(`/admin/qr-payments/${id}`)
    return response.data.data
  },

  /**
   * Cancel QR payment
   */
  async cancelQRPayment(id: number): Promise<QRPayment> {
    const response = await api.post(`/admin/qr-payments/${id}/cancel`)
    return response.data.data
  },

  /**
   * Expire QR payment
   */
  async expireQRPayment(id: number): Promise<QRPayment> {
    const response = await api.post(`/admin/qr-payments/${id}/expire`)
    return response.data.data
  },

  /**
   * Get QR payment analytics
   */
  async getQRPaymentAnalytics(filters: { date_from?: string; date_to?: string; user_id?: number; qr_type?: string } = {}): Promise<QRPaymentAnalytics> {
    const response = await api.get('/admin/qr-payments/analytics', { params: filters })
    return response.data.data
  }
}

export interface QRPaymentAnalytics {
  overview: {
    total_qr_codes: number
    completed_count: number
    pending_count: number
    expired_count: number
    cancelled_count: number
    static_merchant_count: number
    dynamic_p2p_count: number
    completion_rate: number
    total_completed_amount: number
    average_amount: number
  }
  status_breakdown: Array<{
    status: string
    count: number
    total_amount: number
  }>
  type_breakdown: Array<{
    qr_type: string
    count: number
    completed_count: number
    total_amount: number
  }>
  split_bill_stats: {
    total_split_bills: number
    completed_split_bills: number
    total_collected: number
    total_target_amount: number
    avg_target_amount: number
  }
  daily_stats: Array<{
    date: string
    created_count: number
    completed_count: number
    expired_count: number
    completed_amount: number
  }>
}

