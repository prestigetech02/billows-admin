import api from '../api'

export interface ProfitSummary {
  totalProviderFees: number
  totalMarkup: number
  totalCommission: number
  totalNetProfit: number
  transactionCount: number
}

export interface ProfitByType {
  transactionType: string
  totalProviderFees: number
  totalMarkup: number
  totalCommission: number
  totalNetProfit: number
  transactionCount: number
}

export interface ProfitByProvider {
  provider: string
  totalProviderFees: number
  totalMarkup: number
  totalCommission: number
  totalNetProfit: number
  transactionCount: number
}

export interface BillPaymentCommission {
  serviceType: string
  provider: string
  totalCommission: number
  totalAmount: number
  transactionCount: number
  commissionRate: string
}

export interface TransferMarkup {
  provider: string
  totalProviderFees: number
  totalMarkup: number
  totalNetProfit: number
  transactionCount: number
}

export interface ProfitFilters {
  date_from?: string
  date_to?: string
  transaction_type?: string
}

export const profitService = {
  async getProfitSummary(filters: ProfitFilters = {}): Promise<ProfitSummary> {
    const response = await api.get('/admin/profit/summary', { params: filters })
    return response.data.data
  },

  async getProfitByType(filters: ProfitFilters = {}): Promise<ProfitByType[]> {
    const response = await api.get('/admin/profit/by-type', { params: filters })
    return response.data.data
  },

  async getProfitByProvider(filters: ProfitFilters = {}): Promise<ProfitByProvider[]> {
    const response = await api.get('/admin/profit/by-provider', { params: filters })
    return response.data.data
  },

  async getBillPaymentCommissions(filters: ProfitFilters = {}): Promise<BillPaymentCommission[]> {
    const response = await api.get('/admin/profit/bill-commissions', { params: filters })
    return response.data.data
  },

  async getTransferMarkups(filters: ProfitFilters = {}): Promise<TransferMarkup[]> {
    const response = await api.get('/admin/profit/transfer-markups', { params: filters })
    return response.data.data
  },
}

