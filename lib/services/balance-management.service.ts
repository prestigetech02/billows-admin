import api from '../api';

export interface TopupConfig {
  id?: number;
  provider: string;
  currency: string;
  enabled: boolean;
  thresholdAmount: number;
  topupAmount: number;
  minTopupAmount: number;
  maxTopupAmount: number;
  notificationEmails: string[];
  bankAccountId?: number;
}

export interface TopupHistory {
  id: number;
  provider: string;
  currency: string;
  triggerBalance: number;
  topupAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankTransferReference?: string;
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  metadata?: any;
}

export interface BalanceForecast {
  provider: string;
  currency: string;
  forecastDate: string;
  currentBalance: number;
  predictedBalance: number;
  predictedOutflow: number;
  predictedInflow: number;
  confidenceScore: number;
  historicalDays: number;
  recommendation: {
    action: string;
    message: string;
    suggestedAmount?: number;
    priority: string;
  };
}

export const balanceManagementService = {
  // Get auto top-up configuration
  getTopupConfig: async (provider: string, currency: string = 'NGN') => {
    const response = await api.get('/admin/balance-management/topup-config', {
      params: { provider, currency },
    });
    return response.data;
  },

  // Set auto top-up configuration
  setTopupConfig: async (config: Partial<TopupConfig>) => {
    const response = await api.post('/admin/balance-management/topup-config', config);
    return response.data;
  },

  // Get top-up history
  getTopupHistory: async (filters?: {
    provider?: string;
    currency?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/admin/balance-management/topup-history', {
      params: filters,
    });
    return response.data;
  },

  // Generate balance forecast
  generateForecast: async (data: {
    provider: string;
    currency?: string;
    forecastDate?: string;
    historicalDays?: number;
  }) => {
    const response = await api.post('/admin/balance-management/forecast', data);
    return response.data;
  },

  // Get forecast history
  getForecastHistory: async (filters?: {
    provider?: string;
    currency?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/admin/balance-management/forecast-history', {
      params: filters,
    });
    return response.data;
  },

  // Manually trigger top-up check
  checkTopup: async (provider: string, currency: string = 'NGN') => {
    const response = await api.post('/admin/balance-management/check-topup', {
      provider,
      currency,
    });
    return response.data;
  },
};














