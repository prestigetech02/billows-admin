'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { TransactionFilters } from '@/lib/services/transactions.service'

interface TransactionFiltersPanelProps {
  filters: TransactionFilters
  onFilterChange: (filters: Partial<TransactionFilters>) => void
  onClose: () => void
}

export default function TransactionFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: TransactionFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<TransactionFilters>>({
    type: filters.type,
    status: filters.status,
    category: filters.category,
    provider: filters.provider,
    date_from: filters.date_from,
    date_to: filters.date_to,
    amount_min: filters.amount_min,
    amount_max: filters.amount_max
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
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <input
            type="text"
            value={localFilters.type || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value || undefined })}
            placeholder="e.g., wallet_funding, bill_payment"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input
            type="text"
            value={localFilters.category || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value || undefined })}
            placeholder="e.g., electricity, airtime"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Provider Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <input
            type="text"
            value={localFilters.provider || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, provider: e.target.value || undefined })}
            placeholder="e.g., paystack, payscribe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
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

        {/* Amount Min */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Amount
          </label>
          <input
            type="number"
            value={localFilters.amount_min || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, amount_min: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Amount Max */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Amount
          </label>
          <input
            type="number"
            value={localFilters.amount_max || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, amount_max: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="0.00"
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
