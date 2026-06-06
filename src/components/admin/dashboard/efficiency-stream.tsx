import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, Zap, ArrowDownLeft, Target } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

interface StreamChartProps {
  period: string
}

const chartConfig = {
  captured: {
    label: 'Captured (Enrolled)',
    color: '#6366F1',
  },
  lost: {
    label: 'Lost Opportunity',
    color: '#F1F5F9',
  },
} satisfies ChartConfig

export function EfficiencyStreamChart({ period }: StreamChartProps) {
  const { data: trends = [], isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'trends', 'stream', period],
    queryFn: () => adminDashboardService.getTrends({ period }),
    staleTime: 60000,
  })

  // Transform data into a percentage-based "Efficiency Stream"
  const streamData = React.useMemo(() => {
    return trends.map((d) => {
      const views = Number(d.views || 0)
      const enrollments = Number(d.enrollments || 0)
      const total = Math.max(views, enrollments) // Usually views > enrollments

      if (total === 0) return { ...d, captured: 0, lost: 100 }

      const capturedPercent = (enrollments / total) * 100
      const lostPercent = 100 - capturedPercent

      return {
        date: d.date,
        captured: capturedPercent,
        lost: lostPercent,
        rawViews: views,
        rawEnrollments: enrollments,
      }
    })
  }, [trends])

  return (
    <Card className="col-span-full rounded-[48px] border-none shadow-2xl bg-slate-950 text-white overflow-hidden relative group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-500/20 transition-all duration-1000" />

      <CardHeader className="p-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                <Target className="size-6" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black tracking-tighter">
                  Efficiency Stream
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                  Conversion Health Analysis
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                Status
              </span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-2">
                <Zap className="size-4 fill-emerald-400" /> High Performance
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative z-10">
        {isLoading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full bg-white/5" />
          </div>
        ) : (
          <div className="relative">
            <ChartContainer config={chartConfig} className="h-[450px] w-full">
              <AreaChart
                data={streamData}
                stackOffset="expand"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="capturedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E293B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E293B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[32px] shadow-2xl min-w-[240px] animate-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                          {format(parseISO(data.date), 'MMMM do, yyyy')}
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                              <div className="size-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                              <span className="text-xs font-bold text-white">
                                Efficiency
                              </span>
                            </div>
                            <span className="text-xl font-black text-white tabular-nums">
                              {data.captured.toFixed(1)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                Views
                              </span>
                              <span className="text-sm font-black text-white">
                                {data.rawViews}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                                Enrolled
                              </span>
                              <span className="text-sm font-black text-indigo-400">
                                {data.rawEnrollments}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="captured"
                  stackId="1"
                  stroke="#818CF8"
                  strokeWidth={2}
                  fill="url(#capturedGradient)"
                  animationDuration={2500}
                />
                <Area
                  type="monotone"
                  dataKey="lost"
                  stackId="1"
                  stroke="transparent"
                  fill="url(#lostGradient)"
                />
              </AreaChart>
            </ChartContainer>

            {/* Absolute Date Markers */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between pointer-events-none">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Period Start
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {format(
                    parseISO(streamData[0]?.date || new Date().toISOString()),
                    'MMM dd, yyyy',
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Period End
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {format(
                    parseISO(
                      streamData[streamData.length - 1]?.date ||
                        new Date().toISOString(),
                    ),
                    'MMM dd, yyyy',
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
