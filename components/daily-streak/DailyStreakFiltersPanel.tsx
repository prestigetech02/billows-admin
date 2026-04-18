'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { DailyStreakFilters } from '@/lib/services/daily-streak.service'

interface DailyStreakFiltersPanelProps {
  filters: DailyStreakFilters
  onFilterChange: (filters: Partial<DailyStreakFilters>) => void
  onClose: () => void
}

export default function DailyStreakFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: DailyStreakFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<DailyStreakFilters>>({
    min_streak: filters.min_streak,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Min Streak Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Streak
          </label>
          <input
            type="number"
            min="0"
            value={localFilters.min_streak || ''}
            onChange={(e) => setLocalFilters({ 
              ...localFilters, 
              min_streak: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Any"
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






