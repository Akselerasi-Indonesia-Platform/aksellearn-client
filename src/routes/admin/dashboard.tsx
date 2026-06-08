import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  adminDashboardService,
  type DashboardParams,
} from '@/services/admin/dashboard.service'
import { adminFinanceService } from '@/services/admin/finance.service'
import { getUser, isAdmin } from '@/lib/auth'
import { formatIDR } from '@/lib/currency'
import {
  FinancialCard,
  ConversionCard,
  TotalStudentsCard,
  ActiveCoursesCard,
  OverviewCard,
} from '@/components/admin/dashboard/stats-cards'
import { PrecisionTrendChart } from '@/components/admin/dashboard/precision-trend-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, RefreshCcw, Calendar, LayoutDashboard, Activity, Wallet, CheckCircle2, ShoppingBag, Calendar as CalendarIcon } from 'lucide-react'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/dashboard')({
  head: () => ({
    meta: [
      {
        title: 'Admin Overview | Aksellearn',
      },
    ],
  }),
  component: DashboardPage,
})

const MONTHS = [
  { value: 0, label: 'dashboard.months.allYear' },
  { value: 1, label: 'dashboard.months.january' },
  { value: 2, label: 'dashboard.months.february' },
  { value: 3, label: 'dashboard.months.march' },
  { value: 4, label: 'dashboard.months.april' },
  { value: 5, label: 'dashboard.months.may' },
  { value: 6, label: 'dashboard.months.june' },
  { value: 7, label: 'dashboard.months.july' },
  { value: 8, label: 'dashboard.months.august' },
  { value: 9, label: 'dashboard.months.september' },
  { value: 10, label: 'dashboard.months.october' },
  { value: 11, label: 'dashboard.months.november' },
  { value: 12, label: 'dashboard.months.december' },
]

const YEARS = [2024, 2025, 2026, 2027]

