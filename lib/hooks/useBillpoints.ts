import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billpointsService, BillpointTransaction, BillpointFilters } from '@/lib/services/billpoints.service'
import { useToast } from './useToast'

export function useBillpointStats() {
  return useQuery({
    queryKey: ['billpoints', 'stats'],
    queryFn: () => billpointsService.getStats(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useBillpointTransactions(filters: BillpointFilters = {}) {
  return useQuery({
    queryKey: ['billpoints', 'transactions', filters],
    queryFn: () => billpointsService.getTransactions(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useUserBillpoints(userId: number | null) {
  return useQuery({
    queryKey: ['billpoints', 'user', userId],
    queryFn: () => billpointsService.getUserBillpoints(userId!),
    enabled: !!userId,
  })
}

export function useBillpointLeaderboard(filters: any = {}) {
  return useQuery({
    queryKey: ['billpoints', 'leaderboard', filters],
    queryFn: () => billpointsService.getLeaderboard(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdjustBillpoints() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ userId, amount, type, description }: { userId: number; amount: number; type: 'add' | 'subtract'; description?: string }) =>
      billpointsService.adjustBillpoints(userId, amount, type, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billpoints'] })
      showSuccess('Billpoints adjusted successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to adjust billpoints')
    },
  })
}






