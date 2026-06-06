import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Zap,
  ArrowRight,
  BookOpen,
  Bell,
  Sparkles,
  Award,
  FileEdit,
  MailWarning,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/hooks/use-auth'
import { authService } from '@/services/auth.service'
import { userCourseService } from '@/services/user/course.service'
import { userCartService } from '@/services/user/cart.service'
import { userDashboardService } from '@/services/user/dashboard.service'

// Atomic Components
// Dashboard Components
import { StudentHero } from '@/components/user/dashboard/sections/student-hero'
import { StatsGrid } from '@/components/user/dashboard/sections/stats-grid'
import { CourseResumeList } from '@/components/user/dashboard/sections/course-resume-list'
import { CourseUpdates } from '@/components/user/dashboard/sections/course-updates'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { z } from 'zod'

const dashboardSearchSchema = z.object({
  page: z.number().catch(1).default(1),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  difficulty: z.string().optional(),
  sort_by: z.string().catch('newest').default('newest'),
  sort: z.string().catch('desc').default('desc'),
})

type DashboardSearchParams = z.infer<typeof dashboardSearchSchema>

function UserDashboard() {
  const user = useAuthStore((state) => state.user)
  const needsEmailVerification = !!user && !user.email_verified_at

  const navigate = useNavigate()
  const searchParams = Route.useSearch()

  const [isResending, setIsResending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      setIsResending(true)
      await authService.resendVerification()
      toast.success('Verification email sent!')
      setCooldown(120)
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('Please wait before requesting another email.')
        setCooldown(120)
      } else {
        toast.error(err.response?.data?.message || 'Failed to resend verification email.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', 'courses', 'enrolled', searchParams],
    queryFn: () => userCourseService.getAll({ 
      ...searchParams,
      limit: 12 // Optimized for 4-column grid
    }),
  })

  const extendMutation = useMutation({
    mutationFn: (courseUuid: string) =>
      userCartService.addItem({ id: courseUuid, type: 'course' }),
    onSuccess: () => {
      toast.success('Course added to cart', {
        description: 'Redirecting to secure checkout...',
      })
      navigate({ to: '/checkout' })
    },
    onError: () => {
      toast.error('Failed to initiate extension', {
        description: 'Please try again or contact support.',
      })
    },
  })

  const handleExtendAccess = (uuid: string) => {
    extendMutation.mutate(uuid)
  }

  const { data: dashboardData } = useQuery({
    queryKey: ['user', 'dashboard'],
    queryFn: () => userDashboardService.getSummary(),
  })
  
  const handleFilterChange = (updates: Partial<DashboardSearchParams>) => {
    navigate({
      to: '/student/dashboard',
      search: (prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }),
    })
  }

  const courses = data?.data || []

  const dashboardStats = React.useMemo(() => {
    const activeCount = courses.length
    return {
      activeCourses: activeCount,
      completedModules: courses.reduce(
        (acc, c) =>
          acc + (c.modules?.filter((m) => m.is_completed)?.length || 0),
        0,
      ),
      dailyTime: 'Active Session',
      gpa: dashboardData?.gpa ?? 0,
    }
  }, [courses, dashboardData])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="size-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <Zap className="size-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Couldn't Load Your Courses
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            We had trouble loading your courses. Please try again.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-xl font-bold h-11 px-8"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-20"
    >
      <StudentHero
        name={user?.name || 'Student'}
        progress={dashboardData?.completion_rate || 0}
        streak={dashboardData?.streak || 0}
        onResume={() => {
          if (courses.length > 0) {
            navigate({
              to: '/student/learn/$courseUuid',
              params: { courseUuid: courses[0].slug || courses[0].id },
              search: { tab: 'overview' },
            })
          }
        }}
        isLoading={isLoading}
      />

      {needsEmailVerification && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
            <MailWarning className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 text-sm">Your email is not verified</h3>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              You need to verify your email to unlock checkout, certificates, and premium features.
              Check your inbox or resend the verification email.
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 shrink-0 w-full sm:w-auto"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
          >
            {isResending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem] bg-[#F0F7FF]/50" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={dashboardStats} />
      )}

      {isLoading ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col h-full border border-slate-100 shadow-sm overflow-hidden bg-white rounded-[2rem]">
                <div className="aspect-video relative overflow-hidden bg-slate-50">
                  <Skeleton className="w-full h-full rounded-none" />
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                  <div className="pt-4 mt-auto border-t border-slate-50 flex flex-col gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : courses.length === 0 && !searchParams.search && !searchParams.category ? (
        <EmptyCoursesState onBrowse={() => navigate({ to: '/' })} />
      ) : (
        <CourseResumeList
          onExtend={handleExtendAccess}
          onFilterChange={handleFilterChange}
          searchParams={searchParams}
          meta={data?.meta}
          courses={courses.map((c) => {
            const totalModules = c.modules?.length || c.modules_count || 0
            const completedModules =
              c.modules?.filter((m) => m.is_completed)?.length || 0

            const progress = c.progress_percentage ?? 0

            return {
              id: c.id,
              slug: c.slug || c.id,
              title: c.title,
              category: (c.category as any)?.name || 'Course',
              progress,
              thumbnail: c.thumbnail,
              remainingDays: c.remaining_days,
              enrollment_uuid: c.enrollment_uuid,
              lessonsLeft:
                totalModules > 0
                  ? Math.max(0, totalModules - completedModules)
                  : undefined,
              rating: c.summary?.stats?.average_rating || 0,
              reviewsCount: c.summary?.stats?.total_reviews || 0,
              duration: c.summary?.stats?.total_duration || '0m',
              lecturesCount: totalModules,
              priceFormatted: 'Enrolled',
              is_active: c.is_active,
            }
          })}
        />
      )}

      <div className="pt-8 border-t border-[#056FAE]/10">
        <h4 className="text-xl md:text-2xl font-black text-[#0D3A6E] tracking-tight mb-8">
          Your Progress
        </h4>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-8">
            {courses.length > 0 && (
              <ActivityTimeline courses={courses} recentActivities={dashboardData?.recent_activities} />
            )}
            <BrowseMoreButton onBrowse={() => navigate({ to: '/' })} />
          </div>

          <div className="space-y-8">
            <CertificatesWidget 
              total={dashboardData?.total_certificates} 
              onView={() => navigate({ to: '/student/profile' })} 
            />
          </div>

          <div className="space-y-8">
            <PendingAssignmentsWidget 
              count={dashboardData?.pending_assignments_count} 
              onGoToCourse={() => {
                if (courses.length > 0) {
                  navigate({
                    to: '/student/learn/$courseUuid',
                    params: { courseUuid: courses[0].slug || courses[0].id },
                    search: { tab: 'overview' },
                  })
                } else {
                  navigate({ to: '/' })
                }
              }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- Atomic Components ---

function EmptyCoursesState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="relative overflow-hidden bg-[#F0F7FF] rounded-[2rem] p-20 text-center space-y-8 border border-[#056FAE]/10 shadow-sm group">
      <div className="absolute top-0 right-0 p-10 opacity-5 text-[#056FAE] pointer-events-none group-hover:scale-150 transition-transform duration-1000">
        <Sparkles className="size-40" />
      </div>
      <div className="size-24 bg-white rounded-2xl flex items-center justify-center text-[#056FAE] mx-auto shadow-sm border border-[#056FAE]/10 group-hover:scale-110 transition-transform">
        <BookOpen className="size-12" />
      </div>
      <div className="space-y-4 relative z-10">
        <h3 className="text-3xl md:text-4xl font-black text-[#0D3A6E] tracking-tight">
          Ready to Start Learning?
        </h3>
        <p className="text-[#0D3A6E]/70 font-bold max-w-sm mx-auto text-balance text-lg">
          You haven't enrolled in any courses yet. Browse our catalog and
          find the right course for you.
        </p>
      </div>
      <Button
        onClick={onBrowse}
        className="h-14 px-10 rounded-xl bg-[#70C942] text-white hover:bg-[#70C942]/90 active:scale-95 transition-all text-xs font-black uppercase tracking-widest gap-3 shadow-lg shadow-[#70C942]/20 border-0"
      >
        Browse Courses <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

function ActivityTimeline({ courses, recentActivities }: { courses: any[], recentActivities?: any[] }) {
  return (
    <div className="bg-white border border-[#056FAE]/10 rounded-[2rem] p-8 space-y-6 shadow-xl shadow-[#056FAE]/5">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-[#056FAE]/60 uppercase tracking-[0.3em] pl-1">
          Recent Activity
        </h4>
        <Bell className="size-4 text-[#056FAE]" />
      </div>
      <div className="space-y-4">
        {recentActivities?.length ? (
          recentActivities.map((activity: any) => (
            <div key={activity.id} className="space-y-1">
              <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest truncate bg-[#F0F7FF] px-2 py-0.5 rounded-md w-fit">
                {activity.type || 'Activity'}
              </p>
              <p className="text-sm font-bold text-[#0D3A6E]">
                {activity.description}
              </p>
            </div>
          ))
        ) : (
          courses.slice(0, 2).map((course) => (
            <div key={course.id} className="space-y-3">
              <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest truncate bg-[#F0F7FF] px-2 py-0.5 rounded-md w-fit">
                {course.title}
              </p>
              <CourseUpdates courseUuid={course.id} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function BrowseMoreButton({ onBrowse }: { onBrowse: () => void }) {
  return (
    <button
      onClick={onBrowse}
      className="w-full h-16 rounded-[2rem] border-2 border-dashed border-[#056FAE]/20 text-[#056FAE]/60 font-black uppercase tracking-widest hover:border-[#056FAE] hover:text-[#056FAE] hover:bg-[#F0F7FF] transition-all text-xs group shadow-sm"
    >
      Browse More Courses{' '}
      <ArrowRight className="inline-block ml-2 size-4 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}

function CertificatesWidget({ total, onView }: { total?: number, onView: () => void }) {
  if (!total || total <= 0) return null

  return (
    <div className="bg-gradient-to-br from-[#0A2E59] to-[#0D3A6E] rounded-[2rem] p-8 space-y-6 shadow-2xl text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#056FAE]/30 to-transparent" />
      <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-[#056FAE]/30 rounded-full blur-[100px]" />
      <div className="relative z-10 space-y-4">
        <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
          <Award className="size-6 text-[#70C942]" />
        </div>
        <div>
          <h4 className="text-2xl font-black tracking-tight text-white">
            {total} Certificates
          </h4>
          <p className="text-[#F0F7FF]/70 font-bold text-sm mt-1">
            You've successfully completed your courses.
          </p>
        </div>
        <Button 
          onClick={onView}
          className="w-full h-12 bg-[#F0F7FF] text-[#0D3A6E] hover:bg-white font-black uppercase tracking-widest text-xs rounded-xl mt-2"
        >
          View Certificates
        </Button>
      </div>
    </div>
  )
}

function PendingAssignmentsWidget({ count, onGoToCourse }: { count?: number, onGoToCourse: () => void }) {
  if (!count || count <= 0) return null

  return (
    <div className="bg-[#FFF8E6] border border-[#FFD966]/40 rounded-[2rem] p-8 space-y-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="size-12 bg-[#FFD966]/20 rounded-2xl flex items-center justify-center text-[#B38000] shrink-0">
          <FileEdit className="size-6" />
        </div>
        <div>
          <h4 className="text-lg font-black text-[#4D3800] tracking-tight uppercase">
            Quizzes to Complete
          </h4>
          <p className="text-[#805D00] font-bold text-sm mt-1">
            You have <span className="font-black">{count}</span> quiz(zes) waiting for you.
          </p>
        </div>
      </div>
      <Button 
        onClick={onGoToCourse}
        className="w-full h-12 bg-[#B38000] hover:bg-[#996D00] text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-[#B38000]/20"
      >
        Go to Course <ArrowRight className="inline-block ml-2 size-4" />
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/student/dashboard')({
  validateSearch: dashboardSearchSchema,
  component: UserDashboard,
})
