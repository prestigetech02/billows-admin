import { QueryClient } from '@tanstack/react-query'
import { usersService } from '@/lib/services/users.service'
import { dashboardService } from '@/lib/services/dashboard.service'

/**
 * Prefetch queries based on route path
 * This enables instant navigation by loading data before the user clicks
 */
export function prefetchRouteData(queryClient: QueryClient, path: string) {
  // Dashboard route
  if (path === '/dashboard') {
    queryClient.prefetchQuery({
      queryKey: ['dashboardStats'],
      queryFn: () => dashboardService.getStats(),
      staleTime: 1 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['dashboardActivity', 20],
      queryFn: () => dashboardService.getRecentActivity(20),
      staleTime: 1 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['dashboardPending'],
      queryFn: () => dashboardService.getPendingActions(),
      staleTime: 1 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['dashboardRevenue', '30d'],
      queryFn: () => dashboardService.getRevenueChart('30d'),
      staleTime: 5 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['dashboardTransaction', '30d'],
      queryFn: () => dashboardService.getTransactionChart('30d'),
      staleTime: 5 * 60 * 1000,
    })
    return
  }

  // Users list route
  if (path === '/dashboard/users' || path.startsWith('/dashboard/users/kyc-pending')) {
    queryClient.prefetchQuery({
      queryKey: ['users', { page: 1, limit: 20 }],
      queryFn: () => usersService.getUsers({ page: 1, limit: 20 }),
      staleTime: 2 * 60 * 1000,
    })
    return
  }

  // Transactions route
  if (path === '/dashboard/transactions') {
    // You can add transaction prefetching here when hooks are created
    return
  }

  // Transfers route
  if (path === '/dashboard/transfers') {
    // You can add transfers prefetching here when hooks are created
    return
  }

  // QR Payments route
  if (path === '/dashboard/qr-payments') {
    // You can add QR payments prefetching here when hooks are created
    return
  }

  // Add more routes as needed...
}





















