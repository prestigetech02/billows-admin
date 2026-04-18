'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, User, LogOut, Search, X, Loader2 } from 'lucide-react'
import { authService, User as UserType } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import NotificationDropdown, { useNotificationCount } from '@/components/NotificationDropdown'
import api from '@/lib/api'

interface HeaderProps {
  toggleSidebar: () => void
}

interface SearchResult {
  id: number
  type: 'user' | 'transaction'
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  transaction_type?: string
  amount?: number
  status?: string
  description?: string
  created_at: string
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{
    users: SearchResult[]
    transactions: SearchResult[]
    total: number
  }>({ users: [], transactions: [], total: 0 })
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const unreadCount = useNotificationCount()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults({ users: [], transactions: [], total: 0 })
      setShowSearchResults(false)
      return
    }

    if (searchQuery.trim().length < 2) {
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get('/admin/search', {
          params: { q: searchQuery.trim(), limit: 10 }
        })
        if (response.data.success) {
          setSearchResults(response.data.data)
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults({ users: [], transactions: [], total: 0 })
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('')
    setShowSearchResults(false)
    if (result.type === 'user') {
      router.push(`/dashboard/users/${result.id}`)
    } else if (result.type === 'transaction') {
      router.push(`/dashboard/transactions/${result.id}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Menu Button and Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                placeholder="Search users, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.total > 0) {
                    setShowSearchResults(true)
                  }
                }}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.total > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* Users Section */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Users ({searchResults.users.length})
                      </div>
                      {searchResults.users.map((user) => (
                        <button
                          key={`user-${user.id}`}
                          onClick={() => handleSearchResultClick(user)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {user.email}
                              </div>
                            </div>
                            <div className="ml-2 text-xs text-gray-400">
                              User
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Transactions Section */}
                  {searchResults.transactions.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Transactions ({searchResults.transactions.length})
                      </div>
                      {searchResults.transactions.map((transaction) => (
                        <button
                          key={`transaction-${transaction.id}`}
                          onClick={() => handleSearchResultClick(transaction)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {transaction.description || `Transaction #${transaction.id}`}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {transaction.amount && formatCurrency(transaction.amount)} • {transaction.status}
                              </div>
                            </div>
                            <div className="ml-2 text-xs text-gray-400">
                              TXN
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* View All Results */}
                  {searchResults.total > 10 && (
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowSearchResults(false)
                          router.push(`/dashboard/users?search=${encodeURIComponent(searchQuery)}`)
                        }}
                        className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-center"
                      >
                        View all results ({searchResults.total})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {showSearchResults && searchResults.total === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                  <div className="text-sm text-gray-500 text-center">
                    No results found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNotificationClick={(notification) => {
                // Navigate to notification details or notifications page
                router.push(`/dashboard/notifications`)
              }}
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.[0] || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 md:hidden">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

