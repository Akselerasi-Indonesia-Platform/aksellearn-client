import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { adminDashboardService } from '@/services/admin/dashboard.service'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, Database, ArrowUpRight } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

interface TrendChartProps {
  period: string
}

const chartConfig = {
  views: {
    label: 'Views',
    color: '#3B82F6',
  },
  enrollments: {
    label: 'Enrollments',
    color: '#6366F1',
  },
} satisfies ChartConfig

export function TrendChart({ period }: TrendChartProps) {
  // Now using a single query as the BE returns both metrics automatically
  const { data: trends = [], isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'trends', period],
    queryFn: () => adminDashboardService.getTrends({ period }),
    staleTime: 60000,
  })

  return (
    <Card className="col-span-full lg:col-span-8 rounded-[40px] border-none shadow-2xl bg-white overflow-hidden group">
      <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-2xl">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              Conversion Dynamics
            </CardTitle>
            {!isLoading && trends.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <Database className="w-3 h-3" />
                {trends.length} Days Synced
              </div>
            )}
          </div>
          <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-12">
            Traffic vs Acquisition Performance
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 pt-10 pb-8">
        {isLoading ? (
          <div className="h-[350px] w-full flex items-end gap-3 px-6">
            {[40, 70, 45, 90, 65, 50, 80, 35, 60, 75, 40, 85].map(
              (height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-2xl bg-slate-50"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        ) : trends.length === 0 ? (
          <div className="h-[350px] flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <TrendingUp className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="font-black text-slate-800 text-xl">
              No Data Stream
            </h3>
            <p className="text-slate-400 font-bold text-sm max-w-xs mt-2">
              We are currently waiting for interaction data to populate this
              growth chart.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart
              data={trends}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorEnrollments"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-slate-100"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                dy={15}
                tickFormatter={(val) => {
                  try {
                    const date = parseISO(val)
                    if (!isValid(date)) return val
                    return format(date, 'MMM dd')
                  } catch (e) {
                    return val
                  }
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                tickFormatter={(value) => value.toLocaleString()}
                width={40}
              />
              <ChartTooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      try {
                        return format(parseISO(label), 'EEEE, MMMM do')
                      } catch (e) {
                        return label
                      }
                    }}
                    formatter={(value, name, item) => {
                      const isEnrollment = name === 'enrollments'
                      const views = Number(item.payload.views || 0)
                      const enrollments = Number(item.payload.enrollments || 0)
                      const convRate =
                        views > 0 ? ((enrollments / views) * 100).toFixed(1) : 0

                      return (
                        <div className="flex flex-col gap-1.5 py-1">
                          <div className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                              <div
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: isEnrollment
                                    ? '#6366F1'
                                    : '#3B82F6',
                                }}
                              />
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                {name}
                              </span>
                            </div>
                            <span className="text-sm font-black text-slate-900">
                              {value.toLocaleString()}
                            </span>
                          </div>
                          {isEnrollment && views > 0 && (
                            <div className="mt-1 pt-1 border-t border-slate-50 flex items-center justify-between text-[10px] font-black">
                              <span className="text-slate-400 uppercase tracking-tight">
                                Conversion
                              </span>
                              <span className="text-indigo-600 flex items-center gap-0.5">
                                {convRate}%{' '}
                                <ArrowUpRight className="size-2.5" />
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    }}
                    className="rounded-[32px] border-none shadow-2xl bg-white/95 backdrop-blur-xl p-6 min-w-[220px] border border-slate-50"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#6366F1"
                strokeWidth={5}
                fillOpacity={1}
                fill="url(#colorEnrollments)"
                animationDuration={1500}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#6366F1' }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
