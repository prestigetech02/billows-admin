'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { getAllBanners, deleteBanner, Banner, GetAllBannersParams } from '@/lib/services/banner.services'
import PageLoader from '@/components/ui/PageLoader'
import BannerTable from '@/components/banners/BannerTable'
import BannerFormModal from '@/components/banners/BannerFormModal'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState<GetAllBannersParams>({})

  useEffect(() => {
    fetchBanners()
  }, [filters])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllBanners(filters)
      setBanners(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load banners')
      console.error('Error fetching banners:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBanner(null)
    setShowCreateModal(true)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await deleteBanner(id)
      await fetchBanners()
    } catch (err: any) {
      setError(err.message || 'Failed to delete banner')
      console.error('Error deleting banner:', err)
    }
  }

  const handleSave = async () => {
    // The form modal will handle the actual save, we just need to refresh
    setShowCreateModal(false)
    setEditingBanner(null)
    await fetchBanners()
  }

  const handleFilterChange = (newFilters: Partial<GetAllBannersParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (loading && banners.length === 0) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Banners</h1>
          <p className="text-gray-600 mt-1">Manage app advertisement banners and carousel images</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={filters.position || ''}
              onChange={(e) => handleFilterChange({ position: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Positions</option>
              <option value="home">Home</option>
              <option value="referral">Referral</option>
              <option value="promo">Promo</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => handleFilterChange({ 
                is_active: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No banners found</p>
          <p className="text-gray-500 text-sm mt-2">Create your first banner to get started</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Banner
          </button>
        </div>
      ) : (
        <BannerTable
          banners={banners}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BannerFormModal
          banner={editingBanner}
          onSave={handleSave}
          onClose={() => {
            setShowCreateModal(false)
            setEditingBanner(null)
          }}
          saving={saving}
          setSaving={setSaving}
        />
      )}
    </div>
  )
}





















