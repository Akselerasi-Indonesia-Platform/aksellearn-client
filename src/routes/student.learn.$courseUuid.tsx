import * as React from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import type { CourseVideoPlayerController } from '@/components/user/course/video/course-video-player'
import { CourseSyllabusSidebar } from '@/components/user/course/navigation/course-syllabus-sidebar'
import { CourseLearnHeader } from '@/components/user/course/layout/course-learn-header'
import { CourseLockedState } from '@/components/user/course/layout/course-locked-state'
import { CoursePlayerArea } from '@/components/user/course/layout/course-player-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { CourseCertificateModal } from '@/components/user/course/ui/course-certificate-modal'
import { userNoteService } from '@/services/user/note.service'

import { useCourseLearnData } from '@/hooks/use-course-learn-data'
import { useCourseMutations } from '@/hooks/use-course-mutations'
import { useCourseCelebration } from '@/hooks/use-course-celebration'
import { useCourseModuleNavigation } from '@/hooks/use-course-module-navigation'

import { CourseOverviewTab } from '@/components/user/course/tabs/course-overview-tab'
import { CourseResourcesTab } from '@/components/user/course/tabs/course-resources-tab'
import { CourseUpdatesTab } from '@/components/user/course/tabs/course-updates-tab'
import { CourseDiscussionTab } from '@/components/user/course/tabs/course-discussion-tab'
import { CourseNotesTab } from '@/components/user/course/tabs/course-notes-tab'
import { CourseReviewTab } from '@/components/user/course/tabs/course-review-tab'

