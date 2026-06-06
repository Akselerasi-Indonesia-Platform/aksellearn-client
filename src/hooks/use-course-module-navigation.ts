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
      ? activeModule?.title
      : 'Fetching...'
  const activeVideo = isIntro
    ? course?.video
    : typeof activeModule !== 'string'
      ? activeModule?.video
      : ''
  const activeContent = isIntro
    ? course?.content
    : typeof activeModule !== 'string'
      ? activeModule?.content
      : ''

  return {
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
  }
}
