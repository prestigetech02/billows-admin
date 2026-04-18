'use client'

import { useState } from 'react'
import { X, Mail, Phone, Calendar, Wallet, CreditCard, UserCheck, UserX } from 'lucide-react'
import { User, usersService } from '@/lib/services/users.service'
import { format } from 'date-fns'
import { useToast } from '@/lib/hooks/useToast'

interface UserDetailModalProps {
  user: User
  onClose: () => void
  onUserUpdate: () => void
}

export default function UserDetailModal({
  user,
  onClose,
  onUserUpdate
}: UserDetailModalProps) {
  const { showError, showSuccess, showWarning } = useToast()
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this user?')) return
    try {
      setActionLoading('suspend')
      await usersService.suspendUser(user.id)
      onUserUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error suspending user:', error)
      showError(error.response?.data?.error || 'Failed to suspend user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async () => {
    try {
      setActionLoading('activate')
      await usersService.activateUser(user.id)
      onUserUpdate()
      onClose()
    } catch (error: any) {
      console.error('Error activating user:', error)
      showError(error.response?.data?.error || 'Failed to activate user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async () => {
    const newPassword = prompt('Enter new password (minimum 6 characters):')
    if (!newPassword) return
    if (newPassword.length < 6) {
      showWarning('Password must be at least 6 characters')
      return
    }
    try {
      setActionLoading('reset')
      await usersService.resetPassword(user.id, newPassword)
      showSuccess('Password reset successfully')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      showError(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600 mt-1">User Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-gray-900 font-medium">
                    {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">KYC Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.kyc_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : user.kyc_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : user.kyc_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.kyc_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          {(user.wallet_balance !== undefined || user.total_transactions !== undefined) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet & Transactions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.wallet_balance !== undefined && (
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Wallet Balance</p>
                      <p className="text-gray-900 font-medium text-lg">
                        ₦{user.wallet_balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {user.total_transactions !== undefined && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Transactions</p>
                      <p className="text-gray-900 font-medium text-lg">
                        {user.total_transactions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex items-center gap-3">
              {user.is_active ? (
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <UserX className="w-4 h-4" />
                  {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend User'}
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <UserCheck className="w-4 h-4" />
                  {actionLoading === 'activate' ? 'Activating...' : 'Activate User'}
                </button>
              )}
              <button
                onClick={handleResetPassword}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {actionLoading === 'reset' ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
