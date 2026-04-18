import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsService, Coupon, CouponFilters, CouponsResponse } from '@/lib/services/coupons.service'
import { useToast } from './useToast'

export function useCoupons(filters: CouponFilters = {}) {
  return useQuery<CouponsResponse>({
    queryKey: ['coupons', filters],
    queryFn: () => couponsService.getCoupons(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCouponStats() {
  return useQuery({
    queryKey: ['coupons', 'stats'],
    queryFn: () => couponsService.getStats(),
  })
}

export function useCoupon(id: number | null) {
  return useQuery({
    queryKey: ['coupons', id],
    queryFn: () => couponsService.getCouponById(id!),
    enabled: !!id,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (couponData: Partial<Coupon>) => couponsService.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      showSuccess('Coupon created successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to create coupon')
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coupon> }) =>
      couponsService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      showSuccess('Coupon updated successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to update coupon')
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  return useMutation({
    mutationFn: (id: number) => couponsService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      showSuccess('Coupon deleted successfully')
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || 'Failed to delete coupon')
    },
  })
}

