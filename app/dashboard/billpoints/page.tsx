'use client'

import { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import { billpointsService, BillpointFilters } from '@/lib/services/billpoints.service'
import { useBillpointStats, useBillpointTransactions, useBillpointLeaderboard, useAdjustBillpoints } from '@/lib/hooks/useBillpoints'
import { TableSkeleton } from '@/components/ui/Skeleton'
import BillpointTransactionTable from '@/components/billpoints/BillpointTransactionTable'
import BillpointFiltersPanel from '@/components/billpoints/BillpointFiltersPanel'
import BillpointAdjustModal from '@/components/billpoints/BillpointAdjustModal'
import BillpointLeaderboard from '@/components/billpoints/BillpointLeaderboard'
import { useToast } from '@/lib/hooks/useToast'

export default function BillpointsPage() {
  const { showError } = useToast()
  const [activeTab, setActiveTab] = useState<'transactions' | 'leaderboard' | 'user-billpoints'>('transactions')
  const [filters, setFilters] = useState<BillpointFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [selectedUserBalance, setSelectedUserBalance] = useState<number>(0)

  // Fetch data
  const { data: statsData } = useBillpointStats()
  const { data: transactionsData, isLoading: transactionsLoading, isFetching: transactionsFetching } = useBillpointTransactions(filters)
  const { data: leaderboardData, isLoading: leaderboardLoading } = useBillpointLeaderboard({ limit: 50 })
  const adjustBillpointsMutation = useAdjustBillpoints()

  const transactions = transactionsData?.transactions || []
  const pagination = transactionsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const leaderboard = Array.isArray(leaderboardData) ? leaderboardData : []
  const stats = statsData || {
    total_earned: 0,
    total_used: 0,
    total_balance: 0,
    active_users: 0,
    total_transactions: 0,
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<BillpointFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
    setShowFilters(false)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdjustBillpoints = async (amount: number, type: 'add' | 'subtract', description: string) => {
    if (!selectedUserId) return
    try {
      await adjustBillpointsMutation.mutateAsync({
        userId: selectedUserId,
        amount,
        type,
        description
      })
      setShowAdjustModal(false)
      setSelectedUserId(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleOpenAdjustModal = (userId: number, userName: string, balance: number) => {
    setSelectedUserId(userId)
    setSelectedUserName(userName)
    setSelectedUserBalance(balance)
    setShowAdjustModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billpoints Management</h1>
          <p className="text-gray-600 mt-1">Manage billpoints, view transactions and leaderboard</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'transactions' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Earned</div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {(stats.total_earned ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Used</div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {(stats.total_used ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Balance</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {(stats.total_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Active Users</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.active_users.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total_transactions.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'leaderboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('user-billpoints')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'user-billpoints'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Billpoints
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Filters Panel */}
          {showFilters && (
            <BillpointFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user email, name, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Transactions Table */}
          {transactionsLoading && transactions.length === 0 ? (
            <TableSkeleton />
          ) : (
            <BillpointTransactionTable
              transactions={transactions}
              loading={transactionsFetching}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {activeTab === 'leaderboard' && (
        <BillpointLeaderboard
          leaderboard={leaderboard}
          loading={leaderboardLoading}
        />
      )}

      {activeTab === 'user-billpoints' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-600">
            <p>User Billpoints search functionality coming soon.</p>
            <p className="text-sm mt-2">Use the transactions tab to filter by user ID.</p>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {selectedUserId && (
        <BillpointAdjustModal
          userId={selectedUserId}
          userName={selectedUserName}
          currentBalance={selectedUserBalance}
          isOpen={showAdjustModal}
          onClose={() => {
            setShowAdjustModal(false)
            setSelectedUserId(null)
          }}
          onSubmit={handleAdjustBillpoints}
          isLoading={adjustBillpointsMutation.isPending}
        />
      )}
    </div>
  )
}

