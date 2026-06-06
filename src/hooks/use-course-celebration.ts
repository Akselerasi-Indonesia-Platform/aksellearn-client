import { useEffect } from 'react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import type { CourseModule } from '@/types/course'

export function useCourseCelebration(modules: CourseModule[] | undefined, courseUuid: string) {
  useEffect(() => {
    if (modules?.length) {
      const completedCount = modules.filter((m) => m.is_completed).length
      const total = modules.length
      const percentage = (completedCount / total) * 100

      // 100% Celebration
      if (
        percentage === 100 &&
        !localStorage.getItem(`cert-celebrated-${courseUuid}-100`)
      ) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        toast.success('🏆 Curriculum Completed!', {
          description:
            'You have mastered all modules in this stage. Your certificate is now available.',
          duration: 10000,
        })
        localStorage.setItem(`cert-celebrated-${courseUuid}-100`, 'true')
      } 
      // 75% Celebration
      else if (
        percentage >= 75 && percentage < 100 &&
        !localStorage.getItem(`cert-celebrated-${courseUuid}-75`)
      ) {
        toast.success('🔥 Almost there!', {
          description: 'You are 75% through the course. Keep pushing!',
        })
        localStorage.setItem(`cert-celebrated-${courseUuid}-75`, 'true')
      }
      // 50% Celebration
      else if (
        percentage >= 50 && percentage < 75 &&
        !localStorage.getItem(`cert-celebrated-${courseUuid}-50`)
      ) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        toast.success('⭐ Halfway Point Reached!', {
          description: "You're halfway there! Great progress so far.",
        })
        localStorage.setItem(`cert-celebrated-${courseUuid}-50`, 'true')
      }
      // 25% Celebration
      else if (
        percentage >= 25 && percentage < 50 &&
        !localStorage.getItem(`cert-celebrated-${courseUuid}-25`)
      ) {
        toast.success('🚀 Off to a great start!', {
          description: "You've completed 25% of the curriculum.",
        })
        localStorage.setItem(`cert-celebrated-${courseUuid}-25`, 'true')
      }
    }
  }, [modules, courseUuid])
}
