'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, RefreshCw, DollarSign, AlertCircle } from 'lucide-react'
import { feesService, FeeConfiguration } from '@/lib/services/fees.service'
import PageLoader from '@/components/ui/PageLoader'

export default function FeesSettings() {
  const [fees, setFees] = useState<FeeConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeConfiguration | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await feesService.getFees()
      setFees(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load fees')
      console.error('Error fetching fees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFee(null)
    setShowCreateModal(true)
  }

  const handleEdit = (fee: FeeConfiguration) => {
    setEditingFee(fee)
    setShowCreateModal(true)
  }

  const handleSave = async (feeData: any) => {
    try {
      setSaving(true)
      setError(null)
      
      if (editingFee) {
        await feesService.updateFee(editingFee.id, feeData)
      } else {
        await feesService.createFee(feeData)
      }
      
      setShowCreateModal(false)
      setEditingFee(null)
      await fetchFees()
    } catch (err: any) {
      setError(err.message || 'Failed to save fee configuration')
      console.error('Error saving fee:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (fee: FeeConfiguration) => {
    try {
      await feesService.updateFee(fee.id, { is_active: !fee.is_active })
      await fetchFees()
    } catch (err: any) {
      setError(err.message || 'Failed to update fee')
      console.error('Error toggling fee:', err)
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bill_payment: 'Bill Payment',
      transfer: 'Transfer',
      remittance: 'Remittance',
      wallet_funding: 'Wallet Funding',
      withdrawal: 'Withdrawal',
      card_creation: 'Card Creation',
      currency_conversion: 'Currency Conversion',
      payment_link: 'Payment Link',
      waec_pin: 'WAEC Pin'
    }
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatFeeValue = (fee: FeeConfiguration) => {
    if (fee.fee_type === 'percentage') {
      return `${fee.fee_value}%`
    } else if (fee.fee_type === 'fixed') {
      return `₦${fee.fee_value.toFixed(2)}`
    }
    return `${fee.fee_value}% (tiered)`
  }

  if (loading && fees.length === 0) {
    return <PageLoader variant="table" />
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fee Configurations</h2>
          <p className="text-sm text-gray-600 mt-1">Manage transaction fees and charges</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFees}
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
            Add Fee Configuration
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

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {fees.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No fee configurations found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first fee configuration to get started</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Fee Configuration
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min/Max Fee
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
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTransactionTypeLabel(fee.transaction_type)}
                      </div>
                      <div className="text-xs text-gray-500">{fee.transaction_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fee.fee_type === 'percentage' 
                          ? 'bg-blue-100 text-blue-800'
                          : fee.fee_type === 'fixed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {fee.fee_type.charAt(0).toUpperCase() + fee.fee_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatFeeValue(fee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {fee.min_fee !== null && fee.max_fee !== null ? (
                          <>₦{fee.min_fee.toFixed(2)} - ₦{fee.max_fee.toFixed(2)}</>
                        ) : fee.min_fee !== null ? (
                          <>Min: ₦{fee.min_fee.toFixed(2)}</>
                        ) : fee.max_fee !== null ? (
                          <>Max: ₦{fee.max_fee.toFixed(2)}</>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(fee)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                          fee.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {fee.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fee.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(fee)}
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
        <FeeFormModal
          fee={editingFee}
          onSave={handleSave}
          onClose={() => {
            setShowCreateModal(false)
            setEditingFee(null)
          }}
          saving={saving}
        />
      )}
    </div>
  )
}

// Fee Form Modal Component
interface FeeFormModalProps {
  fee: FeeConfiguration | null
  onSave: (data: any) => void
  onClose: () => void
  saving: boolean
}

function FeeFormModal({ fee, onSave, onClose, saving }: FeeFormModalProps) {
  const [formData, setFormData] = useState({
    transaction_type: fee?.transaction_type || '',
    fee_type: fee?.fee_type || 'percentage' as 'percentage' | 'fixed' | 'tiered',
    fee_value: fee?.fee_value || 0,
    min_fee: fee?.min_fee || null,
    max_fee: fee?.max_fee || null,
    amount_min: fee?.amount_min || null,
    amount_max: fee?.amount_max || null,
    is_active: fee?.is_active ?? true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const transactionTypes = [
    { value: 'bill_payment', label: 'Bill Payment' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'remittance', label: 'Remittance' },
    { value: 'wallet_funding', label: 'Wallet Funding' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'card_creation', label: 'Card Creation' },
    { value: 'currency_conversion', label: 'Currency Conversion' },
    { value: 'payment_link', label: 'Payment Link' },
    { value: 'waec_pin', label: 'WAEC Pin' }
  ]

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required'
    }
    
    if (formData.fee_value < 0) {
      newErrors.fee_value = 'Fee value must be non-negative'
    }
    
    if (formData.min_fee !== null && formData.min_fee < 0) {
      newErrors.min_fee = 'Min fee must be non-negative'
    }
    
    if (formData.max_fee !== null && formData.max_fee < 0) {
      newErrors.max_fee = 'Max fee must be non-negative'
    }
    
    if (formData.min_fee !== null && formData.max_fee !== null && formData.min_fee > formData.max_fee) {
      newErrors.max_fee = 'Max fee must be greater than or equal to min fee'
    }
    
    if (formData.amount_min !== null && formData.amount_min < 0) {
      newErrors.amount_min = 'Amount min must be non-negative'
    }
    
    if (formData.amount_max !== null && formData.amount_max < 0) {
      newErrors.amount_max = 'Amount max must be non-negative'
    }
    
    if (formData.amount_min !== null && formData.amount_max !== null && formData.amount_min >= formData.amount_max) {
      newErrors.amount_max = 'Amount max must be greater than amount min'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const submitData = {
        ...formData,
        min_fee: formData.min_fee === null || formData.min_fee === 0 ? null : formData.min_fee,
        max_fee: formData.max_fee === null || formData.max_fee === 0 ? null : formData.max_fee,
        amount_min: formData.amount_min === null || formData.amount_min === 0 ? null : formData.amount_min,
        amount_max: formData.amount_max === null || formData.amount_max === 0 ? null : formData.amount_max
      }
      
      if (fee) {
        // Update: exclude transaction_type and fee_type
        const { transaction_type, fee_type, ...updateData } = submitData
        onSave(updateData)
      } else {
        // Create: include all fields
        onSave(submitData)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {fee ? 'Edit Fee Configuration' : 'Create Fee Configuration'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.transaction_type}
              onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
              disabled={!!fee}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.transaction_type ? 'border-red-500' : 'border-gray-300'
              } ${fee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select transaction type</option>
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.transaction_type && (
              <p className="mt-1 text-sm text-red-600">{errors.transaction_type}</p>
            )}
          </div>

          {/* Fee Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.fee_type}
              onChange={(e) => setFormData({ ...formData, fee_type: e.target.value as any })}
              disabled={!!fee}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                fee ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
              }`}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="tiered">Tiered (Percentage)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.fee_type === 'percentage' && 'Fee is calculated as a percentage of the transaction amount'}
              {formData.fee_type === 'fixed' && 'Fee is a fixed amount regardless of transaction amount'}
              {formData.fee_type === 'tiered' && 'Fee is calculated as percentage (tiered logic coming soon)'}
            </p>
          </div>

          {/* Fee Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.fee_value}
              onChange={(e) => setFormData({ ...formData, fee_value: parseFloat(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.fee_value ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.fee_type === 'percentage' ? 'e.g., 1.5 for 1.5%' : 'e.g., 50 for ₦50'}
            />
            {errors.fee_value && (
              <p className="mt-1 text-sm text-red-600">{errors.fee_value}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.fee_type === 'percentage' 
                ? 'Enter percentage value (e.g., 1.5 for 1.5%)'
                : 'Enter fixed amount in NGN'}
            </p>
          </div>

          {/* Min/Max Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Fee (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.min_fee || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  min_fee: e.target.value ? parseFloat(e.target.value) : null 
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.min_fee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Leave empty for no minimum"
              />
              {errors.min_fee && (
                <p className="mt-1 text-sm text-red-600">{errors.min_fee}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Fee (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.max_fee || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  max_fee: e.target.value ? parseFloat(e.target.value) : null 
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.max_fee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Leave empty for no maximum"
              />
              {errors.max_fee && (
                <p className="mt-1 text-sm text-red-600">{errors.max_fee}</p>
              )}
            </div>
          </div>

          {/* Amount Range (for tiered fees) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Range (Optional - for tiered fees)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Define the transaction amount range for this fee tier. Leave empty to apply to all amounts.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount_min || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    amount_min: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.amount_min ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.amount_min && (
                  <p className="mt-1 text-xs text-red-600">{errors.amount_min}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount_max || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    amount_max: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.amount_max ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Leave empty for no maximum"
                />
                {errors.amount_max && (
                  <p className="mt-1 text-xs text-red-600">{errors.amount_max}</p>
                )}
              </div>
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
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active (fee will be applied to transactions)
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
              {saving ? 'Saving...' : fee ? 'Update Fee' : 'Create Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

