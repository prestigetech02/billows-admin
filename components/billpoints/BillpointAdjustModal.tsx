'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BillpointAdjustModalProps {
  userId: number | null
  userName?: string
  currentBalance: number
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, type: 'add' | 'subtract', description: string) => void
  isLoading?: boolean
}

export default function BillpointAdjustModal({
  userId,
  userName,
  currentBalance,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: BillpointAdjustModalProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'add' | 'subtract'>('add')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    onSubmit(parseFloat(amount), type, description || `Admin ${type === 'add' ? 'credit' : 'debit'}`)
    // Reset form
    setAmount('')
    setDescription('')
    setType('add')
  }

  if (!isOpen || !userId) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Adjust Billpoints</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700">User</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {userName || `User ID: ${userId}`}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Current Balance: <span className="font-medium">{currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts</span>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="add"
                  checked={type === 'add'}
                  onChange={(e) => setType(e.target.value as 'add')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Add (Credit)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="subtract"
                  checked={type === 'subtract'}
                  onChange={(e) => setType(e.target.value as 'subtract')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Subtract (Debit)</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter amount"
            />
            {type === 'subtract' && parseFloat(amount) > currentBalance && (
              <p className="mt-1 text-xs text-red-600">
                Insufficient balance. Current: {currentBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Reason for adjustment (optional)"
            />
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900">Preview</div>
              <div className="text-lg font-semibold text-blue-900 mt-1">
                {type === 'add' ? '+' : '-'}
                {parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
              </div>
              <div className="text-sm text-blue-700 mt-1">
                New Balance: {(type === 'add' ? currentBalance + parseFloat(amount) : currentBalance - parseFloat(amount)).toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0 || (type === 'subtract' && parseFloat(amount) > currentBalance)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Adjust Billpoints'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}






