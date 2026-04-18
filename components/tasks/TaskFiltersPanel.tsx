'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { TaskFilters } from '@/lib/services/tasks.service'

interface TaskFiltersPanelProps {
  filters: TaskFilters
  onFilterChange: (filters: Partial<TaskFilters>) => void
  onClose: () => void
}

export default function TaskFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: TaskFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<TaskFilters>>({
    is_active: filters.is_active,
    task_type: filters.task_type,
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
            value={localFilters.is_active === undefined ? '' : localFilters.is_active ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value
              setLocalFilters({ 
                ...localFilters, 
                is_active: value === '' ? undefined : value === 'true' 
              })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Task Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type
          </label>
          <select
            value={localFilters.task_type || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, task_type: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="one_time">One Time</option>
            <option value="recurring">Recurring</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="milestone">Milestone</option>
          </select>
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






