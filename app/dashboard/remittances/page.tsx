'use client'

import { useState, useEffect } from 'react'
import { Filter, Eye, RefreshCw, Download } from 'lucide-react'
import api from '@/lib/api'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'

interface Remittance {
  id: number
  transaction_id: number
  recipient_name: string
  recipient_account: string
  recipient_bank: string
  recipient_country: string
  from_currency: string
  to_currency: string
  from_amount: number
  to_amount: number
  exchange_rate: number
  markup_percentage: number
  provider: string
  status: string
  fee: number
  description: string
  created_at: string
}

interface RemittanceFilters {
  page?: number
  limit?: number
  status?: string
  country?: string
  date_from?: string
  date_to?: string
  user_id?: number
}

export default function RemittancesPage() {
  const { showError } = useToast()
  const [remittances, setRemittances] = useState<Remittance[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<RemittanceFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchRemittances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchRemittances = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.country) params.append('country', filters.country)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      if (filters.user_id) params.append('user_id', filters.user_id.toString())

      const response = await api.get(`/admin/remittances?${params.toString()}`)
      setRemittances(response.data.remittances || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch (error: any) {
      console.error('Error fetching remittances:', error)
      showError(error.response?.data?.error || 'Failed to fetch remittances')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<RemittanceFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewRemittance = (remittance: Remittance) => {
    setSelectedRemittance(remittance)
    setShowDetail(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrencySymbol = (country: string) => {
    switch (country) {
      case 'GH':
        return '₵'
      case 'KE':
        return 'KES'
      case 'ZA':
        return 'R'
      default:
        return ''
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch {
      return dateString
    }
  }

  if (loading && remittances.length === 0) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Remittances</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage cross-border remittances
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={fetchRemittances}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => handleFilterChange({ country: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Countries</option>
                <option value="GH">Ghana</option>
                <option value="KE">Kenya</option>
                <option value="ZA">South Africa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ date_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange({ date_to: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exchange Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {remittances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No remittances found
                  </td>
                </tr>
              ) : (
                remittances.map((remittance) => (
                  <tr key={remittance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {remittance.recipient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {remittance.recipient_account} • {remittance.recipient_bank}
                        </div>
                        <div className="text-xs text-gray-400">
                          {remittance.recipient_country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₦{formatAmount(remittance.from_amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCurrencySymbol(remittance.recipient_country)}{formatAmount(remittance.to_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1 {remittance.from_currency} = {remittance.exchange_rate.toFixed(6)} {remittance.to_currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(remittance.status)}`}>
                        {remittance.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(remittance.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewRemittance(remittance)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} remittances
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetail && selectedRemittance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Remittance Details</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRemittance.status)}`}>
                    {selectedRemittance.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Recipient Name</label>
                <div className="text-gray-900">{selectedRemittance.recipient_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Number</label>
                <div className="text-gray-900">{selectedRemittance.recipient_account}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bank</label>
                <div className="text-gray-900">{selectedRemittance.recipient_bank}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <div className="text-gray-900">{selectedRemittance.recipient_country}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount Sent</label>
                <div className="text-gray-900">₦{formatAmount(selectedRemittance.from_amount)} {selectedRemittance.from_currency}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount Received</label>
                <div className="text-gray-900">{getCurrencySymbol(selectedRemittance.recipient_country)}{formatAmount(selectedRemittance.to_amount)} {selectedRemittance.to_currency}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Exchange Rate</label>
                <div className="text-gray-900">1 {selectedRemittance.from_currency} = {selectedRemittance.exchange_rate.toFixed(6)} {selectedRemittance.to_currency}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Markup</label>
                <div className="text-gray-900">{selectedRemittance.markup_percentage}%</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fee</label>
                <div className="text-gray-900">₦{formatAmount(selectedRemittance.fee)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="text-gray-900">{selectedRemittance.description || 'N/A'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <div className="text-gray-900">{formatDate(selectedRemittance.created_at)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

