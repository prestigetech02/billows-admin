'use client'

import { Banner } from '@/lib/services/banner.services'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'

interface BannerTableProps {
  banners: Banner[]
  loading: boolean
  onEdit: (banner: Banner) => void
  onDelete: (id: number) => void
}

export default function BannerTable({
  banners,
  loading,
  onEdit,
  onDelete
}: BannerTableProps) {
  const getPositionBadge = (position: string) => {
    const styles = {
      home: 'bg-blue-100 text-blue-800',
      referral: 'bg-purple-100 text-purple-800',
      promo: 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[position as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}>
        {position.charAt(0).toUpperCase() + position.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
        <Eye className="w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
        <EyeOff className="w-3 h-3" />
        Inactive
      </span>
    )
  }

  if (loading && banners.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Click URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="relative w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={banner.image_url}
                      alt={banner.title || 'Banner image'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {banner.title || <span className="text-gray-400 italic">No title</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPositionBadge(banner.position)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(banner.is_active)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {banner.click_url ? (
                      <a
                        href={banner.click_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                        title={banner.click_url}
                      >
                        {banner.click_url}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No URL</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {banner.start_date || banner.end_date ? (
                      <div className="space-y-1">
                        {banner.start_date && (
                          <div className="text-xs text-gray-500">
                            From: {format(new Date(banner.start_date), 'MMM d, yyyy')}
                          </div>
                        )}
                        {banner.end_date && (
                          <div className="text-xs text-gray-500">
                            To: {format(new Date(banner.end_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No date range</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(banner.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(banner)}
                      className="text-blue-600 hover:text-blue-900 transition p-2 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(banner.id)}
                      className="text-red-600 hover:text-red-900 transition p-2 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}





















