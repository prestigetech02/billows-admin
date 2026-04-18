'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { referralsService, Referral, ReferralFilters } from '@/lib/services/referrals.service'
import { useReferrals, useReferralStats, useReferralById, useCompleteReferral, useAwardEarnings } from '@/lib/hooks/useReferrals'
import { TableSkeleton } from '@/components/ui/Skeleton'
import ReferralTable from '@/components/referrals/ReferralTable'
import ReferralFiltersPanel from '@/components/referrals/ReferralFiltersPanel'
import ReferralDetailModal from '@/components/referrals/ReferralDetailModal'
import { useToast } from '@/lib/hooks/useToast'

export default function ReferralsPage() {
  const { showError } = useToast()
  const [filters, setFilters] = useState<ReferralFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReferralId, setSelectedReferralId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionMenuReferral, setActionMenuReferral] = useState<{ referral: Referral; anchor: HTMLElement } | null>(null)

  // Fetch data
  const { data: referralsData, isLoading, isFetching } = useReferrals(filters)
  const { data: statsData } = useReferralStats()
  const { data: referralDetail } = useReferralById(selectedReferralId)
  const completeReferralMutation = useCompleteReferral()
  const awardEarningsMutation = useAwardEarnings()

  const referrals = referralsData?.referrals || []
  const pagination = referralsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const stats = statsData || {
    total_referrals: 0,
    completed_referrals: 0,
    pending_referrals: 0,
    total_earnings: 0,
    available_to_withdraw: 0,
    total_withdrawn: 0,
    pending_withdrawals: {
      count: 0,
      total: 0,
    },
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<ReferralFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
    setShowFilters(false)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewReferral = (referral: Referral) => {
    setSelectedReferralId(referral.id)
    setShowDetailModal(true)
  }

  const handleCompleteReferral = async (referral: Referral) => {
    if (!confirm(`Are you sure you want to mark this referral as completed?`)) {
      return
    }
    try {
      await completeReferralMutation.mutateAsync(referral.id)
      setActionMenuReferral(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleAwardEarnings = async (referral: Referral) => {
    if (!confirm(`Are you sure you want to award earnings for this referral?`)) {
      return
    }
    try {
      await awardEarningsMutation.mutateAsync(referral.id)
      setActionMenuReferral(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referrals Management</h1>
          <p className="text-gray-600 mt-1">Manage referral program and track referrals</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Referrals</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total_referrals.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.completed_referrals.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending_referrals.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Earnings</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            ₦{(stats.total_earnings ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Available to Withdraw</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            ₦{(stats.available_to_withdraw ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Withdrawn</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ₦{(stats.total_withdrawn ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Pending Withdrawals</div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {stats.pending_withdrawals?.count || 0} ({stats.pending_withdrawals?.total ? `₦${(stats.pending_withdrawals.total).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '₦0'})
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <ReferralFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or referral code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Referrals Table */}
      {isLoading && referrals.length === 0 ? (
        <TableSkeleton />
      ) : (
        <ReferralTable
          referrals={referrals}
          loading={isFetching}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewReferral={handleViewReferral}
          onCompleteReferral={handleCompleteReferral}
          onAwardEarnings={handleAwardEarnings}
        />
      )}

      {/* Detail Modal */}
      {referralDetail && (
        <ReferralDetailModal
          referral={referralDetail}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedReferralId(null)
          }}
        />
      )}

      {/* Action Menu (using portal or similar) */}
      {actionMenuReferral && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuReferral(null)}
        >
          <div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px]"
            style={{
              top: actionMenuReferral.anchor.getBoundingClientRect().bottom + 4,
              left: actionMenuReferral.anchor.getBoundingClientRect().left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu items can be added here if needed */}
          </div>
        </div>
      )}
    </div>
  )
}

