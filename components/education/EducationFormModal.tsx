'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Image as ImageIcon, XCircle } from 'lucide-react'
import { EducationalContent } from '@/lib/services/education.service'
import { useToast } from '@/lib/hooks/useToast'
import api from '@/lib/api'

interface EducationFormModalProps {
  content?: EducationalContent | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<EducationalContent>) => void
  isLoading?: boolean
}

const CATEGORIES = [
  'Financial Literacy',
  'Personal Finance',
  'Investment',
  'Savings',
  'Budgeting',
  'Credit & Debt',
  'Insurance',
  'Retirement Planning',
  'Tax Planning',
  'Other'
]

export default function EducationFormModal({
  content,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: EducationFormModalProps) {
  const { showError, showSuccess } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<EducationalContent>>({
    title: '',
    category: 'Financial Literacy',
    author: '',
    featured_image_url: '',
    content: '',
    read_time: '',
    is_published: false,
    is_featured: false,
    display_order: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        category: content.category,
        author: content.author,
        featured_image_url: content.featured_image_url || '',
        content: content.content,
        read_time: content.read_time || '',
        is_published: content.is_published,
        is_featured: content.is_featured,
        display_order: content.display_order,
      })
    } else {
      // Reset form for new content
      setFormData({
        title: '',
        category: 'Financial Literacy',
        author: '',
        featured_image_url: '',
        content: '',
        read_time: '',
        is_published: false,
        is_featured: false,
        display_order: 0,
      })
    }
  }, [content, isOpen])

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('Please select a JPEG, PNG, or WebP image')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/admin/education/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const result = response.data.data
      setFormData({ ...formData, featured_image_url: result.url })
      showSuccess('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      showError(error.response?.data?.error || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, featured_image_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {content ? 'Edit Educational Content' : 'Create New Educational Content'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Understanding Digital Wallets"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Billows Team"
              />
            </div>

            {/* Featured Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image <span className="text-red-500">*</span>
              </label>
              
              {formData.featured_image_url ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
                    <img
                      src={formData.featured_image_url}
                      alt="Featured preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 1200x630px (1.9:1 aspect ratio). Minimum: 800x420px. Formats: JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading image...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-100 rounded-full mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP up to 5MB
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Recommended: 1200x630px (1.9:1 aspect ratio)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={formData.read_time || ''}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="5 min read"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Supports Markdown: # for headings, **bold**, ![alt](url) for images, [VIDEO](url) for videos)
                </span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm resize-none"
                  style={{ minHeight: '400px', height: '400px' }}
                  placeholder="# Title&#10;&#10;Your content here...&#10;&#10;![Image](https://example.com/image.jpg)&#10;&#10;[VIDEO](https://example.com/video.mp4)"
                />
              </div>
            </div>

            {/* Published */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : content ? 'Update Content' : 'Create Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

