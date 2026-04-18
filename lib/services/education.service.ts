import api from '../api'

export interface EducationalContent {
  id: number
  title: string
  category: string
  author: string
  featured_image_url?: string | null
  content: string
  read_time?: string | null
  is_published: boolean
  is_featured: boolean
  view_count: number
  display_order: number
  created_by?: number | null
  created_at: string
  updated_at: string
  created_by_first_name?: string | null
  created_by_last_name?: string | null
}

export interface EducationalContentFilters {
  page?: number
  limit?: number
  category?: string
  search?: string
  is_published?: boolean
  is_featured?: boolean
}

export interface EducationalContentResponse {
  data: EducationalContent[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const educationService = {
  /**
   * Get all educational content for admin
   */
  async getEducationalContent(filters: EducationalContentFilters = {}): Promise<EducationalContentResponse> {
    const response = await api.get('/admin/education', { params: filters })
    return response.data
  },

  /**
   * Get educational content by ID
   */
  async getEducationalContentById(id: number): Promise<EducationalContent> {
    const response = await api.get(`/admin/education/${id}`)
    return response.data.data
  },

  /**
   * Create educational content
   */
  async createEducationalContent(contentData: Partial<EducationalContent>): Promise<EducationalContent> {
    const response = await api.post('/admin/education', contentData)
    return response.data.data
  },

  /**
   * Update educational content
   */
  async updateEducationalContent(id: number, contentData: Partial<EducationalContent>): Promise<EducationalContent> {
    const response = await api.put(`/admin/education/${id}`, contentData)
    return response.data.data
  },

  /**
   * Delete educational content
   */
  async deleteEducationalContent(id: number): Promise<void> {
    await api.delete(`/admin/education/${id}`)
  },

  /**
   * Upload featured image
   */
  async uploadFeaturedImage(file: File): Promise<{ url: string; public_id: string; width: number; height: number }> {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/admin/education/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },
}

