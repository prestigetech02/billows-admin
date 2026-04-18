'use client'

import { useState } from 'react'
import { useDailyStreaks, useDailyStreakStats, useDailyStreakDetails, useResetStreak } from '@/lib/hooks/useDailyStreak'
import DailyStreakTable from '@/components/daily-streak/DailyStreakTable'
import DailyStreakDetailModal from '@/components/daily-streak/DailyStreakDetailModal'
import { Flame, Users, TrendingUp, Gift, Calendar } from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'

export default function DailyStreakPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  })
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data: streaksData, isLoading: streaksLoading } = useDailyStreaks(filters)
  const { data: stats, isLoading: statsLoading } = useDailyStreakStats()
  const { data: streakDetails } = useDailyStreakDetails(selectedUserId)
  const resetStreakMutation = useResetStreak()

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleViewDetails = (userId: number) => {
    setSelectedUserId(userId)
    setIsDetailModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailModalOpen(false)
    setSelectedUserId(null)
  }

  const handleResetStreak = (userId: number) => {
    resetStreakMutation.mutate(userId)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  // Ensure statsData has default values to prevent NaN
  const statsData = {
    totalActiveStreaks: stats?.totalActiveStreaks ?? 0,
    averageStreak: stats?.averageStreak ?? 0,
    longestStreak: stats?.longestStreak ?? 0,
    totalBillpointsAwarded: stats?.totalBillpointsAwarded ?? 0,
    totalClaims: stats?.totalClaims ?? 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Streak Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage user daily login streaks and billpoints rewards</p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-medium text-blue-600">Active Streaks</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {formatNumber(statsData.totalActiveStreaks)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div className="text-sm font-medium text-green-600">Average Streak</div>
            </div>
            <div className="text-3xl font-bold text-green-900">
              {statsData.averageStreak ? statsData.averageStreak.toFixed(1) : '0.0'} days
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-purple-600" />
              <div className="text-sm font-medium text-purple-600">Longest Streak</div>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {formatNumber(statsData.longestStreak)} days
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-orange-600" />
              <div className="text-sm font-medium text-orange-600">Total Billpoints</div>
            </div>
            <div className="text-3xl font-bold text-orange-900">
              {formatNumber(statsData.totalBillpointsAwarded)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div className="text-sm font-medium text-indigo-600">Total Claims</div>
            </div>
            <div className="text-3xl font-bold text-indigo-900">
              {formatNumber(statsData.totalClaims)}
            </div>
          </div>
        </div>
      )}

      {/* Streaks Table */}
      {streaksLoading ? (
        <PageLoader variant="card" />
      ) : (
        <DailyStreakTable
          streaks={streaksData?.streaks || []}
          loading={streaksLoading}
          pagination={streaksData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
          onResetStreak={handleResetStreak}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && streakDetails && (
        <DailyStreakDetailModal
          streakData={streakDetails}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          onResetStreak={handleResetStreak}
        />
      )}
    </div>
  )
}
