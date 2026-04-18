'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, Search, Filter } from 'lucide-react'
import { useEducationalContent, useDeleteEducationalContent } from '@/lib/hooks/useEducation'
import { EducationalContent, EducationalContentFilters } from '@/lib/services/education.service'
import PageLoader from '@/components/ui/PageLoader'
import EducationTable from '@/components/education/EducationTable'

export default function EducationPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<EducationalContentFilters>({
    page: 1,
    limit: 20,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading, error, refetch } = useEducationalContent(filters)
  const deleteMutation = useDeleteEducationalContent()

  const handleCreate = () => {
    router.push('/dashboard/education/new')
  }

  const handleEdit = (content: EducationalContent) => {
    router.push(`/dashboard/education/${content.id}`)
  }

  const handleDelete = async (content: EducationalContent) => {
    try {
      await deleteMutation.mutateAsync(content.id)
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const handleSearch = () => {
    setFilters({
      ...filters,
      page: 1,
      search: searchQuery || undefined,
      category: categoryFilter || undefined,
      is_published: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  if (isLoading && !data) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Educational Content</h1>
          <p className="text-sm text-gray-600 mt-1">Manage educational articles and resources</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title, content, or author..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Categories</option>
              <option value="Financial Literacy">Financial Literacy</option>
              <option value="Personal Finance">Personal Finance</option>
              <option value="Investment">Investment</option>
              <option value="Savings">Savings</option>
              <option value="Budgeting">Budgeting</option>
              <option value="Credit & Debt">Credit & Debt</option>
              <option value="Insurance">Insurance</option>
              <option value="Retirement Planning">Retirement Planning</option>
              <option value="Tax Planning">Tax Planning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            {error instanceof Error ? error.message : 'Failed to load educational content'}
          </p>
        </div>
      )}

      {/* Table */}
      {data && (
        <EducationTable
          content={data.data}
          loading={isLoading}
          pagination={data.pagination}
          onPageChange={handlePageChange}
          onEditContent={handleEdit}
          onDeleteContent={handleDelete}
        />
      )}
    </div>
  )
}

