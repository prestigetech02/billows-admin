'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Tag, Eye, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { tagsService, UserTag, TagFilters, TagStats } from '@/lib/services/tags.service'
import { useQuery } from '@tanstack/react-query'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { format } from 'date-fns'

export default function TagsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<TagFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch tags
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['tags', filters],
    queryFn: () => tagsService.getTags(filters),
    staleTime: 30000
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['tag-stats'],
    queryFn: () => tagsService.getTagStats(),
    staleTime: 60000
  })

  const tags = data?.tags || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const stats = statsData || {
    total_users: 0,
    users_with_tag: 0,
    users_without_tag: 0,
    tags_changed: 0,
    active_users_with_tag: 0,
    tag_adoption_rate: '0.00'
  }

  const handleSearch = (search: string) => {
    setSearchQuery(search)
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<TagFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewUser = (userId: number) => {
    router.push(`/dashboard/users/${userId}`)
  }

  const getKYCStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      not_submitted: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.not_submitted}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Suspended
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tags</h1>
          <p className="text-gray-600 mt-1">Manage and monitor user payment tags</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_users.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Tags</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.users_with_tag.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Without Tags</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.users_without_tag.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Adoption Rate</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.tag_adoption_rate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tag, name, or email..."
            value={searchQuery}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => {
              const newHasTag = filters.has_tag === 'true' ? undefined : 'true'
              handleFilterChange({ has_tag: newHasTag })
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filters.has_tag === 'true'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Has Tag
          </button>
          <button
            onClick={() => {
              const newHasTag = filters.has_tag === 'false' ? undefined : 'false'
              handleFilterChange({ has_tag: newHasTag })
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filters.has_tag === 'false'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No Tag
          </button>
          <button
            onClick={() => {
              const newChanged = filters.tag_changed === 'true' ? undefined : 'true'
              handleFilterChange({ tag_changed: newChanged })
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filters.tag_changed === 'true'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tag Changed
          </button>
          <button
            onClick={() => {
              const newStatus = filters.status === 'active' ? undefined : 'active'
              handleFilterChange({ status: newStatus })
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filters.status === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Only
          </button>
          {(filters.has_tag || filters.tag_changed || filters.status) && (
            <button
              onClick={() => {
                setFilters({ page: 1, limit: 20 })
                setSearchQuery('')
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tags Table */}
      {isLoading && tags.length === 0 ? (
        <TableSkeleton rows={10} cols={7} />
      ) : tags.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tags found</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tag.first_name} {tag.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{tag.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tag.payment_tag ? (
                        <div>
                          <span className="text-sm font-medium text-blue-600">{tag.payment_tag}</span>
                          {tag.payment_tag_changed && (
                            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                              Changed
                            </span>
                          )}
                          {tag.payment_tag_set_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              Set {format(new Date(tag.payment_tag_set_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No tag set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tag.payment_tag ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₦{tag.wallet_balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tag.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getKYCStatusBadge(tag.kyc_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewUser(tag.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

