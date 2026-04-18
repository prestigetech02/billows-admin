'use client'

import { Coupon } from '@/lib/services/coupons.service'
import { MoreVertical, Eye, Edit, Trash2, Users } from 'lucide-react'
import { format } from 'date-fns'

interface CouponTableProps {
  coupons: Coupon[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onViewCoupon?: (coupon: Coupon) => void
  onEditCoupon?: (coupon: Coupon) => void
  onDeleteCoupon?: (coupon: Coupon) => void
  onAssignCoupon?: (coupon: Coupon) => void
  onActionMenuClick?: (coupon: Coupon, anchor: HTMLElement) => void
}

export default function CouponTable({
  coupons,
  loading,
  pagination,
  onPageChange,
  onViewCoupon,
  onEditCoupon,
  onDeleteCoupon,
  onAssignCoupon,
  onActionMenuClick
}: CouponTableProps) {
  const getStatusBadge = (isActive: boolean, validUntil: string) => {
    const now = new Date()
    const expiresAt = new Date(validUntil)
    const isExpired = expiresAt < now

    if (!isActive) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      )
    }

    if (isExpired) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      )
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    )
  }

  const getDiscountTypeBadge = (type: string) => {
    const styles = {
      percentage: 'bg-blue-100 text-blue-800',
      fixed_amount: 'bg-purple-100 text-purple-800',
      free_item: 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles] || styles.percentage}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getApplicableToBadge = (applicableTo: string) => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {applicableTo === 'all' ? 'All' : applicableTo.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  if (loading && coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading coupons...</p>
        </div>
      </div>
    )
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-600">No coupons found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicable To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono font-medium text-gray-900">
                    {coupon.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{coupon.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{coupon.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getDiscountTypeBadge(coupon.discount_type)}
                    <span className="text-sm font-medium text-gray-900">
                      {coupon.discount_label || 
                        (coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%` 
                          : `₦${coupon.discount_value}`)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getApplicableToBadge(coupon.applicable_to)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {coupon.assigned_count || 0} assigned
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(coupon.is_active, coupon.valid_until)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onViewCoupon && (
                      <button
                        onClick={() => onViewCoupon(coupon)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onActionMenuClick && (
                      <button
                        onClick={(e) => onActionMenuClick(coupon, e.currentTarget)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> coupons
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}






