'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Eye, EyeOff, Upload, Image as ImageIcon, Info, XCircle } from 'lucide-react'
import { useEducationalContentById, useCreateEducationalContent, useUpdateEducationalContent } from '@/lib/hooks/useEducation'
import { EducationalContent } from '@/lib/services/education.service'
import PageLoader from '@/components/ui/PageLoader'
import { useToast } from '@/lib/hooks/useToast'
import api from '@/lib/api'

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

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

export default function EducationEditorPage() {
  const router = useRouter()
  const params = useParams()
  const contentId = params.id === 'new' ? null : parseInt(params.id as string)
  
  const { data: existingContent, isLoading: isLoadingContent } = useEducationalContentById(contentId)
  const createMutation = useCreateEducationalContent()
  const updateMutation = useUpdateEducationalContent()

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
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    if (existingContent) {
      setFormData({
        title: existingContent.title,
        category: existingContent.category,
        author: existingContent.author,
        featured_image_url: existingContent.featured_image_url || '',
        content: existingContent.content,
        read_time: existingContent.read_time || '',
        is_published: existingContent.is_published,
        is_featured: existingContent.is_featured,
        display_order: existingContent.display_order,
      })
      if (existingContent.featured_image_url) {
        setFeaturedImagePreview(existingContent.featured_image_url)
      }
    }
  }, [existingContent])

  useEffect(() => {
    if (formData.featured_image_url) {
      setFeaturedImagePreview(formData.featured_image_url)
    }
  }, [formData.featured_image_url])

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
      setFeaturedImagePreview(result.url)
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
    setFeaturedImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (contentId) {
        await updateMutation.mutateAsync({ id: contentId, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      router.push('/dashboard/education')
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Quill editor modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image', 'video'
  ]

  if (contentId && isLoadingContent) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/education')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {contentId ? 'Edit Content' : 'Create New Content'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition ${
                  showPreview 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.title || !formData.content || !formData.author}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Meta Fields */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Details</h2>
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
                  
                  {featuredImagePreview ? (
                    <div className="relative">
                      <div className="relative w-full h-64 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
                        <img
                          src={featuredImagePreview}
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
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value || undefined })}
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

                {/* Published & Featured */}
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
            </div>

            {/* Content Editor with Quill */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
              <div className="border-b border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Content Editor</h2>
                <p className="text-xs text-gray-500 mt-1">Use the toolbar above to format your content. Images and videos will be embedded inline.</p>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.content || ''}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your educational content here..."
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  />
                </div>
                <style jsx global>{`
                  .ql-container {
                    flex: 1 !important;
                    display: flex !important;
                    flex-direction: column !important;
                  }
                  .ql-editor {
                    flex: 1 !important;
                    min-height: 500px !important;
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Mobile Preview</h2>
                <p className="text-sm text-gray-500 mt-1">How it will appear on the mobile app</p>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Mobile Preview Frame */}
                <div className="mx-auto max-w-sm bg-gray-50 rounded-3xl p-4 shadow-inner">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    {/* Featured Image */}
                    {formData.featured_image_url && (
                      <img
                        src={formData.featured_image_url}
                        alt="Featured"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    
                    {/* Header Card */}
                    <div className="p-4 bg-white">
                      {/* Category Badge */}
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                        {formData.category || 'Category'}
                      </span>
                      
                      {/* Title */}
                      <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {formData.title || 'Untitled'}
                      </h1>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formData.author || 'Author'}</span>
                        <span>{formData.read_time || '5 min read'}</span>
                      </div>
                    </div>
                    
                    {/* Content Section - HTML Preview */}
                    <div className="p-4" style={{ background: 'transparent' }}>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content || '' }}
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#374151'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
