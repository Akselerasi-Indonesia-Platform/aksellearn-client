import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ExternalLink, 
  FileText, 
  Package, 
  ShoppingBag,
  ArrowLeft,
  Copy
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { userOrderService } from '@/services/user/order.service'
import { formatCurrency } from '@/lib/utils'
import { useMidtrans } from '@/hooks/use-midtrans'
import { extractPaymentDetails } from '@/lib/payment-helper'
import { toast } from 'sonner'

export const Route = createFileRoute('/student/order/$uuid')({
  component: OrderDetailsPage,
})

function OrderDetailsPage() {
  const { uuid } = Route.useParams()
  const { snapPay, isReady: isSnapReady } = useMidtrans()
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['user', 'orders', uuid],
    queryFn: () => userOrderService.getOne(uuid),
  })

  // Load cached payment_init from localStorage on the client side
  const cachedPaymentInit = useQuery({
    queryKey: ['user', 'orders', 'cached-payment-init', uuid],
    queryFn: () => {
      if (typeof window === 'undefined') return null
      const val = localStorage.getItem(`payment_init_${uuid}`)
      if (!val) return null
      try {
        return JSON.parse(val)
      } catch {
        return null
      }
    },
    staleTime: Infinity,
  }).data

  // Combine cached payment init response and order metadata
  const paymentDetails = useQuery({
    queryKey: ['user', 'orders', 'payment-details', uuid, order?.status, cachedPaymentInit],
    queryFn: () => {
      if (!order) return null
      // Try cached first, then order metadata/itself
      return extractPaymentDetails(cachedPaymentInit) || extractPaymentDetails(order)
    },
    enabled: !!order,
  }).data

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
          <Package className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
        <p className="text-slate-500 mt-2 mb-8">We couldn't find the order you're looking for.</p>
        <Button asChild>
          <Link to="/student/order">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Payment Successful',
          icon: <CheckCircle2 className="size-5 text-emerald-500" />,
          badgeClass: 'bg-emerald-500 hover:bg-emerald-600',
          containerClass: 'bg-emerald-50 border-emerald-100',
          textClass: 'text-emerald-900',
        }
      case 'completed':
        return {
          label: 'Completed',
          icon: <CheckCircle2 className="size-5 text-emerald-500" />,
          badgeClass: 'bg-emerald-500 hover:bg-emerald-600',
          containerClass: 'bg-emerald-50 border-emerald-100',
          textClass: 'text-emerald-900',
        }
      case 'pending':
        return {
          label: 'Awaiting Payment',
          icon: <Clock className="size-5 text-amber-500" />,
          badgeClass: 'bg-amber-500 hover:bg-amber-600',
          containerClass: 'bg-amber-50 border-amber-100',
          textClass: 'text-amber-900',
        }
      default:
        return {
          label: status.toUpperCase(),
          icon: <Package className="size-5 text-slate-500" />,
          badgeClass: 'bg-slate-500 hover:bg-slate-600',
          containerClass: 'bg-slate-50 border-slate-100',
          textClass: 'text-slate-900',
        }
    }
  }

  const statusConfig = getStatusConfig(order.status)

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-lg font-semibold gap-2 text-slate-500 hover:text-slate-900 -ml-2 group"
            >
              <Link to="/student/order">
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to History
              </Link>
            </Button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Order Details
            </h1>
            <p className="text-slate-500 font-medium">
              ID: <span className="text-slate-900 font-bold">{order.uuid}</span>
            </p>
          </div>
          <Badge className={`${statusConfig.badgeClass} px-4 py-1.5 rounded-full text-sm font-bold border-none shadow-lg shadow-primary/10`}>
            {order.status.toUpperCase()}
          </Badge>
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl p-6 border ${statusConfig.containerClass} flex items-start gap-4`}>
          <div className="size-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
            {statusConfig.icon}
          </div>
          <div className="space-y-1">
            <h3 className={`font-bold ${statusConfig.textClass}`}>
              {statusConfig.label}
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {order.status === 'pending' 
                ? "Please complete your payment to unlock your course access instantly." 
                : "Your payment has been processed. You can now start learning!"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Details & Items */}
          <div className="lg:col-span-8 space-y-8">
            {order.status === 'pending' && paymentDetails && (
              <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="size-5 text-indigo-600" /> Payment Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  {paymentDetails.type === 'va' && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Virtual Account</p>
                        <h4 className="font-extrabold text-slate-800 text-lg">{paymentDetails.bankName} Virtual Account</h4>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 w-full sm:w-auto">
                        <span className="font-mono font-black text-slate-900 tracking-wider text-base select-all">{paymentDetails.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (paymentDetails.accountNumber) {
                              navigator.clipboard.writeText(paymentDetails.accountNumber)
                              toast.success('Account number copied to clipboard!')
                            }
                          }}
                          className="size-8 p-0 shrink-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {paymentDetails.type === 'bill' && (
                    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biller Code</p>
                          <h4 className="font-bold text-slate-800">Mandiri Biller Code</h4>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-mono font-bold text-slate-900 text-sm">{paymentDetails.billerCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (paymentDetails.billerCode) {
                                navigator.clipboard.writeText(paymentDetails.billerCode)
                                toast.success('Biller code copied!')
                              }
                            }}
                            className="size-7 p-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill Key (VA)</p>
                          <h4 className="font-bold text-slate-800">Mandiri Bill Key</h4>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-mono font-bold text-slate-900 text-sm">{paymentDetails.billKey}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (paymentDetails.billKey) {
                                navigator.clipboard.writeText(paymentDetails.billKey)
                                toast.success('Bill key copied!')
                              }
                            }}
                            className="size-7 p-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentDetails.type === 'cstore' && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Convenience Store</p>
                        <h4 className="font-extrabold text-slate-800 text-lg">{paymentDetails.storeName} Payment Code</h4>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 w-full sm:w-auto">
                        <span className="font-mono font-black text-slate-900 tracking-wider text-base select-all">{paymentDetails.paymentCode}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (paymentDetails.paymentCode) {
                              navigator.clipboard.writeText(paymentDetails.paymentCode)
                              toast.success('Payment code copied!')
                            }
                          }}
                          className="size-8 p-0 shrink-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {paymentDetails.type === 'qris' && (
                    <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 gap-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Scan QRIS to Pay</p>
                      {paymentDetails.qrUrl ? (
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                          <img src={paymentDetails.qrUrl} alt="QRIS Code" className="size-48 object-contain" />
                        </div>
                      ) : (
                        <Button asChild variant="commerce" className="rounded-xl">
                          <a href={paymentDetails.deeplinkUrl || '#'} target="_blank" rel="noopener noreferrer">
                            Pay with E-Wallet
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {paymentDetails.type === 'redirect' && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Redirect Payment</p>
                        <h4 className="font-extrabold text-slate-800 text-lg">Secure Gateway Redirection</h4>
                      </div>
                      {paymentDetails.paymentUrl && (
                        <Button asChild variant="commerce" className="rounded-xl shrink-0">
                          <a href={paymentDetails.paymentUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                            Go to Payment <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">How to Pay</h5>
                    <ul className="space-y-3">
                      {(paymentDetails.instructions || []).map((instruction, idx) => (
                        <li key={idx} className="text-sm font-medium text-slate-600 flex items-start gap-3">
                          <span className="size-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="leading-relaxed">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-bold">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="divide-y divide-slate-100">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                        <FileText className="size-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{item.title_snapshot}</h4>
                        <p className="text-sm text-slate-500 font-medium">Single Course License</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">{formatCurrency(item.price_at_purchase)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info & Action */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Info</h4>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock className="size-4" />
                      <span className="text-sm font-medium">{format(new Date(order.created_at), 'PPP p')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <CreditCard className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-0.5">Payment Method</p>
                      <h4 className="font-bold text-primary">{order.payment_method || 'Payment Gateway'}</h4>
                    </div>
                  </div>
                </div>

                {order.status === 'pending' && (!paymentDetails || paymentDetails.type === 'redirect' || paymentDetails.type === 'other') && (
                  <Button 
                    onClick={() => {
                      const payUrl = order.payment_url || paymentDetails?.paymentUrl
                      if (payUrl) {
                        window.open(payUrl, '_blank')
                      } else if (order.snap_token) {
                        snapPay(order.snap_token)
                      } else {
                        toast.error('Payment gateway link not available.')
                      }
                    }}
                    disabled={!(order.payment_url || paymentDetails?.paymentUrl) && (!isSnapReady || !order.snap_token)}
                    variant="commerce"
                    size="xl"
                    className="w-full rounded-2xl gap-2"
                  >
                    Pay Now <ExternalLink className="size-4" />
                  </Button>
                )}

                {order.status === 'paid' && (
                  <Button 
                    asChild
                    variant="card-enroll"
                    size="xl"
                    className="w-full rounded-2xl gap-2 font-bold shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all uppercase tracking-wider"
                  >
                    <Link to="/student/dashboard">
                      Go to Dashboard <CheckCircle2 className="size-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-4">
              <div className="flex gap-3">
                <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Need Help?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    If you encounter any issues with your payment, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
