import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Banknote,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  CreditCard,
  User,
  Info,
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

import { getUser, can } from '@/lib/auth'
import { adminInstructorService } from '@/services/admin/instructor.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/admin/instructor/withdrawals')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const user = getUser()
    const isAuthorized = can('withdrawal.read', user) || can('withdrawal.process', user) || can('admin.manage_all', user)
    if (!isAuthorized) {
      throw redirect({
        to: '/not-found' as any,
        replace: true,
      })
    }
  },
  component: InstructorWithdrawalsPage,
})

function InstructorWithdrawalsPage() {
  const queryClient = useQueryClient()
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [page, setPage] = React.useState(1)
  
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['instructor', 'wallet'],
    queryFn: () => adminInstructorService.getWalletBalance(),
  })

  const { data: banks = [] } = useQuery({
    queryKey: ['instructor', 'banks'],
    queryFn: () => adminInstructorService.getBanks(),
  })

  const { data: withdrawalsData, isLoading: isWithdrawalsLoading } = useQuery({
    queryKey: ['instructor', 'withdrawals', page],
    queryFn: () => adminInstructorService.getWithdrawals({ page, limit: 20 }),
  })

  const withdrawals = withdrawalsData?.data || []

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      amount: 50000,
      user_bank_id: '',
    }
  })

  // Set default bank if available
  React.useEffect(() => {
    if (banks.length > 0) {
      const primaryBank = banks.find((b: any) => b.is_primary)
      setValue('user_bank_id', primaryBank ? primaryBank.uuid : banks[0].uuid)
    }
  }, [banks, setValue])

  const requestMutation = useMutation({
    mutationFn: (data: any) => adminInstructorService.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'wallet'] })
      queryClient.invalidateQueries({ queryKey: ['instructor', 'withdrawals'] })
      toast.success('Withdrawal request submitted successfully!')
      setIsRequestModalOpen(false)
      reset()
    },
    onError: (err: any) => {
      toast.error(`Request failed: ${err.response?.data?.message || err.message}`)
    },
  })

  const onSubmit = (data: any) => {
    if (!data.user_bank_id) {
      toast.error('Please select a bank account.')
      return
    }
    const amount = Number(data.amount)
    if (amount < 50000) {
      toast.error('Minimum withdrawal is Rp 50.000')
      return
    }
    if (amount > (wallet?.available_balance || 0)) {
      toast.error('Amount exceeds available balance.')
      return
    }
    requestMutation.mutate({ amount, user_bank_id: data.user_bank_id })
  }

  const handleViewDetails = (w: any) => {
    setSelectedWithdrawal(w)
    setIsDetailModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle className="size-3" /> Completed
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
            <XCircle className="size-3" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="size-3" /> Pending
          </span>
        )
    }
  }

  return (
    <AdminPage className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
          <p className="text-muted-foreground">
            Manage your wallet and request payout withdrawals.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="rounded-[24px] border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Wallet className="size-48" />
          </div>
          <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[200px]">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
                Available Balance
              </span>
              <div className="text-4xl font-black tracking-tight">
                {isWalletLoading ? <Loader2 className="animate-spin size-8 mt-2" /> : formatCurrency(wallet?.available_balance || 0)}
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/70">Locked</span>
                <span className="font-semibold">{formatCurrency(wallet?.locked_balance || 0)}</span>
              </div>
              <Button 
                onClick={() => setIsRequestModalOpen(true)}
                disabled={banks.length === 0 || (wallet?.available_balance || 0) < 50000}
                className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl shadow-lg"
              >
                Request Payout <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 justify-center">
          {banks.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>No Bank Account Linked</strong>
                <p className="mt-1 opacity-90">You must add at least one bank account before you can request a withdrawal. Head over to the Bank Accounts page.</p>
              </div>
            </div>
          )}
          {(wallet?.available_balance || 0) > 0 && (wallet?.available_balance || 0) < 50000 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3">
              <Banknote className="size-5 shrink-0 mt-0.5 text-slate-400" />
              <div className="text-sm">
                <strong>Minimum Withdrawal Amount</strong>
                <p className="mt-1 text-slate-500">You need a minimum of Rp 50.000 to request a payout.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Withdrawal History</h2>
        <Card className="rounded-[24px] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            {isWithdrawalsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                <Clock className="size-10 mx-auto opacity-20 mb-3" />
                <p className="font-semibold">No withdrawal requests yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {format(new Date(w.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(w.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(w)}
                          className="h-8 text-primary hover:text-primary hover:bg-primary/10 font-semibold rounded-lg"
                        >
                          <Eye className="size-4 mr-1.5" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Available to withdraw: {formatCurrency(wallet?.available_balance || 0)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount (Rp)</label>
              <Input
                type="number"
                {...register('amount', { 
                  required: "Amount is required", 
                  min: { value: 50000, message: "Minimum withdrawal request is Rp 50.000" } 
                })}
                className="text-lg font-bold h-11"
              />
              {errors.amount && (
                <span className="text-[11px] font-medium text-destructive block">
                  {errors.amount.message as string}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Transfer To Bank</label>
              <Select
                value={watch('user_bank_id')}
                onValueChange={(val) => setValue('user_bank_id', val)}
              >
                <SelectTrigger className="h-11 font-medium">
                  <SelectValue placeholder="Select a saved bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((b: any) => (
                    <SelectItem key={b.uuid} value={b.uuid} className="py-2.5">
                      {b.bank_name} - {b.account_number} {b.is_primary ? <span className="text-muted-foreground ml-1 font-medium">(Primary)</span> : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50">
          {selectedWithdrawal && (
            <>
              <div className="bg-white p-6 border-b flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    Withdrawal Details
                  </DialogTitle>
                  <DialogDescription className="mt-1 font-mono text-xs">
                    Ref: {selectedWithdrawal.uuid || `WD-${selectedWithdrawal.id}`}
                  </DialogDescription>
                </div>
                <div>
                  {getStatusBadge(selectedWithdrawal.status)}
                </div>
              </div>

              <div className="p-6 flex flex-col gap-8">
                {/* Top Row: Details & Summary */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Bank Details */}
                  <div className="space-y-4 flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Destination Account</h3>
                    <Card className="border-none shadow-sm bg-white overflow-hidden flex-1">
                      <CardContent className="p-5 space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Building2 className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Bank Name</p>
                            <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedWithdrawal.bank_name || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                            <CreditCard className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Account Number</p>
                            <p className="font-bold text-sm text-slate-900 font-mono mt-0.5">{selectedWithdrawal.bank_account_number || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                            <User className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Account Holder</p>
                            <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedWithdrawal.bank_account_name || '-'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Summary Info */}
                  <div className="space-y-4 flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Summary</h3>
                    <Card className="border-none shadow-sm bg-white flex-1">
                      <CardContent className="p-5 space-y-5">
                        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner">
                            <Banknote className="size-6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Requested Amount</p>
                            <p className="font-black text-2xl text-slate-900 tracking-tight mt-0.5">{formatCurrency(selectedWithdrawal.amount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                            <Calendar className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Request Date</p>
                            <p className="font-bold text-sm text-slate-900 mt-0.5">{format(new Date(selectedWithdrawal.created_at), 'dd MMM yyyy, HH:mm')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Bottom Row: Status Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Transfer Status</h3>

                  {/* Status specific cards */}
                  {selectedWithdrawal.status === 'rejected' && (
                    <Card className="border border-rose-200 shadow-sm bg-rose-50 overflow-hidden">
                      <CardContent className="p-5 flex items-start gap-4">
                        <XCircle className="size-6 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="font-bold text-base text-rose-900">Withdrawal Rejected</p>
                          <p className="text-sm text-rose-700 bg-white/60 p-3 rounded-lg border border-rose-100 inline-block">{selectedWithdrawal.rejected_reason || 'No reason provided.'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(selectedWithdrawal.status === 'completed' || selectedWithdrawal.status === 'paid') && (
                    <Card className="border border-emerald-200 shadow-md bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
                          <div className="flex items-center gap-3 text-emerald-800 font-bold text-lg">
                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full shadow-inner">
                              <CheckCircle2 className="size-5" />
                            </div>
                            Transfer Completed
                          </div>
                          {selectedWithdrawal.proof_image_path && (
                            <a 
                              href={selectedWithdrawal.proof_image_path.startsWith('http') ? selectedWithdrawal.proof_image_path : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/storage/${selectedWithdrawal.proof_image_path.replace(/^\//, '')}`}
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
                            >
                              <ExternalLink className="size-3.5" /> Open in New Tab
                            </a>
                          )}
                        </div>
                        
                        {selectedWithdrawal.proof_image_path ? (
                          <div className="space-y-3">
                            <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Proof of Transfer Document</p>
                            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-100 bg-slate-50 flex items-center justify-center group shadow-sm max-h-[450px]">
                              <img 
                                src={selectedWithdrawal.proof_image_path.startsWith('http') ? selectedWithdrawal.proof_image_path : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/storage/${selectedWithdrawal.proof_image_path.replace(/^\//, '')}`} 
                                alt="Proof of Transfer" 
                                className="object-contain w-full h-full max-h-[450px] transition-transform duration-700 group-hover:scale-[1.02]"
                              />
                              <div className="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                                <span className="bg-white text-emerald-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                  <Eye className="size-4" /> Click to enlarge
                                </span>
                              </div>
                              <a 
                                href={selectedWithdrawal.proof_image_path.startsWith('http') ? selectedWithdrawal.proof_image_path : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/storage/${selectedWithdrawal.proof_image_path.replace(/^\//, '')}`}
                                target="_blank" 
                                rel="noreferrer" 
                                className="absolute inset-0 z-10"
                                aria-label="View Full Image"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-emerald-700 bg-emerald-100/50 p-4 rounded-xl border border-emerald-100">The transfer was marked as completed, but no receipt image was provided.</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {(selectedWithdrawal.status === 'pending' || selectedWithdrawal.status === 'processing') && (
                    <Card className="border border-amber-200 shadow-sm bg-amber-50">
                      <CardContent className="p-5 flex items-start gap-4">
                        <Info className="size-6 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-base text-amber-800">Processing Request</p>
                          <p className="text-sm text-amber-700">This withdrawal is being reviewed by the admin team. It usually takes 1-3 business days.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              <DialogFooter className="p-6 pt-0 bg-white mt-auto">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="rounded-xl w-full sm:w-auto font-bold">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
