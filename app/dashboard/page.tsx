'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, DollarSign, FileCheck, TrendingUp, ArrowUp, ArrowDown, RefreshCw, ArrowUpRight, QrCode, Gift, Clock, Activity, AlertCircle } from 'lucide-react'
import { RecentActivity, PendingActions } from '@/lib/services/dashboard.service'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardStats, useDashboardActivity, useDashboardPending, useDashboardRevenue, useDashboardTransaction } from '@/lib/hooks/useDashboard'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useQueryClient } from '@tanstack/react-query'

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // React Query hooks - data is automatically cached and refetched
  const { data: stats, isLoading: statsLoading, isRefetching: statsRefetching } = useDashboardStats()
  const { data: activityData, isLoading: activityLoading } = useDashboardActivity(20)
  const { data: pendingActions, isLoading: pendingLoading } = useDashboardPending()
  const { data: revenueData, isLoading: revenueLoading } = useDashboardRevenue(chartPeriod)
  const { data: transactionData, isLoading: transactionLoading } = useDashboardTransaction(chartPeriod)

  const loading = statsLoading || activityLoading || pendingLoading
  const refreshing = statsRefetching

  const recentActivity = activityData?.activities || []

  const handleRefresh = () => {
    // Manually refetch all queries
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardPending'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardRevenue'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardTransaction'] })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <TrendingUp className="w-4 h-4" />
      case 'kyc':
        return <FileCheck className="w-4 h-4" />
      case 'user':
        return <Users className="w-4 h-4" />
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4" />
      case 'qr_payment':
        return <QrCode className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'bg-blue-100 text-blue-600'
      case 'kyc':
        return 'bg-yellow-100 text-yellow-600'
      case 'user':
        return 'bg-green-100 text-green-600'
      case 'transfer':
        return 'bg-purple-100 text-purple-600'
      case 'qr_payment':
        return 'bg-indigo-100 text-indigo-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading && !stats) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Pending Actions Alert */}
      {pendingActions && pendingActions.total > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Pending Actions Required</h3>
              <p className="text-sm text-yellow-700">
                {pendingActions.total} {pendingActions.total === 1 ? 'action' : 'actions'} awaiting your review
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingActions.kyc > 0 && (
              <button
                onClick={() => router.push('/dashboard/kyc')}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
              >
                {pendingActions.kyc} KYC
              </button>
            )}
            {pendingActions.transfers > 0 && (
              <button
                onClick={() => router.push('/dashboard/transfers')}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
              >
                {pendingActions.transfers} Transfers
              </button>
            )}
            {pendingActions.qr_payments > 0 && (
              <button
                onClick={() => router.push('/dashboard/qr-payments')}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
              >
                {pendingActions.qr_payments} QR Payments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${stats.users.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.users.growth_percentage >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.users.growth_percentage)}%
            </span>
          </div>
          <h3 className="text-[24px] font-bold text-gray-900">{stats.users.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
          <p className="text-xs text-gray-500 mt-2">{stats.users.active} active, {stats.users.new_today} new today</p>
        </div>

        {/* KYC Pending */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/kyc')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-yellow-600" />
            </div>
            {stats.kyc.pending > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {stats.kyc.pending} pending
              </span>
            )}
          </div>
          <h3 className="text-[24px] font-bold text-gray-900">{stats.kyc.pending}</h3>
          <p className="text-sm text-gray-600 mt-1">KYC Reviews</p>
          <p className="text-xs text-gray-500 mt-2">{stats.kyc.approved_today} approved today</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${stats.revenue.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.growth_percentage >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats.revenue.growth_percentage)}%
            </span>
          </div>
          <h3 className="text-[24px] font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          <p className="text-xs text-gray-500 mt-2">{formatCurrency(stats.revenue.today)} today</p>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              {stats.transactions.success_rate}% success
            </span>
          </div>
          <h3 className="text-[24px] font-bold text-gray-900">{stats.transactions.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
          <p className="text-xs text-gray-500 mt-2">{stats.transactions.today} today</p>
        </div>
      </div>

      {/* Quick Stats Cards - Transfers, QR Payments, Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transfers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/transfers')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-purple-600" />
            </div>
            {stats.transfers.pending > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {stats.transfers.pending} pending
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{stats.transfers.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Transfers</p>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-gray-500">Volume: {formatCurrency(stats.transfers.total_volume)}</span>
            <span className="text-gray-500">Fees: {formatCurrency(stats.transfers.total_fees)}</span>
          </div>
        </div>

        {/* QR Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/qr-payments')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <QrCode className="w-6 h-6 text-indigo-600" />
            </div>
            {stats.qr_payments.pending > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {stats.qr_payments.pending} pending
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{stats.qr_payments.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">QR Payments</p>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-green-600">{stats.qr_payments.completed} completed</span>
            <span className="text-gray-500">{formatCurrency(stats.qr_payments.total_amount)}</span>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Gift className="w-6 h-6 text-pink-600" />
            </div>
            {stats.rewards.pending > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {stats.rewards.pending} pending
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{stats.rewards.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Rewards Earned</p>
          <p className="text-xs text-gray-500 mt-2">{stats.rewards.today} today</p>
        </div>
      </div>

      {/* Charts and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <div className="h-64">
            {revenueLoading || !revenueData ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Revenue" />
                  <Area type="monotone" dataKey="fees" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Fees" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user.name || activity.user.email}
                    </p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                    {activity.details.amount && (
                      <p className="text-xs font-semibold text-green-600 mt-1">
                        {formatCurrency(activity.details.amount)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h2>
        <div className="h-64">
          {transactionLoading || !transactionData ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Success" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