function StandaloneDatePicker({
  value,
  onChange,
  placeholder,
  clearText = 'Clear',
}: {
  value?: string
  onChange: (val: string | undefined) => void
  placeholder?: string
  clearText?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[160px] pl-3 text-left font-semibold h-10 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-between',
            !value && 'text-slate-400 font-normal',
          )}
        >
          <span className="truncate">
            {value ? (
              format(new Date(value), 'dd MMM yyyy')
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-50 ml-2 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100 bg-white"
        align="start"
      >
        <CalendarComponent
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
          initialFocus
        />
        {value && (
          <div className="p-2 border-t border-slate-100 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 font-bold hover:bg-red-50"
              onClick={() => onChange(undefined)}
            >
              {clearText}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function DashboardPage() {
  const { t } = useTranslation()

  // Identify if the active user is an instructor
  const user = getUser()
  const isInstructor = React.useMemo(() => {
    if (!user) return false
    return user.roles?.some((role: any) => {
      const name = typeof role === 'string' ? role : role.name
      return name === 'Teacher' || name === 'Instructor'
    })
  }, [user])

  // Initialize with current month and year
  const now = new Date()
  const [params, setParams] = React.useState<DashboardParams>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    period: '30d',
    date_from: undefined,
    date_to: undefined,
  })

  const {
    data: stats,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats', params],
    queryFn: () => adminDashboardService.getStats(params),
    refetchInterval: 60 * 1000,
    staleTime: 45 * 1000,
  })

  const showInstructorView = React.useMemo(() => {
    return isInstructor || stats?.meta?.can_manage_all === false
  }, [isInstructor, stats?.meta?.can_manage_all])

  const handleMonthChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      month: parseInt(value),
      period: value === '0' ? 'year' : '30d',
    }))
  }

  const handleYearChange = (value: string) => {
    setParams((prev) => ({ ...prev, year: parseInt(value) }))
  }

  return (
    <AdminPage>
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('sidebar.dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium tracking-tight">
              {t('dashboard.updatesEveryMinute')}
            </span>
            {dataUpdatedAt && (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full ml-2">
                {t('dashboard.lastUpdated', { time: format(dataUpdatedAt, 'HH:mm') })}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              {t('dashboard.startDate')}
            </label>
            <StandaloneDatePicker
              value={params.date_from}
              onChange={(val) => {
                if (val && params.date_to && new Date(val) > new Date(params.date_to)) {
                  toast.error('Start Date must be earlier than or equal to End Date')
                  return
                }
                setParams((prev) => ({
                  ...prev,
                  date_from: val,
                }))
              }}
              placeholder={t('dashboard.selectStart')}
              clearText={t('dashboard.clear')}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              {t('dashboard.endDate')}
            </label>
            <StandaloneDatePicker
              value={params.date_to}
              onChange={(val) => {
                if (val && params.date_from && new Date(params.date_from) > new Date(val)) {
                  toast.error('End Date must be later than or equal to Start Date')
                  return
                }
                setParams((prev) => ({
                  ...prev,
                  date_to: val,
                }))
              }}
              placeholder={t('dashboard.selectEnd')}
              clearText={t('dashboard.clear')}
            />
          </div>

          {/* Month Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              {t('dashboard.month')}
            </label>
            <Select
              value={String(params.month)}
              onValueChange={handleMonthChange}
              disabled={!!(params.date_from || params.date_to)}
            >
              <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm focus:ring-indigo-500 disabled:opacity-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue placeholder={t('dashboard.month')} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {MONTHS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={String(m.value)}
                    className="font-bold py-2.5"
                  >
                    {t(m.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
              {t('dashboard.year')}
            </label>
            <Select
              value={String(params.year)}
              onValueChange={handleYearChange}
              disabled={!!(params.date_from || params.date_to)}
            >
              <SelectTrigger className="w-[100px] h-10 rounded-xl border-slate-200 bg-white font-bold text-slate-600 shadow-sm focus:ring-indigo-500 disabled:opacity-50">
                <SelectValue placeholder={t('dashboard.year')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {YEARS.map((y) => (
                  <SelectItem
                    key={y}
                    value={String(y)}
                    className="font-bold py-2.5"
                  >
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <div className="h-4" />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl bg-white border-slate-200 shadow-sm hover:bg-slate-50 group mt-1.5"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCcw
                className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : 'group-active:rotate-180 transition-transform'}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Simplified Stats Grid */}
      {showInstructorView ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <FinancialCard
            title={t('dashboard.myEarnings')}
            total={(stats?.revenue?.total || 0) / 100}
            currency={stats?.revenue?.currency}
            isLoading={isLoading}
          />
          <TotalStudentsCard
            total={stats?.engagement.total_students || 0}
            isLoading={isLoading}
          />
          <ActiveCoursesCard
            total={stats?.courses.total || 0}
            isLoading={isLoading}
          />
          <ConversionCard
            views={stats?.courses.total_views || 0}
            enrolled={stats?.courses.total_enrolled || 0}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <FinancialCard
            title={t('dashboard.totalRevenue')}
            total={(stats?.revenue?.total || 0) / 100}
            monthly={(stats?.revenue?.monthly || 0) / 100}
            currency={stats?.revenue?.currency}
            isLoading={isLoading}
          />
          <OverviewCard
            title={t('dashboard.totalOrders')}
            value={(stats as any)?.orders?.total || 0}
            subtitle={t('dashboard.totalCompletedTransactions')}
            icon={ShoppingBag}
            iconContainerClassName="bg-blue-100 text-blue-600"
            isLoading={isLoading}
          />
          <TotalStudentsCard
            total={stats?.engagement.total_students || 0}
            isLoading={isLoading}
          />
          <ActiveCoursesCard
            total={stats?.courses.total || 0}
            isLoading={isLoading}
          />
          <ConversionCard
            views={stats?.courses.total_views || 0}
            enrolled={stats?.courses.total_enrolled || 0}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Course Analytics Header */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                {showInstructorView ? t('dashboard.earningsAndSalesTrends') : t('dashboard.courseAnalytics')}
              </h2>
              <p className="text-slate-500 font-medium">
                {showInstructorView ? t('dashboard.overviewPayouts') : t('dashboard.viewAndEnrollment')}
              </p>
            </div>
          </div>
          <PrecisionTrendChart
            period={params.period}
            month={params.month}
            year={params.year}
            date_from={params.date_from}
            date_to={params.date_to}
          />
        </div>

      </div>
    </AdminPage>
  )
}
