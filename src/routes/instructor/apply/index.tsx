import * as React from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { useAuthStore } from '@/hooks/use-auth'
import { ApplicationForm } from '@/components/instructor/application-form'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/instructor/apply/')({
  beforeLoad: ({ location }) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: InstructorApplyPage,
})

function InstructorApplyPage() {
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ['instructor-status'],
    queryFn: () => instructorApplicationService.getStatus(),
  })

  const status = statusData?.data?.status
  const reapplyAfter = statusData?.data?.reapply_after
  const submittedAt = statusData?.data?.created_at

  const { user } = useAuthStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user?.roles?.includes('Instructor')) {
      navigate({ to: '/admin/dashboard', replace: true })
      return
    }

    if (!isLoading && status) {
      if (status === 'pending' || status === 'under_review' || status === 'accepted') {
        navigate({ to: '/instructor/apply/status', replace: true })
      } else if (status === 'rejected' && reapplyAfter && new Date(reapplyAfter) > new Date()) {
        navigate({ to: '/instructor/apply/status', replace: true })
      }
    }
  }, [user, status, isLoading, reapplyAfter, navigate])

  const renderContent = () => {
    if (isLoading) {
      return <div className="py-24 text-center text-lg text-gray-500">Loading your application status...</div>
    }

    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Instructor Application</h1>
          <p className="text-lg text-gray-500">Tell us about your expertise and teaching experience.</p>
        </div>
        <ApplicationForm onSuccess={() => {
          refetch().then(() => {
            navigate({ to: '/instructor/apply/status', replace: true })
          })
        }} />
      </div>
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
