import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ExternalLink,
  Package,
  Search,
  ShoppingBag,
} from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { userOrderService } from '@/services/user/order.service'
import { formatCurrency, cn } from '@/lib/utils'
import { z } from 'zod'
import { toast } from 'sonner'

const orderSearchSchema = z.object({
  order_id: z.string().optional(),
  status_code: z.string().optional(),
  transaction_status: z.string().optional(),
})

export const Route = createFileRoute('/student/order/')({
  validateSearch: (search) => orderSearchSchema.parse(search),
  component: StudentOrderHistory,
})

function StudentOrderHistory() {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const queryClient = useQueryClient()
  const { order_id } = Route.useSearch()

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'orders'],
    queryFn: () => userOrderService.getAll(),
  })

  React.useEffect(() => {
    if (order_id) {
      // 🛡️ [Midtrans Redirect]
      // When user returns from Midtrans, we invalidate the orders query 
      // to ensure they see the 'Paid' status updated by the webhook.
      queryClient.invalidateQueries({ queryKey: ['user', 'orders'] })
      
      toast.success("Payment processed! Your course access is being unlocked.", {
        description: `Order ID: ${order_id}`,
        duration: 5000,
      })

      // Clean up URL parameters to prevent repeated invalidations/toasts on refresh
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('order_id')
        url.searchParams.delete('status_code')
        url.searchParams.delete('transaction_status')
        window.history.replaceState({}, '', url.pathname)
      }
    }
  }, [order_id, queryClient])

  const orders = data?.data || []

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order?.uuid?.toLowerCase().includes(search.toLowerCase()) ||
      (order.items || []).some((item) =>
        item?.title_snapshot?.toLowerCase().includes(search.toLowerCase()),
      )
    const matchesStatus =
      statusFilter === 'all' || order?.status?.toLowerCase() === statusFilter
      
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm shadow-emerald-500/20">
            {status === 'completed' ? 'Completed' : 'Success'}
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-200 bg-amber-50"
          >
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="text-indigo-500 border-indigo-200 bg-indigo-50"
          >
            Processing
          </Badge>
        )
      case 'failed':
      case 'expired':
      case 'cancelled':
      case 'refunded':
        return (
          <Badge variant="destructive" className="bg-rose-500 capitalize">
            {status}
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Purchase History
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Manage your subscriptions and course receipts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            {['all', 'paid', 'completed', 'pending', 'processing', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300',
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50',
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative group grayscale focus-within:grayscale-0 transition-all">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-500" />
            <Input
              placeholder="Search orders..."
              className="pl-10 h-10 w-full sm:w-64 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))
        ) : filteredOrders.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-slate-200 bg-slate-50/50 p-20 text-center space-y-6">
            <div className="size-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto">
              <ShoppingBag className="size-10" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                No orders found
              </p>
              <p className="text-sm text-slate-400 font-medium">
                Your purchase history is empty.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl font-bold border-slate-200"
            >
              Browse Courses
            </Button>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.uuid}
              className="rounded-2xl border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all group"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="size-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <Package className="size-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      Order #{order.uuid.split('-')[0].toUpperCase()}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {format(new Date(order.created_at), 'PPP')} •{' '}
                    {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                    Total
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {formatCurrency(
                      order.total_amount || (order as any).total,
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                  {order.status === 'pending' && order.payment_url && (
                    <Button
                      onClick={() => {
                        window.open(order.payment_url!, '_blank')
                      }}
                      variant="card-enroll"
                      size="sm"
                      className="w-full sm:w-auto gap-2"
                    >
                      Pay Now <ExternalLink className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Link to="/student/order/$uuid" params={{ uuid: order.uuid }}>
                      Details
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  )
}
