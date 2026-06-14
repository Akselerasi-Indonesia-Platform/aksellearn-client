import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CourseModule } from '@/types/course'

interface UseCourseModuleNavigationProps {
  course: any
  urlCourseId: string
  setIsCertModalOpen: (val: boolean) => void
}

export function useCourseModuleNavigation({
  course,
  urlCourseId,
  setIsCertModalOpen,
}: UseCourseModuleNavigationProps) {
  const queryClient = useQueryClient()

  const [activeModule, setActiveModule] = useState<
    CourseModule | 'intro' | null
  >(null)

  const [activeVideoUuid, setActiveVideoUuid] = useState<string | null>(null)
  
  // Local state to instantly track videos that become completed during this session
  // without waiting for a full course refetch
  const [sessionCompletedVideos, setSessionCompletedVideos] = useState<Set<string>>(new Set())

  const markVideoCompleted = useCallback((videoUuid: string) => {
    setSessionCompletedVideos(prev => {
      const next = new Set(prev)
      next.add(videoUuid)
      return next
    })
  }, [])

  useEffect(() => {
    if (course && !activeModule) {
      if (course.video && (course.progress_percentage || 0) < 5) {
        setActiveModule('intro')
      } else if (course.modules?.length) {
        const syllabus = [...course.modules].sort(
          (a, b) => (a.order_weight ?? a.order ?? 0) - (b.order_weight ?? b.order ?? 0)
        )
        const resume = syllabus.find((m) => !m.is_completed) || syllabus[0]
        setActiveModule(resume)
      }
    }
  }, [course, activeModule])

  useEffect(() => {
    if (activeModule && activeModule !== 'intro') {
      const module = activeModule as CourseModule
      if (module.videos && module.videos.length > 0) {
        // Find first unwatched video, or default to first video
        const unwatched = module.videos.find(v => !v.watch_progress?.is_watched)
        setActiveVideoUuid(unwatched?.uuid || module.videos[0].uuid)
      } else {
        setActiveVideoUuid(null)
      }
    } else {
      setActiveVideoUuid(null)
    }
  }, [activeModule])

  const isLastModule = useMemo(() => {
    if (!course || !course.modules || activeModule === 'intro') return false
    const syllabus = [...course.modules].sort(
      (a, b) => (a.order_weight ?? a.order ?? 0) - (b.order_weight ?? b.order ?? 0)
    )
    const currentIndex = syllabus.findIndex(
      (m) =>
        m.id === (activeModule as any)?.id ||
        m.uuid === (activeModule as any)?.uuid
    )
    return currentIndex === syllabus.length - 1
  }, [course, activeModule])

  const handleModuleComplete = useCallback(async () => {
    queryClient.invalidateQueries({
      queryKey: ['user', 'course', 'learn', urlCourseId],
    })
    toast.success('Objective Cleared!')
  }, [queryClient, urlCourseId])

  const handleNextModule = useCallback(() => {
    if (!course || !course.modules) return

    const syllabus = [...course.modules].sort(
      (a, b) => (a.order_weight ?? a.order ?? 0) - (b.order_weight ?? b.order ?? 0)
    )

    // If current is intro, move to first module
    if (activeModule === 'intro') {
      if (syllabus.length > 0) setActiveModule(syllabus[0])
      return
    }

    // Find current index
    const currentIndex = syllabus.findIndex(
      (m) =>
        m.id === (activeModule as any)?.id ||
        m.uuid === (activeModule as any)?.uuid
    )

    if (currentIndex !== -1 && currentIndex < syllabus.length - 1) {
      const next = syllabus[currentIndex + 1]
      setActiveModule(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setIsCertModalOpen(true)
    }
  }, [course, activeModule, setIsCertModalOpen])

  const handleNextVideo = useCallback(() => {
    if (activeModule && activeModule !== 'intro') {
      const module = activeModule as CourseModule
      if (module.videos && module.videos.length > 0 && activeVideoUuid) {
        const currentIndex = module.videos.findIndex(v => v.uuid === activeVideoUuid)
        if (currentIndex !== -1 && currentIndex < module.videos.length - 1) {
          setActiveVideoUuid(module.videos[currentIndex + 1].uuid)
          return
        }
      }
    }
    // If no more videos in this module, move to next module
    handleNextModule()
  }, [activeModule, activeVideoUuid, handleNextModule])

  const isQuiz =
    typeof activeModule !== 'string' &&
    (activeModule?.type === 'quiz' || activeModule?.module_type === 'quiz')
  const isAssignment =
    typeof activeModule !== 'string' &&
    (activeModule?.type === 'assignment' || activeModule?.module_type === 'assignment')
  const isIntro = activeModule === 'intro'
  const activeModuleUuid = isIntro
    ? null
    : typeof activeModule !== 'string'
      ? (activeModule?.uuid || activeModule?.id) ?? null
      : null

  const activeTitle = isIntro
    ? 'Course Introduction'
    : typeof activeModule !== 'string'
      ? activeModule?.videos?.find(v => v.uuid === activeVideoUuid)?.title || activeModule?.title
      : 'Fetching...'
  const activeVideo = isIntro
    ? course?.video
    : typeof activeModule !== 'string'
      ? activeModule?.videos?.find(v => v.uuid === activeVideoUuid)?.stream_url || activeModule?.video
      : ''
  const activeContent = isIntro
    ? course?.content
    : typeof activeModule !== 'string'
      ? activeModule?.content
      : ''

  const canComplete = useMemo(() => {
    if (isIntro) return true
    if (isQuiz || isAssignment) return true
    if (typeof activeModule === 'string' || !activeModule) return false

    // Lesson modules: if they have a multi-video playlist, ALL videos must be watched.
    if (activeModule.videos && activeModule.videos.length > 0) {
      return activeModule.videos.every(v => 
        v.watch_progress?.is_watched || sessionCompletedVideos.has(v.uuid)
      )
    }

    // Backward compatibility for single video or text-only lessons
    return true
  }, [isIntro, isQuiz, isAssignment, activeModule, sessionCompletedVideos])

  return {
    activeModule,
    setActiveModule,
    activeVideoUuid,
    setActiveVideoUuid,
    isLastModule,
    handleModuleComplete,
    handleNextModule,
    handleNextVideo,
    isQuiz,
    isAssignment,
    isIntro,
    activeModuleUuid,
    activeTitle,
    activeVideo,
    activeContent,
    canComplete,
    markVideoCompleted,
    sessionCompletedVideos,
  }
}
