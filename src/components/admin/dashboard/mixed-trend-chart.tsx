import * as React from 'react'
import {
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
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
import { BarChart, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

interface MixedTrendChartProps {
  period: string
}

const chartConfig = {
  views: {
    label: 'Traffic (Views)',
    color: 'hsl(var(--muted-foreground) / 0.1)',
  },
  enrollments: {
    label: 'Acquisition (Enrollments)',
    color: '#6366F1',
  },
} satisfies ChartConfig

export function MixedTrendChart({ period }: MixedTrendChartProps) {
  const { data: trends = [], isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'trends', 'mixed', period],
    queryFn: () => adminDashboardService.getTrends({ period }),
    staleTime: 60000,
  })

  return (
    <Card className="col-span-full lg:col-span-8 rounded-[40px] border-none shadow-2xl bg-white overflow-hidden group">
      <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-slate-50 rounded-2xl">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              Volume vs. Velocity
            </CardTitle>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 animate-pulse">
              Executive View
            </div>
          </div>
          <CardDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-12">
            Traffic Bars vs. Enrollment Trend
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 pt-10 pb-8">
        {isLoading ? (
          <div className="h-[350px] w-full flex items-end gap-3 px-6">
            {[30, 60, 45, 80, 55, 40, 70, 25, 50, 65, 30, 75].map(
              (height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-2xl bg-slate-50"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ComposedChart
              data={trends}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            >
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
                cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) =>
                      format(parseISO(label), 'EEEE, MMMM do')
                    }
                    formatter={(value, name, item) => {
                      const isEnrollment = name === 'enrollments'
                      const views = Number(item.payload.views || 0)
                      const enrollments = Number(item.payload.enrollments || 0)
                      const convRate =
                        views > 0 ? ((enrollments / views) * 100).toFixed(1) : 0

                      return (
                        <div className="flex flex-col gap-2 py-1">
                          <div className="flex items-center justify-between gap-12">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {name}
                            </span>
                            <span
                              className={`text-sm font-black ${isEnrollment ? 'text-indigo-600' : 'text-slate-900'}`}
                            >
                              {value.toLocaleString()}
                            </span>
                          </div>
                          {isEnrollment && views > 0 && (
                            <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Efficiency
                              </span>
                              <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                                {convRate}% <ArrowUpRight className="size-3" />
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    }}
                    className="rounded-[32px] border-none shadow-2xl bg-white/95 backdrop-blur-xl p-6 min-w-[200px]"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                radius={[8, 8, 0, 0]}
                barSize={30}
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="#6366F1"
                strokeWidth={5}
                dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
