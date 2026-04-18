'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, RefreshCw, ArrowLeftRight } from 'lucide-react'
import { transactionsService, Transaction, TransactionFilters } from '@/lib/services/transactions.service'
import PageLoader from '@/components/ui/PageLoader'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionFiltersPanel from '@/components/transactions/TransactionFiltersPanel'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal'
import { useToast } from '@/lib/hooks/useToast'

export default function TransactionsPage() {
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
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionDetail, setShowTransactionDetail] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionsService.getTransactions(filters)
      setTransactions(response.transactions)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    // Search can be implemented if backend supports it
    // For now, we'll use filters
  }

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page on filter change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const exportFilters = { ...filters }
      delete exportFilters.page
      delete exportFilters.limit

      const blob = await transactionsService.exportTransactions(exportFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error exporting transactions:', error)
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
      console.error('Error fetching transaction details:', error)
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
      // Refresh transactions list
      await fetchTransactions()
      // Refresh detail if modal is open
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        const updated = await transactionsService.getTransactionById(transactionId)
        setSelectedTransaction(updated)
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error)
      showError(error.response?.data?.error || `Failed to ${action} transaction`)
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform transactions</p>
        </div>
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
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <TransactionFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Transactions Table */}
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
    </div>
  )
}
