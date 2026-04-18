'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Coupon } from '@/lib/services/coupons.service'

interface CouponFormModalProps {
  coupon?: Coupon | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<Coupon>) => void
  isLoading?: boolean
}

export default function CouponFormModal({
  coupon,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CouponFormModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    discount_label: '',
    minimum_purchase_amount: 0,
    maximum_discount_amount: undefined,
    applicable_to: 'all',
    usage_limit: undefined,
    per_user_limit: 1,
    valid_from: undefined,
    valid_until: '',
    is_active: true,
  })

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_label: coupon.discount_label,
        minimum_purchase_amount: coupon.minimum_purchase_amount,
        maximum_discount_amount: coupon.maximum_discount_amount,
        applicable_to: coupon.applicable_to,
        usage_limit: coupon.usage_limit,
        per_user_limit: coupon.per_user_limit,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
        is_active: coupon.is_active,
      })
    } else {
      // Reset form for new coupon
      setFormData({
        code: '',
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        discount_label: '',
        minimum_purchase_amount: 0,
        maximum_discount_amount: undefined,
        applicable_to: 'all',
        usage_limit: undefined,
        per_user_limit: 1,
        valid_from: undefined,
        valid_until: '',
        is_active: true,
      })
    }
  }, [coupon, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code (only for new coupons) */}
            {!coupon && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  placeholder="COUPON123"
                />
              </div>
            )}

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="20% Off Airtime"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Get 20% cashback on all airtime recharges"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_item">Free Item</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
              />
            </div>

            {/* Discount Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Label
              </label>
              <input
                type="text"
                value={formData.discount_label || ''}
                onChange={(e) => setFormData({ ...formData, discount_label: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="20% or ₦500"
              />
            </div>

            {/* Applicable To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable To <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.applicable_to}
                onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="airtime">Airtime</option>
                <option value="data">Data</option>
                <option value="electricity">Electricity</option>
                <option value="cable_tv">Cable TV</option>
                <option value="transfer">Transfer</option>
                <option value="bills">Bills</option>
              </select>
            </div>

            {/* Minimum Purchase Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minimum_purchase_amount}
                onChange={(e) => setFormData({ ...formData, minimum_purchase_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
              />
            </div>

            {/* Maximum Discount Amount (for percentage) */}
            {formData.discount_type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Discount Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maximum_discount_amount || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maximum_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Optional"
                />
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  usage_limit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Unlimited"
              />
            </div>

            {/* Per User Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per User Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.per_user_limit}
                onChange={(e) => setFormData({ ...formData, per_user_limit: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From
              </label>
              <input
                type="datetime-local"
                value={formData.valid_from || ''}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Is Active */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}






