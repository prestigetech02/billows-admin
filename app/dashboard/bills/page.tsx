'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { transactionsService, Transaction, TransactionFilters } from '@/lib/services/transactions.service'
import PageLoader from '@/components/ui/PageLoader'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionFiltersPanel from '@/components/transactions/TransactionFiltersPanel'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal'
import { useToast } from '@/lib/hooks/useToast'
import ScheduledAirtimeTab from '@/components/bills/ScheduledAirtimeTab'
import AutoTopupTab from '@/components/bills/AutoTopupTab'

export default function BillPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'scheduled' | 'auto-topup'>('payments')
  const { showError } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
    type: 'bill_payment'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionDetail, setShowTransactionDetail] = useState(false)

  useEffect(() => {
    fetchBillPayments()
  }, [filters])

  const fetchBillPayments = async () => {
    try {
      setLoading(true)
      const response = await transactionsService.getTransactions(filters)
      setTransactions(response.transactions)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching bill payments:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    // Backend doesn't currently support text search on admin transactions.
    // We could map search into category/provider later if needed.
  }

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      type: 'bill_payment', // Always constrain to bill payments
      page: 1 // Reset to first page on filter change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const exportFilters: Partial<TransactionFilters> = { ...filters }
      delete exportFilters.page
      delete exportFilters.limit

      const blob = await transactionsService.exportTransactions(exportFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bill-payments-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error exporting bill payments:', error)
      // TODO: Show error toast
    } finally {
      setExporting(false)
    }
  }

  const handleViewTransaction = async (transaction: Transaction) => {
    try {
      const fullTransaction = await transactionsService.getTransactionById(transaction.id)
      setSelectedTransaction(fullTransaction)
      setShowTransactionDetail(true)
    } catch (error: any) {
      console.error('Error fetching bill payment details:', error)
      // TODO: Show error toast
    }
  }

  const handleTransactionAction = async (action: string, transactionId: number) => {
    try {
      if (action === 'refund') {
        await transactionsService.refundTransaction(transactionId)
      } else if (action === 'retry') {
        await transactionsService.retryTransaction(transactionId)
      }
      // Refresh list
      await fetchBillPayments()
      // Refresh detail if modal is open
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        const updated = await transactionsService.getTransactionById(transactionId)
        setSelectedTransaction(updated)
      }
    } catch (error: any) {
      console.error(`Error performing ${action} on bill payment:`, error)
      showError(error.response?.data?.error || `Failed to ${action} bill payment`)
    }
  }

  if (loading && transactions.length === 0) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill Payments</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all airtime, data, cable TV, electricity and other bill payments
          </p>
        </div>
        {activeTab === 'payments' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
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
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bill Payments
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'scheduled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scheduled Airtime
            </button>
            <button
              onClick={() => setActiveTab('auto-topup')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'auto-topup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auto Top-up
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' && (
        <>
          {/* Quick Info Bar */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm text-blue-900">
            <span className="font-medium">Showing only bill payment transactions.</span>
            <span className="text-blue-800">
              Use <span className="font-semibold">Category</span> filter for airtime, data, cable_tv, electricity, etc.
            </span>
            <span className="text-blue-800">
              Use <span className="font-semibold">Provider</span> filter for Payscribe or others.
            </span>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <TransactionFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Bill Payments Table */}
          <TransactionTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewTransaction={handleViewTransaction}
          />

          {/* Transaction Detail Modal */}
          {showTransactionDetail && selectedTransaction && (
            <TransactionDetailModal
              transaction={selectedTransaction}
              onClose={() => {
                setShowTransactionDetail(false)
                setSelectedTransaction(null)
              }}
              onAction={handleTransactionAction}
            />
          )}
        </>
      )}

      {activeTab === 'scheduled' && (
        <ScheduledAirtimeTab />
      )}

      {activeTab === 'auto-topup' && (
        <AutoTopupTab />
      )}
    </div>
  )
}


