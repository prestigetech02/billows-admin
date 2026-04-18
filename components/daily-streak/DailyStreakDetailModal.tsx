'use client'

import { X } from 'lucide-react'
import { format } from 'date-fns'

interface DailyStreakDetailModalProps {
  streakData: any
  isOpen: boolean
  onClose: () => void
  onResetStreak?: (userId: number) => void
}

export default function DailyStreakDetailModal({
  streakData,
  isOpen,
  onClose,
  onResetStreak
}: DailyStreakDetailModalProps) {
  if (!isOpen || !streakData) return null

  const { user, streak, recent_claims } = streakData

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Daily Streak Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">User Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {user?.first_name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600">Current Streak</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{streak?.current_streak || 0} days</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600">Total Billpoints Earned</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {(streak?.total_billpoints_earned || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} pts
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Last Login</div>
              <div className="text-base text-gray-900">
                {streak?.last_login_date 
                  ? format(new Date(streak.last_login_date), 'MMM dd, yyyy')
                  : 'Never'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Last Claim</div>
              <div className="text-base text-gray-900">
                {streak?.last_claim_date 
                  ? format(new Date(streak.last_claim_date), 'MMM dd, yyyy')
                  : 'Never'}
              </div>
            </div>
          </div>

          {/* Recent Claims */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Claims (Last 30 days)</h3>
            {recent_claims && recent_claims.length > 0 ? (
              <div className="space-y-2">
                {recent_claims.map((claim: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(claim.claim_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Streak: {claim.streak_count} days
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      +{claim.billpoints_awarded} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                No claims in the last 30 days
              </div>
            )}
          </div>

          {/* Actions */}
          {onResetStreak && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset this user\'s streak? This action cannot be undone.')) {
                    onResetStreak(user?.id)
                    onClose()
                  }
                }}
                className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Reset Streak
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}






