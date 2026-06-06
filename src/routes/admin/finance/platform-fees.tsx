import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  Plus,
  Trash2,
  Edit2,
  Percent,
  Settings,
  Loader2,
  AlertCircle,
  Building,
  BookOpen,
  User,
  Filter,
} from 'lucide-react'
import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { getUser, isAdmin } from '@/lib/auth'
import { adminFinanceService } from '@/services/admin/finance.service'
import { PageHeader } from '@/components/admin/shared/layout/page-header'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import { DataHeader } from '@/components/admin/shared/data/data-header'
import { DataFooter } from '@/components/admin/shared/data/data-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/utils'

const platformFeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  fee_type: z.enum(['percentage', 'flat', 'percentage_and_flat']).default('percentage'),
  percentage_value: z.coerce.number().min(0).max(100, 'Percentage cannot exceed 100%').optional().nullable(),
  flat_value: z.coerce.number().min(0, 'Flat fee cannot be negative').optional().nullable(),
  maximum_value: z.coerce.number().min(0, 'Maximum value cannot be negative').optional().nullable(),
  applies_to: z.enum(['all', 'course', 'instructor']),
  entity_id: z.union([z.string(), z.number()]).optional().nullable(),
  is_active: z.boolean().default(true),
})

type PlatformFeeFormValues = z.infer<typeof platformFeeSchema>

const platformFeesSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
  search: z.string().default('').catch(''),
  applies_to: z.enum(['all', 'course', 'instructor']).optional().catch(undefined),
})

export const Route = createFileRoute('/admin/finance/platform-fees')({
  validateSearch: platformFeesSearchSchema,
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
  component: PlatformFeesPage,
})