function CourseDetailPage() {
  const { courseUuid: urlCourseId } = useParams({ from: '/student/learn/$courseUuid' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = getUser()
  const { tab = 'overview' } = Route.useSearch()

  const [isCertModalOpen, setIsCertModalOpen] = React.useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [playerController, setPlayerController] =
    React.useState<CourseVideoPlayerController | null>(null)

  const {
    course,
    courseUuid,
    announcements,
    comments,
    certificate,
    isLoading,
    isError,
    refetch,
  } = useCourseLearnData(urlCourseId)

  const {
    postCommentMutation,
    postReviewMutation,
    deleteCommentMutation,
    updateCommentMutation,
    toggleCommentLikeMutation,
    extendMutation,
  } = useCourseMutations(courseUuid, urlCourseId)

  useCourseCelebration(course?.modules, courseUuid)

  const {
    activeModule,
    setActiveModule,
    isLastModule,
    handleModuleComplete,
    handleNextModule,
    isQuiz,
    isAssignment,
    isIntro,
    activeModuleUuid,
    activeTitle,
    activeVideo,
    activeContent,
  } = useCourseModuleNavigation({
    course,
    urlCourseId,
    setIsCertModalOpen,
  })

  // Polling logic when video is pending or processing
  const activeVideoData = isIntro
    ? course?.video_data
    : typeof activeModule !== 'string'
      ? activeModule?.video_data
      : undefined

  const videoStatus = activeVideoData?.status

  React.useEffect(() => {
    if (videoStatus === 'pending' || videoStatus === 'processing') {
      const interval = setInterval(() => {
        refetch()
      }, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [videoStatus, refetch])

  // Toast transition notifications
  const lastStatusRef = React.useRef<string | undefined>(undefined)
  React.useEffect(() => {
    if (!videoStatus) {
      lastStatusRef.current = undefined
      return
    }
    if (lastStatusRef.current && lastStatusRef.current !== videoStatus) {
      if (videoStatus === 'processing') {
        toast.info('Video encoding has started!')
      } else if (videoStatus === 'available') {
        toast.success('Video is ready! You can start watching now.')
      } else if (videoStatus === 'completed') {
        toast.success('HD quality (720p/1080p) is now available!')
      } else if (videoStatus === 'failed') {
        toast.error('Failed to process video.')
      }
    }
    lastStatusRef.current = videoStatus
  }, [videoStatus])

  const handleExtendAccess = () => {
    extendMutation.mutate()
  }



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">
          Initializing Workbench...
        </p>
      </div>
    )
  }



  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 text-center">
        <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100">
          <AlertCircle className="size-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Access Denied
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Curriculum data could not be verified.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: '/student/dashboard' })}
          variant="outline"
          className="h-12 px-8 rounded-xl font-bold"
        >
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // Course Expired / Locked State
  if (course.remaining_days === 0) {
    return (
      <CourseLockedState
        course={course}
        handleExtendAccess={handleExtendAccess}
        isPending={extendMutation.isPending}
        onReturnToDashboard={() => navigate({ to: '/student/dashboard' })}
      />
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <CourseLearnHeader
        course={course}
        activeModule={activeModule}
        isIntro={isIntro}
        activeTitle={activeTitle || ''}
        certificate={certificate}
        handleExtendAccess={handleExtendAccess}
        setIsCertModalOpen={setIsCertModalOpen}
        onBack={() => navigate({ to: '/student/dashboard' })}
      />

      <div className="grid gap-10 grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "space-y-10 transition-all duration-300",
            isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-8"
          )}
        >
          <CoursePlayerArea
            isAssignment={isAssignment}
            isQuiz={isQuiz}
            isIntro={isIntro}
            activeModule={activeModule}
            course={course}
            activeVideo={activeVideo}
            activeTitle={activeTitle || ''}
            isLastModule={isLastModule}
            handleNextModule={handleNextModule}
            handleModuleComplete={handleModuleComplete}
            courseUuid={courseUuid}
            setIsCertModalOpen={setIsCertModalOpen}
            setPlayerController={setPlayerController}
          />

          <Tabs defaultValue={tab} className="w-full">
            <TabsList className="flex border-b border-slate-200/60 mb-8 bg-transparent p-0 overflow-x-auto no-scrollbar w-full justify-start rounded-none h-14 space-x-6">
              <TabsTrigger
                value="overview"
                className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700"
              >
                Resources
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700 flex gap-2 items-center"
              >
                Updates
                {announcements.length > 0 && (
                  <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700"
              >
                Discussion
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700"
              >
                Notes
              </TabsTrigger>
              {course.enrollment_status === 'completed' && (
                <TabsTrigger
                  value="review"
                  className="h-full px-2 rounded-none bg-transparent font-bold text-sm tracking-wide text-slate-500 border-b-2 border-transparent data-[state=active]:border-[#056FAE] data-[state=active]:text-[#056FAE] data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-slate-700 flex gap-2 items-center"
                >
                  Review
                  {!course.user_review && (
                    <span className="size-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent
              value="overview"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <CourseOverviewTab
                course={course}
                activeContent={activeContent}
                isIntro={isIntro}
              />
            </TabsContent>

            <TabsContent
              value="resources"
              className="animate-in fade-in duration-300 space-y-6"
            >
              <CourseResourcesTab attachments={course.attachments} />
            </TabsContent>

            <TabsContent
              value="announcements"
              className="animate-in fade-in duration-300 space-y-6"
            >
              <CourseUpdatesTab announcements={announcements} />
            </TabsContent>

            <TabsContent
              value="comments"
              className="animate-in fade-in duration-300 space-y-8"
            >
              <CourseDiscussionTab
                comments={comments}
                user={user}
                postCommentMutation={postCommentMutation}
                deleteCommentMutation={deleteCommentMutation}
                updateCommentMutation={updateCommentMutation}
                toggleCommentLikeMutation={toggleCommentLikeMutation}
                playerController={playerController}
                hasVideo={!!activeVideo}
              />
            </TabsContent>

            <TabsContent
              value="notes"
              className="animate-in fade-in duration-300 space-y-8"
            >
              <CourseNotesTab
                courseUuid={courseUuid}
                activeModuleUuid={activeModuleUuid}
                playerController={playerController}
                course={course}
                queryClient={queryClient}
              />
            </TabsContent>
            <TabsContent
              value="review"
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <CourseReviewTab
                existingReview={course.user_review}
                postReviewMutation={postReviewMutation}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "sticky top-[152px] h-[calc(100vh-190px)] min-h-[500px] transition-all duration-300",
            isSidebarCollapsed ? "lg:col-span-1 hidden lg:block" : "lg:col-span-4"
          )}
        >
          <CourseSyllabusSidebar
            courseTitle={course.title}
            modules={course.modules || []}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeModuleUuid={
              isIntro
                ? 'intro'
                : typeof activeModule !== 'string'
                  ? activeModule?.uuid || activeModule?.id
                  : undefined
            }
            hasIntroVideo={!!course.video}
            onSelectModule={(m) => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setActiveModule(m)
            }}
            className="h-full"
          />
        </motion.div>
      </div>

      {course && (
        <CourseCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          courseUuid={courseUuid}
          courseTitle={course.title}
          variant={certificate?.variant || 'modern'}
          enrollmentUuid={course.enrollment_uuid}
          certificate={certificate}
          issuingAuthority={course.certificate_config?.issuing_authority}
        />
      )}
    </div>
  )
}

export const Route = createFileRoute('/student/learn/$courseUuid')({
  component: CourseDetailPage,
  validateSearch: (search: Record<string, unknown>): { tab?: string } => {
    const validTabs = ['overview', 'resources', 'announcements', 'comments', 'notes', 'review']
    const tab = search.tab as string | undefined
    return {
      tab: (tab && validTabs.includes(tab)) ? tab : undefined,
    }
  },
})


