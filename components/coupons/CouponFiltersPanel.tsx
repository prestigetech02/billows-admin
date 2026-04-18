'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CouponFilters } from '@/lib/services/coupons.service'

interface CouponFiltersPanelProps {
  filters: CouponFilters
  onFilterChange: (filters: Partial<CouponFilters>) => void
  onClose: () => void
}

export default function CouponFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: CouponFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<CouponFilters>>({
    is_active: filters.is_active,
    applicable_to: filters.applicable_to,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={localFilters.is_active === undefined ? '' : localFilters.is_active.toString()}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              is_active: e.target.value === '' ? undefined : e.target.value === 'true' 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Applicable To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable To
          </label>
          <select
            value={localFilters.applicable_to || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, applicable_to: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="all">All</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
            <option value="electricity">Electricity</option>
            <option value="cable_tv">Cable TV</option>
            <option value="transfer">Transfer</option>
            <option value="bills">Bills</option>
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

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}






