import api from '../api'

export interface KYCDocument {
  id: number
  user_id: number
  document_type: string
  document_number?: string
  front_image_url?: string
  back_image_url?: string
  selfie_image_url?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: number
  reviewed_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  user_kyc_status?: string
  reviewer_email?: string
  reviewer_first_name?: string
  reviewer_last_name?: string
  metadata?: any
}

export interface KYCDocumentsResponse {
  documents: KYCDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface KYCFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  document_type?: string
  search?: string
  date_from?: string
  date_to?: string
}

export interface KYCReviewRequest {
  kyc_id: number
  action: 'approve' | 'reject'
  rejection_reason?: string
  notes?: string
}

export const kycService = {
  /**
   * Get all KYC documents with filters
   */
  async getKYCDocuments(filters: KYCFilters = {}): Promise<KYCDocumentsResponse> {
    const response = await api.get('/admin/kyc', { params: filters })
    const data = response.data.data
    
    // Map backend response format to frontend format
    // Backend returns { kyc_documents: [...], pagination: {...} }
    // Frontend expects { documents: [...], pagination: {...} }
    if (data.kyc_documents) {
      return {
        documents: data.kyc_documents.map((doc: any) => ({
          ...doc,
          // Flatten user object if it exists
          email: doc.user?.email || doc.email,
          first_name: doc.user?.first_name || doc.first_name,
          last_name: doc.user?.last_name || doc.last_name,
          phone_number: doc.user?.phone_number || doc.phone_number,
          user_kyc_status: doc.user?.kyc_status || doc.user_kyc_status,
          // Flatten reviewer object if it exists
          reviewer_email: doc.reviewed_by?.email || doc.reviewer_email,
          reviewer_first_name: doc.reviewed_by?.name?.split(' ')[0] || doc.reviewer_first_name,
          reviewer_last_name: doc.reviewed_by?.name?.split(' ').slice(1).join(' ') || doc.reviewer_last_name,
        })),
        pagination: data.pagination
      }
    }
    
    // Fallback to direct response if already in correct format
    return data
  },

  /**
   * Get KYC document by ID
   */
  async getKYCDocumentById(id: number): Promise<KYCDocument> {
    const response = await api.get(`/admin/kyc/${id}`)
    return response.data.data
  },

  /**
   * Review KYC document
   */
  async reviewKYC(review: KYCReviewRequest): Promise<KYCDocument> {
    const response = await api.post('/admin/kyc/review', review)
    return response.data.data
  },

  /**
   * Get user KYC history
   */
  async getUserKYCHistory(userId: number): Promise<KYCDocument[]> {
    const response = await api.get(`/admin/kyc/users/${userId}/history`)
    return response.data.data
  },

  /**
   * Get document image URL
   */
  getDocumentImageUrl(imagePath: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    return `${baseUrl}/admin/kyc/images/${encodeURIComponent(imagePath)}`
  }
}

// Tier-based KYC interfaces and service
export interface TierKYCSubmission {
  id: number
  user_id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number?: string
    tier: number
  }
  target_tier: number
  submission_type: 'tier_1_to_2' | 'tier_2_to_3'
  bvn?: string
  date_of_birth?: string
  national_id_number?: string
  national_id_image_url?: string
  proof_of_address_url?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at: string
  reviewed_at?: string
}

export interface TierKYCSubmissionsResponse {
  submissions: TierKYCSubmission[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TierKYCSubmissionDetails {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number?: string
    tier: number
  }
  submission: {
    id: number
    target_tier: number
    submission_type: 'tier_1_to_2' | 'tier_2_to_3'
    bvn?: string
    date_of_birth?: string
    national_id_number?: string
    national_id_image_url?: string
    proof_of_address_url?: string
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    admin_notes?: string
    reviewed_by?: number
    reviewer_name?: string
    created_at: string
    reviewed_at?: string
  }
}

export interface TierKYCFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  target_tier?: '2' | '3' | 'all'
  search?: string
  date_from?: string
  date_to?: string
}

export const tierKYCService = {
  /**
   * Get tier-based KYC submissions
   */
  async getTierSubmissions(filters: TierKYCFilters = {}): Promise<TierKYCSubmissionsResponse> {
    const params: any = { ...filters }
    // Convert 'all' to undefined for backend
    if (params.status === 'all') params.status = undefined
    if (params.target_tier === 'all') params.target_tier = undefined
    
    const response = await api.get('/admin/kyc/tier-submissions', { params })
    return {
      submissions: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  },

  /**
   * Get tier-based KYC submission details
   */
  async getTierSubmissionDetails(submissionId: number): Promise<TierKYCSubmissionDetails> {
    const response = await api.get(`/admin/kyc/tier-submissions/${submissionId}`)
    return response.data.data
  },

  /**
   * Approve tier-based KYC submission
   */
  async approveTierSubmission(submissionId: number, notes?: string): Promise<any> {
    const response = await api.post(`/admin/kyc/tier-submissions/${submissionId}/approve`, { notes })
    return response.data.data
  },

  /**
   * Reject tier-based KYC submission
   */
  async rejectTierSubmission(submissionId: number, rejectionReason: string, notes?: string): Promise<any> {
    const response = await api.post(`/admin/kyc/tier-submissions/${submissionId}/reject`, {
      rejection_reason: rejectionReason,
      notes
    })
    return response.data.data
  },
}
