import * as React from 'react'
import { ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { TrendingUp, Users, BookOpen, Clock, Zap, Target, Wallet, CheckCircle2, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

/**
 * Generic Overview Card for key statistics.
 */
export function OverviewCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  isLoading,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  iconClassName?: string
  iconContainerClassName?: string
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconContainerClassName || 'bg-slate-100 text-slate-600'}`}>
          <Icon className={`w-4 h-4 ${iconClassName || ''}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-slate-900 mt-2">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Financial Card
 * Displays total and monthly revenue with currency localization.
 */
export function FinancialCard({
  title = "Total Revenue",
  total,
  monthly,
  currency = 'IDR',
  isLoading,
}: {
  title?: string
  total: number
  monthly?: number
  currency?: string
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  const formatValue = (val: number) => {
    return formatCurrency(val, currency)
  }

  return (
    <Card className="overflow-hidden border border-indigo-950/20 shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white group relative rounded-3xl">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-24 h-24 rotate-12" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">
          {title}
        </CardTitle>
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
          <TrendingUp className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-black tracking-tighter">
          {formatValue(total)}
        </div>
        {monthly && monthly > 0 ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
              +{formatValue(monthly)}
            </div>
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-tight">
              Performance this Month
            </span>
          </div>
        ) : null}

        <div className="h-[40px] mt-6 opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { v: 10 },
                { v: 15 },
                { v: 12 },
                { v: 25 },
                { v: 20 },
                { v: 35 },
              ]}
            >
              <Area
                type="monotone"
                dataKey="v"
                stroke="#fff"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Inventory Card
 * Displays total modules and total video time.
 */
export function InventoryCard({
  modules,
  videoTime,
  isLoading,
}: {
  modules: number
  videoTime: number
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  const hours = Math.floor(videoTime / 3600)
  const minutes = Math.floor((videoTime % 3600) / 60)

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Learning Volume
        </CardTitle>
        <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
          <BookOpen className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-black tracking-tight text-slate-900">
            {modules}
          </div>
          <div className="text-xs font-bold text-muted-foreground mb-1">
            Modules
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-slate-600">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-sm font-bold">
            {hours > 0 ? `${hours}+ hours` : `${minutes} minutes`}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight ml-auto">
            Video Content
          </span>
        </div>
        <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Conversion Card
 * Displays View vs Enroll and calculates Conversion Rate.
 */
export function ConversionCard({
  views,
  enrolled,
  isLoading,
}: {
  views: number
  enrolled: number
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  const conversionRate = views > 0 ? (enrolled / views) * 100 : 0

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Course Velocity
        </CardTitle>
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <Zap className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-slate-900">
          {conversionRate.toFixed(1)}%
        </div>
        <div className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-tight">
          Conversion Rate
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">
              Views
            </div>
            <div className="text-sm font-bold text-slate-800">
              {views.toLocaleString()}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex-1 text-right">
            <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">
              Enrollments
            </div>
            <div className="text-sm font-bold text-slate-800">
              {enrolled.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Health Card
 * Displays average progress as a Platform Health Meter.
 */
export function HealthCard({
  progress,
  isLoading,
}: {
  progress: number
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Platform Health
        </CardTitle>
        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
          <Target className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative size-16 flex items-center justify-center">
            <svg className="size-full rotate-[-90deg]">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="175.9"
                initial={{ strokeDashoffset: 175.9 }}
                animate={{ strokeDashoffset: 175.9 - (175.9 * progress) / 100 }}
                className="text-emerald-500"
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">
              {Math.round(progress)}%
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              Average Completion
            </div>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-1">
              Student engagement is{' '}
              <span className="text-emerald-600">higher than 65%</span> of
              benchmark.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Total Students Card
 * Displays total registered students.
 */
export function TotalStudentsCard({
  total,
  isLoading,
}: {
  total: number
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Total Students
        </CardTitle>
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <Users className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-slate-900 mt-2">
          {total.toLocaleString()}
        </div>
        <div className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">
          Registered Learners
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Active Courses Card
 * Displays total active courses available.
 */
export function ActiveCoursesCard({
  total,
  isLoading,
}: {
  total: number
  isLoading?: boolean
}) {
  if (isLoading) return <CardSkeleton />

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-3xl transition-all hover:border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Active Courses
        </CardTitle>
        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
          <BookOpen className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-slate-900 mt-2">
          {total.toLocaleString()}
        </div>
        <div className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">
          Published Courses
        </div>
      </CardContent>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card className="border border-slate-100 shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-2/3" />
        <div className="h-[40px] mt-4">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
