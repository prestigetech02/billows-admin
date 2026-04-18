'use client'

import { useState, useEffect } from 'react'
import { Filter, Eye, QrCode, X, Clock, BarChart3 } from 'lucide-react'
import { qrPaymentsService, QRPayment, QRPaymentFilters, QRPaymentAnalytics } from '@/lib/services/qr-payments.service'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'

type TabType = 'all' | 'analytics'

export default function QRPaymentsPage() {
  const { showError, showSuccess } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [qrPayments, setQrPayments] = useState<QRPayment[]>([])
  const [analytics, setAnalytics] = useState<QRPaymentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<QRPaymentFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedQRPayment, setSelectedQRPayment] = useState<QRPayment | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [expiring, setExpiring] = useState(false)

  useEffect(() => {
    if (activeTab === 'all') {
      fetchQRPayments()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab])

  const fetchQRPayments = async () => {
    try {
      setLoading(true)
      const response = await qrPaymentsService.getQRPayments(filters)
      setQrPayments(response.qrPayments)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching QR payments:', error)
      showError(error.response?.data?.error || 'Failed to fetch QR payments')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<QRPaymentFilters>) => {
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

  const handleViewQRPayment = async (qrPayment: QRPayment) => {
    try {
      const fullQRPayment = await qrPaymentsService.getQRPaymentById(qrPayment.id)
      setSelectedQRPayment(fullQRPayment)
      setShowDetail(true)
    } catch (error: any) {
      console.error('Error fetching QR payment details:', error)
      showError(error.response?.data?.error || 'Failed to fetch QR payment details')
    }
  }

  const handleCancelQRPayment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this QR payment?')) {
      return
    }

    try {
      setCancelling(true)
      await qrPaymentsService.cancelQRPayment(id)
      await fetchQRPayments()
      if (selectedQRPayment && selectedQRPayment.id === id) {
        const updated = await qrPaymentsService.getQRPaymentById(id)
        setSelectedQRPayment(updated)
      }
      showSuccess('QR payment cancelled successfully')
    } catch (error: any) {
      console.error('Error cancelling QR payment:', error)
      showError(error.response?.data?.error || 'Failed to cancel QR payment')
    } finally {
      setCancelling(false)
    }
  }

  const handleExpireQRPayment = async (id: number) => {
    if (!confirm('Are you sure you want to expire this QR payment?')) {
      return
    }

    try {
      setExpiring(true)
      await qrPaymentsService.expireQRPayment(id)
      await fetchQRPayments()
      if (selectedQRPayment && selectedQRPayment.id === id) {
        const updated = await qrPaymentsService.getQRPaymentById(id)
        setSelectedQRPayment(updated)
      }
      showSuccess('QR payment expired successfully')
    } catch (error: any) {
      console.error('Error expiring QR payment:', error)
      showError(error.response?.data?.error || 'Failed to expire QR payment')
    } finally {
      setExpiring(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await qrPaymentsService.getQRPaymentAnalytics({
        date_from: filters.date_from,
        date_to: filters.date_to,
        user_id: filters.user_id,
        qr_type: filters.qr_type
      })
      setAnalytics(data)
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      showError(error.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQRTypeLabel = (type: string) => {
    switch (type) {
      case 'static_merchant': return 'Static Merchant'
      case 'dynamic_p2p': return 'Dynamic P2P'
      default: return type
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading && qrPayments.length === 0) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Payments</h1>
          <p className="text-gray-600 mt-1">Monitor and manage QR payment codes</p>
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
              <QrCode className="w-4 h-4" />
              All QR Payments
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
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Type</label>
              <select
                value={filters.qr_type || ''}
                onChange={(e) => handleFilterChange({ qr_type: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="static_merchant">Static Merchant</option>
                <option value="dynamic_p2p">Dynamic P2P</option>
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
          {/* QR Payments Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qrPayments.map((qr) => (
                <tr key={qr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      {qr.qr_code.substring(0, 20)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {qr.first_name} {qr.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{qr.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getQRTypeLabel(qr.qr_type)}</div>
                    {qr.allow_multiple_payments && (
                      <div className="text-xs text-blue-600">Split Bill</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {qr.amount !== null && qr.amount !== undefined ? (
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(qr.amount, qr.currency)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Any Amount</div>
                    )}
                    {qr.allow_multiple_payments && qr.target_amount && (
                      <div className="text-xs text-gray-500 mt-1">
                        Target: {formatCurrency(qr.target_amount, qr.currency)}
                      </div>
                    )}
                    {qr.allow_multiple_payments && qr.amount_collected !== null && qr.amount_collected !== undefined && qr.amount_collected > 0 && (
                      <div className="text-xs text-green-600 mt-1 font-medium">
                        Collected: {formatCurrency(qr.amount_collected, qr.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(qr.status)}`}>
                      {qr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {qr.expires_at ? new Date(qr.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(qr.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewQRPayment(qr)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {qr.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCancelQRPayment(qr.id)}
                            disabled={cancelling}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                            title="Cancel QR payment"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleExpireQRPayment(qr.id)}
                            disabled={expiring}
                            className="text-orange-600 hover:text-orange-900 flex items-center gap-1 disabled:opacity-50"
                            title="Expire QR payment"
                          >
                            <Clock className="w-4 h-4" />
                            Expire
                          </button>
                        </>
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
                  <div className="text-sm text-gray-500 mb-1">Total QR Codes</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.overview.total_qr_codes}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.completion_rate}%</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Total Amount Processed</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.overview.total_completed_amount, 'NGN')}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Average Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.overview.average_amount, 'NGN')}
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="text-2xl font-bold text-yellow-600">{analytics.overview.pending_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="text-2xl font-bold text-green-600">{analytics.overview.completed_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Expired</div>
                    <div className="text-2xl font-bold text-red-600">{analytics.overview.expired_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Cancelled</div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.overview.cancelled_count}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Type Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Type Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-500">Static Merchant</div>
                    <div className="text-2xl font-bold text-blue-600">{analytics.overview.static_merchant_count}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500">Dynamic P2P</div>
                    <div className="text-2xl font-bold text-purple-600">{analytics.overview.dynamic_p2p_count}</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Completed</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.type_breakdown.map((type) => (
                        <tr key={type.qr_type}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {getQRTypeLabel(type.qr_type)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{type.count}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{type.completed_count}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(type.total_amount, 'NGN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Split Bill Statistics */}
              {analytics.split_bill_stats.total_split_bills > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Bill Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Split Bills</div>
                      <div className="text-xl font-bold text-gray-900">{analytics.split_bill_stats.total_split_bills}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Completed</div>
                      <div className="text-xl font-bold text-green-600">{analytics.split_bill_stats.completed_split_bills}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Collected</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(analytics.split_bill_stats.total_collected, 'NGN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Avg Target</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(analytics.split_bill_stats.avg_target_amount, 'NGN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Statistics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Statistics (Last 30 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Completed</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expired</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.daily_stats.map((day) => (
                        <tr key={day.date}>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{day.created_count}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{day.completed_count}</td>
                          <td className="px-4 py-3 text-sm text-red-600">{day.expired_count}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(day.completed_amount, 'NGN')}</td>
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

      {/* QR Payment Detail Modal */}
      {showDetail && selectedQRPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">QR Payment Details</h2>
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedQRPayment(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">QR Code</label>
                    <p className="text-sm text-gray-900 font-mono break-all">{selectedQRPayment.qr_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(selectedQRPayment.status)}`}>
                        {selectedQRPayment.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900 font-medium">{getQRTypeLabel(selectedQRPayment.qr_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Currency</label>
                    <p className="text-sm text-gray-900 font-medium">{selectedQRPayment.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedQRPayment.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Updated At</label>
                    <p className="text-sm text-gray-900">{new Date(selectedQRPayment.updated_at || selectedQRPayment.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiver Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{selectedQRPayment.first_name} {selectedQRPayment.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedQRPayment.email}</p>
                  </div>
                  {selectedQRPayment.phone_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selectedQRPayment.phone_number}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-sm text-gray-900">#{selectedQRPayment.user_id}</p>
                  </div>
                </div>
              </div>

              {/* Payer Information (if available) */}
              {selectedQRPayment.payer_id && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900">{selectedQRPayment.payer_first_name} {selectedQRPayment.payer_last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedQRPayment.payer_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payer ID</label>
                      <p className="text-sm text-gray-900">#{selectedQRPayment.payer_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedQRPayment.amount !== null && selectedQRPayment.amount !== undefined && selectedQRPayment.amount > 0 ? (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fixed Amount</label>
                      <p className="text-lg text-gray-900 font-bold">{formatCurrency(selectedQRPayment.amount, selectedQRPayment.currency)}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-sm text-gray-600 italic">Any amount (payer can enter)</p>
                    </div>
                  )}
                  {selectedQRPayment.allow_multiple_payments ? (
                    <>
                      {selectedQRPayment.target_amount && selectedQRPayment.target_amount > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Target Amount</label>
                          <p className="text-lg text-gray-900 font-bold">{formatCurrency(selectedQRPayment.target_amount, selectedQRPayment.currency)}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500">Amount Collected</label>
                        <p className="text-lg text-gray-900 font-bold">
                          {formatCurrency(selectedQRPayment.amount_collected ?? 0, selectedQRPayment.currency)}
                        </p>
                        {selectedQRPayment.target_amount && selectedQRPayment.target_amount > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(((selectedQRPayment.amount_collected ?? 0) / selectedQRPayment.target_amount) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(((selectedQRPayment.amount_collected ?? 0) / selectedQRPayment.target_amount) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Split Bill</label>
                        <p className="text-sm text-green-600 font-medium">Enabled</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Type</label>
                      <p className="text-sm text-gray-900">Single Payment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Information */}
              {selectedQRPayment.transaction_id && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                      <p className="text-sm text-gray-900">#{selectedQRPayment.transaction_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiry Information */}
              {selectedQRPayment.expires_at && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiry Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expires At</label>
                      <p className="text-sm text-gray-900">{new Date(selectedQRPayment.expires_at).toLocaleString()}</p>
                    </div>
                    {selectedQRPayment.status === 'pending' && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Time Remaining</label>
                        {new Date(selectedQRPayment.expires_at) > new Date() ? (
                          <p className="text-sm text-gray-900">
                            {Math.max(0, Math.ceil((new Date(selectedQRPayment.expires_at).getTime() - new Date().getTime()) / 1000 / 60))} minutes
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">Expired</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contributions for split bills */}
              {selectedQRPayment.allow_multiple_payments && selectedQRPayment.contributions && selectedQRPayment.contributions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Contributions</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Payer</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Amount</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedQRPayment.contributions.map((contrib) => (
                          <tr key={contrib.id}>
                            <td className="px-4 py-2">
                              {contrib.payer_first_name} {contrib.payer_last_name}
                              <div className="text-xs text-gray-500">{contrib.payer_email}</div>
                            </td>
                            <td className="px-4 py-2 font-medium">{formatCurrency(contrib.amount, contrib.currency)}</td>
                            <td className="px-4 py-2">{new Date(contrib.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

