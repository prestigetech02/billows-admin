'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, User, Calendar, FileText, Image as ImageIcon } from 'lucide-react'
import { KYCDocument, kycService } from '@/lib/services/kyc.service'
import { format } from 'date-fns'
import { useToast } from '@/lib/hooks/useToast'

interface KYCReviewModalProps {
  document: KYCDocument
  onClose: () => void
  onReviewComplete: () => void
}

export default function KYCReviewModal({
  document,
  onClose,
  onReviewComplete
}: KYCReviewModalProps) {
  const { showError, showWarning } = useToast()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!action) {
      showWarning('Please select an action (Approve or Reject)')
      return
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      showWarning('Please provide a rejection reason')
      return
    }

    try {
      setLoading(true)
      await kycService.reviewKYC({
        kyc_id: document.id,
        action,
        rejection_reason: action === 'reject' ? rejectionReason : undefined,
        notes: notes.trim() || undefined
      })
      onReviewComplete()
    } catch (error: any) {
      console.error('Error reviewing KYC:', error)
      showError(error.response?.data?.error || 'Failed to review KYC document')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null
    return kycService.getDocumentImageUrl(imagePath)
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'national_id': 'National ID',
      'drivers_license': "Driver's License",
      'passport': 'Passport',
      'voters_card': "Voter's Card"
    }
    return labels[type] || type.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Review KYC Document
            </h2>
            <p className="text-gray-600 mt-1">Document #{document.id}</p>
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
          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900 font-medium">
                    {document.first_name} {document.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{document.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{document.phone_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-gray-900 font-medium">
                    {format(new Date(document.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="text-gray-900 font-medium">
                    {getDocumentTypeLabel(document.document_type)}
                  </p>
                </div>
              </div>
              {document.document_number && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Document Number</p>
                    <p className="text-gray-900 font-medium font-mono">
                      {document.document_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {document.front_image_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Front Image</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(document.front_image_url) || ''}
                      alt="Front"
                      className="w-full h-48 object-contain bg-gray-50"
                      onError={() => setImageError('front')}
                    />
                  </div>
                </div>
              )}
              {document.back_image_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Back Image</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(document.back_image_url) || ''}
                      alt="Back"
                      className="w-full h-48 object-contain bg-gray-50"
                      onError={() => setImageError('back')}
                    />
                  </div>
                </div>
              )}
              {document.selfie_image_url && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selfie</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(document.selfie_image_url) || ''}
                      alt="Selfie"
                      className="w-full h-48 object-contain bg-gray-50"
                      onError={() => setImageError('selfie')}
                    />
                  </div>
                </div>
              )}
            </div>
            {!document.front_image_url && !document.back_image_url && !document.selfie_image_url && (
              <p className="text-gray-500 text-center py-8">No images available</p>
            )}
          </div>

          {/* Review Section */}
          {document.status === 'pending' && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
              
              {/* Action Selection */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setAction('approve')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    action === 'approve'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    action === 'reject'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>

              {/* Rejection Reason */}
              {action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    rows={3}
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this review..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !action || (action === 'reject' && !rejectionReason.trim())}
                  className={`px-4 py-2 rounded-lg transition ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : action === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : action === 'approve' ? 'Approve Document' : action === 'reject' ? 'Reject Document' : 'Select Action'}
                </button>
              </div>
            </div>
          )}

          {/* Review History */}
          {document.status !== 'pending' && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review History</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {document.reviewer_first_name} {document.reviewer_last_name}
                    </p>
                    <p className="text-sm text-gray-500">{document.reviewer_email}</p>
                  </div>
                  {document.reviewed_at && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(document.reviewed_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
                {document.rejection_reason && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Rejection Reason:</p>
                    <p className="text-sm text-gray-600 mt-1">{document.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
