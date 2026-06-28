import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminOrderService } from '@/services/admin/order.service'
import { adminFinanceService } from '@/services/admin/finance.service'
import { useAuthStore } from '@/hooks/use-auth'
import { can } from '@/lib/auth'
import {
  ArrowLeft,
  CreditCard,
  RefreshCcw,
  XCircle,
  Undo2,
  Package,
  Activity,
  ReceiptText,
  User,
  Banknote,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Skeleton } from '@/components/ui/skeleton'
import { formatIDR } from '@/lib/currency'
import { RefundModal } from '@/components/admin/revenue/refund-modal'
import { CancelOrderModal } from '@/components/admin/revenue/cancel-order-modal'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'

export const Route = createFileRoute('/admin/order/$uuid')({
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { uuid } = Route.useParams()
  const queryClient = useQueryClient()

  const [isRefundOpen, setIsRefundOpen] = React.useState(false)
  const [isCancelOpen, setIsCancelOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const isSuperAdmin = user?.permissions?.includes('super.admin') || user?.roles?.includes('Super Admin')
  const canViewPlatformFinance = can('platform_finance.read', user) || isSuperAdmin

  const showAdminActions = React.useMemo(() => {
    if (!user) return false
    const isSuperAdminOrAdmin = user.roles?.some((role: any) => {
      const name = typeof role === 'string' ? role : role.name
      return name === 'Super Admin' || name === 'Admin'
    })
    const hasRefundPermission = can('order.refund', user)
    return !!(isSuperAdminOrAdmin || hasRefundPermission)
  }, [user])

  const { data: order, isLoading, error, isError } = useQuery<any, any>({
    queryKey: ['admin', 'order', uuid],
    queryFn: () => adminOrderService.getOne(uuid),
    retry: (failureCount, error) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false
      return failureCount < 2
    }
  })

  const { data: feeConfig } = useQuery({
    queryKey: ['admin', 'finance', 'fee-config'],
    queryFn: async () => {
      try {
        const res = await adminFinanceService.getPlatformFeeConfigs({ limit: 10, applies_to: 'all' })
        const activeConfig = res.data?.find((c: any) => c.is_active && c.applies_to === 'all')
        return {
          platform_fee_percentage: activeConfig ? activeConfig.fee_pct : 10
        }
      } catch {
        return { platform_fee_percentage: 10 }
      }
    },
  })

  // Fetch payouts to match order items
  const { data: payoutsData } = useQuery({
    queryKey: ['admin', 'order-payouts', uuid],
    queryFn: () => adminFinanceService.getAdminPayouts({ limit: 100 }),
    enabled: !!order && isSuperAdmin,
  })

  const matchedPayouts = React.useMemo(() => {
    if (!order || !payoutsData?.data) return []
    const itemIds = order.items?.map((item: any) => item.id) || []
    return (payoutsData.data as any[]).filter((p: any) => itemIds.includes(p.order_item_id))
  }, [order, payoutsData])

  const feePct = feeConfig?.platform_fee_percentage ?? 10
  const grossSubtotal = order?.subtotal_amount || 0
  const gatewayFee = order?.fee_amount || 0
  const baseAmt = Math.max(0, grossSubtotal - gatewayFee)
  const estPlatformFee = Math.round(baseAmt * (feePct / 100))
  const estInstructorEarnings = Math.max(0, grossSubtotal - gatewayFee - estPlatformFee)

  const hasActualPayout = matchedPayouts.length > 0
  const actualGross = hasActualPayout ? matchedPayouts.reduce((sum, p) => sum + p.sale_amount, 0) : grossSubtotal
  const actualGateway = hasActualPayout ? matchedPayouts.reduce((sum, p) => sum + p.gateway_fee, 0) : gatewayFee
  const actualPlatformFee = hasActualPayout ? matchedPayouts.reduce((sum, p) => sum + p.platform_fee, 0) : estPlatformFee
  const actualNetShare = hasActualPayout ? matchedPayouts.reduce((sum, p) => sum + p.net_amount, 0) : estInstructorEarnings
  const actualFeePct = hasActualPayout ? matchedPayouts[0].platform_fee_pct : feePct

  const derivedFlatFee = React.useMemo(() => {
    if (!hasActualPayout) return 0
    return matchedPayouts.reduce((sum, p) => {
      const baseAmt = Math.max(0, p.sale_amount - p.gateway_fee)
      const pctPart = Math.round(baseAmt * (p.platform_fee_pct / 100))
      const flat = Math.max(0, p.platform_fee - pctPart)
      return sum + flat
    }, 0)
  }, [matchedPayouts, hasActualPayout])

  const refreshMutation = useMutation({
    mutationFn: (id: string) => adminOrderService.refresh(id),
    onSuccess: () => {
      toast.success('Order payment status synchronized with gateway')
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', uuid] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: () => toast.error('Failed to sync status'),
  })

  const confirmDelete = async () => {
    try {
      await adminOrderService.delete(uuid)
      toast.success('Order deleted successfully')
      setIsDeleteDialogOpen(false)
      navigate({ to: '/admin/order' })
    } catch (error) {
      toast.error('Failed to delete order')
    }
  }

  if (isLoading) {
    return (
      <AdminPage>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </AdminPage>
    )
  }

  if (isError) {
    const isForbidden = error?.response?.status === 403 || error?.message?.includes('403')
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <AlertCircle className="size-12 text-rose-500" />
          <h3 className="text-xl font-bold">{isForbidden ? 'Access Denied' : 'Error Loading Order'}</h3>
          <p className="text-muted-foreground max-w-md">
            {isForbidden
              ? 'You do not have permission to view this order. Instructors are only authorized to view orders that contain their own courses.'
              : error?.response?.data?.message || error?.message || 'An unexpected error occurred while fetching order details.'}
          </p>
          <Button asChild variant="outline" className="rounded-xl mt-4">
            <Link to="/admin/order">Back to Orders</Link>
          </Button>
        </div>
      </AdminPage>
    )
  }

  if (!order) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <AlertCircle className="size-12 text-slate-300" />
          <h3 className="text-xl font-bold">Order Not Found</h3>
          <p className="text-muted-foreground">This order may have been deleted or does not exist.</p>
          <Button asChild variant="outline" className="rounded-xl mt-4">
            <Link to="/admin/order">Back to Orders</Link>
          </Button>
        </div>
      </AdminPage>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      cancelled: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
      refunded: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    }
    return (
      <Badge variant="outline" className={`capitalize font-bold px-3 py-1 text-xs rounded-lg ${styles[status] || styles.pending}`}>
        {status}
      </Badge>
    )
  }

  const getActionIcon = (action: string) => {
    if (action.includes('success') || action.includes('paid')) return <CheckCircle2 className="size-4 text-emerald-500" />
    if (action.includes('cancel') || action.includes('fail')) return <XCircle className="size-4 text-red-500" />
    if (action.includes('refund')) return <Undo2 className="size-4 text-purple-500" />
    return <Activity className="size-4 text-blue-500" />
  }

  return (
    <AdminPage>
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl h-11 w-11 shrink-0">
            <Link to="/admin/order">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
              {getStatusBadge(order.payment_status || 'pending')}
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2">
              <ReceiptText className="size-3.5" />
              {order.uuid}
            </p>
          </div>
        </div>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Customer & Payment Summary */}
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="size-5 text-primary" /> Customer & Payment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Customer</p>
                  <p className="font-semibold">{order.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">{order.user?.email || 'No email provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-slate-400" />
                    <span className="font-semibold uppercase">{order.payment_method || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Created At</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-sm">
                      {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, HH:mm') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatIDR(order.subtotal_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatIDR(order.tax_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fees</span>
                  <span className="font-medium">{formatIDR(order.fee_amount || 0)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Total Amount</span>
                  <span className="text-xl font-bold text-primary tabular-nums tracking-tight">
                    {formatIDR(order.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Order Items List */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Package className="size-5 text-primary" /> Order Items ({order.items?.length || 0})
              </h3>
            </div>
            <div className="divide-y">
              {order.items?.length > 0 ? (
                order.items.map((item: any, idx: number) => (
                  <div key={item.uuid || item.id || idx} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-base">{item.title_snapshot}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <ReceiptText className="size-3" /> {item.uuid ? item.uuid.split('-')[0] : 'N/A'}
                          </span>
                          <span>Qty: {item.quantity || 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Price</p>
                          <p className="font-bold tabular-nums">{formatIDR(item.price_at_purchase || 0)}</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Status</p>
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {item.fulfillment_status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {item.earning && (
                      <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Price</span>
                            <span className="font-semibold text-slate-700">{formatIDR(item.price_at_purchase || 0)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Gateway Fee Cut</span>
                            <span className="font-semibold text-rose-600">- {formatIDR(item.earning.gateway_fee || 0)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Platform Fee Cut</span>
                            <span className="font-semibold text-rose-600">- {formatIDR(item.earning.platform_fee || 0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black uppercase tracking-wider leading-none">Net Earnings</span>
                            <span className="text-sm font-extrabold tabular-nums mt-0.5 leading-none">
                              {formatIDR(item.earning.net_amount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">No items found for this order.</div>
              )}
            </div>
          </div>
        </div>

        {/* Section C: Activity Timeline */}
        <div className="space-y-6">
          {/* Revenue Split Card */}
          {canViewPlatformFinance && (
            <div className="bg-card rounded-2xl border shadow-sm p-6 bg-gradient-to-br from-indigo-50/50 to-transparent">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-slate-800">
                <span className="flex items-center gap-2">
                  <Banknote className="size-5 text-[#2AABAA]" /> Revenue Split
                </span>
                <Badge variant={hasActualPayout ? "default" : "secondary"} className="text-[9px] font-bold">
                  {hasActualPayout ? "Settled Record" : "Awaiting Settlement (Estimate)"}
                </Badge>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Gross Price</span>
                  <span className="font-bold text-slate-700">{formatIDR(actualGross)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Gateway Fee</span>
                  <span className="font-bold text-slate-700">- {formatIDR(actualGateway)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-rose-500">
                  <span>Platform Commission ({actualFeePct}%)</span>
                  <span>- {formatIDR(actualPlatformFee - derivedFlatFee)}</span>
                </div>
                {derivedFlatFee > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-rose-500">
                    <span>Platform Flat Fee Override</span>
                    <span>- {formatIDR(derivedFlatFee)}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/60">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instructor Net Share</span>
                    <span className="text-emerald-600 font-black text-lg leading-none truncate">{formatIDR(actualNetShare)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center bg-blue-50/30">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Platform Earning</span>
                    <span className="text-blue-600 font-black text-lg leading-none truncate">{formatIDR(actualPlatformFee)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Activity Timeline
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {order.activities && order.activities.length > 0 ? (
                order.activities.map((activity: any, idx: number) => (
                  <div key={activity.uuid || idx} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-6 h-6 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-sm z-10">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="ml-10 space-y-1">
                      <p className="text-xs font-mono text-slate-400">
                        {format(new Date(activity.created_at), 'MMM dd, HH:mm:ss')}
                      </p>
                      <p className="text-sm font-bold capitalize">{activity.action.replace(/_/g, ' ')}</p>
                      {activity.description && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAdminActions && (
        <>
          <RefundModal
            uuid={uuid}
            open={isRefundOpen}
            onOpenChange={setIsRefundOpen}
          />
          <CancelOrderModal
            uuid={uuid}
            open={isCancelOpen}
            onOpenChange={setIsCancelOpen}
          />
        </>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </AdminPage>
  )
}
