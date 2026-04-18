'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, TrendingUp, Users } from 'lucide-react'
import { 
  kycService, 
  KYCDocument, 
  KYCFilters,
  tierKYCService,
  TierKYCSubmission,
  TierKYCFilters,
  TierKYCSubmissionDetails
} from '@/lib/services/kyc.service'
import PageLoader from '@/components/ui/PageLoader'
import KYCTable from '@/components/kyc/KYCTable'
import KYCFiltersPanel from '@/components/kyc/KYCFiltersPanel'
import KYCReviewModal from '@/components/kyc/KYCReviewModal'
import TierKYCTable from '@/components/kyc/TierKYCTable'
import TierKYCFiltersPanel from '@/components/kyc/TierKYCFiltersPanel'
import TierKYCReviewModal from '@/components/kyc/TierKYCReviewModal'

type TabType = 'tier-based' | 'legacy'

export default function KYCPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tier-based')
  
  // Legacy KYC state
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [legacyLoading, setLegacyLoading] = useState(true)
  const [legacyPagination, setLegacyPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [legacyFilters, setLegacyFilters] = useState<KYCFilters>({
    page: 1,
    limit: 20,
    status: 'pending'
  })
  const [showLegacyFilters, setShowLegacyFilters] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [showLegacyReviewModal, setShowLegacyReviewModal] = useState(false)

  // Tier-based KYC state
  const [tierSubmissions, setTierSubmissions] = useState<TierKYCSubmission[]>([])
  const [tierLoading, setTierLoading] = useState(true)
  const [tierPagination, setTierPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [tierFilters, setTierFilters] = useState<TierKYCFilters>({
    page: 1,
    limit: 20,
    status: 'all'
  })
  const [showTierFilters, setShowTierFilters] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<TierKYCSubmissionDetails | null>(null)
  const [showTierReviewModal, setShowTierReviewModal] = useState(false)
  const [tierStats, setTierStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  // Fetch legacy KYC documents
  useEffect(() => {
    if (activeTab === 'legacy') {
      fetchLegacyDocuments()
    }
  }, [legacyFilters, activeTab])

  // Fetch tier-based KYC submissions
  useEffect(() => {
    if (activeTab === 'tier-based') {
      fetchTierSubmissions()
      fetchTierStats()
    }
  }, [tierFilters, activeTab])

  const fetchLegacyDocuments = async () => {
    try {
      setLegacyLoading(true)
      const response = await kycService.getKYCDocuments(legacyFilters)
      setDocuments(response.documents)
      setLegacyPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching KYC documents:', error)
    } finally {
      setLegacyLoading(false)
    }
  }

  const fetchTierSubmissions = async () => {
    try {
      setTierLoading(true)
      const response = await tierKYCService.getTierSubmissions(tierFilters)
      setTierSubmissions(response.submissions)
      setTierPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching tier submissions:', error)
    } finally {
      setTierLoading(false)
    }
  }

  const fetchTierStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
        tierKYCService.getTierSubmissions({ status: 'pending', limit: 1 }),
        tierKYCService.getTierSubmissions({ status: 'approved', limit: 1 }),
        tierKYCService.getTierSubmissions({ status: 'rejected', limit: 1 }),
        tierKYCService.getTierSubmissions({ status: 'all', limit: 1 })
      ])
      setTierStats({
        pending: pendingRes.pagination.total,
        approved: approvedRes.pagination.total,
        rejected: rejectedRes.pagination.total,
        total: allRes.pagination.total
      })
    } catch (error) {
      console.error('Error fetching tier stats:', error)
    }
  }

  const handleTierViewDetails = async (submission: TierKYCSubmission) => {
    try {
      const details = await tierKYCService.getTierSubmissionDetails(submission.id)
      setSelectedSubmission(details)
      setShowTierReviewModal(true)
    } catch (error) {
      console.error('Error fetching submission details:', error)
      alert('Failed to load submission details')
    }
  }

  const handleTierApprove = async (submissionId: number, notes?: string) => {
    try {
      await tierKYCService.approveTierSubmission(submissionId, notes)
      await fetchTierSubmissions()
      await fetchTierStats()
      alert('Submission approved successfully')
    } catch (error: any) {
      console.error('Error approving submission:', error)
      alert(error?.response?.data?.error || 'Failed to approve submission')
      throw error
    }
  }

  const handleTierReject = async (submissionId: number, reason: string, notes?: string) => {
    try {
      await tierKYCService.rejectTierSubmission(submissionId, reason, notes)
      await fetchTierSubmissions()
      await fetchTierStats()
      alert('Submission rejected successfully')
    } catch (error: any) {
      console.error('Error rejecting submission:', error)
      alert(error?.response?.data?.error || 'Failed to reject submission')
      throw error
    }
  }

  const handleTierReviewComplete = async () => {
    await fetchTierSubmissions()
    await fetchTierStats()
    setShowTierReviewModal(false)
    setSelectedSubmission(null)
  }

  const handleLegacySearch = (search: string) => {
    setLegacyFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleLegacyFilterChange = (newFilters: Partial<KYCFilters>) => {
    setLegacyFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handleLegacyPageChange = (page: number) => {
    setLegacyFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLegacyReview = (document: KYCDocument) => {
    setSelectedDocument(document)
    setShowLegacyReviewModal(true)
  }

  const handleLegacyReviewComplete = async () => {
    await fetchLegacyDocuments()
    setShowLegacyReviewModal(false)
    setSelectedDocument(null)
  }

  const handleTierSearch = (search: string) => {
    setTierFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleTierFilterChange = (newFilters: Partial<TierKYCFilters>) => {
    setTierFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }

  const handleTierPageChange = (page: number) => {
    setTierFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
          <p className="text-gray-600 mt-1">Review and manage user identity verification documents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('tier-based')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'tier-based'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tier-Based KYC
            </button>
            <button
              onClick={() => setActiveTab('legacy')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'legacy'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Legacy KYC
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tier-based' ? (
            <>
              {/* Tier-Based KYC Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div className="text-sm font-medium text-yellow-600">Pending</div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">{tierStats.pending}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm font-medium text-green-600">Approved</div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{tierStats.approved}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="text-sm font-medium text-red-600">Rejected</div>
                  </div>
                  <div className="text-2xl font-bold text-red-900">{tierStats.rejected}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div className="text-sm font-medium text-blue-600">Total</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{tierStats.total}</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onChange={(e) => handleTierSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters Panel */}
              {showTierFilters && (
                <TierKYCFiltersPanel
                  filters={tierFilters}
                  onFilterChange={handleTierFilterChange}
                  onClose={() => setShowTierFilters(false)}
                />
              )}

              {/* Filters Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowTierFilters(!showTierFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    showTierFilters
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Tier-Based KYC Table */}
              <TierKYCTable
                submissions={tierSubmissions}
                loading={tierLoading}
                pagination={tierPagination}
                onPageChange={handleTierPageChange}
                onViewDetails={handleTierViewDetails}
              />

              {/* Tier-Based KYC Review Modal */}
              {showTierReviewModal && selectedSubmission && (
                <TierKYCReviewModal
                  submissionData={selectedSubmission}
                  isOpen={showTierReviewModal}
                  onClose={() => {
                    setShowTierReviewModal(false)
                    setSelectedSubmission(null)
                  }}
                  onApprove={handleTierApprove}
                  onReject={handleTierReject}
                />
              )}
            </>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or document number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onChange={(e) => handleLegacySearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters Panel */}
              {showLegacyFilters && (
                <KYCFiltersPanel
                  filters={legacyFilters}
                  onFilterChange={handleLegacyFilterChange}
                  onClose={() => setShowLegacyFilters(false)}
                />
              )}

              {/* Filters Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowLegacyFilters(!showLegacyFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    showLegacyFilters
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Legacy KYC Table */}
              <KYCTable
                documents={documents}
                loading={legacyLoading}
                pagination={legacyPagination}
                onPageChange={handleLegacyPageChange}
                onReview={handleLegacyReview}
              />

              {/* Legacy KYC Review Modal */}
              {showLegacyReviewModal && selectedDocument && (
                <KYCReviewModal
                  document={selectedDocument}
                  onClose={() => {
                    setShowLegacyReviewModal(false)
                    setSelectedDocument(null)
                  }}
                  onReviewComplete={handleLegacyReviewComplete}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
