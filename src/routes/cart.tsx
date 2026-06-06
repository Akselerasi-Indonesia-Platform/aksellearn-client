import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  Info,
  Clock,
  ExternalLink,
  Edit3,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicLayout } from '@/components/public/layout/main-layout'
import { useCart } from '@/hooks/use-cart'
import { userOrderService } from '@/services/user/order.service'
import { userCourseService } from '@/services/user/course.service'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { z } from 'zod'
import { toast } from 'sonner'

function CartPage() {
  const navigate = useNavigate()
  const { order_id, transaction_status } = Route.useSearch()

  React.useEffect(() => {
    if (order_id) {
      // 🛡️ [Midtrans Redirect - Failure/Unfinish]
      // If the user lands back on the cart with an order_id, it means the 
      // payment was either canceled, failed, or left unfinished.
      
      const isCancel = transaction_status === 'cancel'
      const isDeny = transaction_status === 'deny'
      
      if (isCancel) {
        toast.info("Payment canceled.", {
          description: "You can try paying again from your Purchase History or checkout again.",
        })
      } else if (isDeny) {
        toast.error("Payment failed.", {
          description: "Your transaction was denied. Please try a different payment method.",
        })
      } else {
        toast.warning("Payment unfinished.", {
          description: "Your order is still pending. You can complete it later in your Purchase History.",
        })
      }

      // Clean up URL parameters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('order_id')
        url.searchParams.delete('status_code')
        url.searchParams.delete('transaction_status')
        window.history.replaceState({}, '', url.pathname)
      }
    }
  }, [order_id, transaction_status])

  const [couponInput, setCouponInput] = React.useState('')
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | undefined>(
    typeof window !== 'undefined' ? localStorage.getItem('active_coupon') || undefined : undefined
  )

  const {
    cart,
    isLoading,
    isError,
    error,
    isFetching,
    removeFromCart,
    isRemoving,
    clearCart,
    isClearing,
    updateQuantity,
    isUpdating,
    validateCoupon,
    isValidatingCoupon,
    refreshCart,
  } = useCart()

  const lastAppliedCouponRef = React.useRef<string | undefined>(undefined)

  // Auto-apply coupon from local storage on initial load
  React.useEffect(() => {
    if (appliedCoupon && cart && !cart.discount_breakdown?.some(d => d.type === 'coupon') && cart.items.length > 0) {
      validateCoupon(appliedCoupon).catch(() => {
        setAppliedCoupon(undefined)
        localStorage.removeItem('active_coupon')
      })
    }
  }, [appliedCoupon, cart?.items?.length])

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    try {
      const res = await validateCoupon(couponInput.trim())
      setAppliedCoupon(couponInput.trim())
      localStorage.setItem('active_coupon', couponInput.trim())
      const hasCoupon = res.discount_breakdown?.some(item => item.type === 'coupon') || (res.coupon_discount && res.coupon_discount > 0)
      if (hasCoupon) {
        toast.success(`Coupon "${couponInput.trim()}" applied successfully!`)
      } else {
        toast.warning(`Coupon applied, but no discount was active for these items.`)
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to apply coupon'
      toast.error(message)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined)
    setCouponInput('')
    localStorage.removeItem('active_coupon')
    refreshCart()
  }

  const queryClient = useQueryClient()
  const isUserAuthenticated = isAuthenticated()
  const isUserAdmin = isAdmin()

  // 1. Fetch Pending Order
  const { data: pendingOrder } = useQuery({
    queryKey: ['user', 'orders', 'pending'],
    queryFn: () => userOrderService.getPending(),
    enabled: isUserAuthenticated,
  })

  // Fetch enrollments for smart routing
  const { data: enrollments } = useQuery({
    queryKey: ['user', 'enrollments'],
    queryFn: () => userCourseService.getAll().then((res) => res.data || []),
    enabled: isUserAuthenticated,
  })

  const getSmartRoute = (itemUuid: string, slug?: string) => {
    const targetSlug = slug || itemUuid
    if (!isUserAuthenticated || !enrollments) {
      return { to: '/course/$courseSlug', params: { courseSlug: targetSlug } } as any
    }
    const enrollment = enrollments.find((e: any) => e.uuid === itemUuid || e.id === itemUuid)
    if (!enrollment) {
      return { to: '/course/$courseSlug', params: { courseSlug: targetSlug } } as any
    }
    const isExpired = enrollment.enrollment_status === 'expired' || (enrollment.remaining_days !== undefined && enrollment.remaining_days <= 0)
    if (isExpired) {
      return { to: '/course/$courseSlug', params: { courseSlug: targetSlug } } as any
    }
    return { to: '/student/learn/$courseUuid', params: { courseUuid: itemUuid } } as any
  }

  // 2. Restore Order Mutation
  const restoreMutation = useMutation({
    mutationFn: (uuid: string) => userOrderService.restore(uuid),
    onSuccess: () => {
      toast.success("Order restored!", {
        description: "Your items are back in the cart.",
      })
      queryClient.invalidateQueries({ queryKey: ['user', 'orders', 'pending'] })
      refreshCart()
    },
    onError: () => {
      toast.error("Failed to restore order.")
    }
  })

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity({ id, quantity: newQuantity })
    }
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 min-h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="size-12 text-slate-300" />
          </div>
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="text-slate-500 font-medium">
              Explore our selection of professional courses and start learning today.
            </p>
          </div>
          <div className="mt-8">
            <Button
              onClick={() => navigate({ to: '/search' })}
              className="rounded-lg h-12 px-8 font-bold"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="bg-[#f8f9fb] min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="space-y-8">
            {/* Pending Order Banner */}
            {pendingOrder && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">You have a pending order</h3>
                    <p className="text-slate-500 text-sm font-medium">
                      Order #{pendingOrder.uuid.split('-')[0].toUpperCase()} is awaiting payment. 
                      Complete it now to secure your items.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={() => navigate({ 
                      to: '/student/order/$uuid', 
                      params: { uuid: pendingOrder.uuid } 
                    })}
                    variant="card-enroll"
                    size="lg"
                    className="flex-1 md:flex-none gap-2 shadow-sm"
                  >
                    Resume Payment <ExternalLink className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
                <p className="text-slate-500 font-medium mt-1">
                  {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart()}
                disabled={isClearing}
                className="text-slate-500 hover:text-rose-600 font-semibold"
              >
                {isClearing ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="size-4 mr-2" />
                )}
                Clear Cart
              </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-8 space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <Card className="p-4 sm:p-6 border-slate-200 shadow-none hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image */}
                          <div className="w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                            <Link {...getSmartRoute(item.uuid, (item as any).slug)} className="block w-full h-full">
                              {(item.image_url || item.thumbnail) ? (
                                <img
                                  src={item.image_url || item.thumbnail}
                                  className="w-full h-full object-cover"
                                  alt={item.name}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                  <ShoppingBag className="size-10" />
                                </div>
                              )}
                            </Link>
                          </div>

                          {/* Details */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="font-bold text-lg text-slate-900 leading-tight hover:text-primary transition-colors line-clamp-2">
                                  <Link {...getSmartRoute(item.uuid, (item as any).slug)}>
                                    {item.name}
                                  </Link>
                                </h3>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-lg text-slate-900">
                                        {formatCurrency(item.final_price)}
                                    </p>
                                    {item.base_price > item.final_price && (
                                        <p className="text-sm text-slate-400 line-through">
                                            {formatCurrency(item.base_price)}
                                        </p>
                                    )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 font-medium">
                                Professional Certification
                              </p>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFromCart(item.uuid)
                                  }}
                                  disabled={isRemoving}
                                  className="h-auto p-0 text-slate-500 hover:text-rose-600 font-semibold"
                                >
                                  Remove
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-primary font-semibold"
                                >
                                  Save for later
                                </Button>
                              </div>

                              {(item.purchasable_type === 'course' || item.purchasable_type === 'courses') ? (
                                <div className="flex items-center bg-slate-100/70 rounded-lg px-3 py-1.5 border border-slate-200/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                  Qty: 1
                                </div>
                              ) : (
                                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.uuid, item.quantity - 1)}
                                    disabled={isUpdating}
                                    className="size-8 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30"
                                  >
                                    <Minus className="size-3.5" />
                                  </button>
                                  <div className="w-10 text-center">
                                    {isUpdating ? (
                                      <Loader2 className="size-3 animate-spin mx-auto text-primary" />
                                    ) : (
                                      <span className="font-bold text-sm text-slate-900">
                                        {item.quantity}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.uuid, item.quantity + 1)}
                                    disabled={isUpdating}
                                    className="size-8 rounded flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30"
                                  >
                                    <Plus className="size-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/search' })}
                  className="w-full sm:w-auto h-12 rounded-lg font-bold border-slate-200 text-slate-600 gap-2 mt-4"
                >
                  <ArrowLeft className="size-4" />
                  Continue Browsing
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <Card className="p-6 sm:p-8 border-slate-200 shadow-none space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>

                  <div className="space-y-4">
                    <div className="pb-4 border-b border-slate-100 space-y-3">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter coupon code" 
                          value={couponInput || appliedCoupon || ''}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          disabled={!!appliedCoupon || isValidatingCoupon}
                          className="bg-slate-50 font-mono font-bold tracking-wider"
                        />
                        {appliedCoupon ? (
                          <Button 
                            variant="outline" 
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                            disabled={isValidatingCoupon}
                            onClick={handleRemoveCoupon}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary"
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            onClick={handleApplyCoupon}
                          >
                            {isValidatingCoupon && <Loader2 className="size-4 animate-spin mr-2" />}
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>Subtotal</span>
                      <span className="text-slate-900">
                        {formatCurrency(cart.total_base_amount)}
                      </span>
                    </div>

                    {cart.discount_breakdown && cart.discount_breakdown.length > 0 ? (
                      cart.discount_breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm font-medium text-emerald-600">
                          <span className="flex items-center gap-1.5">
                            {item.title}
                            {item.type === 'coupon' && (
                              <span className="text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 uppercase tracking-wider">
                                Coupon
                              </span>
                            )}
                            {(item as any).source && (
                              <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 capitalize">
                                {(item as any).source}
                              </span>
                            )}
                          </span>
                          <span>-{formatCurrency(item.amount)}</span>
                        </div>
                      ))
                    ) : cart.total_discount_amount > 0 ? (
                      <div className="flex justify-between items-center text-sm font-medium text-emerald-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(cart.total_discount_amount)}</span>
                      </div>
                    ) : null}

                    <Separator className="bg-slate-100" />

                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-slate-900">
                        {formatCurrency(cart.total_final_amount)}
                      </span>
                    </div>
                  </div>

                  {isUserAdmin ? (
                    <div className="space-y-3">
                      <Button
                        disabled
                        className="w-full h-14 rounded-lg bg-slate-100 text-slate-400 text-lg font-bold border border-slate-200"
                      >
                        Admin Checkout Disabled
                      </Button>
                      <p className="text-[11px] text-center font-semibold text-slate-400">
                        Admins cannot create orders. Switch to a student account.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => navigate({ to: '/checkout' })}
                      variant="card-enroll"
                      size="xl"
                      className="w-full rounded-lg shadow-md hover:shadow-primary/20"
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                </Card>

                {/* Additional Info */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex gap-3">
                        <Info className="size-5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">Secure Checkout</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Your data is protected by industry-standard encryption protocols.
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

const cartSearchSchema = z.object({
  order_id: z.string().optional(),
  status_code: z.string().optional(),
  transaction_status: z.string().optional(),
})

export const Route = createFileRoute('/cart')({
  validateSearch: (search) => cartSearchSchema.parse(search),
  component: CartPage,
})
