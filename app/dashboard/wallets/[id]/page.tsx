'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Wallet, CreditCard, Calendar } from 'lucide-react'
import { usersService, User } from '@/lib/services/users.service'
import { transactionsService, Transaction } from '@/lib/services/transactions.service'
import { format } from 'date-fns'
import PageLoader from '@/components/ui/PageLoader'

export default function WalletDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = parseInt(params.id as string)

  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      try {
        const [userData, txResp] = await Promise.all([
          usersService.getUserById(userId),
          transactionsService.getTransactions({ user_id: userId, page: 1, limit: 20 })
        ])
        setUser(userData)
        setTransactions(txResp.transactions)
      } catch (error: any) {
        console.error('Error loading wallet details:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)

  if (loading) {
    return <PageLoader variant="card" />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-height-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User wallet not found</p>
          <button
            onClick={() => router.push('/dashboard/wallets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Wallets
          </button>
        </div>
      </div>
    )
  }

  const walletBalance =
    (user as any).wallet?.balance ??
    user.wallet_balance ??
    0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/wallets')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 mt-1">Wallet Details</p>
          </div>
        </div>
      </div>

      {/* User / wallet summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex items-start gap-3">
          <Wallet className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-[24px] font-bold text-gray-900 mt-1">
              {formatCurrency(walletBalance)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-900 font-medium">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              ID: #{user.id}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex items-start gap-3">
          <Phone className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-gray-900 font-medium">{(user as any).phone ?? (user as any).phone_number ?? 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button
            onClick={() => router.push(`/dashboard/transactions?user_id=${userId}`)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions found for this wallet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {tx.transaction_type.replace('_', ' ')}
                      {tx.category && (
                        <span className="ml-2 text-xs text-gray-500">({tx.category})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : tx.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {tx.provider_reference || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


