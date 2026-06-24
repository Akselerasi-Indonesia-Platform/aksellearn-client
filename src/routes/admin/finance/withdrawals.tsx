import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  User,
  Check,
  X,
  Loader2,
  FileText,
  Copy,
} from 'lucide-react'
import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getUser } from '@/lib/auth'
import { adminFinanceService } from '@/services/admin/finance.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { DataTable, type Column } from '@/components/admin/shared/data/data-table'
import { Button } from '@/components/ui/button'
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

export const Route = createFileRoute('/admin/finance/withdrawals')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
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
  component: AdminWithdrawalsPage,
})

function AdminWithdrawalsPage() {
  const queryClient = useQueryClient()
  const [activeStatusTab, setActiveStatusTab] = React.useState<'pending' | 'completed' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(20)

  // Modals state
  const [approvingWithdrawal, setApprovingWithdrawal] = React.useState<any | null>(null)
  const [rejectingWithdrawal, setRejectingWithdrawal] = React.useState<any | null>(null)
  
  const [proofImage, setProofImage] = React.useState<File | null>(null)
  const [rejectedReason, setRejectedReason] = React.useState('')

  // 1. Fetch Withdrawals
  const { data: withdrawalsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'finance', 'withdrawals', activeStatusTab, page, limit],
    queryFn: () =>
      adminFinanceService.getAdminWithdrawals({
        page,
        limit,
        status: activeStatusTab,
      }),
  })

  const withdrawals = withdrawalsData?.data || []

  // 3. Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      adminFinanceService.approveAdminWithdrawal(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'withdrawals'] })
      toast.success('Withdrawal approved and processed!')
      setApprovingWithdrawal(null)
      setProofImage(null)
    },
    onError: (err: any) => {
      toast.error(`Approval failed: ${err.response?.data?.message || err.message}`)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminFinanceService.rejectAdminWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'withdrawals'] })
      toast.success('Withdrawal rejected and funds refunded!')
      setRejectingWithdrawal(null)
      setRejectedReason('')
    },
    onError: (err: any) => {
      toast.error(`Rejection failed: ${err.response?.data?.message || err.message}`)
    },
  })

  // Filter list locally for search query
  const filteredWithdrawals = React.useMemo(() => {
    if (!searchQuery.trim()) return withdrawals
    const q = searchQuery.toLowerCase()
    return withdrawals.filter((w: any) => {
      const instructorName = (w.user?.name || w.instructor?.name || '')
      const bankName = w.bank_name || ''
      return (
        instructorName.toLowerCase().includes(q) ||
        bankName.toLowerCase().includes(q)
      )
    })
  }, [withdrawals, searchQuery])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleApproveSubmit = () => {
    if (!proofImage) {
      toast.error('Please upload a transfer receipt image.')
      return
    }
    const formData = new FormData()
    formData.append('proof_image', proofImage)
    approveMutation.mutate({ id: approvingWithdrawal.id, formData })
  }

  const handleRejectSubmit = () => {
    if (!rejectedReason.trim()) {
      toast.error('Please enter a rejection reason.')
      return
    }
    rejectMutation.mutate({ id: rejectingWithdrawal.id, reason: rejectedReason })
  }

  const columns: Column<any>[] = [
    {
      header: 'Instructor',
      cell: (w) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-[#2AABAA]/10 flex items-center justify-center text-[#0E7A6A] font-bold">
            <User className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">
              {w.user?.name || w.instructor?.name || 'Unknown'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      cell: (w) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(w.amount)}
        </span>
      ),
    },
    {
      header: 'Bank Details',
      cell: (w) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{w.bank_name}</span>
          <span className="text-xs text-slate-500">{w.bank_account_number}</span>
          <span className="text-xs text-slate-400">{w.bank_account_name}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (w) => (
        <div className="flex flex-col items-center justify-center gap-2">
          {activeStatusTab === 'pending' && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setApprovingWithdrawal(w)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <Check className="size-3.5" />
                Approve
              </Button>
              <Button
                onClick={() => setRejectingWithdrawal(w)}
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold h-8 px-3 rounded-xl text-xs flex items-center gap-1 shadow-sm"
              >
                <X className="size-3.5" />
                Reject
              </Button>
            </div>
          )}
          {activeStatusTab === 'completed' && (
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mb-2">
                <CheckCircle className="size-3" /> Completed
              </span>
              {w.proof_image_path && (
                <a 
                  href={w.proof_image_path.startsWith('http') ? w.proof_image_path : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/storage/${w.proof_image_path.replace(/^\//, '')}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-600 underline"
                >
                  View Receipt
                </a>
              )}
            </div>
          )}
          {activeStatusTab === 'rejected' && (
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                <X className="size-3" /> Rejected
              </span>
              {w.rejected_reason && (
                <span className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={w.rejected_reason}>
                  {w.rejected_reason}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminPage className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Payout Queue</h1>
        <p className="text-muted-foreground">
          Review and process instructor withdrawal requests.
        </p>
      </div>

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
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg font-bold text-slate-600 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="rounded-lg font-bold text-slate-600 px-6 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Rejected
            </TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Input
              placeholder="Search instructor or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs font-medium border-slate-200"
            />
            <Search className="absolute left-3 inset-y-0 my-auto size-4 text-slate-400" />
          </div>
        </div>

        <TabsContent value={activeStatusTab} className="space-y-4 m-0">
          <DataTable
            data={filteredWithdrawals}
            columns={columns}
            isLoading={isLoading}
            emptyState={
              isError ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
                  <AlertCircle className="h-10 w-10 text-rose-500" />
                  <p className="text-sm font-bold text-slate-800">
                    Failed to retrieve data.
                  </p>
                  <Button onClick={() => refetch()} variant="outline" className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
                  <Clock className="h-12 w-12 text-slate-300" />
                  <p className="text-sm font-bold text-slate-800">
                    No withdrawal records found.
                  </p>
                </div>
              )
            }
          />
        </TabsContent>
      </Tabs>

      {/* Approve Modal */}
      <Dialog open={!!approvingWithdrawal} onOpenChange={(open) => !open && setApprovingWithdrawal(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Confirm Transfer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              Please manually transfer the funds via your corporate banking portal and upload the receipt here.
            </DialogDescription>
          </DialogHeader>

          {approvingWithdrawal && (
            <div className="space-y-4 my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-slate-900 font-black text-emerald-600 text-base">
                    {formatCurrency(approvingWithdrawal.amount)}
                  </span>
                </div>
                <div className="border-t border-slate-200 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Bank:</span>
                  <span className="text-slate-900">{approvingWithdrawal.bank_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="text-slate-900">{approvingWithdrawal.bank_account_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account No:</span>
                  <div className="flex items-center gap-2 text-slate-900">
                    <span>{approvingWithdrawal.bank_account_number}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6 hover:bg-slate-200"
                      onClick={() => copyToClipboard(approvingWithdrawal.bank_account_number)}
                    >
                      <Copy className="size-3 text-slate-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FileText className="size-3.5 text-slate-400" /> Transfer Receipt (Required)
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setProofImage(e.target.files[0])
                }
              }}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setApprovingWithdrawal(null)}
              className="rounded-xl text-xs font-bold h-10 px-5 border border-slate-100"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-10 px-5 flex items-center gap-1.5 shadow"
              onClick={handleApproveSubmit}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectingWithdrawal} onOpenChange={(open) => !open && setRejectingWithdrawal(null)}>
        <DialogContent className="rounded-2xl max-w-md p-6 bg-white border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Reject Withdrawal
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              Provide a reason for rejection. The funds will be returned to the instructor's available balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rejection Reason
            </label>
            <Textarea
              placeholder="e.g. Account name does not match KYC profile."
              value={rejectedReason}
              onChange={(e) => setRejectedReason(e.target.value)}
              className="rounded-xl border-slate-200 text-xs min-h-[90px]"
            />
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setRejectingWithdrawal(null)}
              className="rounded-xl text-xs font-bold h-10 px-5 border border-slate-100"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-10 px-5 flex items-center gap-1.5 shadow"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
