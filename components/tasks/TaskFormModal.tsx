'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/lib/services/tasks.service'
import { X } from 'lucide-react'

interface TaskFormModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Task>) => void
  isLoading?: boolean
}

const ACTION_TYPES = [
  { value: 'complete_profile', label: 'Complete Profile' },
  { value: 'verify_email', label: 'Verify Email' },
  { value: 'verify_phone', label: 'Verify Phone' },
  { value: 'complete_kyc', label: 'Complete KYC' },
  { value: 'first_airtime_purchase', label: 'First Airtime Purchase' },
  { value: 'first_data_purchase', label: 'First Data Purchase' },
  { value: 'first_electricity_purchase', label: 'First Electricity Purchase' },
  { value: 'first_cable_tv_purchase', label: 'First Cable TV Purchase' },
  { value: 'first_transfer', label: 'First Transfer' },
  { value: 'fund_wallet', label: 'Fund Wallet' },
  { value: 'set_payment_tag', label: 'Set Payment Tag' },
  { value: 'refer_friend', label: 'Refer a Friend' },
  { value: 'complete_transactions', label: 'Complete Transactions' },
]

const TASK_TYPES = [
  { value: 'one_time', label: 'One Time' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'milestone', label: 'Milestone' },
]

export default function TaskFormModal({
  task,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: TaskFormModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    task_type: 'one_time',
    reward_billpoints: 0,
    completion_criteria: { type: '' },
    icon_name: '',
    display_order: 0,
    is_active: true,
  })
  const [actionType, setActionType] = useState('')
  const [count, setCount] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        task_type: task.task_type,
        reward_billpoints: task.reward_billpoints,
        completion_criteria: task.completion_criteria,
        icon_name: task.icon_name || '',
        display_order: task.display_order,
        is_active: task.is_active,
      })
      const criteria = typeof task.completion_criteria === 'string' 
        ? JSON.parse(task.completion_criteria) 
        : task.completion_criteria
      setActionType(criteria?.type || '')
      setCount(criteria?.count)
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        task_type: 'one_time',
        reward_billpoints: 0,
        completion_criteria: { type: '' },
        icon_name: '',
        display_order: 0,
        is_active: true,
      })
      setActionType('')
      setCount(undefined)
    }
  }, [task, isOpen])

  // Update completion criteria when action type or count changes
  useEffect(() => {
    const criteria: any = { type: actionType }
    if (count !== undefined && count > 0) {
      criteria.count = count
    }
    setFormData(prev => ({ ...prev, completion_criteria: criteria }))
  }, [actionType, count])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const requiresCount = actionType === 'complete_transactions'

  const completionCriteriaJson = JSON.stringify(formData.completion_criteria, null, 2)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Complete Your Profile"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Describe what users need to do..."
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {TASK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reward Billpoints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Billpoints <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.reward_billpoints}
                onChange={(e) => setFormData({ ...formData, reward_billpoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., 100"
              />
            </div>

            {/* Completion Criteria */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Criteria <span className="text-red-500">*</span>
                </label>
                
                {/* Action Type */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Action Type
                  </label>
                  <select
                    required
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Select action type...</option>
                    {ACTION_TYPES.map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Count (only for complete_transactions) */}
                {requiresCount && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={count || ''}
                      onChange={(e) => setCount(parseInt(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      placeholder="e.g., 10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of transactions required to complete this task
                    </p>
                  </div>
                )}

                {/* JSON Preview */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    JSON Preview (read-only)
                  </label>
                  <div className="bg-white border border-gray-300 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-x-auto">
                      {completionCriteriaJson}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon Name
              </label>
              <input
                type="text"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., account_circle, star, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Material icon name (optional)
              </p>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the list
              </p>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Only active tasks are visible to users
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !actionType}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
