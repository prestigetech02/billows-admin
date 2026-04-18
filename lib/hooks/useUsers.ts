import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, User, UserFilters, UsersResponse } from '@/lib/services/users.service'

const USERS_QUERY_KEY = 'users'
const USER_QUERY_KEY = 'user'
const USER_ACTIVITY_QUERY_KEY = 'userActivity'
const USER_TRANSACTIONS_QUERY_KEY = 'userTransactions'

export function useUsers(filters: UserFilters = {}) {
  return useQuery<UsersResponse>({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => usersService.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for list data
  })
}

export function useUser(userId: number) {
  return useQuery<User>({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: () => usersService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for user details
  })
}

export function useUserActivityTimeline(userId: number, limit: number = 100) {
  return useQuery({
    queryKey: [USER_ACTIVITY_QUERY_KEY, userId, limit],
    queryFn: () => usersService.getUserActivityTimeline(userId, limit),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useUserTransactions(userId: number, filters: any = {}) {
  return useQuery({
    queryKey: [USER_TRANSACTIONS_QUERY_KEY, userId, filters],
    queryFn: () => usersService.getUserTransactions(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { is_active?: boolean; role?: 'user' | 'admin' } }) =>
      usersService.updateUser(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => usersService.suspendUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] })
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => usersService.activateUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] })
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })
}

export function useAdjustUserBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, amount, currency, reason }: { userId: number; amount: number; currency: string; reason: string }) =>
      usersService.adjustUserBalance(userId, amount, currency, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId] })
      queryClient.invalidateQueries({ queryKey: [USER_TRANSACTIONS_QUERY_KEY, variables.userId] })
    },
  })
}
