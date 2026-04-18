'use client'

import { useState, useEffect } from 'react'
import { Filter, Eye, ArrowUpRight, RefreshCw, TrendingUp, Package, BarChart3 } from 'lucide-react'
import { transfersService, Transfer, TransferFilters, BulkTransferBatch, TransferAnalytics } from '@/lib/services/transfers.service'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'

type TabType = 'all' | 'bulk' | 'analytics'

export default function TransfersPage() {
  const { showError, showSuccess } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [bulkBatches, setBulkBatches] = useState<BulkTransferBatch[]>([])
  const [analytics, setAnalytics] = useState<TransferAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    if (activeTab === 'all') {
      fetchTransfers()
    } else if (activeTab === 'bulk') {
      fetchBulkTransfers()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const response = await transfersService.getTransfers(filters)
      setTransfers(response.transfers)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching transfers:', error)
      showError(error.response?.data?.error || 'Failed to fetch transfers')
    } finally {
      setLoading(false)
    }
  }

  const fetchBulkTransfers = async () => {
    try {
      setLoading(true)
      const response = await transfersService.getBulkTransfers(filters)
      setBulkBatches(response.batches)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching bulk transfers:', error)
      showError(error.response?.data?.error || 'Failed to fetch bulk transfers')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await transfersService.getTransferAnalytics({
        date_from: filters.date_from,
        date_to: filters.date_to,
        user_id: filters.user_id
      })
      setAnalytics(data)
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      showError(error.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<TransferFilters>) => {
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

  const handleViewTransfer = async (transfer: Transfer) => {
    try {
      const fullTransfer = await transfersService.getTransferById(transfer.id)
      setSelectedTransfer(fullTransfer)
      setShowDetail(true)
    } catch (error: any) {
      console.error('Error fetching transfer details:', error)
      showError(error.response?.data?.error || 'Failed to fetch transfer details')
    }
  }

  const handleRefundTransfer = async (transferId: number) => {
    const reason = prompt('Enter refund reason:')
    if (!reason) return

    try {
      setRefunding(true)
      await transfersService.refundTransfer(transferId, reason)
      showSuccess('Transfer refunded successfully')
      await fetchTransfers()
      if (selectedTransfer && selectedTransfer.id === transferId) {
        const updated = await transfersService.getTransferById(transferId)
        setSelectedTransfer(updated)
      }
    } catch (error: any) {
      console.error('Error refunding transfer:', error)
      showError(error.response?.data?.error || 'Failed to refund transfer')
    } finally {
      setRefunding(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading && transfers.length === 0) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all wallets/bank transfers</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              All Transfers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bulk Transfers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                value={filters.provider || ''}
                onChange={(e) => handleFilterChange({ provider: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Providers</option>
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ date_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange({ date_to: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'all' && (
        <>
          {/* Transfers Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{transfer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transfer.first_name} {transfer.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{transfer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transfer.recipient_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{transfer.recipient_account || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{transfer.recipient_bank || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transfer.amount, transfer.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(transfer.fee, transfer.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.provider ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transfer.provider === 'flutterwave' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transfer.provider === 'flutterwave' ? 'Flutterwave' : 'Paystack'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transfer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewTransfer(transfer)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {(transfer.status === 'failed' || transfer.status === 'completed') && (
                        <button
                          onClick={() => handleRefundTransfer(transfer.id)}
                          disabled={refunding}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                          title="Refund transfer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
          </div>
        </>
      )}

      {/* Bulk Transfers View */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {loading && bulkBatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bulkBatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No bulk transfers found</div>
            ) : (
              <div className="space-y-6">
                {bulkBatches.map((batch) => (
                  <div key={batch.batch_code} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Batch: {batch.batch_code}</h3>
                        <p className="text-sm text-gray-500">
                          User: {batch.user_name} ({batch.user_email}) | {batch.transfers.length} transfers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Total: {formatCurrency(batch.total_amount, 'NGN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Fees: {formatCurrency(batch.total_fee, 'NGN')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {Object.entries(batch.statuses).map(([status, count]) => (
                        <div key={status} className="text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                            {status}: {count}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Recipient</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left">Fee</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {batch.transfers.map((transfer) => (
                              <tr key={transfer.id}>
                                <td className="px-4 py-2">
                                  <div className="font-medium">{transfer.recipient_name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{transfer.recipient_account || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-2">{formatCurrency(transfer.amount, transfer.currency)}</td>
                                <td className="px-4 py-2">{formatCurrency(transfer.fee, transfer.currency)}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transfer.status)}`}>
                                    {transfer.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{new Date(transfer.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading && !analytics ? (
            <PageLoader variant="card" />
          ) : analytics ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Transfers</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.overview.total_transfers}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.overview.total_volume, 'NGN')}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Fees</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.overview.total_fees, 'NGN')}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.success_rate}%</div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Fees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.status_breakdown.map((status) => (
                        <tr key={status.status}>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{status.count}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(status.total_amount, 'NGN')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(status.total_fee, 'NGN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Volume Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Volume (Last 30 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Volume</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fees</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.daily_volume.map((day) => (
                        <tr key={day.date}>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{day.count}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(day.volume, 'NGN')}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(day.fees, 'NGN')}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{day.completed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">No analytics data available</div>
          )}
        </div>
      )}

      {/* Transfer Detail Modal */}
      {showDetail && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Transfer Details</h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedTransfer(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transfer ID</label>
                  <p className="text-sm text-gray-900">#{selectedTransfer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                    {selectedTransfer.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-sm text-gray-900 font-medium">{formatCurrency(selectedTransfer.amount, selectedTransfer.currency)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedTransfer.fee, selectedTransfer.currency)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.first_name} {selectedTransfer.last_name}</p>
                  <p className="text-xs text-gray-500">{selectedTransfer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Recipient</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.recipient_name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedTransfer.recipient_account || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.recipient_bank || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.provider || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.provider_reference || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransfer.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedTransfer.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{selectedTransfer.description}</p>
                </div>
              )}
              {(selectedTransfer.status === 'failed' || selectedTransfer.status === 'completed') && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRefundTransfer(selectedTransfer.id)}
                    disabled={refunding}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refunding ? 'animate-spin' : ''}`} />
                    {refunding ? 'Processing Refund...' : 'Refund Transfer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

