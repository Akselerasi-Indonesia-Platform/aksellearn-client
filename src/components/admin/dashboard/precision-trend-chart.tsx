import * as React from 'react'
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { adminDashboardService } from '@/services/admin/dashboard.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO, isValid } from 'date-fns'
import { getUser } from '@/lib/auth'

interface PrecisionChartProps {
  period?: string
  month?: number
  year?: number
  course_uuid?: string
  date_from?: string
  date_to?: string
}

export function PrecisionTrendChart({
  period,
  month,
  year,
  course_uuid,
  date_from,
  date_to,
}: PrecisionChartProps) {
  // Identify if the active user is an instructor
  const user = getUser()
  const isInstructor = React.useMemo(() => {
    if (!user) return false
    return user.roles?.some((role: any) => {
      const name = typeof role === 'string' ? role : role.name
      return name === 'Teacher' || name === 'Instructor'
    })
  }, [user])

  const { data: rawTrends = [], isLoading } = useQuery({
    queryKey: [
      'admin',
      'dashboard',
      'trends',
      'precision',
      period,
      month,
      year,
      course_uuid,
      date_from,
      date_to,
    ],
    queryFn: () =>
      adminDashboardService.getTrends({
        period,
        month,
        year,
        course_uuid,
        date_from,
        date_to,
      }),
    staleTime: 60000,
  })

  // Map and divide earnings by 100 for proper display units
  const trends = React.useMemo(() => {
    if (!isInstructor) return rawTrends
    return rawTrends.map((item: any) => ({
      ...item,
      earnings: (item.earnings || 0) / 100,
    }))
  }, [rawTrends, isInstructor])

  const chartConfig = React.useMemo<ChartConfig>(() => {
    if (isInstructor) {
      return {
        earnings: {
          label: 'Earnings',
          color: '#10b981',
        },
        orders: {
          label: 'Orders',
          color: '#6366f1',
        },
      } as ChartConfig
    }
    return {
      views: {
        label: 'Views',
        color: '#94a3b8',
      },
      enrollments: {
        label: 'Enrollments',
        color: '#2563eb',
      },
    } as ChartConfig
  }, [isInstructor])

  const leftTickFormatter = (v: any): string => {
    if (isInstructor) {
      if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `Rp ${(v / 1000).toFixed(0)}k`
      return `Rp ${v}`
    }
    return v >= 1000 ? `${v / 1000}k` : String(v)
  }

  const leftLabelFormatter = (v: any) => {
    if (v <= 0) return ''
    if (isInstructor) {
      if (v >= 1000000) return `Rp ${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `Rp ${(v / 1000).toFixed(0)}k`
      return `Rp ${v}`
    }
    return v.toLocaleString()
  }

  return (
    <Card className="col-span-full rounded-[24px] border border-slate-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            {isInstructor ? 'Earnings & Sales Trends' : 'Course Analytics'}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        {isLoading ? (
          <div className="h-[400px] w-full flex items-end gap-3 px-6 pb-10">
            {[20, 50, 35, 70, 45, 30, 60, 15, 40, 55, 20, 65].map(
              (height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-lg bg-slate-50"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
        ) : (
          <div className="h-[450px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={trends}
                margin={{ top: 40, right: 40, left: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={15}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(val) => {
                    try {
                      const date = parseISO(val)
                      if (!isValid(date)) return val
                      return format(date, 'd MMM')
                    } catch (e) {
                      return val
                    }
                  }}
                />

                {/* Left Axis: Views or Earnings */}
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isInstructor ? '#10b981' : '#94a3b8' }}
                  tickFormatter={leftTickFormatter}
                />

                {/* Right Axis: Enrollments or Orders */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isInstructor ? '#6366f1' : '#2563eb' }}
                  tickFormatter={(v) => v}
                />

                <Tooltip
                  content={
                    <ChartTooltipContent className="rounded-xl shadow-xl border-slate-100" />
                  }
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '0',
                    paddingBottom: '30px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={isInstructor ? 'earnings' : 'views'}
                  stroke={isInstructor ? '#10b981' : '#94a3b8'}
                  strokeWidth={2}
                  dot={{ r: 4, fill: isInstructor ? '#10b981' : '#94a3b8', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey={isInstructor ? 'earnings' : 'views'}
                    position="top"
                    offset={15}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fill: '#1e293b',
                    }}
                    formatter={leftLabelFormatter}
                  />
                </Line>

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={isInstructor ? 'orders' : 'enrollments'}
                  stroke={isInstructor ? '#6366f1' : '#2563eb'}
                  strokeWidth={2}
                  dot={{ r: 4, fill: isInstructor ? '#6366f1' : '#2563eb', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2000}
                >
                  <LabelList
                    dataKey={isInstructor ? 'orders' : 'enrollments'}
                    position="bottom"
                    offset={15}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fill: '#1e293b',
                    }}
                    formatter={(v: any) => (v > 0 ? v.toLocaleString() : '')}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
