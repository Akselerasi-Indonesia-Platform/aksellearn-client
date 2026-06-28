import * as React from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Users,
  BookOpen,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from 'lucide-react'

import { getUser, can } from '@/lib/auth'
import { adminFinanceService } from '@/services/admin/finance.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { FinancialCard, OverviewCard } from '@/components/admin/dashboard/stats-cards'

export const Route = createFileRoute('/admin/finance/revenue')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const user = getUser()
    // Explicit permission check for platform finance
    const canView = can('platform_finance.read', user) || can('super.admin', user) || can('manage_all', user)
    
    if (!canView) {
      throw redirect({
        to: '/not-found' as any,
        replace: true,
      })
    }
  },
  component: PlatformFinancePage,
})

function PlatformFinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'finance', 'revenue-summary'],
    queryFn: () => adminFinanceService.getPlatformFinanceSummary(),
  })

  const financials = data?.financials
  const metrics = data?.metrics

  return (
    <AdminPage
      title="Platform Finance"
      description="Global financial overview, GMV, and platform health."
      headerAction={null}
    >
      <div className="space-y-6">
        {/* Top Level GMV (Gross Merchandise Value) */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <FinancialCard
            title="Total GMV (Gross Merchandise Value)"
            total={financials?.total_gmv || 0}
            currency="IDR"
            isLoading={isLoading}
          />
        </div>

        {/* Financial Breakdown */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <OverviewCard
              title="Platform Fees Earned"
              value={`Rp ${(financials?.total_platform_fees || 0).toLocaleString('id-ID')}`}
              icon={Building}
              iconContainerClassName="bg-blue-100 text-blue-600"
              isLoading={isLoading}
            />
            <OverviewCard
              title="Instructor Earnings"
              value={`Rp ${(financials?.total_instructor_earnings || 0).toLocaleString('id-ID')}`}
              icon={Users}
              iconContainerClassName="bg-emerald-100 text-emerald-600"
              isLoading={isLoading}
            />
            <OverviewCard
              title="Pending Withdrawals"
              value={`Rp ${(financials?.total_pending_withdrawals || 0).toLocaleString('id-ID')}`}
              icon={Clock}
              iconContainerClassName="bg-amber-100 text-amber-600"
              isLoading={isLoading}
            />
            <OverviewCard
              title="Completed Withdrawals"
              value={`Rp ${(financials?.total_completed_withdrawals || 0).toLocaleString('id-ID')}`}
              icon={CheckCircle2}
              iconContainerClassName="bg-purple-100 text-purple-600"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Platform Metrics */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8">Platform Activity Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OverviewCard
              title="Total Completed Orders"
              value={metrics?.total_orders || 0}
              icon={ShoppingBag}
              iconContainerClassName="bg-indigo-100 text-indigo-600"
              isLoading={isLoading}
            />
            <OverviewCard
              title="Active Courses"
              value={metrics?.total_courses || 0}
              icon={BookOpen}
              iconContainerClassName="bg-pink-100 text-pink-600"
              isLoading={isLoading}
            />
            <OverviewCard
              title="Total Enrollments"
              value={metrics?.total_enrollments || 0}
              icon={Users}
              iconContainerClassName="bg-orange-100 text-orange-600"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </AdminPage>
  )
}
