import * as React from 'react'
import {
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  LineChart,
  AreaChart,
  ComposedChart,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { Activity, Percent, Layers, MousePointer2 } from 'lucide-react'

const commonAxis = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 10, fontWeight: 800, fill: '#94a3b8' },
  dy: 10,
}

interface ChartProps {
  data: any[]
}

// 1. EFFICIENCY PULSE (Focuses purely on Conversion %)
export function EfficiencyPulseChart({ data }: ChartProps) {
  const processedData = React.useMemo(
    () =>
      data.map((d) => ({
        ...d,
        rate:
          d.views > 0
            ? Number(((d.enrollments / d.views) * 100).toFixed(1))
            : 0,
      })),
    [data],
  )

  const config = {
    rate: { label: 'Conv. Rate %', color: '#10B981' },
  } satisfies ChartConfig

  return (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Percent className="size-4" />
          </div>
          <CardTitle className="text-sm font-black">Efficiency Pulse</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={config} className="h-[200px] w-full">
          <LineChart data={processedData}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-slate-100"
            />
            <XAxis
              dataKey="date"
              {...commonAxis}
              tickFormatter={(v) => format(parseISO(v), 'MM/dd')}
            />
            <YAxis {...commonAxis} tickFormatter={(v) => `${v}%`} width={35} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              type="stepAfter"
              dataKey="rate"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// 2. DIRECT COMPARISON (Grouped Bars)
export function GroupedBarVariant({ data }: ChartProps) {
  const config = {
    views: { label: 'Views', color: '#CBD5E1' },
    enrollments: { label: 'Acquisition', color: '#6366F1' },
  } satisfies ChartConfig

  return (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
            <Layers className="size-4" />
          </div>
          <CardTitle className="text-sm font-black">
            Direct Comparison
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={config} className="h-[200px] w-full">
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-slate-100"
            />
            <XAxis
              dataKey="date"
              {...commonAxis}
              tickFormatter={(v) => format(parseISO(v), 'MM/dd')}
            />
            <YAxis {...commonAxis} width={35} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="views" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="enrollments" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// 3. DUAL-SCALE NAVIGATOR (Independent Scales)
export function DualScaleChart({ data }: ChartProps) {
  const config = {
    views: { label: 'Views (L)', color: '#3B82F6' },
    enrollments: { label: 'Enr (R)', color: '#6366F1' },
  } satisfies ChartConfig

  return (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Activity className="size-4" />
          </div>
          <CardTitle className="text-sm font-black">
            Dual-Scale Navigator
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={config} className="h-[200px] w-full">
          <ComposedChart data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-slate-100"
            />
            <XAxis
              dataKey="date"
              {...commonAxis}
              tickFormatter={(v) => format(parseISO(v), 'MM/dd')}
            />
            <YAxis yAxisId="left" {...commonAxis} width={35} />
            <YAxis
              yAxisId="right"
              orientation="right"
              {...commonAxis}
              width={35}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="views"
              fill="#3B82F6"
              fillOpacity={0.05}
              stroke="#3B82F6"
              strokeWidth={1}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="enrollments"
              stroke="#6366F1"
              strokeWidth={4}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
