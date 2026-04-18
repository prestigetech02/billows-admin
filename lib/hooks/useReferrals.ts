import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { referralsService, Referral, ReferralFilters } from '@/lib/services/referrals.service'
import { useToast } from './useToast'

export function useReferralStats() {
  return useQuery({
    queryKey: ['referrals', 'stats'],
    queryFn: () => referralsService.getStats(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useReferrals(filters: ReferralFilters = {}) {
  return useQuery({
    queryKey: ['referrals', filters],
    queryFn: () => referralsService.getReferrals(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useReferralById(id: number | null) {
  return useQuery({
    queryKey: ['referrals', id],
    queryFn: () => referralsService.getReferralById(id!),
    enabled: !!id,
  })
}

export function useCompleteReferral() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => referralsService.completeReferral(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      showSuccess('Referral marked as completed successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to complete referral')
    },
  })
}

export function useAwardEarnings() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => referralsService.awardEarnings(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      showSuccess('Earnings awarded successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to award earnings')
    },
  })
}

export function useEarningsList(filters: any = {}) {
  return useQuery({
    queryKey: ['referrals', 'earnings', filters],
    queryFn: () => referralsService.getEarningsList(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useWithdrawalRequests(filters: any = {}) {
  return useQuery({
    queryKey: ['referrals', 'withdrawals', filters],
    queryFn: () => referralsService.getWithdrawalRequests(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => referralsService.approveWithdrawal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      showSuccess('Withdrawal approved successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to approve withdrawal')
    },
  })
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      referralsService.rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      showSuccess('Withdrawal rejected successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to reject withdrawal')
    },
  })
}






