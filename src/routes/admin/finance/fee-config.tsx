import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  DollarSign,
  Percent,
  Settings,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Calculator,
} from 'lucide-react'
import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { getUser, isAdmin } from '@/lib/auth'
import { adminFinanceService } from '@/services/admin/finance.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

const feeConfigSchema = z.object({
  platform_fee_percentage: z.coerce
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100%'),
})

type FeeConfigFormValues = z.infer<typeof feeConfigSchema>

export const Route = createFileRoute('/admin/finance/fee-config')({
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
  component: FeeConfigPage,
})

function FeeConfigPage() {
  const queryClient = useQueryClient()
  const [calcPrice, setCalcPrice] = React.useState<number>(100000)

  // 1. Fetch Current Fee Configuration
  const { data: config, isLoading, isError } = useQuery({
    queryKey: ['admin', 'finance', 'fee-config'],
    queryFn: async () => {
      const res = await adminFinanceService.getPlatformFeeConfigs({ limit: 10, applies_to: 'all' })
      const activeConfig = res.data?.find((c: any) => c.is_active && c.applies_to === 'all')
      return {
        id: activeConfig?.id,
        platform_fee_percentage: activeConfig ? activeConfig.fee_pct : 10
      }
    },
    // Fallback default in case of empty API response
    initialData: { id: undefined, platform_fee_percentage: 10 },
  })

  // 2. React Hook Form Setup
  const form = useForm<FeeConfigFormValues>({
    resolver: zodResolver(feeConfigSchema) as any,
    defaultValues: {
      platform_fee_percentage: config?.platform_fee_percentage ?? 10,
    },
  }) as any

  // Sync initialData when it successfully loads
  React.useEffect(() => {
    if (config) {
      form.reset({
        platform_fee_percentage: config.platform_fee_percentage,
      })
    }
  }, [config, form])

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FeeConfigFormValues) => {
      const res = await adminFinanceService.getPlatformFeeConfigs({ limit: 10, applies_to: 'all' })
      const activeConfig = res.data?.find((c: any) => c.is_active && c.applies_to === 'all')
      if (activeConfig) {
        return adminFinanceService.updatePlatformFeeConfig(activeConfig.id, {
          name: activeConfig.name || 'Global Platform Fee',
          fee_pct: values.platform_fee_percentage,
          fee_flat: activeConfig.fee_flat || 0,
          applies_to: 'all',
          is_active: true,
        })
      } else {
        return adminFinanceService.createPlatformFeeConfig({
          name: 'Global Platform Fee',
          fee_pct: values.platform_fee_percentage,
          fee_flat: 0,
          applies_to: 'all',
          is_active: true,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-config'] })
      toast.success('Platform fee configuration updated successfully!')
    },
    onError: (err: any) => {
      toast.error(
        `Failed to update configuration: ${
          err.response?.data?.message || err.message
        }`
      )
    },
  })

  const onSubmit = (values: FeeConfigFormValues) => {
    updateMutation.mutate(values)
  }

  // Calculator helper variables
  const currentFeePercentage = form.watch('platform_fee_percentage') ?? 10
  const platformCut = (calcPrice * currentFeePercentage) / 100
  const instructorShare = calcPrice - platformCut

  if (isLoading) {
    return (
      <AdminPage className="mx-auto flex w-full max-w-4xl flex-col justify-center items-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2AABAA] border-t-transparent" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Loading Finance settings...
          </p>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Finance Settings</h1>
        <p className="text-muted-foreground">
          Manage system commission fees, verify transactions splits, and configure billing rules.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Fee Configuration Form Card */}
        <div className="md:col-span-7">
          <Card className="rounded-xl border-primary/10 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2AABAA]/10 rounded-xl text-[#0E7A6A]">
                  <Settings className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Platform Commission Fee
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Set the percentage cut taken by the platform on student purchases.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="platform_fee_percentage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-bold text-slate-700">
                          Fee Percentage (%)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="10.00"
                              className="pl-4 pr-12 h-12 rounded-xl text-lg font-bold border-slate-200 focus:ring-[#2AABAA]"
                              {...field}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                              <Percent className="size-4" />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-slate-400 font-medium leading-relaxed">
                          This percentage will be automatically deducted from all student purchase amounts to calculate instructor payouts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Info Box */}
                  <div className="flex gap-3 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-indigo-900">
                    <ShieldCheck className="size-5 shrink-0 text-indigo-500 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Transaction Isolation Guard</p>
                      <p className="text-indigo-700 leading-relaxed">
                        Updates to the fee percentage will only apply to future order creations. Currently settled transactions or orders already in process remain unaffected.
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50 border-t p-6 px-8 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#2AABAA] hover:bg-[#208A89] text-white font-bold h-11 px-8 rounded-xl"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        {/* Real-time Earnings Simulator */}
        <div className="md:col-span-5">
          <Card className="rounded-xl border-none bg-gradient-to-b from-[#2AABAA]/10 to-indigo-500/10 shadow-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-[#0E7A6A]" />
                <span className="text-[10px] font-black text-[#0E7A6A] uppercase tracking-[0.2em]">
                  Revenue Calculator
                </span>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 mt-2">
                Split Simulator
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Simulate revenue shares based on current configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Simulation Price (IDR)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="pl-10 h-10 rounded-xl font-bold border-slate-200 bg-white"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      Rp
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Course price</span>
                    <span>{formatCurrency(calcPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-500">
                    <span className="flex items-center gap-1.5">
                      Platform Fee ({currentFeePercentage}%)
                    </span>
                    <span>- {formatCurrency(platformCut)}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex items-center justify-between text-sm font-bold text-slate-950">
                    <span>Instructor Earnings</span>
                    <span className="text-emerald-600">{formatCurrency(instructorShare)}</span>
                  </div>
                </div>
              </div>

              {/* Graphical Split Representation */}
              <div className="space-y-4 bg-white/40 p-5 rounded-2xl border border-white/60">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Visual Distribution
                </h4>
                <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  {currentFeePercentage > 0 && (
                    <div
                      className="h-full bg-rose-400 transition-all duration-300"
                      style={{ width: `${currentFeePercentage}%` }}
                      title={`Platform: ${currentFeePercentage}%`}
                    />
                  )}
                  {100 - currentFeePercentage > 0 && (
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300 flex-1"
                      title={`Instructor: ${100 - currentFeePercentage}%`}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-rose-400" /> Platform Fee ({currentFeePercentage}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-400" /> Instructor ({100 - currentFeePercentage}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPage>
  )
}
