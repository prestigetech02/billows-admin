'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/lib/api'

interface Setting {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description: string | null
  updated_at: string
}

interface SettingCategory {
  name: string
  icon: string
  settings: Setting[]
}

// Define setting categories based on key prefixes
const getCategoryForSetting = (key: string): string => {
  // Platform Configuration
  if (key.startsWith('app_') || key === 'app_name' || key === 'app_url' || 
      key === 'admin_email' || key === 'support_email' || key === 'support_phone') {
    return 'Platform Configuration'
  }
  
  // Transaction Limits
  if (key.startsWith('transaction_') || key.startsWith('min_') || key.startsWith('max_') || 
      key === 'min_transaction_amount' || key === 'max_transaction_amount' ||
      key === 'daily_transaction_limit' || key === 'monthly_transaction_limit' ||
      key === 'require_kyc_for_transactions' || key === 'kyc_required_amount_threshold') {
    return 'Transaction Limits'
  }
  
  // Wallet & Balance
  if (key.startsWith('wallet_') || key.startsWith('balance_') || 
      key === 'min_wallet_balance' || key === 'max_wallet_balance' ||
      key === 'allow_negative_balance' || key === 'auto_fund_wallet') {
    return 'Wallet & Balance'
  }
  
  // KYC Settings
  if (key.startsWith('kyc_')) {
    return 'KYC Settings'
  }
  
  // Security
  if (key.startsWith('security_') || key.startsWith('password_') || 
      key.startsWith('session_') || key.startsWith('login_') ||
      key === 'max_login_attempts' || key === 'session_timeout_minutes' ||
      key === 'require_2fa_for_admins' || key === 'password_min_length' ||
      key === 'password_require_special_chars') {
    return 'Security'
  }
  
  // Notifications
  if (key.startsWith('notification_') || 
      (key.startsWith('enable_') && key.includes('notification')) ||
      key === 'enable_email_notifications' || key === 'enable_sms_notifications' ||
      key === 'enable_push_notifications' || key === 'notification_email_from') {
    return 'Notifications'
  }
  
  // Social Media Links
  if (key === 'whatsapp_url' || key === 'instagram_url' || 
      key === 'tiktok_url' || key === 'facebook_url') {
    return 'Social Media Links'
  }
  
  // If no match, still categorize as "Other" but we'll hide it if empty
  return 'Other'
}

export default function GeneralSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Platform Configuration', 'Transaction Limits', 'Security', 'Social Media Links']))

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/settings')
      if (response.data.success) {
        setSettings(response.data.data)
        // Initialize edited settings with current values
        const initial: Record<string, any> = {}
        response.data.data.forEach((setting: Setting) => {
          initial[setting.key] = setting.value
        })
        setEditedSettings(initial)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load settings')
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (key: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      [key]: value
    }))
    setSuccess(null)
    setError(null)
  }

  const handleSave = async (key: string) => {
    try {
      setSaving(key)
      setError(null)
      setSuccess(null)

      const value = editedSettings[key]
      const setting = settings.find((s) => s.key === key)

      if (!setting) return

      // Validate value based on type
      let validatedValue = value
      if (setting.type === 'number') {
        validatedValue = parseFloat(value)
        if (isNaN(validatedValue)) {
          setError(`Invalid number for ${key}`)
          setSaving(null)
          return
        }
      } else if (setting.type === 'boolean') {
        validatedValue = Boolean(value)
      } else if (setting.type === 'json') {
        try {
          validatedValue = typeof value === 'string' ? JSON.parse(value) : value
        } catch {
          setError(`Invalid JSON for ${key}`)
          setSaving(null)
          return
        }
      }

      const response = await api.put(`/admin/settings/${key}`, {
        value: validatedValue
      })

      if (response.data.success) {
        setSuccess(`Setting "${key}" updated successfully`)
        // Update the settings list
        setSettings((prev) =>
          prev.map((s) =>
            s.key === key
              ? { ...s, value: validatedValue, updated_at: new Date().toISOString() }
              : s
          )
        )
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to update ${key}`)
      console.error('Error updating setting:', err)
    } finally {
      setSaving(null)
    }
  }

  const renderInput = (setting: Setting) => {
    const value = editedSettings[setting.key] ?? setting.value

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleValueChange(setting.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        )

      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
            placeholder="Enter valid JSON"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Settings List */}
      {settings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No settings found</p>
          <p className="text-sm text-gray-500 mt-2">Settings will appear here once they are created in the database</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            // Group settings by category
            const categories = new Map<string, Setting[]>()
            settings.forEach((setting) => {
              const category = getCategoryForSetting(setting.key)
              if (!categories.has(category)) {
                categories.set(category, [])
              }
              categories.get(category)!.push(setting)
            })

            // Sort categories
            const categoryOrder = [
              'Platform Configuration',
              'Transaction Limits',
              'Wallet & Balance',
              'KYC Settings',
              'Security',
              'Notifications',
              'Social Media Links',
              'Other'
            ]

            return Array.from(categories.entries())
              .filter(([categoryName]) => {
                // Hide "Other" category if it exists
                return categoryName !== 'Other'
              })
              .sort((a, b) => {
                const indexA = categoryOrder.indexOf(a[0])
                const indexB = categoryOrder.indexOf(b[0])
                if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0])
                if (indexA === -1) return 1
                if (indexB === -1) return -1
                return indexA - indexB
              })
              .map(([categoryName, categorySettings]) => {
                const isExpanded = expandedCategories.has(categoryName)
                return (
                  <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setExpandedCategories((prev) => {
                          const newSet = new Set(prev)
                          if (newSet.has(categoryName)) {
                            newSet.delete(categoryName)
                          } else {
                            newSet.add(categoryName)
                          }
                          return newSet
                        })
                      }}
                      className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {categorySettings.length} {categorySettings.length === 1 ? 'setting' : 'settings'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-6 space-y-4">
                        {categorySettings.map((setting) => {
                          const hasChanges = editedSettings[setting.key] !== setting.value
                          return (
                            <div
                              key={setting.key}
                              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-900 mb-1">
                                    {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </label>
                                  {setting.description && (
                                    <p className="text-xs text-gray-500 mb-3">{setting.description}</p>
                                  )}
                                  <div className="mt-2">{renderInput(setting)}</div>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Type: {setting.type} • Last updated:{' '}
                                    {new Date(setting.updated_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasChanges && (
                                    <span className="text-xs text-orange-600 font-medium">Unsaved</span>
                                  )}
                                  <button
                                    onClick={() => handleSave(setting.key)}
                                    disabled={!hasChanges || saving === setting.key}
                                    className={`
                                      flex items-center gap-2 px-4 py-2 rounded-lg transition
                                      ${
                                        hasChanges
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }
                                      ${saving === setting.key ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                  >
                                    {saving === setting.key ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        Save
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
          })()}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  )
}

