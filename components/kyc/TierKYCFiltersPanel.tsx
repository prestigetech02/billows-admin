'use client'

import { X } from 'lucide-react'
import { TierKYCFilters } from '@/lib/services/kyc.service'

interface TierKYCFiltersPanelProps {
  filters: TierKYCFilters
  onFilterChange: (filters: Partial<TierKYCFilters>) => void
  onClose: () => void
}

export default function TierKYCFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: TierKYCFiltersPanelProps) {
  const handleClear = () => {
    onFilterChange({
      status: 'all',
      target_tier: 'all',
      search: undefined,
      date_from: undefined,
      date_to: undefined
    })
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Target Tier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Tier
          </label>
          <select
            value={filters.target_tier || 'all'}
            onChange={(e) => onFilterChange({ target_tier: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onFilterChange({ date_from: e.target.value || undefined })}
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
            value={filters.date_to || ''}
            onChange={(e) => onFilterChange({ date_to: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Clear Filters
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

