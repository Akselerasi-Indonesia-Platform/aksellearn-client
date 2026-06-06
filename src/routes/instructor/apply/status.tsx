import * as React from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { useAuthStore } from '@/hooks/use-auth'
import { ApplicationStatusCard } from '@/components/instructor/application-status-card'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/instructor/apply/status')({
  beforeLoad: ({ location }) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: InstructorApplyStatusPage,
})

function InstructorApplyStatusPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['instructor-status'],
    queryFn: () => instructorApplicationService.getStatus(),
  })

  const status = statusData?.data?.status
  const reapplyAfter = statusData?.data?.reapply_after
  const submittedAt = statusData?.data?.created_at
  const rejectionNote = statusData?.data?.rejection_note

  React.useEffect(() => {
    if (user?.roles?.includes('Instructor')) {
      navigate({ to: '/admin/dashboard', replace: true })
      return
    }

    if (!isLoading && !status) {
      // If there's no status, redirect back to apply
      navigate({ to: '/instructor/apply', replace: true })
    }
  }, [user, status, isLoading, navigate])

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-24 text-center text-lg text-gray-500">Loading your application status...</div>
    }

    if (!status) return null

    return (
      <ApplicationStatusCard 
        status={status} 
        reapplyAfter={reapplyAfter} 
        submittedAt={submittedAt}
        rejectionNote={rejectionNote}
      />
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 py-12 px-4">
        {renderContent()}
      </div>
    </PublicLayout>
  )
}
