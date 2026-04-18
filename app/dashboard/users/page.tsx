'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, MoreVertical, Eye, UserCheck, UserX, Key, RefreshCw } from 'lucide-react'
import { usersService, User, UserFilters } from '@/lib/services/users.service'
import { useUsers, useSuspendUser, useActivateUser } from '@/lib/hooks/useUsers'
import { TableSkeleton } from '@/components/ui/Skeleton'
import UserTable from '@/components/users/UserTable'
import UserFiltersPanel from '@/components/users/UserFiltersPanel'
import UserActionsMenu from '@/components/users/UserActionsMenu'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/useToast'

export default function UsersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { showError } = useToast()
  const [exporting, setExporting] = useState(false)
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [actionMenuUser, setActionMenuUser] = useState<{ user: User; anchor: HTMLElement } | null>(null)

  // React Query hook - data is automatically cached
  const { data, isLoading, isFetching } = useUsers(filters)
  const users = data?.users || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const loading = isLoading

  // Mutations
  const suspendUserMutation = useSuspendUser()
  const activateUserMutation = useActivateUser()

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1 // Reset to first page on new search
    }))
  }

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
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

      const blob = await usersService.exportUsers(exportFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error exporting users:', error)
      // TODO: Show error toast
    } finally {
      setExporting(false)
    }
  }

  const handleUserAction = async (action: string, userId: number, data?: any) => {
    try {
      switch (action) {
        case 'suspend':
          await suspendUserMutation.mutateAsync(userId)
          break
        case 'activate':
          await activateUserMutation.mutateAsync(userId)
          break
        case 'resetPassword':
          await usersService.resetPassword(userId, data.newPassword)
          // Invalidate users list after password reset
          queryClient.invalidateQueries({ queryKey: ['users'] })
          break
        case 'view':
          router.push(`/dashboard/users/${userId}`)
          break
      }
      setActionMenuUser(null)
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error)
      showError(error.response?.data?.error || `Failed to ${action}`)
    }
  }

  const handleViewUser = (user: User) => {
    router.push(`/dashboard/users/${user.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
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

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
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

      {/* Users Table */}
      {loading && users.length === 0 ? (
        <TableSkeleton rows={10} cols={6} />
      ) : (
        <UserTable
          users={users}
          loading={isFetching}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewUser={handleViewUser}
          onActionMenuClick={(user, anchor) => setActionMenuUser({ user, anchor })}
        />
      )}

      {/* Actions Menu */}
      {actionMenuUser && (
        <UserActionsMenu
          user={actionMenuUser.user}
          anchor={actionMenuUser.anchor}
          onClose={() => setActionMenuUser(null)}
          onAction={handleUserAction}
        />
      )}
    </div>
  )
}
