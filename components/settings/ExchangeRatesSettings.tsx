'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, RefreshCw, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface ExchangeRateMarkup {
  id: number
  from_currency: string
  to_currency: string
  markup_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ExchangeRatesSettings() {
  const [markups, setMarkups] = useState<ExchangeRateMarkup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMarkup, setEditingMarkup] = useState<ExchangeRateMarkup | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMarkups()
  }, [])

  const fetchMarkups = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/settings/exchange-rates')
      if (response.data.success) {
        setMarkups(response.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load exchange rate markups')
      console.error('Error fetching markups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingMarkup(null)
    setShowCreateModal(true)
  }

  const handleEdit = (markup: ExchangeRateMarkup) => {
    setEditingMarkup(markup)
    setShowCreateModal(true)
  }

  const handleSave = async (markupData: any) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (editingMarkup) {
        const response = await api.put(`/admin/settings/exchange-rates/${editingMarkup.id}`, markupData)
        if (response.data.success) {
          setSuccess('Exchange rate markup updated successfully')
          setShowCreateModal(false)
          setEditingMarkup(null)
          await fetchMarkups()
          setTimeout(() => setSuccess(null), 3000)
        }
      } else {
        const response = await api.post('/admin/settings/exchange-rates', markupData)
        if (response.data.success) {
          setSuccess('Exchange rate markup created successfully')
          setShowCreateModal(false)
          await fetchMarkups()
          setTimeout(() => setSuccess(null), 3000)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save exchange rate markup')
      console.error('Error saving markup:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (markup: ExchangeRateMarkup) => {
    try {
      await api.put(`/admin/settings/exchange-rates/${markup.id}`, {
        is_active: !markup.is_active
      })
      await fetchMarkups()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update markup')
      console.error('Error toggling markup:', err)
    }
  }

  const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'KES', 'GHS', 'ZAR']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-gray-600">Loading exchange rates...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Exchange Rate Markups</h2>
          <p className="text-sm text-gray-600 mt-1">Manage currency exchange rate markups</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMarkups}
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
            Add Exchange Rate
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-600 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Markups Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {markups.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No exchange rate markups found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first exchange rate markup to get started</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Exchange Rate
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Markup Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {markups.map((markup) => (
                  <tr key={markup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {markup.from_currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {markup.to_currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {markup.markup_percentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(markup)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                          markup.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {markup.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(markup.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(markup)}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <ExchangeRateFormModal
          markup={editingMarkup}
          onSave={handleSave}
          onClose={() => {
            setShowCreateModal(false)
            setEditingMarkup(null)
          }}
          saving={saving}
          currencies={currencies}
        />
      )}
    </div>
  )
}

// Exchange Rate Form Modal Component
interface ExchangeRateFormModalProps {
  markup: ExchangeRateMarkup | null
  onSave: (data: any) => void
  onClose: () => void
  saving: boolean
  currencies: string[]
}

function ExchangeRateFormModal({ markup, onSave, onClose, saving, currencies }: ExchangeRateFormModalProps) {
  const [formData, setFormData] = useState({
    from_currency: markup?.from_currency || '',
    to_currency: markup?.to_currency || '',
    markup_percentage: markup?.markup_percentage || 0,
    is_active: markup?.is_active ?? true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.from_currency) {
      newErrors.from_currency = 'From currency is required'
    }
    
    if (!formData.to_currency) {
      newErrors.to_currency = 'To currency is required'
    }
    
    if (formData.from_currency === formData.to_currency) {
      newErrors.to_currency = 'To currency must be different from from currency'
    }
    
    if (formData.markup_percentage < 0) {
      newErrors.markup_percentage = 'Markup percentage must be non-negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {markup ? 'Edit Exchange Rate Markup' : 'Create Exchange Rate Markup'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Currency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.from_currency}
              onChange={(e) => setFormData({ ...formData, from_currency: e.target.value })}
              disabled={!!markup}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.from_currency ? 'border-red-500' : 'border-gray-300'
              } ${markup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select currency</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            {errors.from_currency && (
              <p className="mt-1 text-sm text-red-600">{errors.from_currency}</p>
            )}
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Currency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.to_currency}
              onChange={(e) => setFormData({ ...formData, to_currency: e.target.value })}
              disabled={!!markup}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.to_currency ? 'border-red-500' : 'border-gray-300'
              } ${markup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select currency</option>
              {currencies
                .filter((c) => c !== formData.from_currency)
                .map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
            {errors.to_currency && (
              <p className="mt-1 text-sm text-red-600">{errors.to_currency}</p>
            )}
          </div>

          {/* Markup Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Markup Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.markup_percentage}
              onChange={(e) => setFormData({ ...formData, markup_percentage: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.markup_percentage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 2.5 for 2.5%"
            />
            {errors.markup_percentage && (
              <p className="mt-1 text-sm text-red-600">{errors.markup_percentage}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the markup percentage to add to the base exchange rate
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active (markup will be applied to exchange rates)
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
              {saving ? 'Saving...' : markup ? 'Update Markup' : 'Create Markup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

