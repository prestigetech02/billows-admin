'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from '@/lib/contexts/SidebarContext'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchRouteData } from '@/lib/utils/prefetch'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  Menu,
  X,
  ChevronRight,
  CreditCard,
  Link as LinkIcon,
  Brain,
  ChevronLeft,
  Wallet,
  Image as ImageIcon,
  ArrowUpRight,
  QrCode,
  Bell,
  BarChart3,
  Globe,
  TrendingUp,
  Tag,
  Coins,
  BookOpen,
  Flame,
  CheckSquare,
  Gift
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: any
  children?: { name: string; href: string }[]
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    children: [
      { name: 'All Users', href: '/dashboard/users' },
      { name: 'KYC Management', href: '/dashboard/kyc' },
      { name: 'KYC Pending', href: '/dashboard/users/kyc-pending' }
    ]
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: DollarSign
  },
  {
    name: 'Transfers',
    href: '/dashboard/transfers',
    icon: ArrowUpRight
  },
  {
    name: 'Remittances',
    href: '/dashboard/remittances',
    icon: Globe
  },
  {
    name: 'QR Payments',
    href: '/dashboard/qr-payments',
    icon: QrCode
  },
  {
    name: 'Bill Payments',
    href: '/dashboard/bills',
    icon: CreditCard
  },
  {
    name: 'Wallets & Balances',
    href: '/dashboard/wallets',
    icon: Wallet
  },
  {
    name: 'Balance Management',
    href: '/dashboard/balance-management',
    icon: TrendingUp
  },
  {
    name: 'Payment Tags',
    href: '/dashboard/tags',
    icon: Tag
  },
  {
    name: 'Profit & Revenue',
    href: '/dashboard/profit',
    icon: Coins
  },
  {
    name: 'Ad Banners',
    href: '/dashboard/banners',
    icon: ImageIcon
  },
  {
    name: 'Education',
    href: '/dashboard/education',
    icon: BookOpen
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare
  },
  {
    name: 'Daily Streak',
    href: '/dashboard/daily-streak',
    icon: Flame
  },
  {
    name: 'Billpoints',
    href: '/dashboard/billpoints',
    icon: Gift
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell
  },
  {
    name: 'Analytics & Reports',
    href: '/dashboard/analytics',
    icon: BarChart3
  },
  {
    name: 'Exchange Rates',
    href: '/dashboard/settings?tab=exchange-rates',
    icon: TrendingUp
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const handleMouseEnter = (href: string) => {
    // Prefetch route data on hover for instant navigation
    prefetchRouteData(queryClient, href)
  }

  const handleToggleCollapse = () => {
    toggleCollapse()
    // Close expanded items when collapsing
    if (!isCollapsed) {
      setExpandedItems([])
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle Button */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src="/images/billows_logo_dark.png"
                    alt="Billows"
                    fill
                    sizes="40px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Billows</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
            ) : (
              <div className="relative w-10 h-10 mx-auto">
                <Image
                  src="/images/billows_appicon_dark.png"
                  alt="Billows"
                  fill
                  sizes="40px"
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
            )}
            <button
              onClick={handleToggleCollapse}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''} hidden lg:flex`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.name)
              const active = isActive(item.href)

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => !isCollapsed && toggleExpanded(item.name)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-colors group ${
                          active
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                          <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                          {!isCollapsed && (
                            <span className="font-medium text-sm">{item.name}</span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight
                            className={`w-4 h-4 transition-transform text-gray-400 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </button>
                      {!isCollapsed && isExpanded && (
                        <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                          {item.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              prefetch={true}
                              onMouseEnter={() => handleMouseEnter(child.href)}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  toggleSidebar()
                                }
                              }}
                              className={`w-full block px-3 py-2 rounded-lg transition-colors text-sm ${
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      prefetch={true}
                      onMouseEnter={() => handleMouseEnter(item.href)}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          toggleSidebar()
                        }
                      }}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-colors group ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.name}</span>
                      )}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
