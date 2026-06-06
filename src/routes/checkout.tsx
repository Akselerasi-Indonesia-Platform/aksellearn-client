import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { PublicLayout } from '@/components/public/layout/main-layout'
import { userPaymentService } from '@/services/user/payment.service'
import { useMidtrans } from '@/hooks/use-midtrans'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUser } from '@/lib/auth'
import { useAuthStore } from '@/hooks/use-auth'
import { MailWarning, Mail, Loader2 } from 'lucide-react'
import { authService } from '@/services/auth.service'

// Atomic Components
import { CheckoutItem } from '@/components/public/checkout/checkout-item'
import { CheckoutSummary } from '@/components/public/checkout/checkout-summary'
import { PaymentSelector } from '@/components/public/checkout/payment-selector'

function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const needsEmailVerification = !!user && !user.email_verified_at
  const { cart, isLoading: isCartLoading, removeFromCart } = useCart()
  const { isReady: isSnapReady } = useMidtrans()
  const [selectedMethod, setSelectedMethod] = React.useState<string | number | null>(
    null,
  )
  const [customerNote, setCustomerNote] = React.useState('')
  const [isResending, setIsResending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      setIsResending(true)
      await authService.resendVerification()
      toast.success('Verification email sent!')
      setCooldown(120)
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('Please wait before requesting another email.')
        setCooldown(120)
      } else {
        toast.error(err.response?.data?.message || 'Failed to resend verification email.')
      }
    } finally {
      setIsResending(false)
    }
  }

  // Fetch Payment Methods
  const { data: paymentData, isLoading: isMethodsLoading } = useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: () => userPaymentService.getMethods(),
  })

  const methods = paymentData?.data || []

  // Auto-select first method
  React.useEffect(() => {
    if (methods.length > 0 && !selectedMethod) {
      setSelectedMethod(methods[0].id)
    }
  }, [methods, selectedMethod])

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: () => {
      // Robust UUID v4 generator fallback
      const generateKey = () => {
        if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
          return window.crypto.randomUUID()
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      }

      const idempotencyKey = generateKey()

      const activeCoupon = typeof window !== 'undefined' ? localStorage.getItem('active_coupon') || '' : ''

      return userPaymentService.checkout(
        {
          payment_method_id: selectedMethod || 1,
          coupon_code: activeCoupon,
          customer_note: customerNote,
        },
        idempotencyKey,
      )
    },
    onSuccess: (res) => {
      // 🚀 [Redirect to Order Details]
      if (typeof window !== 'undefined' && res.payment_init) {
        localStorage.setItem(`payment_init_${res.order.uuid}`, JSON.stringify(res.payment_init))
      }

      navigate({ 
        to: '/student/order/$uuid', 
        params: { uuid: res.order.uuid } 
      })

      // If it's a redirect-style payment, we can also trigger it, 
      // but the order page is the "Source of Truth" now.
      if (res.payment_init?.payment_url && !res.payment_init?.reference_id) {
         window.open(res.payment_init.payment_url, '_blank')
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || ''
      
      if (msg.includes('empty cart')) {
        toast.error("Your session expired or cart is empty. Let's find some courses!")
        navigate({ to: '/search' })
        return
      }

      toast.error(msg || 'Checkout failed. Please try again.')
    },
  })

  if (isCartLoading || isMethodsLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32 text-center space-y-6">
          <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
            <ShoppingBag className="size-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            It looks like you haven't added any courses to your cart yet. Explore our catalog to find your next learning journey.
          </p>
          <Button
            onClick={() => navigate({ to: '/search' })}
            className="rounded-xl h-12 px-8 font-bold"
          >
            Explore Courses
          </Button>
        </div>
      </PublicLayout>
    )
  }

  // --------------------- EMAIL VERIFICATION BLOCKER --------------------- //
  if (needsEmailVerification) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32 text-center space-y-6 max-w-lg">
          <div className="size-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <MailWarning className="size-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Verify Your Email First</h2>
          <p className="text-slate-500 leading-relaxed">
            You need to verify your email address before you can complete a purchase.
            Check your inbox for the verification link we sent when you registered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleResend} disabled={isResending || cooldown > 0} className="rounded-xl h-12 px-8">
              {isResending ? <Loader2 className="animate-spin size-4 mr-2" /> : <Mail className="size-4 mr-2" />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="rounded-xl h-12 px-8">
              Back to Home
            </Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="bg-[#fcfdfe] min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/cart' })}
                  className="rounded-lg font-semibold gap-2 text-slate-500 hover:text-slate-900 -ml-2 group"
                >
                  <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Cart
                </Button>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Checkout
                </h1>
                {user && (
                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    Checking out as <span className="text-[#0D3A6E] font-extrabold">{user.name}</span> ({user.email})
                  </p>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Details */}
              <div className="lg:col-span-8 space-y-12">
                {/* 1. Review Items */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Order Summary
                    </h2>
                    <span className="text-sm font-medium text-slate-500">
                      {cart.total_items} {cart.total_items === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-1 sm:p-2 divide-y divide-slate-100">
                      {cart.items?.map((item) => (
                        <CheckoutItem
                          key={item.id}
                          item={item}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* 2. Select Payment Method */}
                <section className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Select Payment Method
                  </h2>
                  <PaymentSelector
                    methods={methods}
                    selectedId={selectedMethod}
                    onSelect={(id) => setSelectedMethod(id)}
                  />
                </section>

                {/* 3. Customer Notes */}
                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">
                      Order Notes (Optional)
                    </h2>
                    <span className={`text-xs font-bold ${customerNote.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {customerNote.length}/500
                    </span>
                  </div>
                  <textarea
                    placeholder="Enter any special requests, instructions, or notes for this order..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value.slice(0, 500))}
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white font-medium text-slate-700 text-sm shadow-sm transition-all resize-none"
                  />
                </section>

                {/* Secure Payment Notice */}
                <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-4">
                    <div className="size-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <ShieldCheck className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900">Secure Payment Gateway</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Your transaction is protected with military-grade encryption. You can choose your preferred payment method (Credit Card, GoPay, Bank Transfer) in the next step via our secure payment popup.
                        </p>
                    </div>
                </section>
              </div>

              {/* Right Column: Summary Sidebar */}
              <div className="lg:col-span-4 sticky top-32">
                <CheckoutSummary
                  cart={cart}
                  isPending={checkoutMutation.isPending}
                  isSnapReady={isSnapReady}
                  canCheckout={!needsEmailVerification}
                  selectedMethodName={methods.find(m => m.id === selectedMethod)?.name}
                  onCheckout={() => checkoutMutation.mutate()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})
