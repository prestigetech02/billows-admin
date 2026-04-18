'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Image as ImageIcon, FileText } from 'lucide-react'
import { TierKYCSubmissionDetails } from '@/lib/services/kyc.service'
import { format } from 'date-fns'

interface TierKYCReviewModalProps {
  submissionData: TierKYCSubmissionDetails
  isOpen: boolean
  onClose: () => void
  onApprove: (submissionId: number, notes?: string) => Promise<void>
  onReject: (submissionId: number, reason: string, notes?: string) => Promise<void>
  isLoading?: boolean
}

export default function TierKYCReviewModal({
  submissionData,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false
}: TierKYCReviewModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!isOpen || !submissionData) return null

  const { user, submission } = submissionData
  const isTier1To2 = submission.submission_type === 'tier_1_to_2'

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve this Tier ${submission.target_tier} upgrade request?`)) {
      return
    }
    setProcessing(true)
    try {
      await onApprove(submission.id, notes || undefined)
      handleClose()
    } catch (error) {
      console.error('Error approving submission:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (!confirm(`Are you sure you want to reject this Tier ${submission.target_tier} upgrade request?`)) {
      return
    }
    setProcessing(true)
    try {
      await onReject(submission.id, rejectionReason, notes || undefined)
      handleClose()
    } catch (error) {
      console.error('Error rejecting submission:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setAction(null)
    setRejectionReason('')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Tier {submission.target_tier} Upgrade Request
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={processing}
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
                    {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.phone_number && (
                    <div className="text-sm text-gray-500">{user.phone_number}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tier Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600">Current Tier</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">Tier {user.tier}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-600">Target Tier</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">Tier {submission.target_tier}</div>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Submission Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {isTier1To2 ? (
                <>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">BVN</div>
                    <div className="text-sm text-gray-900 font-mono">{submission.bvn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Date of Birth</div>
                    <div className="text-sm text-gray-900">
                      {submission.date_of_birth ? format(new Date(submission.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">National ID Number</div>
                    <div className="text-sm text-gray-900 font-mono">{submission.national_id_number || 'N/A'}</div>
                  </div>
                  {submission.national_id_image_url && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">National ID Image</div>
                      <a
                        href={submission.national_id_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Image
                      </a>
                    </div>
                  )}
                  {submission.proof_of_address_url && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Proof of Address</div>
                      <a
                        href={submission.proof_of_address_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Image
                      </a>
                    </div>
                  )}
                </>
              )}
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Status</div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                    submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>
              </div>
              {submission.rejection_reason && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Rejection Reason</div>
                  <div className="text-sm text-gray-900">{submission.rejection_reason}</div>
                </div>
              )}
              {submission.admin_notes && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Admin Notes</div>
                  <div className="text-sm text-gray-900">{submission.admin_notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {submission.status === 'pending' && (
            <div className="border-t border-gray-200 pt-6">
              {!action ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAction('approve')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {action === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Please provide a reason for rejection..."
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={action === 'approve' ? handleApprove : handleReject}
                      disabled={processing || (action === 'reject' && !rejectionReason.trim())}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {processing ? 'Processing...' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => setAction(null)}
                      disabled={processing}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Info */}
          {submission.status !== 'pending' && submission.reviewed_at && (
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                {submission.status === 'approved' ? 'Approved' : 'Rejected'} by {submission.reviewer_name || 'Admin'} on {format(new Date(submission.reviewed_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

