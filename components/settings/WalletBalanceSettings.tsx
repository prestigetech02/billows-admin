'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'

interface Setting {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description: string | null
  updated_at: string
}

export default function WalletBalanceSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/settings')
      if (response.data.success) {
        const walletSettings = response.data.data.filter((setting: Setting) => 
          setting.key === 'min_wallet_balance' || 
          setting.key === 'max_wallet_balance' || 
          setting.key === 'allow_negative_balance' || 
          setting.key === 'auto_fund_wallet'
        )
        setSettings(walletSettings)
        const initial: Record<string, any> = {}
        walletSettings.forEach((setting: Setting) => {
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
      }

      const response = await api.put(`/admin/settings/${key}`, {
        value: validatedValue
      })

      if (response.data.success) {
        setSuccess(`Setting "${key}" updated successfully`)
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

      {settings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No wallet balance settings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => {
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

