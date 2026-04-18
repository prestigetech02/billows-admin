'use client'

import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  user_id: number
  email: string
  first_name: string
  last_name: string
  balance: number
  total_earned: number
  total_used: number
}

interface BillpointLeaderboardProps {
  leaderboard: LeaderboardEntry[]
  loading: boolean
}

export default function BillpointLeaderboard({
  leaderboard,
  loading
}: BillpointLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="w-6 h-6 text-yellow-500" />
    } else if (rank === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />
    } else if (rank === 3) {
      return <Award className="w-6 h-6 text-orange-500" />
    }
    return (
      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-600">{rank}</span>
      </div>
    )
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    } else if (rank === 2) {
      return 'bg-gray-100 text-gray-800 border-gray-300'
    } else if (rank === 3) {
      return 'bg-orange-100 text-orange-800 border-orange-300'
    }
    return 'bg-white text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-gray-600">No leaderboard data available</p>
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
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Earned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Used
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              return (
              <tr key={entry.user_id} className={`hover:bg-gray-50 transition-colors ${getRankBadge(rank)}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getRankIcon(rank)}
                    <span className="ml-2 text-sm font-medium text-gray-900">#{rank}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.first_name} {entry.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{entry.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-purple-600">
                    {entry.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {entry.total_earned.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.total_used.toLocaleString(undefined, { maximumFractionDigits: 0 })} pts
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

