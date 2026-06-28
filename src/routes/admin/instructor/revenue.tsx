import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { adminInstructorService } from '@/services/admin/instructor.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIDR } from '@/lib/currency'

export const Route = createFileRoute('/admin/instructor/revenue')({
  component: InstructorRevenuePage,
})

function InstructorRevenuePage() {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['admin', 'instructor', 'revenue'],
    queryFn: () => adminInstructorService.getRevenue(),
  })

  if (isLoading) {
    return (
      <AdminPage
        title="Instructor Revenue"
      >
        <div className="flex h-96 items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Loading revenue data...
          </span>
        </div>
      </AdminPage>
    )
  }

  const stats = revenueData?.stats
  const breakdown = revenueData?.breakdown || []

  return (
    <AdminPage
      title="Instructor Revenue"
    >
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="rounded-2xl border-border shadow-sm bg-card admin-theme overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {formatIDR(stats?.total_revenue || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm bg-card admin-theme overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Total Sales
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {stats?.total_sales || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm bg-card admin-theme overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Active Students
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {stats?.total_students || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border shadow-sm bg-card admin-theme overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Active Courses
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <BookOpen className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {stats?.total_courses || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card className="rounded-2xl border-border shadow-sm bg-card admin-theme overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <CardTitle className="text-sm font-bold text-foreground">Revenue by Course</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4 text-right">Sales Count</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.length > 0 ? (
                  breakdown.map((item, idx) => (
                    <tr
                      key={item.course_uuid}
                      className="border-b border-border/50 hover:bg-muted/10 transition-colors last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {item.course_title}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-muted-foreground">
                        {item.sales_count}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {formatIDR(item.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        No revenue data found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  )
}
