'use client'

import { useState } from 'react'
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { couponsService, Coupon, CouponFilters } from '@/lib/services/coupons.service'
import { useCoupons, useCouponStats, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/lib/hooks/useCoupons'
import { TableSkeleton } from '@/components/ui/Skeleton'
import CouponTable from '@/components/coupons/CouponTable'
import CouponFiltersPanel from '@/components/coupons/CouponFiltersPanel'
import CouponFormModal from '@/components/coupons/CouponFormModal'
import { useToast } from '@/lib/hooks/useToast'

export default function CouponsPage() {
  const { showSuccess, showError } = useToast()
  const [filters, setFilters] = useState<CouponFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [actionMenuCoupon, setActionMenuCoupon] = useState<{ coupon: Coupon; anchor: HTMLElement } | null>(null)

  // React Query hooks
  const { data: couponsData, isLoading, isFetching } = useCoupons(filters)
  const { data: statsData } = useCouponStats()
  const createCouponMutation = useCreateCoupon()
  const updateCouponMutation = useUpdateCoupon()
  const deleteCouponMutation = useDeleteCoupon()

  const coupons = couponsData?.coupons || []
  const pagination = couponsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const stats = statsData || {
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    totalDiscountsGiven: 0,
    activeUserCoupons: 0,
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<CouponFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateCoupon = async (couponData: Partial<Coupon>) => {
    try {
      await createCouponMutation.mutateAsync(couponData)
      setShowCreateModal(false)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleUpdateCoupon = async (couponData: Partial<Coupon>) => {
    if (!editingCoupon) return
    try {
      await updateCouponMutation.mutateAsync({ id: editingCoupon.id, data: couponData })
      setEditingCoupon(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return
    }
    try {
      await deleteCouponMutation.mutateAsync(coupon.id)
      setActionMenuCoupon(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleCouponAction = (action: string, coupon: Coupon) => {
    switch (action) {
      case 'edit':
        setEditingCoupon(coupon)
        setActionMenuCoupon(null)
        break
      case 'delete':
        handleDeleteCoupon(coupon)
        break
      case 'view':
        // TODO: Implement view details
        setActionMenuCoupon(null)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons and promo codes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Coupons</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCoupons}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Active Coupons</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.activeCoupons}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Usage</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsage}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Discounts Given</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            ₦{stats.totalDiscountsGiven.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Active User Coupons</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{stats.activeUserCoupons}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, title, or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <CouponFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Coupons Table */}
      {isLoading && coupons.length === 0 ? (
        <TableSkeleton rows={10} cols={8} />
      ) : (
        <CouponTable
          coupons={coupons}
          loading={isFetching}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEditCoupon={(coupon) => setEditingCoupon(coupon)}
          onDeleteCoupon={handleDeleteCoupon}
          onActionMenuClick={(coupon, anchor) => setActionMenuCoupon({ coupon, anchor })}
        />
      )}

      {/* Action Menu */}
      {actionMenuCoupon && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
          style={{
            top: actionMenuCoupon.anchor.getBoundingClientRect().bottom + 5,
            left: actionMenuCoupon.anchor.getBoundingClientRect().left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCouponAction('view', actionMenuCoupon.coupon)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => handleCouponAction('edit', actionMenuCoupon.coupon)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleCouponAction('delete', actionMenuCoupon.coupon)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuCoupon && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuCoupon(null)}
        />
      )}

      {/* Create/Edit Modal */}
      <CouponFormModal
        coupon={editingCoupon}
        isOpen={showCreateModal || !!editingCoupon}
        onClose={() => {
          setShowCreateModal(false)
          setEditingCoupon(null)
        }}
        onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
        isLoading={createCouponMutation.isPending || updateCouponMutation.isPending}
      />
    </div>
  )
}

