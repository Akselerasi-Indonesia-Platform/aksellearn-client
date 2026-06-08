import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userCartService, Cart } from '@/services/user/cart.service'
import { toast } from 'sonner'
import { useUIStore } from './use-ui-store'

export function useCart() {
  const queryClient = useQueryClient()
  const { openMiniCart } = useUIStore()

  const cartQuery = useQuery({
    queryKey: ['user', 'cart'],
    queryFn: () => userCartService.get(),
  })

  const addToCartMutation = useMutation({
    mutationFn: (params: {
      id: string | number
      type: 'course' | 'bundle'
      quantity?: number
    }) => userCartService.addItem({
      ...params,
      id: String(params.id),
    }),
    onSuccess: (updatedCart: Cart) => {
      // Immediate state update
      queryClient.setQueryData(['user', 'cart'], updatedCart)
      // Open the mini cart sidebar instead of a blocking toast
      openMiniCart()
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to add item to cart'
      if (typeof msg === 'string' && msg.toLowerCase().includes('lifetime access')) {
        toast.error('You already own lifetime access to this course!')
      } else {
        toast.error(msg)
      }
    },
  })

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => userCartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'cart'] })
      toast.success('Item removed from cart')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to remove item'
      toast.error(msg)
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => userCartService.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'cart'] })
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: (params: { id: string; quantity: number }) =>
      userCartService.updateQuantity(params),
    onSuccess: (updatedCart: Cart) => {
      queryClient.setQueryData(['user', 'cart'], updatedCart)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update quantity'
      toast.error(msg)
    },
  })

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) => userCartService.validateCoupon(code),
    onSuccess: (updatedCart: Cart) => {
      queryClient.setQueryData(['user', 'cart'], updatedCart)
    },
  })

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    isFetching: cartQuery.isFetching,
    addToCart: addToCartMutation.mutate,
    addToCartAsync: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    removeFromCart: removeFromCartMutation.mutate,
    isRemoving: removeFromCartMutation.isPending,
    clearCart: clearCartMutation.mutate,
    isClearing: clearCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutate,
    isUpdating: updateQuantityMutation.isPending,
    validateCoupon: validateCouponMutation.mutateAsync,
    isValidatingCoupon: validateCouponMutation.isPending,
    refreshCart: () => queryClient.invalidateQueries({ queryKey: ['user', 'cart'] }),
  }
}
