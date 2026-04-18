'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/lib/hooks/useToast'
import { Filter, Download, BarChart3, TrendingUp, Users, DollarSign, Activity, Calendar, Server, Coins } from 'lucide-react'
import { analyticsService, AnalyticsFilters, AnalyticsOverview, RevenueAnalytics, UserActivityAnalytics, TransactionTrends } from '@/lib/services/analytics.service'
import { profitService, ProfitSummary, ProfitByType, ProfitByProvider } from '@/lib/services/profit.service'
import PageLoader from '@/components/ui/PageLoader'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type TabType = 'overview' | 'revenue' | 'users' | 'transactions' | 'providers' | 'profit'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const { showError } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivityAnalytics | null>(null)
  const [transactionTrends, setTransactionTrends] = useState<TransactionTrends | null>(null)
  const [providerMetrics, setProviderMetrics] = useState<any>(null)
  const [providerComparison, setProviderComparison] = useState<any>(null)
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'flutterwave'>('paystack')
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null)
  const [profitByType, setProfitByType] = useState<ProfitByType[]>([])
  const [profitByProvider, setProfitByProvider] = useState<ProfitByProvider[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<AnalyticsFilters>({
    date_from: '',
    date_to: '',
    period: 'day'
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'overview') {
        const data = await analyticsService.getOverview(filters)
        setOverview(data)
      } else if (activeTab === 'revenue') {
        const data = await analyticsService.getRevenue(filters)
        setRevenue(data)
      } else if (activeTab === 'users') {
        const data = await analyticsService.getUserActivity(filters)
        setUserActivity(data)
      } else if (activeTab === 'transactions') {
        const data = await analyticsService.getTransactionTrends(filters)
        setTransactionTrends(data)
      } else if (activeTab === 'providers') {
        const [metrics, comparison] = await Promise.all([
          analyticsService.getProviderMetrics(selectedProvider, 'NGN', 30),
          analyticsService.compareProviders('NGN', 30),
        ])
        setProviderMetrics(metrics)
        setProviderComparison(comparison)
      } else if (activeTab === 'profit') {
        const profitFilters = {
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
        }
        const [summary, byType, byProvider] = await Promise.all([
          profitService.getProfitSummary(profitFilters),
          profitService.getProfitByType(profitFilters),
          profitService.getProfitByProvider(profitFilters),
        ])
        setProfitSummary(summary)
        setProfitByType(byType)
        setProfitByProvider(byProvider)
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error)
      showError(error.response?.data?.error || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleExport = async (type: 'revenue' | 'transactions' | 'users' | 'overview') => {
    try {
      setExporting(true)
      const blob = await analyticsService.exportAnalytics(type, filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${filters.date_from || 'all'}_${filters.date_to || 'all'}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Error exporting analytics:', error)
      showError(error.response?.data?.error || 'Failed to export analytics')
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and insights for your platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => handleExport(activeTab === 'overview' ? 'overview' : activeTab === 'revenue' ? 'revenue' : activeTab === 'users' ? 'users' : 'transactions')}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange({ date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={filters.period || 'day'}
                onChange={(e) => handleFilterChange({ period: e.target.value as 'day' | 'week' | 'month' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            {(activeTab === 'transactions') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  value={filters.transaction_type || ''}
                  onChange={(e) => handleFilterChange({ transaction_type: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="bill_payment">Bill Payment</option>
                  <option value="transfer">Transfer</option>
                  <option value="remittance">Remittance</option>
                  <option value="wallet_funding">Wallet Funding</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="currency_conversion">Currency Conversion</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'users', label: 'User Activity', icon: Users },
              { id: 'transactions', label: 'Transaction Trends', icon: TrendingUp },
              { id: 'providers', label: 'Provider Metrics', icon: Server },
              { id: 'profit', label: 'Profit & Revenue', icon: Coins }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <PageLoader variant="card" />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && overview && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">Total Users</div>
                      <div className="text-3xl font-bold text-blue-900">{formatNumber(overview.overview.total_users)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-green-900">{formatCurrency(overview.overview.total_revenue)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">Total Volume</div>
                      <div className="text-3xl font-bold text-purple-900">{formatCurrency(overview.overview.total_volume)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 mb-1">Success Rate</div>
                      <div className="text-3xl font-bold text-orange-900">{overview.overview.success_rate}%</div>
                    </div>
                  </div>

                  {/* Transaction Type Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Type Breakdown</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={overview.transaction_type_breakdown}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ transaction_type, count }) => `${transaction_type}: ${count}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {overview.transaction_type_breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Count</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Volume</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {overview.transaction_type_breakdown.map((type) => (
                              <tr key={type.transaction_type}>
                                <td className="px-4 py-3 text-sm text-gray-900 capitalize">{type.transaction_type.replace('_', ' ')}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(type.count)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(type.total_amount)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(type.total_fees)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview.status_breakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" />
                          <Bar dataKey="total_fees" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && revenue && (
                <div className="space-y-6">
                  {/* Revenue Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                      <div className="text-3xl font-bold text-green-900">{formatCurrency(revenue.total_revenue)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">Total Volume</div>
                      <div className="text-3xl font-bold text-blue-900">{formatCurrency(revenue.total_volume)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">Total Transactions</div>
                      <div className="text-3xl font-bold text-purple-900">{formatNumber(revenue.total_transactions)}</div>
                    </div>
                  </div>

                  {/* Revenue Trends Chart */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenue.revenue_trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="total_revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="total_volume" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue by Type */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Transaction Type</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Revenue</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transactions</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Volume</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {revenue.revenue_by_type.map((type) => (
                            <tr key={type.transaction_type}>
                              <td className="px-4 py-3 text-sm text-gray-900 capitalize">{type.transaction_type.replace('_', ' ')}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatCurrency(type.total_revenue)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(type.transaction_count)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(type.total_volume)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{type.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* User Activity Tab */}
              {activeTab === 'users' && userActivity && (
                <div className="space-y-6">
                  {/* User Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">Total Users</div>
                      <div className="text-3xl font-bold text-blue-900">{formatNumber(userActivity.user_statistics.total_users)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">Active Users</div>
                      <div className="text-3xl font-bold text-green-900">{formatNumber(userActivity.user_statistics.active_users_count)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">Verified Users</div>
                      <div className="text-3xl font-bold text-purple-900">{formatNumber(userActivity.user_statistics.verified_users)}</div>
                    </div>
                  </div>

                  {/* User Trends Chart */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Trends</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userActivity.new_users_trend.map((item, index) => ({
                          period: item.period,
                          new_users: item.new_users,
                          active_users: userActivity.active_users_trend[index]?.active_users || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="new_users" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="active_users" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Active Users */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Active Users</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transactions</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Volume</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fees Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {userActivity.top_active_users.map((user) => (
                            <tr key={user.user_id}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(user.transaction_count)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(user.total_volume)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(user.total_fees_paid)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Trends Tab */}
              {activeTab === 'transactions' && transactionTrends && (
                <div className="space-y-6">
                  {/* Transaction Trends Chart */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={transactionTrends.transaction_trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="transaction_count" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Transactions" />
                          <Area type="monotone" dataKey="completed_count" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed" />
                          <Area type="monotone" dataKey="failed_count" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Failed" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Transaction Trends Table */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends Details</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Period</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Completed</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Failed</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Volume</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Success Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {transactionTrends.transaction_trends.map((trend) => (
                            <tr key={trend.period}>
                              <td className="px-4 py-3 text-sm text-gray-900">{trend.period}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(trend.transaction_count)}</td>
                              <td className="px-4 py-3 text-sm text-green-600">{formatNumber(trend.completed_count)}</td>
                              <td className="px-4 py-3 text-sm text-red-600">{formatNumber(trend.failed_count)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(trend.total_volume)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{trend.success_rate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Profit Tab */}
              {activeTab === 'profit' && profitSummary && (
                <div className="space-y-6">
                  {/* Profit Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">Net Profit</div>
                      <div className="text-3xl font-bold text-green-900">
                        {formatCurrency(profitSummary.totalNetProfit)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {profitSummary.transactionCount} transactions
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">Total Markup</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {formatCurrency(profitSummary.totalMarkup)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Additional fees charged</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">Total Commission</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(profitSummary.totalCommission)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Bill payment discounts</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 mb-1">Provider Fees</div>
                      <div className="text-3xl font-bold text-orange-900">
                        {formatCurrency(profitSummary.totalProviderFees)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Paid to gateways</div>
                    </div>
                  </div>

                  {/* Profit by Transaction Type */}
                  {profitByType.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit by Transaction Type</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={profitByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ transactionType, totalNetProfit }) => 
                                  `${transactionType.replace('_', ' ')}: ${formatCurrency(totalNetProfit)}`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="totalNetProfit"
                              >
                                {profitByType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Net Profit</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Markup</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Commission</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Provider Fees</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transactions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {profitByType.map((type) => (
                                <tr key={type.transactionType}>
                                  <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                                    {type.transactionType.replace('_', ' ')}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                    {formatCurrency(type.totalNetProfit)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatCurrency(type.totalMarkup)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatCurrency(type.totalCommission)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatCurrency(type.totalProviderFees)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatNumber(type.transactionCount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profit by Provider */}
                  {profitByProvider.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit by Provider</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitByProvider}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="provider" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="totalNetProfit" fill="#10b981" name="Net Profit" />
                            <Bar dataKey="totalMarkup" fill="#3b82f6" name="Markup" />
                            <Bar dataKey="totalCommission" fill="#8b5cf6" name="Commission" />
                            <Bar dataKey="totalProviderFees" fill="#f59e0b" name="Provider Fees" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Provider</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Net Profit</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Markup</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Commission</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Provider Fees</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transactions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {profitByProvider.map((provider) => (
                              <tr key={provider.provider}>
                                <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                                  {provider.provider || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                  {formatCurrency(provider.totalNetProfit)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatCurrency(provider.totalMarkup)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatCurrency(provider.totalCommission)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatCurrency(provider.totalProviderFees)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatNumber(provider.transactionCount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Provider Metrics Tab */}
              {activeTab === 'providers' && (
                <div className="space-y-6">
                  {/* Provider Selector */}
                  <div className="flex gap-2 mb-4">
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

                  {providerMetrics && providerMetrics.data && (
                    <div className="space-y-6">
                      {/* Metrics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-600 mb-1">Current Balance</div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(providerMetrics.data.balance.current)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                          <div className="text-sm text-green-600 mb-1">Success Rate</div>
                          <div className="text-2xl font-bold text-green-900">
                            {providerMetrics.data.transactions.successRate.toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                          <div className="text-sm text-purple-600 mb-1">Total Transactions</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {formatNumber(providerMetrics.data.transactions.total)}
                          </div>
                        </div>
                      </div>

                      {/* Balance Metrics */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Average Balance</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(providerMetrics.data.balance.average)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Minimum Balance</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(providerMetrics.data.balance.minimum)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Maximum Balance</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(providerMetrics.data.balance.maximum)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Volatility</div>
                            <div className="text-lg font-semibold">
                              {formatCurrency(providerMetrics.data.balance.volatility)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Metrics */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Successful</div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatNumber(providerMetrics.data.transactions.successful)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Failed</div>
                            <div className="text-lg font-semibold text-red-600">
                              {formatNumber(providerMetrics.data.transactions.failed)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Total Inflow</div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(providerMetrics.data.flows.totalInflow)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Total Outflow</div>
                            <div className="text-lg font-semibold text-red-600">
                              {formatCurrency(providerMetrics.data.flows.totalOutflow)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Provider Comparison */}
                  {providerComparison && providerComparison.data && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Comparison</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Paystack */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Paystack</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Balance:</span>
                              <span className="text-sm font-medium">
                                {formatCurrency(providerComparison.data.paystack.balance.current)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Success Rate:</span>
                              <span className="text-sm font-medium">
                                {providerComparison.data.paystack.transactions.successRate.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Transactions:</span>
                              <span className="text-sm font-medium">
                                {formatNumber(providerComparison.data.paystack.transactions.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Flutterwave */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Flutterwave</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Balance:</span>
                              <span className="text-sm font-medium">
                                {formatCurrency(providerComparison.data.flutterwave.balance.current)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Success Rate:</span>
                              <span className="text-sm font-medium">
                                {providerComparison.data.flutterwave.transactions.successRate.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Transactions:</span>
                              <span className="text-sm font-medium">
                                {formatNumber(providerComparison.data.flutterwave.transactions.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {providerComparison.data.recommendations && providerComparison.data.recommendations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                          <div className="space-y-2">
                            {providerComparison.data.recommendations.map((rec: any, index: number) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg ${
                                  rec.priority === 'high'
                                    ? 'bg-red-50 border border-red-200'
                                    : rec.priority === 'medium'
                                    ? 'bg-yellow-50 border border-yellow-200'
                                    : 'bg-blue-50 border border-blue-200'
                                }`}
                              >
                                <div className="text-sm font-medium text-gray-900">{rec.message}</div>
                                {rec.suggestedAmount && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    Suggested: {formatCurrency(rec.suggestedAmount)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}








