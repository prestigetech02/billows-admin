'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { KYCFilters } from '@/lib/services/kyc.service'

interface KYCFiltersPanelProps {
  filters: KYCFilters
  onFilterChange: (filters: Partial<KYCFilters>) => void
  onClose: () => void
}

export default function KYCFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: KYCFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<KYCFilters>>({
    status: filters.status,
    document_type: filters.document_type,
    date_from: filters.date_from,
    date_to: filters.date_to
  })

  const handleApply = () => {
    onFilterChange(localFilters)
  }

  const handleClear = () => {
    const cleared = {}
    setLocalFilters(cleared)
    onFilterChange(cleared)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={localFilters.status || 'all'}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Document Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={localFilters.document_type || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, document_type: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="national_id">National ID</option>
            <option value="drivers_license">Driver's License</option>
            <option value="passport">Passport</option>
            <option value="voters_card">Voter's Card</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={localFilters.date_from || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date To
          </label>
          <input
            type="date"
            value={localFilters.date_to || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
