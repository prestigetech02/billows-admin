import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksService, Task, TaskFilters } from '@/lib/services/tasks.service'
import { useToast } from './useToast'

export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => tasksService.getStats(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksService.getTasks(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useTaskById(id: number | null) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksService.getTaskById(id!),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (taskData: Partial<Task>) => tasksService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showSuccess('Task created successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to create task')
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      tasksService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showSuccess('Task updated successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to update task')
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showSuccess('Task deleted successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to delete task')
    },
  })
}

export function useTaskCompletions(filters: any = {}) {
  return useQuery({
    queryKey: ['tasks', 'completions', filters],
    queryFn: () => tasksService.getTaskCompletions(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useUserTaskProgress(userId: number | null) {
  return useQuery({
    queryKey: ['tasks', 'user-progress', userId],
    queryFn: () => tasksService.getUserTaskProgress(userId!),
    enabled: !!userId,
  })
}

export function useCompleteTaskForUser() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: number; userId: number }) =>
      tasksService.completeTaskForUser(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showSuccess('Task marked as completed for user')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to complete task')
    },
  })
}

export function useClaimTaskRewardForUser() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: number; userId: number }) =>
      tasksService.claimTaskRewardForUser(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showSuccess('Task reward claimed for user')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to claim task reward')
    },
  })
}






