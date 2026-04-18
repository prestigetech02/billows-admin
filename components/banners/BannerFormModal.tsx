'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Banner, CreateBannerData, UpdateBannerData, createBanner, updateBanner } from '@/lib/services/banner.services'
import Image from 'next/image'

interface BannerFormModalProps {
  banner: Banner | null
  onSave: () => void
  onClose: () => void
  saving: boolean
  setSaving: (saving: boolean) => void
}

export default function BannerFormModal({ banner, onSave, onClose, saving, setSaving }: BannerFormModalProps) {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    position: (banner?.position || 'home') as 'home' | 'referral' | 'promo',
    is_active: banner?.is_active ?? true,
    start_date: banner?.start_date ? banner.start_date.split('T')[0] : '',
    end_date: banner?.end_date ? banner.end_date.split('T')[0] : '',
    click_url: banner?.click_url || '',
    image: null as File | null
  })
  
  const [preview, setPreview] = useState<string | null>(banner?.image_url || null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (banner?.image_url) {
      setPreview(banner.image_url)
    }
  }, [banner])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select an image file' })
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' })
        return
      }

      setFormData({ ...formData, image: file })
      setErrors({ ...errors, image: '' })

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null })
    setPreview(banner?.image_url || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Image is required for new banners
    if (!banner && !formData.image) {
      newErrors.image = 'Banner image is required'
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    // Validate URL format if provided
    if (formData.click_url && !isValidUrl(formData.click_url)) {
      newErrors.click_url = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    try {
      setSaving(true)
      setErrors({})

      const submitData = {
        title: formData.title || undefined,
        position: formData.position,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        click_url: formData.click_url || null,
      }

      if (banner) {
        // Update existing banner
        const updateData: UpdateBannerData = {
          title: submitData.title,
          position: submitData.position,
          is_active: submitData.is_active,
          start_date: submitData.start_date,
          end_date: submitData.end_date,
          click_url: submitData.click_url,
          ...(formData.image && { image: formData.image })
        }
        await updateBanner(banner.id, updateData)
      } else {
        // Create new banner
        if (!formData.image) {
          setErrors({ image: 'Banner image is required' })
          setSaving(false)
          return
        }

        const createData: CreateBannerData = {
          title: submitData.title,
          position: submitData.position,
          is_active: submitData.is_active,
          start_date: submitData.start_date,
          end_date: submitData.end_date,
          click_url: submitData.click_url,
          image: formData.image
        }
        await createBanner(createData)
      }

      onSave()
    } catch (err: any) {
      console.error('Error saving banner:', err)
      setErrors({ submit: err.message || 'Failed to save banner. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image {!banner && <span className="text-red-500">*</span>}
            </label>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Recommended Image Size:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Optimal:</strong> 1080 × 608 pixels (16:9 aspect ratio)</li>
                <li><strong>Alternative:</strong> 1200 × 675 pixels (16:9 aspect ratio)</li>
                <li><strong>For carousels:</strong> 1080 × 540 pixels (2:1 ratio) or 1080 × 480 pixels</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Maximum file size: 5MB • Supported formats: PNG, JPG, JPEG, WebP
              </p>
            </div>
            <div className="space-y-4">
              {preview ? (
                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  <div 
                    className="relative w-full aspect-video cursor-pointer group"
                    onClick={() => !saving && !banner && fileInputRef.current?.click()}
                    title={banner ? 'Click change button below to replace image' : 'Click to change image'}
                  >
                    <Image
                      src={preview}
                      alt="Banner preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {!banner && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Click to change</span>
                      </div>
                    )}
                  </div>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      disabled={saving}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {banner && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Change Image
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => !saving && fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Click to upload image</p>
                  <p className="text-gray-500 text-sm mt-1">Recommended: 1080 × 608px (16:9)</p>
                </div>
              )}
              
              {!preview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choose Image
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={saving}
              />
              
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter banner title"
              disabled={saving}
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={saving}
            >
              <option value="home">Home</option>
              <option value="referral">Referral</option>
              <option value="promo">Promo</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select where this banner will be displayed in the app
            </p>
          </div>

          {/* Click URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Click URL (Optional)
            </label>
            <input
              type="url"
              value={formData.click_url}
              onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.click_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
              disabled={saving}
            />
            {errors.click_url && (
              <p className="mt-1 text-sm text-red-600">{errors.click_url}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL to navigate to when banner is clicked
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={saving}
                min={formData.start_date || undefined}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={saving}
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active (banner will be visible in the app)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

