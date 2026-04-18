'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PlatformSettings from '@/components/settings/PlatformSettings'
import TransactionLimitsSettings from '@/components/settings/TransactionLimitsSettings'
import WalletBalanceSettings from '@/components/settings/WalletBalanceSettings'
import KYCSettings from '@/components/settings/KYCSettings'
import SecuritySettings from '@/components/settings/SecuritySettings'
import NotificationsSettings from '@/components/settings/NotificationsSettings'
import SocialMediaSettings from '@/components/settings/SocialMediaSettings'
import FeesSettings from '@/components/settings/FeesSettings'
import ExchangeRatesSettings from '@/components/settings/ExchangeRatesSettings'
import { Settings, DollarSign, TrendingUp, Shield, Bell, Users, Wallet, Lock, Share2 } from 'lucide-react'

type TabType = 'general' | 'transaction-limits' | 'wallet-balance' | 'kyc' | 'security' | 'notifications' | 'social-media' | 'fees' | 'exchange-rates'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'general')

  // Sync active tab with URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null
    if (tab && ['general', 'transaction-limits', 'wallet-balance', 'kyc', 'security', 'notifications', 'social-media', 'fees', 'exchange-rates'].includes(tab)) {
      setActiveTab(tab)
    } else if (!tab) {
      // If no tab in URL, default to general
      setActiveTab('general')
    }
  }, [searchParams])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/dashboard/settings?tab=${tab}`, { scroll: false })
  }

  const tabs = [
    {
      id: 'general' as TabType,
      name: 'General',
      icon: Settings,
      description: 'Platform configuration settings'
    },
    {
      id: 'transaction-limits' as TabType,
      name: 'Transaction Limits',
      icon: DollarSign,
      description: 'Transaction amount limits and controls'
    },
    {
      id: 'wallet-balance' as TabType,
      name: 'Wallet & Balance',
      icon: Wallet,
      description: 'Wallet balance settings'
    },
    {
      id: 'kyc' as TabType,
      name: 'KYC Settings',
      icon: Users,
      description: 'KYC verification settings'
    },
    {
      id: 'security' as TabType,
      name: 'Security',
      icon: Lock,
      description: 'Security and authentication settings'
    },
    {
      id: 'notifications' as TabType,
      name: 'Notifications',
      icon: Bell,
      description: 'Notification preferences'
    },
    {
      id: 'social-media' as TabType,
      name: 'Social Media',
      icon: Share2,
      description: 'Social media links'
    },
    {
      id: 'fees' as TabType,
      name: 'Fees',
      icon: DollarSign,
      description: 'Transaction fee configurations'
    },
    {
      id: 'exchange-rates' as TabType,
      name: 'Exchange Rates',
      icon: TrendingUp,
      description: 'Currency exchange rate markups'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system settings and configurations</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && <PlatformSettings />}
          {activeTab === 'transaction-limits' && <TransactionLimitsSettings />}
          {activeTab === 'wallet-balance' && <WalletBalanceSettings />}
          {activeTab === 'kyc' && <KYCSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'social-media' && <SocialMediaSettings />}
          {activeTab === 'fees' && <FeesSettings />}
          {activeTab === 'exchange-rates' && <ExchangeRatesSettings />}
        </div>
      </div>
    </div>
  )
}

