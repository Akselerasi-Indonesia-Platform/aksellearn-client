import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building,
  Edit2,
  Star,
  Check,
  ChevronsUpDown
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
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export const Route = createFileRoute('/admin/instructor/bank-accounts')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const user = getUser()
    const isAuthorized = can('user_bank.read', user) || can('admin.manage_all', user)
    if (!isAuthorized) {
      throw redirect({
        to: '/not-found' as any,
        replace: true,
      })
    }
  },
  component: BankAccountsPage,
})

function BankAccountsPage() {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editingBank, setEditingBank] = React.useState<any | null>(null)
  const [openBankSelect, setOpenBankSelect] = React.useState(false)
  
  const { data: banks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['instructor', 'banks'],
    queryFn: () => adminInstructorService.getBanks(),
  })

  const { data: availableBanks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['payment', 'banks'],
    queryFn: () => adminInstructorService.getAvailableBanks(),
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      bank_code: '',
      bank_name: '',
      account_number: '',
      account_name: '',
      is_primary: false,
    }
  })

  const isPrimaryChecked = watch('is_primary')

  const createMutation = useMutation({
    mutationFn: (data: any) => adminInstructorService.createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'banks'] })
      toast.success('Bank account added successfully!')
      setIsAddModalOpen(false)
      reset()
    },
    onError: (err: any) => {
      toast.error(`Failed to add bank account: ${err.response?.data?.message || err.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: any }) => adminInstructorService.updateBank(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'banks'] })
      toast.success('Bank account updated!')
      setEditingBank(null)
      reset()
    },
    onError: (err: any) => {
      toast.error(`Update failed: ${err.response?.data?.message || err.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => adminInstructorService.deleteBank(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'banks'] })
      toast.success('Bank account deleted!')
    },
    onError: (err: any) => {
      toast.error(`Deletion failed: ${err.response?.data?.message || err.message}`)
    },
  })

  const onSubmit = (data: any) => {
    if (editingBank) {
      updateMutation.mutate({ uuid: editingBank.uuid, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const openEditModal = (bank: any) => {
    setEditingBank(bank)
    setValue('bank_code', bank.bank_code || '')
    setValue('bank_name', bank.bank_name)
    setValue('account_number', bank.account_number)
    setValue('account_name', bank.account_name)
    setValue('is_primary', bank.is_primary)
  }

  const handleSetPrimary = (uuid: string) => {
    updateMutation.mutate({ uuid, data: { is_primary: true } })
  }

  return (
    <AdminPage className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts to receive withdrawal payouts.
          </p>
        </div>
        <Button 
          onClick={() => {
            reset()
            setEditingBank(null)
            setIsAddModalOpen(true)
          }}
          className="bg-primary text-primary-foreground font-bold rounded-xl shadow h-10 px-6 gap-2"
        >
          <Plus className="size-4" />
          Add Bank Account
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground animate-pulse">Loading banks...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="text-sm font-bold text-slate-800">Failed to load bank accounts.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">Retry</Button>
        </div>
      ) : banks.length === 0 ? (
        <Card className="rounded-[30px] border-dashed border-2 bg-slate-50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-16 gap-4 text-center">
            <div className="p-4 bg-slate-200/50 rounded-full text-slate-400">
              <CreditCard className="size-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-800">No bank accounts added</p>
              <p className="text-sm text-slate-500 max-w-sm">
                You need to add at least one bank account before you can request any revenue withdrawals.
              </p>
            </div>
            <Button 
              onClick={() => {
                reset()
                setEditingBank(null)
                setIsAddModalOpen(true)
              }}
              className="mt-4"
            >
              Add Your First Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank: any) => (
            <Card key={bank.uuid} className={`rounded-2xl border-2 transition-all ${bank.is_primary ? 'border-primary shadow-md bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
              <CardContent className="p-5 flex flex-col h-full gap-4 relative">
                {bank.is_primary && (
                  <div className="absolute top-4 right-4 text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-full">
                    <Star className="size-3 fill-primary" /> Primary
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${bank.is_primary ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    <Building className="size-5" />
                  </div>
                  <div className="flex flex-col pr-16">
                    <span className="font-bold text-slate-900 line-clamp-1">{bank.bank_name}</span>
                    <span className="text-xs text-slate-500">{bank.account_name}</span>
                  </div>
                </div>

                <div className="mt-auto bg-white/60 p-3 rounded-xl border border-slate-100">
                  <span className="font-mono text-sm tracking-widest text-slate-700 font-semibold">{bank.account_number}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-100">
                  {!bank.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(bank.uuid)}
                      disabled={updateMutation.isPending}
                      className="text-xs font-semibold text-slate-500 hover:text-primary flex-1"
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(bank)}
                    className="size-8 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this bank account?')) {
                        deleteMutation.mutate(bank.uuid)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={isAddModalOpen || !!editingBank} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setEditingBank(null)
        }
      }}>
        <DialogContent className="rounded-2xl max-w-sm p-6 bg-card border border-border shadow-2xl admin-theme">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bank Name</label>
              <Popover open={openBankSelect} onOpenChange={setOpenBankSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBankSelect}
                    className="w-full h-10 rounded-xl bg-muted/30 border-border justify-between text-left font-normal"
                  >
                    <span className="line-clamp-1 truncate">
                      {watch('bank_code')
                        ? availableBanks.find((b: any) => b.code === watch('bank_code'))?.name || 'Select a bank'
                        : 'Select a bank'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl max-h-[300px]" align="start">
                  <Command>
                    <CommandInput placeholder="Search bank..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>No bank found.</CommandEmpty>
                      <CommandGroup>
                        {isLoadingBanks ? (
                          <div className="p-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading banks...
                          </div>
                        ) : (
                          availableBanks.map((bank: any) => (
                            <CommandItem
                              key={bank.id}
                              value={bank.name}
                              onSelect={() => {
                                setValue('bank_code', bank.code)
                                setValue('bank_name', bank.name)
                                setOpenBankSelect(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  watch('bank_code') === bank.code ? "opacity-100 text-primary" : "opacity-0"
                                )}
                              />
                              <span className="truncate">{bank.name}</span>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" {...register('bank_code', { required: 'Bank selection is required' })} />
              <input type="hidden" {...register('bank_name')} />
              {errors.bank_code && <p className="text-xs text-rose-500">{errors.bank_code.message as string}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Name</label>
              <Input
                {...register('account_name', { required: 'Account name is required' })}
                placeholder="e.g. John Doe"
                className="h-10 rounded-xl bg-muted/30 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Number</label>
              <Input
                {...register('account_number', { required: 'Account number is required' })}
                placeholder="e.g. 1234567890"
                className="h-10 rounded-xl bg-muted/30 border-border"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_primary"
                checked={isPrimaryChecked}
                onCheckedChange={(val) => setValue('is_primary', !!val)}
              />
              <label
                htmlFor="is_primary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
              >
                Set as primary bank account
              </label>
            </div>

            <DialogFooter className="pt-4 sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingBank(null)
                }}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBank ? 'Save Changes' : 'Add Bank'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
