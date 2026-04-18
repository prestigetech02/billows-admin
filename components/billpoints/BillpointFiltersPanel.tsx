'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { BillpointFilters } from '@/lib/services/billpoints.service'

interface BillpointFiltersPanelProps {
  filters: BillpointFilters
  onFilterChange: (filters: Partial<BillpointFilters>) => void
  onClose: () => void
}

export default function BillpointFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: BillpointFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<BillpointFilters>>({
    transaction_type: filters.transaction_type,
    transaction_subtype: filters.transaction_subtype,
    date_from: filters.date_from,
    date_to: filters.date_to,
    user_id: filters.user_id,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Transaction Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={localFilters.transaction_type || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, transaction_type: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="earned">Earned</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Transaction Subtype Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtype
          </label>
          <select
            value={localFilters.transaction_subtype || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, transaction_subtype: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Subtypes</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
            <option value="electricity">Electricity</option>
            <option value="cable_tv">Cable TV</option>
            <option value="admin_adjustment">Admin Adjustment</option>
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

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="number"
            value={localFilters.user_id || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, user_id: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Enter user ID"
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
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}






