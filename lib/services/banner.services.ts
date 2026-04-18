import api from '../api'

export interface Banner {
  id: number
  title: string | null
  image_url: string
  image_public_id: string | null
  position: 'home' | 'referral' | 'promo'
  is_active: boolean
  start_date: string | null
  end_date: string | null
  click_url: string | null
  created_by: number | null
  created_at: string
  updated_at: string
}

export interface CreateBannerData {
  title?: string
  position?: 'home' | 'referral' | 'promo'
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
  click_url?: string | null
  image: File
}

export interface UpdateBannerData {
  title?: string
  position?: 'home' | 'referral' | 'promo'
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
  click_url?: string | null
  image?: File
}

export interface GetAllBannersParams {
  position?: 'home' | 'referral' | 'promo'
  is_active?: boolean
}

/**
 * Get all banners with optional filters (Admin only)
 */
export async function getAllBanners(params?: GetAllBannersParams): Promise<Banner[]> {
  const queryParams = new URLSearchParams()
  
  if (params?.position) {
    queryParams.append('position', params.position)
  }
  
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = `/banners${queryString ? `?${queryString}` : ''}`
  
  const response = await api.get<{ success: boolean; data: Banner[] }>(url)
  return response.data.data
}

/**
 * Get active banner for a specific position (Public)
 */
export async function getActiveBanner(position: 'home' | 'referral' | 'promo' = 'home'): Promise<Banner | null> {
  const response = await api.get<{ success: boolean; data: Banner | null }>(`/banners/active?position=${position}`)
  return response.data.data
}

/**
 * Create a new banner (Admin only)
 */
export async function createBanner(data: CreateBannerData): Promise<Banner> {
  const formData = new FormData()
  
  formData.append('image', data.image)
  
  if (data.title) {
    formData.append('title', data.title)
  }
  
  if (data.position) {
    formData.append('position', data.position)
  }
  
  if (data.is_active !== undefined) {
    formData.append('is_active', data.is_active.toString())
  }
  
  if (data.start_date) {
    formData.append('start_date', data.start_date)
  }
  
  if (data.end_date) {
    formData.append('end_date', data.end_date)
  }
  
  if (data.click_url) {
    formData.append('click_url', data.click_url)
  }

  const response = await api.post<{ success: boolean; message: string; data: Banner }>('/banners', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  // Fetch the complete banner data after creation
  const banners = await getAllBanners()
  const createdBanner = banners.find(b => b.id === response.data.data.id)
  
  if (!createdBanner) {
    throw new Error('Failed to fetch created banner')
  }
  
  return createdBanner
}

/**
 * Update a banner (Admin only)
 */
export async function updateBanner(id: number, data: UpdateBannerData): Promise<void> {
  const formData = new FormData()
  
  if (data.image) {
    formData.append('image', data.image)
  }
  
  if (data.title !== undefined) {
    formData.append('title', data.title)
  }
  
  if (data.position) {
    formData.append('position', data.position)
  }
  
  if (data.is_active !== undefined) {
    formData.append('is_active', data.is_active.toString())
  }
  
  if (data.start_date !== undefined) {
    formData.append('start_date', data.start_date || '')
  }
  
  if (data.end_date !== undefined) {
    formData.append('end_date', data.end_date || '')
  }
  
  if (data.click_url !== undefined) {
    formData.append('click_url', data.click_url || '')
  }

  await api.put<{ success: boolean; message: string }>(`/banners/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * Delete a banner (Admin only)
 */
export async function deleteBanner(id: number): Promise<void> {
  await api.delete<{ success: boolean; message: string }>(`/banners/${id}`)
}