function PlatformFeesPage() {
  const queryClient = useQueryClient()
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  
  const { page, limit, search, applies_to } = searchParams
  const [isOpen, setIsOpen] = React.useState(false)
  const [editingConfig, setEditingConfig] = React.useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(null)

  // 1. Fetch Configuration Rules
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'finance', 'platform-fee-configs', searchParams],
    queryFn: () => adminFinanceService.getPlatformFeeConfigs(searchParams),
  })

  // 2. Fetch Helper Lists for entity dropdowns
  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses-simple-list'],
    queryFn: () => adminFinanceService.getCoursesList(),
  })

  const { data: instructors = [] } = useQuery({
    queryKey: ['admin', 'instructors-simple-list'],
    queryFn: () => adminFinanceService.getInstructorsList(),
  })

  const configs = data?.data || []

  const globalConfig = React.useMemo(() => {
    return configs.find((c: any) => c.applies_to === 'all')
  }, [configs])

  const overrideConfigs = React.useMemo(() => {
    return configs.filter((c: any) => c.applies_to !== 'all')
  }, [configs])

  const courseOptions = React.useMemo(() => {
    return courses.map((c: any) => ({ label: c.title, value: String(c.id) }))
  }, [courses])

  const instructorOptions = React.useMemo(() => {
    return instructors.map((inst: any) => ({ label: `${inst.name} (${inst.email})`, value: String(inst.id) }))
  }, [instructors])

  // 3. React Hook Form Setup
  const form = useForm<PlatformFeeFormValues>({
    resolver: zodResolver(platformFeeSchema) as any,
    defaultValues: {
      name: '',
      fee_type: 'percentage',
      percentage_value: 10,
      flat_value: 0,
      maximum_value: null,
      applies_to: 'course',
      entity_id: null,
      is_active: true,
    },
  }) as any

  const appliesToVal = form.watch('applies_to')
  const feeTypeVal = form.watch('fee_type')

  // Reset entity_id if applies_to changes
  React.useEffect(() => {
    if (appliesToVal === 'all') {
      form.setValue('entity_id', null)
    }
  }, [appliesToVal, form])

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingConfig(null)
    form.reset({
      name: '',
      fee_type: 'percentage',
      percentage_value: 10,
      flat_value: 0,
      maximum_value: null,
      applies_to: globalConfig ? 'course' : 'all',
      entity_id: null,
      is_active: true,
    })
    setIsOpen(true)
  }

  // Open modal for Edit
  const handleEditOpen = (config: any) => {
    setEditingConfig(config)
    const rawEntityId = config.entity_id
    const coercedEntityId = rawEntityId === null || rawEntityId === undefined || rawEntityId === ''
      ? null
      : (isNaN(Number(rawEntityId)) ? rawEntityId : Number(rawEntityId))

    form.reset({
      name: config.name,
      fee_type: config.fee_type || 'percentage',
      percentage_value: config.percentage_value !== undefined && config.percentage_value !== null ? config.percentage_value : config.fee_pct,
      flat_value: config.flat_value !== undefined && config.flat_value !== null ? config.flat_value : config.fee_flat,
      maximum_value: config.maximum_value || null,
      applies_to: config.applies_to,
      entity_id: coercedEntityId,
      is_active: config.is_active,
    })
    setIsOpen(true)
  }

  // 4. Mutations
  const createMutation = useMutation({
    mutationFn: (values: PlatformFeeFormValues) =>
      adminFinanceService.createPlatformFeeConfig(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'platform-fee-configs'] })
      toast.success('Configuration rule created successfully!')
      setIsOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create config')
    },
  })

  // Set Search Url Helpers
  const setUrlSearch = (updater: (prev: typeof searchParams) => typeof searchParams) => {
    navigate({ search: updater })
  }

  const handlePageChange = (newPage: number) => {
    setUrlSearch((prev) => ({ ...prev, page: newPage }))
  }

  const handleSearchChange = (newSearch: string) => {
    setUrlSearch((prev) => ({ ...prev, search: newSearch, page: 1 }))
  }

  const toggleAppliesTo = (val: 'all' | 'course' | 'instructor' | undefined) => {
    setUrlSearch((prev) => ({ ...prev, applies_to: val, page: 1 }))
  }

  const clearFilters = () => {
    setUrlSearch((prev) => ({ ...prev, search: '', applies_to: undefined, page: 1 }))
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: PlatformFeeFormValues }) =>
      adminFinanceService.updatePlatformFeeConfig(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'platform-fee-configs'] })
      toast.success('Configuration rule updated successfully!')
      setIsOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update config')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFinanceService.deletePlatformFeeConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'platform-fee-configs'] })
      toast.success('Configuration rule deleted successfully!')
      setDeleteConfirmId(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete config')
    },
  })

  const onSubmit = (values: PlatformFeeFormValues) => {
    if (values.applies_to !== 'all' && !values.entity_id) {
      toast.error(`Please select a specific ${values.applies_to} for this rule.`)
      return
    }

    const percentage = values.fee_type === 'flat' ? 0 : (values.percentage_value || 0)
    const flat = values.fee_type === 'percentage' ? 0 : (values.flat_value || 0)
    const maxVal = values.fee_type === 'percentage_and_flat' ? (values.maximum_value || null) : null

    const payload: any = {
      ...values,
      fee_pct: percentage,
      fee_flat: flat,
      percentage_value: percentage,
      flat_value: flat,
      maximum_value: maxVal,
    }

    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, values: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // Helper to render entity name
  const getEntityName = (config: any) => {
    if (config.applies_to === 'all') return 'All Platform Sales'
    if (config.applies_to === 'course') {
      const course = courses.find((c) => String(c.id) === String(config.entity_id))
      return course ? `Course: ${course.title}` : `Course (ID: ${config.entity_id})`
    }
    if (config.applies_to === 'instructor') {
      const instructor = instructors.find((i) => String(i.id) === String(config.entity_id))
      return instructor
        ? `Instructor: ${instructor.name}`
        : `Instructor (ID: ${config.entity_id})`
    }
    return '-'
  }

  const activeFiltersCount = applies_to ? 1 : 0

  const filterTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 gap-2 border-border font-semibold shadow-sm"
          variant="outline"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          Scope Filter
          {applies_to && (
            <Badge className="ml-2 rounded-sm px-1 font-bold h-5 bg-primary text-primary-foreground">
              1
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] admin-theme">
        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pt-3">
          Scope
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={applies_to === undefined}
          onCheckedChange={() => toggleAppliesTo(undefined)}
          className="text-xs py-2"
        >
          All Scopes
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={applies_to === 'all'}
          onCheckedChange={() => toggleAppliesTo('all')}
          className="text-xs py-2"
        >
          Global Default Only
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={applies_to === 'course'}
          onCheckedChange={() => toggleAppliesTo('course')}
          className="text-xs py-2"
        >
          Course Overrides
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={applies_to === 'instructor'}
          onCheckedChange={() => toggleAppliesTo('instructor')}
          className="text-xs py-2"
        >
          Instructor Overrides
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <AdminPage>
      {/* Page Header */}
      <PageHeader
        title="Platform Fee Rules"
        description="Manage granular commission rules. Apply global defaults or override fees per-course and per-instructor."
        actions={
          <Button
            onClick={handleCreateOpen}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-5 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="size-4" /> Add Commission Rule
          </Button>
        }
      />

      {/* Global Fallback Default Commission Card */}
      {globalConfig && (
        <Card className="rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-sm overflow-hidden mb-6 mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Settings className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {globalConfig.name || 'Global Default Commission'}
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50">
                      Active Fallback
                    </Badge>
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-medium max-w-xl leading-relaxed">
                    This fallback commission rule applies to all platform sales unless overridden by course-specific or instructor-specific split overrides below.
                  </p>
                  
                  {/* Fee Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-700 font-bold">
                    <span className="bg-indigo-100/50 text-indigo-800 px-2.5 py-1 rounded-lg">
                      Type: <span className="capitalize">{globalConfig.fee_type || 'Percentage'}</span>
                    </span>
                    {(globalConfig.fee_type === 'percentage' || globalConfig.fee_type === 'percentage_and_flat' || !globalConfig.fee_type) && (
                      <span className="bg-indigo-100/50 text-indigo-800 px-2.5 py-1 rounded-lg">
                        Percentage: {globalConfig.percentage_value ?? globalConfig.fee_pct}%
                      </span>
                    )}
                    {(globalConfig.fee_type === 'flat' || globalConfig.fee_type === 'percentage_and_flat') && (
                      <span className="bg-indigo-100/50 text-indigo-800 px-2.5 py-1 rounded-lg">
                        Flat: {formatCurrency(globalConfig.flat_value ?? globalConfig.fee_flat)}
                      </span>
                    )}
                    {globalConfig.fee_type === 'percentage_and_flat' && globalConfig.maximum_value > 0 && (
                      <span className="bg-indigo-100/50 text-indigo-800 px-2.5 py-1 rounded-lg">
                        Max Cap: {formatCurrency(globalConfig.maximum_value)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => handleEditOpen(globalConfig)}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm font-bold rounded-xl h-10 px-4 gap-2 text-xs"
                >
                  <Edit2 className="size-3.5" /> Modify Global Rule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Filter Header */}
      <DataHeader
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        filterTrigger={filterTrigger}
        resultsCount={data?.meta?.total}
        resultsLabel="fee configurations found"
      />

      {/* Main Table Card (Overrides Only) */}
      <Card className="rounded-xl border-slate-100 shadow-sm overflow-hidden bg-white mt-4">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                Fetching platform configurations...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500" />
              <p className="text-sm font-bold text-slate-800">
                Failed to load platform fee configurations.
              </p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                Retry Connection
              </Button>
            </div>
          ) : overrideConfigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 gap-4 text-center">
              <Settings className="h-12 w-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-800">
                No custom commission overrides configured.
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Click "Add Commission Rule" to create customized payout settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-6 pl-8">Rule Name</th>
                    <th className="p-6">Scope / Applies To</th>
                    <th className="p-6">Entity target</th>
                    <th className="p-6 text-right">Fee Rate</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-center pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {overrideConfigs.map((config: any) => (
                    <tr key={config.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 pl-8 font-bold text-slate-900">{config.name}</td>
                      <td className="p-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            config.applies_to === 'all'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : config.applies_to === 'course'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                          }`}
                        >
                          {config.applies_to === 'all' && <Building className="size-3" />}
                          {config.applies_to === 'course' && <BookOpen className="size-3" />}
                          {config.applies_to === 'instructor' && <User className="size-3" />}
                          {config.applies_to.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 text-slate-600 font-medium">
                        {getEntityName(config)}
                      </td>
                      <td className="p-6 text-right font-bold text-slate-900">
                        <div className="flex flex-col items-end">
                          {(!config.fee_type || config.fee_type === 'percentage') && (
                            <span>{config.percentage_value ?? config.fee_pct}%</span>
                          )}
                          {config.fee_type === 'flat' && (
                            <span>{formatCurrency(config.flat_value ?? config.fee_flat)} Flat</span>
                          )}
                          {config.fee_type === 'percentage_and_flat' && (
                            <>
                              <span>{config.percentage_value ?? config.fee_pct}% + {formatCurrency(config.flat_value ?? config.fee_flat)}</span>
                              {config.maximum_value > 0 && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  Max: {formatCurrency(config.maximum_value)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            config.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              config.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {config.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-6 text-center pr-8">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleEditOpen(config)}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirmId(config.id)}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data?.meta && (
            <DataFooter
              page={data.meta.current_page || data.meta.page || page}
              total={data.meta.total || 0}
              limit={data.meta.per_page || data.meta.limit || limit}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] admin-theme shadow-2xl border border-slate-100/50 rounded-3xl p-0 overflow-hidden bg-white">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                {editingConfig ? 'Edit Commission Overrides' : 'Add Commission Override Rule'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
                Specify how much the platform receives for course sales matches.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 pt-2">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Rule Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Standard Instructor Split"
                          className="h-10 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission Scope applies_to */}
                <FormField
                  control={form.control}
                  name="applies_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Commission Scope
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={editingConfig?.applies_to === 'all'}
                        >
                          {(!editingConfig || editingConfig?.applies_to === 'all') && (
                            <option value="all">Global Rule (Fallback Default)</option>
                          )}
                          <option value="course">Specific Course Override</option>
                          <option value="instructor">Specific Instructor Override</option>
                        </select>
                      </FormControl>
                      <FormDescription className="text-[10px] text-slate-400">
                        Decide if this rule applies generally, or overrides split parameters for one specific course or creator.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Course Selector */}
                {appliesToVal === 'course' && (
                  <FormField
                    control={form.control}
                    name="entity_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Select Course Target
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={courseOptions}
                            value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                            onValueChange={(val) => {
                              field.onChange(val === '' ? null : (isNaN(Number(val)) ? val : Number(val)))
                            }}
                            placeholder="-- Choose Course --"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Instructor Selector */}
                {appliesToVal === 'instructor' && (
                  <FormField
                    control={form.control}
                    name="entity_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Select Instructor Target
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={instructorOptions}
                            value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
                            onValueChange={(val) => {
                              field.onChange(val === '' ? null : (isNaN(Number(val)) ? val : Number(val)))
                            }}
                            placeholder="-- Choose Instructor --"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Commission Fee Type */}
                <FormField
                  control={form.control}
                  name="fee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Commission Fee Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="percentage">Percentage Rate Only</option>
                          <option value="flat">Flat Fee Only</option>
                          <option value="percentage_and_flat">Percentage and Flat Combo (with Maximum Cap)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Percentage & Flat rate Row */}
                <div className="grid grid-cols-2 gap-4">
                  {(feeTypeVal === 'percentage' || feeTypeVal === 'percentage_and_flat') && (
                    <FormField
                      control={form.control}
                      name="percentage_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            Platform Fee %
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="30.00"
                                className="pr-8 h-10 rounded-xl font-bold"
                                {...field}
                                value={field.value !== null && field.value !== undefined ? field.value : ''}
                              />
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                <Percent className="size-3.5" />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(feeTypeVal === 'flat' || feeTypeVal === 'percentage_and_flat') && (
                    <FormField
                      control={form.control}
                      name="flat_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Flat Deduction (IDR)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-7 h-10 rounded-xl font-bold"
                                {...field}
                                value={field.value !== null && field.value !== undefined ? field.value : ''}
                              />
                              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                                Rp
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {feeTypeVal === 'percentage_and_flat' && (
                  <FormField
                    control={form.control}
                    name="maximum_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Maximum Payout Cap (IDR, Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="e.g. 50000"
                              className="pl-7 h-10 rounded-xl font-bold"
                              {...field}
                              value={field.value !== null && field.value !== undefined ? field.value : ''}
                            />
                            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                              Rp
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-[10px] text-slate-400">
                          The total fee calculated will never exceed this maximum amount. Leave empty/0 for no cap.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Active Toggle */}
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-0.5">
                        <FormLabel className="text-xs font-bold text-slate-700">
                          Rule Active Status
                        </FormLabel>
                        <FormDescription className="text-[10px] text-slate-400 leading-tight">
                          Inactive rules will be skipped during transaction splitting.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 h-10 px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit as any)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest h-10 px-6 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 group"
            >
              Save Config
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent className="rounded-2xl bg-white border border-slate-100 shadow-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Delete Commission Override Rule?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This action cannot be undone. Orders already processed will maintain their pro-rated commission percentages. Future splits will revert to the global configuration rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold h-10 border border-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 px-6 rounded-xl shadow"
            >
              Delete Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  )
}
