'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, Wallet, CreditCard, UserCheck, UserX, Key, Shield, TrendingUp, DollarSign, Building2, Hash, Plus, Minus, Clock, Activity, FileText, ArrowUpRight, QrCode } from 'lucide-react'
import { usersService, User } from '@/lib/services/users.service'
import { transactionsService, Transaction } from '@/lib/services/transactions.service'
import { format } from 'date-fns'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'

type TabType = 'overview' | 'transactions' | 'activity'

interface ActivityItem {
  id: string
  type: 'transaction' | 'kyc' | 'account' | 'transfer' | 'qr_payment' | 'admin_action'
  action: string
  description: string
  details: any
  created_at: string
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = parseInt(params.id as string)
  const { showError, showSuccess, showWarning } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activityTimeline, setActivityTimeline] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pointsBalance, setPointsBalance] = useState<number | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [usdBalance, setUsdBalance] = useState<number | null>(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    currency: 'NGN',
    reason: '',
    type: 'credit' as 'credit' | 'debit'
  })
  const [adjustingBalance, setAdjustingBalance] = useState(false)
  const [transactionPagination, setTransactionPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
      if (activeTab === 'transactions') {
        fetchUserTransactions()
      } else if (activeTab === 'activity') {
        fetchActivityTimeline()
      }
    }
  }, [userId, activeTab, transactionPagination.page])

  useEffect(() => {
    if (user) {
      fetchUserBalances()
    }
  }, [user])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const userData = await usersService.getUserById(userId)
      setUser(userData)
    } catch (error: any) {
      console.error('Error fetching user details:', error)
      showError(error.response?.data?.error || 'Failed to fetch user details')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTransactions = async () => {
    try {
      const response = await usersService.getUserTransactions(userId, {
        page: transactionPagination.page,
        limit: transactionPagination.limit
      })
      setTransactions(response.transactions || [])
      setTransactionPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }))
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      showError(error.response?.data?.error || 'Failed to fetch transactions')
    }
  }

  const fetchActivityTimeline = async () => {
    try {
      const data = await usersService.getUserActivityTimeline(userId, 100)
      setActivityTimeline(data.activities || [])
    } catch (error: any) {
      console.error('Error fetching activity timeline:', error)
      showError(error.response?.data?.error || 'Failed to fetch activity timeline')
    }
  }

  const fetchUserBalances = async () => {
    try {
      if ((user as any).wallet?.balance !== undefined) {
        setWalletBalance((user as any).wallet.balance)
      } else if (user?.wallet_balance !== undefined) {
        setWalletBalance(user.wallet_balance)
      }
      
      // Fetch USD balance
      if ((user as any).usd_wallet?.balance !== undefined) {
        setUsdBalance((user as any).usd_wallet.balance)
      } else {
        // Default to 0 if not available
        setUsdBalance(0)
      }
      
      try {
        const billpoints = await usersService.getUserBillpoints(userId)
        if (billpoints) {
          setPointsBalance(billpoints.balance)
        }
      } catch (error) {
        console.log('Billpoints not available for this user')
      }
    } catch (error) {
      console.error('Error fetching balances:', error)
    }
  }

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this user? They will not be able to access their account.')) return
    try {
      setActionLoading('suspend')
      await usersService.suspendUser(userId)
      await fetchUserDetails()
      showSuccess('User suspended successfully')
    } catch (error: any) {
      console.error('Error suspending user:', error)
      showError(error.response?.data?.error || 'Failed to suspend user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async () => {
    try {
      setActionLoading('activate')
      await usersService.activateUser(userId)
      await fetchUserDetails()
      showSuccess('User activated successfully')
    } catch (error: any) {
      console.error('Error activating user:', error)
      showError(error.response?.data?.error || 'Failed to activate user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async () => {
    const newPassword = prompt('Enter new password (minimum 6 characters):')
    if (!newPassword) return
    if (newPassword.length < 6) {
      showWarning('Password must be at least 6 characters')
      return
    }
    try {
      setActionLoading('reset')
      await usersService.resetPassword(userId, newPassword)
      showSuccess('Password reset successfully')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      showError(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setActionLoading(null)
    }
  }

  const handleBalanceAdjustment = async () => {
    if (!balanceForm.amount || !balanceForm.reason) {
      showWarning('Please fill in all required fields')
      return
    }

    const amount = parseFloat(balanceForm.amount)
    if (isNaN(amount) || amount <= 0) {
      showWarning('Please enter a valid amount')
      return
    }

    const adjustmentAmount = balanceForm.type === 'debit' ? -Math.abs(amount) : Math.abs(amount)
    const confirmMessage = balanceForm.type === 'credit'
      ? `Are you sure you want to credit ${formatCurrency(Math.abs(amount))} to this user?`
      : `Are you sure you want to debit ${formatCurrency(Math.abs(amount))} from this user?`

    if (!confirm(confirmMessage)) return

    try {
      setAdjustingBalance(true)
      const result = await usersService.adjustUserBalance(
        userId,
        adjustmentAmount,
        balanceForm.currency,
        balanceForm.reason
      )
      showSuccess(`Balance adjusted successfully. New balance: ${formatCurrency(result.newBalance)}`)
      setShowBalanceModal(false)
      setBalanceForm({ amount: '', currency: 'NGN', reason: '', type: 'credit' })
      await fetchUserDetails()
      await fetchUserBalances()
    } catch (error: any) {
      console.error('Error adjusting balance:', error)
      showError(error.response?.data?.error || 'Failed to adjust balance')
    } finally {
      setAdjustingBalance(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
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
    return format(date, 'MMM dd, yyyy HH:mm')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <TrendingUp className="w-4 h-4" />
      case 'kyc':
        return <FileText className="w-4 h-4" />
      case 'account':
        return <UserCheck className="w-4 h-4" />
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4" />
      case 'qr_payment':
        return <QrCode className="w-4 h-4" />
      case 'admin_action':
        return <Shield className="w-4 h-4" />
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
      case 'account':
        return 'bg-green-100 text-green-600'
      case 'transfer':
        return 'bg-purple-100 text-purple-600'
      case 'qr_payment':
        return 'bg-indigo-100 text-indigo-600'
      case 'admin_action':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusBadge = (status: string, type: 'account' | 'kyc') => {
    if (type === 'account') {
      return status === 'active' ? (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Active
        </span>
      ) : (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Suspended
        </span>
      )
    } else {
      const styles = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
        not_submitted: 'bg-gray-100 text-gray-800'
      }
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.not_submitted}`}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    const isCredit = ['wallet_funding', 'airtime_to_wallet'].includes(type)
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getStatusBadgeForTransaction = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return <PageLoader variant="card" />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => router.push('/dashboard/users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 mt-1">User Details</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transaction History' },
              { id: 'activity', label: 'Activity Timeline' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900 font-medium">{(user as any).phone_number || user.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="text-gray-900 font-medium">
                        {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Account Status</p>
                    {getStatusBadge(user.is_active ? 'active' : 'suspended', 'account')}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">KYC Status</p>
                    {getStatusBadge(user.kyc_status, 'kyc')}
                  </div>
                </div>
              </div>

              {/* Account Details Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
                
                {/* Payscribe Account */}
                {(user as any).virtual_account && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Payscribe Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="text-gray-900 font-medium font-mono">
                            {(user as any).virtual_account.account_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Bank Name</p>
                          <p className="text-gray-900 font-medium">
                            {(user as any).virtual_account.bank_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {(user as any).virtual_account.account_name && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Account Name</p>
                            <p className="text-gray-900 font-medium">
                              {(user as any).virtual_account.account_name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paystack Account */}
                {(user as any).paystack_account ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Paystack Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="text-gray-900 font-medium font-mono">
                            {(user as any).paystack_account.account_number || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Bank Name</p>
                          <p className="text-gray-900 font-medium">
                            {(user as any).paystack_account.bank_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {(user as any).paystack_account.account_name && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Account Name</p>
                            <p className="text-gray-900 font-medium">
                              {(user as any).paystack_account.account_name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : !(user as any).virtual_account && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No virtual account found for this user</p>
                    <p className="text-sm text-gray-400 mt-1">The user may need to complete KYC to receive a virtual account</p>
                  </div>
                )}
              </div>

              {/* Wallet & Balance Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Wallet & Balance</h2>
                  <button
                    onClick={() => setShowBalanceModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <DollarSign className="w-4 h-4" />
                    Adjust Balance
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">NGN Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {walletBalance !== null 
                          ? formatCurrency(walletBalance) 
                          : (user as any).wallet?.balance !== undefined 
                            ? formatCurrency((user as any).wallet.balance) 
                            : user.wallet_balance !== undefined 
                              ? formatCurrency(user.wallet_balance) 
                              : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">USD Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {usdBalance !== null 
                          ? `$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : (user as any).usd_wallet?.balance !== undefined 
                            ? `$${(user as any).usd_wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '$0.00'}
                      </p>
                    </div>
                  </div>
                  {pointsBalance !== null && (
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Points Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {pointsBalance.toLocaleString()} pts
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.total_transactions?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {user.is_active ? (
                    <button
                      onClick={handleSuspend}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <UserX className="w-4 h-4" />
                      {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend User'}
                    </button>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      {actionLoading === 'activate' ? 'Activating...' : 'Activate User'}
                    </button>
                  )}
                  <button
                    onClick={handleResetPassword}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Key className="w-4 h-4" />
                    {actionLoading === 'reset' ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'transactions' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                <p className="text-sm text-gray-500 mt-1">All transactions for this user</p>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {getTransactionTypeBadge(transaction.transaction_type)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-medium ${
                                ['wallet_funding', 'airtime_to_wallet'].includes(transaction.transaction_type)
                                  ? 'text-green-600'
                                  : 'text-gray-900'
                              }`}>
                                {['wallet_funding', 'airtime_to_wallet'].includes(transaction.transaction_type) ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatCurrency(transaction.fee || 0)}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadgeForTransaction(transaction.status)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                              {transaction.provider_reference || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {transactionPagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Showing {((transactionPagination.page - 1) * transactionPagination.limit) + 1} to {Math.min(transactionPagination.page * transactionPagination.limit, transactionPagination.total)} of {transactionPagination.total} transactions
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTransactionPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={transactionPagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setTransactionPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={transactionPagination.page >= transactionPagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Activity Timeline Tab */}
          {activeTab === 'activity' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
                <p className="text-sm text-gray-500 mt-1">Complete activity history for this user</p>
              </div>
              {activityTimeline.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No activity found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityTimeline.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-400">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        {activity.details.amount !== undefined && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            {formatCurrency(activity.details.amount)}
                          </p>
                        )}
                        {activity.details.status && (
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                            activity.details.status === 'completed' || activity.details.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : activity.details.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.details.status.toUpperCase()}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Adjust Balance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalanceForm(prev => ({ ...prev, type: 'credit' }))}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                      balanceForm.type === 'credit'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Credit
                  </button>
                  <button
                    onClick={() => setBalanceForm(prev => ({ ...prev, type: 'debit' }))}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                      balanceForm.type === 'debit'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Minus className="w-4 h-4 inline mr-2" />
                    Debit
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={balanceForm.currency}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="NGN">NGN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={balanceForm.reason}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter reason for balance adjustment..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBalanceModal(false)
                    setBalanceForm({ amount: '', currency: 'NGN', reason: '', type: 'credit' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBalanceAdjustment}
                  disabled={adjustingBalance}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {adjustingBalance ? 'Adjusting...' : 'Adjust Balance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
