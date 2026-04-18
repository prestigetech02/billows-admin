'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { kycService, KYCDocument, KYCFilters } from '@/lib/services/kyc.service'
import PageLoader from '@/components/ui/PageLoader'
import KYCTable from '@/components/kyc/KYCTable'
import KYCFiltersPanel from '@/components/kyc/KYCFiltersPanel'
import KYCReviewModal from '@/components/kyc/KYCReviewModal'
import { useToast } from '@/lib/hooks/useToast'

export default function KYCPendingPage() {
  const { showInfo } = useToast()
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<KYCFilters>({
    page: 1,
    limit: 20,
    status: 'pending' // Default to pending
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const loadDocuments = async () => {
      try {
        if (isMounted) {
          setLoading(true)
        }
        const response = await kycService.getKYCDocuments(filters)
        if (isMounted) {
          setDocuments(response.documents || [])
          setPagination(response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          })
        }
      } catch (error: any) {
        if (isMounted) {
          console.error('Error fetching KYC documents:', error)
          setDocuments([])
          // TODO: Show error toast
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    loadDocuments()
    
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.status, filters.document_type, filters.search, filters.date_from, filters.date_to])

  const fetchKYCDocuments = async () => {
    try {
      setLoading(true)
      const response = await kycService.getKYCDocuments(filters)
      setDocuments(response.documents)
      setPagination(response.pagination)
    } catch (error: any) {
      console.error('Error fetching KYC documents:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1 // Reset to first page on new search
    }))
  }

  const handleFilterChange = (newFilters: Partial<KYCFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page on filter change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      // TODO: Implement export functionality
      // const exportFilters = { ...filters }
      // delete exportFilters.page
      // delete exportFilters.limit
      // const blob = await kycService.exportKYCDocuments(exportFilters)
      showInfo('Export functionality coming soon')
    } catch (error: any) {
      console.error('Error exporting KYC documents:', error)
      // TODO: Show error toast
    } finally {
      setExporting(false)
    }
  }

  const handleReview = (document: KYCDocument) => {
    setSelectedDocument(document)
    setShowReviewModal(true)
  }

  const handleReviewComplete = () => {
    setShowReviewModal(false)
    setSelectedDocument(null)
    fetchKYCDocuments() // Refresh the list
  }

  const getStatusCounts = () => {
    // This would ideally come from the API, but for now we'll calculate from current page
    // In a real implementation, you'd want a separate endpoint for counts
    return {
      pending: documents.filter(d => d.status === 'pending').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length
    }
  }

  if (loading && documents.length === 0) {
    return <PageLoader variant="table" />
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Status</h1>
          <p className="text-gray-600 mt-1">Review and manage KYC document submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
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

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {filters.status === 'pending' || filters.status === 'all' 
                  ? pagination.total 
                  : statusCounts.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          {filters.status !== 'pending' && (
            <button
              onClick={() => handleFilterChange({ status: 'pending', page: 1 })}
              className="mt-4 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View All Pending →
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {filters.status === 'approved' || filters.status === 'all' 
                  ? pagination.total 
                  : statusCounts.approved}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          {filters.status !== 'approved' && (
            <button
              onClick={() => handleFilterChange({ status: 'approved', page: 1 })}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All Approved →
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filters.status === 'rejected' || filters.status === 'all' 
                  ? pagination.total 
                  : statusCounts.rejected}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          {filters.status !== 'rejected' && (
            <button
              onClick={() => handleFilterChange({ status: 'rejected', page: 1 })}
              className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View All Rejected →
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or document number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <KYCFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* KYC Documents Table */}
      <KYCTable
        documents={documents}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onReview={handleReview}
      />

      {/* Review Modal */}
      {showReviewModal && selectedDocument && (
        <KYCReviewModal
          document={selectedDocument}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedDocument(null)
          }}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  )
}

