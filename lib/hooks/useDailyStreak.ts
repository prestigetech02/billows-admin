import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dailyStreakService, DailyStreakFilters, DailyStreaksResponse } from '@/lib/services/daily-streak.service'
import { useToast } from './useToast'

export function useDailyStreaks(filters: DailyStreakFilters = {}) {
  return useQuery<DailyStreaksResponse>({
    queryKey: ['daily-streaks', filters],
    queryFn: () => dailyStreakService.getUserStreaks(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useDailyStreakStats() {
  return useQuery({
    queryKey: ['daily-streaks', 'stats'],
    queryFn: () => dailyStreakService.getStats(),
  })
}

export function useDailyStreakDetails(userId: number | null) {
  return useQuery({
    queryKey: ['daily-streaks', 'user', userId],
    queryFn: () => dailyStreakService.getUserStreakDetails(userId!),
    enabled: !!userId,
  })
}

export function useStreakClaims(filters: any = {}) {
  return useQuery({
    queryKey: ['daily-streaks', 'claims', filters],
    queryFn: () => dailyStreakService.getStreakClaims(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useResetStreak() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (userId: number) => dailyStreakService.resetUserStreak(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-streaks'] })
      showSuccess('User streak reset successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to reset user streak')
    },
  })
}

