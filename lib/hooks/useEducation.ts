import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { educationService, EducationalContent, EducationalContentFilters } from '@/lib/services/education.service'
import { useToast } from './useToast'

export function useEducationalContent(filters: EducationalContentFilters = {}) {
  return useQuery({
    queryKey: ['education', filters],
    queryFn: () => educationService.getEducationalContent(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useEducationalContentById(id: number | null) {
  return useQuery({
    queryKey: ['education', id],
    queryFn: () => educationService.getEducationalContentById(id!),
    enabled: !!id,
  })
}

export function useCreateEducationalContent() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (contentData: Partial<EducationalContent>) =>
      educationService.createEducationalContent(contentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      showSuccess('Educational content created successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to create educational content')
    },
  })
}

export function useUpdateEducationalContent() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EducationalContent> }) =>
      educationService.updateEducationalContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      showSuccess('Educational content updated successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to update educational content')
    },
  })
}

export function useDeleteEducationalContent() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => educationService.deleteEducationalContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      showSuccess('Educational content deleted successfully')
    },
    onError: (error: any) => {
      showError(error?.response?.data?.error || 'Failed to delete educational content')
    },
  })
}

