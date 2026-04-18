'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { UserFilters } from '@/lib/services/users.service'

interface UserFiltersPanelProps {
  filters: UserFilters
  onFilterChange: (filters: Partial<UserFilters>) => void
  onClose: () => void
}

export default function UserFiltersPanel({
  filters,
  onFilterChange,
  onClose
}: UserFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<UserFilters>>({
    role: filters.role,
    kyc_status: filters.kyc_status,
    status: filters.status,
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
        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={localFilters.role || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* KYC Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KYC Status
          </label>
          <select
            value={localFilters.kyc_status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, kyc_status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Account Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
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
