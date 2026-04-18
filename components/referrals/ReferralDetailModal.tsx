'use client'

import { Referral } from '@/lib/services/referrals.service'
import { X } from 'lucide-react'
import { format } from 'date-fns'

interface ReferralDetailModalProps {
  referral: Referral | null
  isOpen: boolean
  onClose: () => void
}

export default function ReferralDetailModal({
  referral,
  isOpen,
  onClose
}: ReferralDetailModalProps) {
  if (!isOpen || !referral) return null

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rewarded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Referral Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            {getStatusBadge(referral.status)}
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code
            </label>
            <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {referral.referral_code}
            </div>
          </div>

          {/* Referrer Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referrer
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-900">
                  {referral.referrer?.first_name} {referral.referrer?.last_name}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Email:</span>{' '}
                <span className="text-gray-900">{referral.referrer?.email}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">User ID:</span>{' '}
                <span className="text-gray-900">{referral.referrer_user_id}</span>
              </div>
            </div>
          </div>

          {/* Referred User Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referred User
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-900">
                  {referral.referred?.first_name} {referral.referred?.last_name}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Email:</span>{' '}
                <span className="text-gray-900">{referral.referred?.email}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">User ID:</span>{' '}
                <span className="text-gray-900">{referral.referred_user_id}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {format(new Date(referral.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
            {referral.completed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed At
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {format(new Date(referral.completed_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            )}
            {referral.rewarded_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rewarded At
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {format(new Date(referral.rewarded_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            )}
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






