'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Download } from 'lucide-react'
import { usersService, User, UserFilters } from '@/lib/services/users.service'
import PageLoader from '@/components/ui/PageLoader'
import UserTable from '@/components/users/UserTable'
import UserFiltersPanel from '@/components/users/UserFiltersPanel'

export default function WalletsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    status: 'active'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersService.getUsers(filters)
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching wallets:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
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
      const exportFilters: Partial<UserFilters> = { ...filters }
      delete exportFilters.page
      delete exportFilters.limit

      const blob = await usersService.exportUsers(exportFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wallets-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error exporting wallets:', error)
      // TODO: Show error toast
    } finally {
      setExporting(false)
    }
  }

  const handleViewUser = (user: User) => {
    router.push(`/dashboard/wallets/${user.id}`)
  }

  if (loading && users.length === 0) {
    return <PageLoader variant="table" />
  }

  const totalBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0)
  const averageBalance = users.length > 0 ? totalBalance / users.length : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallets &amp; Balances</h1>
          <p className="text-gray-600 mt-1">View and manage user wallet balances.</p>
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
              showFilters ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Wallet Balance (current page)</p>
          <p className="text-[24px] font-bold text-gray-900 mt-1">
            ₦{totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Users on this page</p>
          <p className="text-[24px] font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Average Balance (current page)</p>
          <p className="text-[24px] font-bold text-gray-900 mt-1">
            ₦{averageBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <UserFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Wallets Table (UserTable now shows wallet balance column) */}
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewUser={handleViewUser}
        showActionsMenu={false}
      />
    </div>
  )
}


