import { useQuery } from '@tanstack/react-query'
import { dashboardService, DashboardStats, RecentActivity, PendingActions } from '@/lib/services/dashboard.service'

const DASHBOARD_STATS_QUERY_KEY = 'dashboardStats'
const DASHBOARD_ACTIVITY_QUERY_KEY = 'dashboardActivity'
const DASHBOARD_PENDING_QUERY_KEY = 'dashboardPending'
const DASHBOARD_REVENUE_QUERY_KEY = 'dashboardRevenue'
const DASHBOARD_TRANSACTION_QUERY_KEY = 'dashboardTransaction'

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: [DASHBOARD_STATS_QUERY_KEY],
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 120 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  })
}

export function useDashboardActivity(limit: number = 20) {
  return useQuery<{ activities: RecentActivity[] }>({
    queryKey: [DASHBOARD_ACTIVITY_QUERY_KEY, limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 120 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  })
}

export function useDashboardPending() {
  return useQuery<PendingActions>({
    queryKey: [DASHBOARD_PENDING_QUERY_KEY],
    queryFn: () => dashboardService.getPendingActions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 120 * 1000, // Auto-refresh every 2 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  })
}

export function useDashboardRevenue(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery<any[]>({
    queryKey: [DASHBOARD_REVENUE_QUERY_KEY, period],
    queryFn: () => dashboardService.getRevenueChart(period),
    staleTime: 5 * 60 * 1000, // 5 minutes for chart data
  })
}

export function useDashboardTransaction(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery<any[]>({
    queryKey: [DASHBOARD_TRANSACTION_QUERY_KEY, period],
    queryFn: () => dashboardService.getTransactionChart(period),
    staleTime: 5 * 60 * 1000, // 5 minutes for chart data
  })
}
















