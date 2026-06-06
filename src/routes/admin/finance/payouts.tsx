import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  User,
  Calendar,
  CreditCard,
  Check,
  Send,
  Loader2,
  FileText,
} from 'lucide-react'
import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getUser, isAdmin } from '@/lib/auth'
import { adminFinanceService } from '@/services/admin/finance.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export const Route = createFileRoute('/admin/finance/payouts')({
  beforeLoad: () => {
    const user = getUser()
    const isSuperAdminOrAdmin = user?.roles?.some((role: any) => {
      const name = typeof role === 'string' ? role : role.name
      return name === 'Super Admin' || name === 'Admin'
    })
    if (!isSuperAdminOrAdmin) {
      throw redirect({
        to: '/not-found' as any,
        replace: true,
      })
    }
  },
  component: AdminPayoutsPage,
})

function AdminPayoutsPage() {
  const queryClient = useQueryClient()
  const [activeStatusTab, setActiveStatusTab] = React.useState<'pending' | 'approved' | 'paid'>('pending')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(20)

  // Modals state
  const [processingPayout, setProcessingPayout] = React.useState<any | null>(null)
  const [paymentReference, setPaymentReference] = React.useState('')

  // 1. Fetch Payouts for the currently active status tab
  const { data: payoutsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'finance', 'payouts', activeStatusTab, page, limit],
    queryFn: () =>
      adminFinanceService.getAdminPayouts({
        page,
        limit,
        status: activeStatusTab,
      }),
  })

  // 2. Fetch stats for card displays (we fetch all pending/approved/paid counts or volumes)
  const { data: allPendingData } = useQuery({
    queryKey: ['admin', 'finance', 'payouts', 'pending-stats'],
    queryFn: () => adminFinanceService.getAdminPayouts({ status: 'pending', limit: 100 }),
  })

  const { data: allApprovedData } = useQuery({
    queryKey: ['admin', 'finance', 'payouts', 'approved-stats'],
    queryFn: () => adminFinanceService.getAdminPayouts({ status: 'approved', limit: 100 }),
  })

  const { data: allPaidData } = useQuery({
    queryKey: ['admin', 'finance', 'payouts', 'paid-stats'],
    queryFn: () => adminFinanceService.getAdminPayouts({ status: 'paid', limit: 100 }),
  })

  const payouts = payoutsData?.data || []
  const meta = payoutsData?.meta || { total: 0 }

  // 3. Mutations
  const approveMutation = useMutation({
    mutationFn: (uuid: string) => adminFinanceService.approveAdminPayout(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      toast.success('Payout request approved successfully!')
    },
    onError: (err: any) => {
      toast.error(`Approval failed: ${err.response?.data?.message || err.message}`)
    },
  })

  const payMutation = useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes: string }) =>
      adminFinanceService.payAdminPayout(uuid, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      toast.success('Payout marked as paid!')
      setProcessingPayout(null)
      setPaymentReference('')
    },
    onError: (err: any) => {
      toast.error(`Payment submission failed: ${err.response?.data?.message || err.message}`)
    },
  })

  // Extract Course Name helper from Notes
  const getCourseNameFromNotes = (notes: string) => {
    if (!notes) return 'Standard Course Purchase'
    const match = notes.match(/\(Course:\s*([^)]+)\)/i)
    return match ? match[1] : notes
  };

  // Stats Calculations
  const stats = React.useMemo(() => {
    const pendingList = allPendingData?.data || []
    const approvedList = allApprovedData?.data || []
    const paidList = allPaidData?.data || []

    return {
      pendingCount: pendingList.length,
      pendingTotal: pendingList.reduce((sum: number, p: any) => sum + p.net_amount, 0),
      approvedCount: approvedList.length,
      approvedTotal: approvedList.reduce((sum: number, p: any) => sum + p.net_amount, 0),
      paidCount: paidList.length,
      paidTotal: paidList.reduce((sum: number, p: any) => sum + p.net_amount, 0),
    }
  }, [allPendingData, allApprovedData, allPaidData])

  // Filter list locally for search search query
  const filteredPayouts = React.useMemo(() => {
    if (!searchQuery.trim()) return payouts
    const q = searchQuery.toLowerCase()
    return payouts.filter((p: any) => {
      const instructorName = p.instructor?.name || ''
      const instructorEmail = p.instructor?.email || ''
      const notes = p.notes || ''
      return (
        instructorName.toLowerCase().includes(q) ||
        instructorEmail.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q)
      )
    })
  }, [payouts, searchQuery])

  return (
    <AdminPage className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Instructor Payouts</h1>
        <p className="text-muted-foreground">
          Track and process instructor share payouts. Approve accrued amounts and register payment logs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="rounded-[24px] border-slate-100 shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Verification
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {stats.pendingCount} Claims
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                VOLUME: {formatCurrency(stats.pendingTotal)}
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Approved (Awaiting Payment)
              </span>
              <h3 className="text-2xl font-black text-blue-600">
                {stats.approvedCount} Claims
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                VOLUME: {formatCurrency(stats.approvedTotal)}
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <CreditCard className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Disbursed / Paid
              </span>
              <h3 className="text-2xl font-black text-emerald-600">
                {formatCurrency(stats.paidTotal)}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                LIFETIME SETTLED INSTRUCTORS
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Area */}
      <Tabs
        value={activeStatusTab}
        onValueChange={(val: any) => {
          setActiveStatusTab(val)
          setPage(1)
        }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
            <TabsTrigger
              value="pending"
              className="rounded-lg font-bold text-slate-600 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Pending Payouts
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="rounded-lg font-bold text-slate-600 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Approved Claims
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="rounded-lg font-bold text-slate-600 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Paid / Disbursed
            </TabsTrigger>
          </TabsList>

          {/* Search bar */}
          <div className="relative w-64">
            <Input
              placeholder="Search instructor or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs font-medium border-slate-200"
            />
            <Search className="absolute left-3 inset-y-0 my-auto size-4 text-slate-400" />
          </div>
        </div>

        {/* Tab contents */}
        <TabsContent value={activeStatusTab} className="space-y-4 m-0">
          <Card className="rounded-[30px] border-primary/10 shadow-xl overflow-hidden bg-white">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2AABAA]" />
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                    Loading payout ledger...
                  </p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
                  <AlertCircle className="h-10 w-10 text-rose-500" />
                  <p className="text-sm font-bold text-slate-800">
                    Failed to retrieve payout data.
                  </p>
                  <Button onClick={() => refetch()} variant="outline" className="mt-2">
                    Retry Connection
                  </Button>
                </div>
              ) : filteredPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
                  <Clock className="h-12 w-12 text-slate-300" />
                  <p className="text-sm font-bold text-slate-800">
                    No payout records found.
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    No transactions are currently under {activeStatusTab} status.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-6">Instructor</th>
                        <th className="p-6">Course Item</th>
                        <th className="p-6 text-right">Sale Price</th>
                        <th className="p-6 text-right">Deductions</th>
                        <th className="p-6 text-right text-emerald-600">Net payout</th>
                        <th className="p-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {filteredPayouts.map((payout: any) => (
                        <tr key={payout.uuid} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-[#2AABAA]/10 flex items-center justify-center text-[#0E7A6A] font-bold">
                                <User className="size-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">
                                  {payout.instructor?.name || 'Unknown Creator'}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {payout.instructor?.email || '-'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 max-w-xs">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 truncate" title={getCourseNameFromNotes(payout.notes)}>
                                {getCourseNameFromNotes(payout.notes)}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="size-3" />
                                {format(new Date(payout.created_at), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                          </td>
                          <td className="p-6 text-right font-semibold text-slate-900">
                            {formatCurrency(payout.sale_amount)}
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex flex-col items-end text-rose-500 text-xs">
                              <span>Gateway: -{formatCurrency(payout.gateway_fee)}</span>
                              <span>Platform ({payout.platform_fee_pct}%): -{formatCurrency(payout.platform_fee)}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right font-black text-emerald-600 text-base">
                            {formatCurrency(payout.net_amount)}
                          </td>
                          <td className="p-6 text-center">
                            {activeStatusTab === 'pending' && (
                              <Button
                                onClick={() => approveMutation.mutate(payout.uuid)}
                                disabled={approveMutation.isPending}
                                className="bg-[#2AABAA] hover:bg-[#208A89] text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1 mx-auto shadow"
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                                Approve Claim
                              </Button>
                            )}
                            {activeStatusTab === 'approved' && (
                              <Button
                                onClick={() => {
                                  setProcessingPayout(payout)
                                  setPaymentReference('')
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1 mx-auto shadow"
                              >
                                <Send className="size-3.5" />
                                Process Payment
                              </Button>
                            )}
                            {activeStatusTab === 'paid' && (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="size-3" /> Paid
                                </span>
                                {payout.notes && (
                                  <span className="text-[10px] text-slate-400 font-semibold mt-1 max-w-[150px] truncate" title={payout.notes}>
                                    Ref: {payout.notes}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payment Reference Modal */}
      <Dialog open={!!processingPayout} onOpenChange={(open) => !open && setProcessingPayout(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Submit Payout Disbursment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              Please enter bank transaction logs or reference receipt codes. The instructor will see this verification.
            </DialogDescription>
          </DialogHeader>

          {processingPayout && (
            <div className="space-y-4 my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                <div className="text-slate-400">Instructor:</div>
                <div className="text-slate-900 text-right font-bold">{processingPayout.instructor?.name}</div>
                <div className="text-slate-400">Net payout share:</div>
                <div className="text-slate-900 text-right font-black text-emerald-600">
                  {formatCurrency(processingPayout.net_amount)}
                </div>
                <div className="text-slate-400">Course Target:</div>
                <div className="text-slate-900 text-right truncate max-w-[200px]">
                  {getCourseNameFromNotes(processingPayout.notes)}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="size-3.5 text-slate-400" /> Payment Receipt / References
            </label>
            <Textarea
              placeholder="e.g. BCA Transfer Ref#192837 or Bank Slip details..."
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="rounded-xl border-slate-200 text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setProcessingPayout(null)}
              className="rounded-xl text-xs font-bold h-10 px-5 border border-slate-100"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10 px-5 flex items-center gap-1.5 shadow"
              onClick={() => {
                if (!paymentReference.trim()) {
                  toast.error('Please input payment transaction receipt references!')
                  return
                }
                payMutation.mutate({ uuid: processingPayout.uuid, notes: paymentReference })
              }}
              disabled={payMutation.isPending}
            >
              {payMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Payment Disbursed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
