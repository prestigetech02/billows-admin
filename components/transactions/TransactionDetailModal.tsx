'use client'

import { useState } from 'react'
import { X, RefreshCw, ArrowLeftRight, Calendar, User, CreditCard, DollarSign, Info, TrendingUp, Percent } from 'lucide-react'
import { Transaction } from '@/lib/services/transactions.service'
import { format } from 'date-fns'

interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
  onAction: (action: string, transactionId: number) => void
}

export default function TransactionDetailModal({
  transaction,
  onClose,
  onAction
}: TransactionDetailModalProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to refund this transaction? This action cannot be undone.')) return
    try {
      setActionLoading('refund')
      await onAction('refund', transaction.id)
    } catch (error) {
      // Error handled in parent
    } finally {
      setActionLoading(null)
    }
  }

  const handleRetry = async () => {
    if (!confirm('Are you sure you want to retry this transaction?')) return
    try {
      setActionLoading('retry')
      await onAction('retry', transaction.id)
    } catch (error) {
      // Error handled in parent
    } finally {
      setActionLoading(null)
    }
  }

  const canRefund = transaction.status === 'completed' && transaction.transaction_type !== 'wallet_funding'
  const canRetry = transaction.status === 'failed'
  const user = transaction.user

  const renderKeyValueRows = (data: Record<string, any>) => {
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1 text-sm">
        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
        <span className="text-gray-900 font-medium text-right break-all">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction #{transaction.id}
            </h2>
            <p className="text-gray-600 mt-1">Transaction Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-gray-900 font-medium text-lg">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  {transaction.fee > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Fee: {formatCurrency(transaction.fee, transaction.currency)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-gray-900 font-medium">{transaction.transaction_type}</p>
                  {transaction.category && (
                    <p className="text-xs text-gray-500 mt-1">Category: {transaction.category}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="text-gray-900 font-medium">
                    {transaction.first_name || user?.first_name}{' '}
                    {transaction.last_name || user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.email || user?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-gray-900 font-medium">#{transaction.user_id}</p>
                  {user?.phone_number && (
                    <p className="text-xs text-gray-500 mt-1">Phone: {user.phone_number}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bill / Service Details */}
          {(transaction.bill_payment || transaction.metadata) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill / Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.bill_payment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Bill Payment Record</p>
                    {renderKeyValueRows(transaction.bill_payment)}
                  </div>
                )}
                {transaction.metadata && typeof transaction.metadata === 'object' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Request Metadata</p>
                    {renderKeyValueRows(transaction.metadata)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Provider Information */}
          {(transaction.provider || transaction.provider_reference) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.provider && (
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="text-gray-900 font-medium">{transaction.provider}</p>
                  </div>
                )}
                {transaction.provider_reference && (
                  <div>
                    <p className="text-sm text-gray-500">Reference</p>
                    <p className="text-gray-900 font-medium font-mono text-sm">
                      {transaction.provider_reference}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profit Breakdown */}
          {(transaction.net_profit !== undefined && transaction.net_profit !== null) || 
           (transaction.provider_fee !== undefined && transaction.provider_fee !== null) ||
           (transaction.markup_fee !== undefined && transaction.markup_fee !== null) ||
           (transaction.provider_commission !== undefined && transaction.provider_commission !== null) ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Profit Breakdown
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transaction.provider_commission !== undefined && transaction.provider_commission !== null && transaction.provider_commission > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-500">Provider Commission</p>
                      </div>
                      <p className="text-lg font-semibold text-green-700">
                        {formatCurrency(transaction.provider_commission, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Discount from bill payment provider</p>
                    </div>
                  )}
                  {transaction.markup_fee !== undefined && transaction.markup_fee !== null && transaction.markup_fee > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-500">Markup Fee</p>
                      </div>
                      <p className="text-lg font-semibold text-blue-700">
                        {formatCurrency(transaction.markup_fee, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Additional fee charged to user</p>
                    </div>
                  )}
                  {transaction.provider_fee !== undefined && transaction.provider_fee !== null && transaction.provider_fee > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-gray-500">Provider Fee</p>
                      </div>
                      <p className="text-lg font-semibold text-orange-700">
                        {formatCurrency(transaction.provider_fee, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Fee paid to payment gateway</p>
                    </div>
                  )}
                  {transaction.net_profit !== undefined && transaction.net_profit !== null && (
                    <div className="bg-white rounded-lg p-3 border-2 border-green-500">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-medium text-gray-700">Net Profit</p>
                      </div>
                      <p className={`text-xl font-bold ${transaction.net_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(transaction.net_profit, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Commission + Markup (Provider Fee shown separately)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Description */}
          {transaction.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700">{transaction.description}</p>
            </div>
          )}

          {/* Provider Response (raw) */}
          {transaction.provider_response && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400" />
                Provider Response (Raw)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(transaction.provider_response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          {(canRefund || canRetry) && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="flex items-center gap-3">
                {canRefund && (
                  <button
                    onClick={handleRefund}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    {actionLoading === 'refund' ? 'Processing...' : 'Refund Transaction'}
                  </button>
                )}
                {canRetry && (
                  <button
                    onClick={handleRetry}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {actionLoading === 'retry' ? 'Processing...' : 'Retry Transaction'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
