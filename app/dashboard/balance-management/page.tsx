'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { balanceManagementService, TopupConfig, TopupHistory, BalanceForecast } from '@/lib/services/balance-management.service'
import { Settings, History, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'

export default function BalanceManagementPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'history' | 'forecast'>('config')
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'flutterwave'>('paystack')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance Management</h1>
          <p className="text-gray-600 mt-1">Manage automatic top-ups and balance forecasting</p>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedProvider('paystack')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedProvider === 'paystack'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Paystack
        </button>
        <button
          onClick={() => setSelectedProvider('flutterwave')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedProvider === 'flutterwave'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Flutterwave
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Auto Top-Up Config
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Top-Up History
            </div>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'forecast'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Balance Forecast
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'config' && <TopupConfigTab provider={selectedProvider} />}
        {activeTab === 'history' && <TopupHistoryTab provider={selectedProvider} />}
        {activeTab === 'forecast' && <ForecastTab provider={selectedProvider} />}
      </div>
    </div>
  )
}

// Top-Up Configuration Tab
function TopupConfigTab({ provider }: { provider: 'paystack' | 'flutterwave' }) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const { showSuccess, showError, showInfo } = useToast()

  const { data: config, isLoading, error: configError } = useQuery({
    queryKey: ['topup-config', provider],
    queryFn: async () => {
      try {
        const response = await balanceManagementService.getTopupConfig(provider)
        return response
      } catch (error: any) {
        // If config doesn't exist, return default
        if (error.response?.status === 404) {
          return {
            success: true,
            data: {
              enabled: false,
              thresholdAmount: 0,
              topupAmount: 0,
              minTopupAmount: 10000,
              maxTopupAmount: 1000000,
              notificationEmails: [],
              currency: 'NGN',
            },
          }
        }
        throw error
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TopupConfig>) => balanceManagementService.setTopupConfig({ 
      ...data, 
      provider,
      currency: 'NGN' // Ensure currency is included
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['topup-config', provider] })
      setIsEditing(false)
      if (response.success) {
        showSuccess('Configuration saved successfully!')
      } else {
        showError(response.error || 'Failed to save configuration')
      }
    },
    onError: (error: any) => {
      console.error('Error saving configuration:', error)
      showError(error.response?.data?.error || error.message || 'Failed to save configuration')
    },
  })

  const checkTopupMutation = useMutation({
    mutationFn: () => balanceManagementService.checkTopup(provider),
    onSuccess: (data) => {
      if (data.data?.topupTriggered) {
        showSuccess(`Top-up triggered! Amount: ${data.data.topupAmount}`)
      } else {
        showInfo(`No top-up needed. ${data.data?.reason || 'Balance is above threshold'}`)
      }
      queryClient.invalidateQueries({ queryKey: ['topup-history', provider] })
    },
    onError: (error: any) => {
      console.error('Error checking top-up:', error)
      showError(error.response?.data?.error || error.message || 'Failed to check top-up')
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  // Handle response structure: { success: true, data: config } or { data: config }
  const configData = (config?.data || config?.success ? (config.data || config) : config) || {
    enabled: false,
    thresholdAmount: 0,
    topupAmount: 0,
    minTopupAmount: 10000,
    maxTopupAmount: 1000000,
    notificationEmails: [],
    currency: 'NGN',
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Auto Top-Up Configuration</h2>
          <div className="flex gap-2">
            <button
              onClick={() => checkTopupMutation.mutate()}
              disabled={checkTopupMutation.isPending}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checkTopupMutation.isPending ? 'animate-spin' : ''}`} />
              Check Now
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <TopupConfigForm
            config={configData}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  {configData.enabled ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      <XCircle className="w-4 h-4" />
                      Disabled
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <div className="mt-1 text-gray-900">{configData.currency || 'NGN'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Threshold Amount</label>
                <div className="mt-1 text-gray-900">
                  {configData.currency || 'NGN'} {configData.thresholdAmount?.toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Top-Up Amount</label>
                <div className="mt-1 text-gray-900">
                  {configData.currency || 'NGN'} {configData.topupAmount?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            {configData.notificationEmails && configData.notificationEmails.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notification Emails</label>
                <div className="mt-1 text-gray-900">{configData.notificationEmails.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Top-Up Configuration Form
function TopupConfigForm({
  config,
  onSubmit,
  onCancel,
}: {
  config: Partial<TopupConfig>
  onSubmit: (data: Partial<TopupConfig>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    enabled: config.enabled || false,
    thresholdAmount: config.thresholdAmount || 0,
    topupAmount: config.topupAmount || 0,
    notificationEmails: (config.notificationEmails || []).join(', '),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      notificationEmails: formData.notificationEmails.split(',').map((e) => e.trim()).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="enabled" className="font-medium text-gray-700">
          Enable Auto Top-Up
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Threshold Amount (NGN)
          </label>
          <input
            type="number"
            value={formData.thresholdAmount}
            onChange={(e) => setFormData({ ...formData, thresholdAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Top-up triggers when balance falls below this amount</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Top-Up Amount (NGN)
          </label>
          <input
            type="number"
            value={formData.topupAmount}
            onChange={(e) => setFormData({ ...formData, topupAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Amount to top up when threshold is reached</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notification Emails (comma-separated)
        </label>
        <input
          type="text"
          value={formData.notificationEmails}
          onChange={(e) => setFormData({ ...formData, notificationEmails: e.target.value })}
          placeholder="admin@example.com, finance@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          Save Configuration
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Top-Up History Tab
function TopupHistoryTab({ provider }: { provider: 'paystack' | 'flutterwave' }) {
  const { data, isLoading } = useQuery({
    queryKey: ['topup-history', provider],
    queryFn: () => balanceManagementService.getTopupHistory({ provider, limit: 50 }),
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const history = data?.data?.history || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Top-Up History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top-Up Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No top-up history found
                </td>
              </tr>
            ) : (
              history.map((item: TopupHistory) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.initiatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.currency} {item.triggerBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.currency} {item.topupAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm text-gray-900 capitalize">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.bankTransferReference || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Forecast Tab
function ForecastTab({ provider }: { provider: 'paystack' | 'flutterwave' }) {
  const queryClient = useQueryClient()
  const [forecastDate, setForecastDate] = useState('')
  const [historicalDays, setHistoricalDays] = useState(30)
  const { showSuccess, showError } = useToast()

  const { data: forecasts, isLoading, error: forecastError } = useQuery({
    queryKey: ['forecast-history', provider],
    queryFn: () => balanceManagementService.getForecastHistory({ provider, limit: 10 }),
    retry: 1,
  })

  const generateMutation = useMutation({
    mutationFn: () =>
      balanceManagementService.generateForecast({
        provider,
        forecastDate: forecastDate || undefined,
        historicalDays,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-history', provider] })
      showSuccess('Forecast generated successfully!')
    },
    onError: (error: any) => {
      console.error('Error generating forecast:', error)
      showError(error.response?.data?.error || error.message || 'Failed to generate forecast')
    },
  })

  // Handle response structure: { success: true, data: forecasts } or { data: forecasts }
  const forecastHistory = Array.isArray(forecasts?.data) 
    ? forecasts.data 
    : (Array.isArray(forecasts) ? forecasts : [])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Balance Forecast</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Date</label>
              <input
                type="date"
                value={forecastDate}
                onChange={(e) => setForecastDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Historical Days</label>
              <input
                type="number"
                value={historicalDays}
                onChange={(e) => setHistoricalDays(parseInt(e.target.value) || 30)}
                min={7}
                max={90}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Forecast History</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : forecastHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No forecasts generated yet</div>
          ) : (
            <div className="space-y-4">
              {forecastHistory.map((forecast: BalanceForecast, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Forecast for {forecast.forecastDate}</span>
                    <span className="text-sm text-gray-500">
                      Confidence: {forecast.confidenceScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-gray-500">Current Balance</div>
                      <div className="text-lg font-semibold">
                        {forecast.currency} {forecast.currentBalance.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Predicted Balance</div>
                      <div className="text-lg font-semibold">
                        {forecast.currency} {forecast.predictedBalance.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Predicted Outflow</div>
                      <div className="text-lg font-semibold text-red-600">
                        {forecast.currency} {forecast.predictedOutflow.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {forecast.recommendation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">{forecast.recommendation.message}</div>
                      {forecast.recommendation.suggestedAmount && (
                        <div className="text-sm text-blue-700 mt-1">
                          Suggested top-up: {forecast.currency}{' '}
                          {forecast.recommendation.suggestedAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





