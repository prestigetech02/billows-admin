'use client'

import { Task } from '@/lib/services/tasks.service'
import { X } from 'lucide-react'
import { format } from 'date-fns'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Active
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    )
  }

  const getTaskTypeBadge = (type: string) => {
    const styles = {
      one_time: 'bg-blue-100 text-blue-800',
      recurring: 'bg-purple-100 text-purple-800',
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-orange-100 text-orange-800',
      milestone: 'bg-pink-100 text-pink-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type as keyof typeof styles] || styles.one_time}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const completionStats = (task as any).completion_stats || {
    total_attempts: 0,
    completed: 0,
    claimed: 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {getStatusBadge(task.is_active)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              {getTaskTypeBadge(task.task_type)}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {task.title}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {task.description}
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reward
            </label>
            <div className="text-lg font-semibold text-purple-600 bg-gray-50 px-4 py-2 rounded-lg">
              {task.reward_billpoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} billpoints
            </div>
          </div>

          {/* Completion Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Criteria
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
                {JSON.stringify(task.completion_criteria, null, 2)}
              </pre>
            </div>
          </div>

          {/* Completion Stats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Statistics
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600">Total Attempts</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{completionStats.total_attempts}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-600">Completed</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{completionStats.completed}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-600">Claimed</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{completionStats.claimed}</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon Name
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {task.icon_name || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {task.display_order}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updated At
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {format(new Date(task.updated_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}






