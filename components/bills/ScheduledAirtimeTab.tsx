'use client'

import { useState } from 'react'
import { Search, Filter, MoreVertical, Eye, Pause, Play, X } from 'lucide-react'
import { scheduledAirtimeService, ScheduledAirtime, ScheduledAirtimeFilters } from '@/lib/services/scheduled-airtime.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { format } from 'date-fns'

export default function ScheduledAirtimeTab() {
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ScheduledAirtimeFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenuSchedule, setActionMenuSchedule] = useState<{ schedule: ScheduledAirtime; anchor: HTMLElement } | null>(null)

  // Fetch data
  const { data: schedulesData, isLoading, isFetching } = useQuery({
    queryKey: ['scheduled-airtime', filters],
    queryFn: () => scheduledAirtimeService.getScheduledAirtime(filters),
    staleTime: 2 * 60 * 1000,
  })

  const { data: statsData } = useQuery({
    queryKey: ['scheduled-airtime', 'stats'],
    queryFn: () => scheduledAirtimeService.getStats(),
  })

  const schedules = schedulesData?.schedules || []
  const pagination = schedulesData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const stats = statsData || {
    totalScheduled: 0,
    activeScheduled: 0,
    completedCount: 0,
    failedCount: 0,
    totalAmount: 0,
  }

  // Mutations
  const pauseMutation = useMutation({
    mutationFn: (id: number) => scheduledAirtimeService.pauseScheduledAirtime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-airtime'] })
      showSuccess('Scheduled airtime paused successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to pause scheduled airtime')
    },
  })

  const resumeMutation = useMutation({
    mutationFn: (id: number) => scheduledAirtimeService.resumeScheduledAirtime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-airtime'] })
      showSuccess('Scheduled airtime resumed successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to resume scheduled airtime')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => scheduledAirtimeService.cancelScheduledAirtime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-airtime'] })
      showSuccess('Scheduled airtime cancelled successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to cancel scheduled airtime')
    },
  })

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<ScheduledAirtimeFilters>) => {
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

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      paused: 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getNetworkBadge = (network: string) => {
    const colors: Record<string, string> = {
      mtn: 'bg-yellow-100 text-yellow-800',
      airtel: 'bg-red-100 text-red-800',
      glo: 'bg-green-100 text-green-800',
      '9mobile': 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[network.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {network.toUpperCase()}
      </span>
    )
  }

  const handleAction = async (action: string, schedule: ScheduledAirtime) => {
    try {
      switch (action) {
        case 'pause':
          await pauseMutation.mutateAsync(schedule.id)
          break
        case 'resume':
          await resumeMutation.mutateAsync(schedule.id)
          break
        case 'cancel':
          if (confirm(`Are you sure you want to cancel this scheduled airtime?`)) {
            await cancelMutation.mutateAsync(schedule.id)
          }
          break
      }
      setActionMenuSchedule(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Scheduled</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalScheduled}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.activeScheduled}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.completedCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.failedCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            ₦{(stats.totalAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by phone number, network, or user..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
              <select
                value={filters.network || ''}
                onChange={(e) => handleFilterChange({ network: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Networks</option>
                <option value="mtn">MTN</option>
                <option value="airtel">Airtel</option>
                <option value="glo">Glo</option>
                <option value="9mobile">9mobile</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Toggle */}
      <div className="flex justify-end">
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

      {/* Table */}
      {isLoading && schedules.length === 0 ? (
        <TableSkeleton rows={10} cols={8} />
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <p className="text-gray-600">No scheduled airtime found</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {schedule.user?.first_name} {schedule.user?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{schedule.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getNetworkBadge(schedule.network)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{schedule.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₦{schedule.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(schedule.scheduled_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.scheduled_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => setActionMenuSchedule({ schedule, anchor: e.currentTarget })}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> schedules
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Menu */}
      {actionMenuSchedule && (
        <>
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
            style={{
              top: actionMenuSchedule.anchor.getBoundingClientRect().bottom + 5,
              left: actionMenuSchedule.anchor.getBoundingClientRect().left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {actionMenuSchedule.schedule.status === 'paused' && (
              <button
                onClick={() => handleAction('resume', actionMenuSchedule.schedule)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
            {(actionMenuSchedule.schedule.status === 'pending' || actionMenuSchedule.schedule.status === 'processing') && (
              <button
                onClick={() => handleAction('pause', actionMenuSchedule.schedule)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
            {(actionMenuSchedule.schedule.status === 'pending' || actionMenuSchedule.schedule.status === 'paused') && (
              <button
                onClick={() => handleAction('cancel', actionMenuSchedule.schedule)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActionMenuSchedule(null)}
          />
        </>
      )}
    </div>
  )
}

