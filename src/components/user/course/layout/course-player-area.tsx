import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { CourseAssignmentPanel } from '@/components/user/course/assignment/course-assignment-panel'
import { CourseQuizInterface } from '@/components/user/course/quiz/course-quiz-interface'
import {
  CourseVideoPlayer,
  CourseVideoPlayerController,
} from '@/components/user/course/video/course-video-player'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CoursePlayerAreaProps {
  isAssignment: boolean
  isQuiz: boolean
  isIntro: boolean
  activeModule: any
  course: any
  activeVideo: string | null
  activeTitle: string
  activeVideoUuid?: string | null
  isLastModule: boolean
  handleNextModule: () => void
  handleNextVideo?: () => void
  handleModuleComplete: () => void
  courseUuid: string
  setIsCertModalOpen: (open: boolean) => void
  setPlayerController: (controller: CourseVideoPlayerController | null) => void
  canComplete?: boolean
  markVideoCompleted?: (uuid: string) => void
}

export function CoursePlayerArea({
  isAssignment,
  isQuiz,
  isIntro,
  activeModule,
  course,
  activeVideo,
  activeTitle,
  activeVideoUuid,
  isLastModule,
  handleNextModule,
  handleNextVideo,
  handleModuleComplete,
  courseUuid,
  setIsCertModalOpen,
  setPlayerController,
  canComplete = true,
  markVideoCompleted,
}: CoursePlayerAreaProps) {
  const activeVideoData = (() => {
    if (isIntro) return course?.video_data

    if (typeof activeModule === 'string' || !activeModule) return undefined

    // Multi-video lesson: resolve the active individual video's media metadata
    if (activeModule.videos && activeModule.videos.length > 0) {
      const activeVid = activeModule.videos.find((v: any) => v.uuid === activeVideoUuid)
      if (activeVid?.media_uuid) {
        return {
          uuid: activeVid.media_uuid,
          status: activeVid.status || 'available',
        } as any
      }
      return undefined
    }

    // Legacy single-video module
    return activeModule?.video_data
  })()

  const [isCompleting, setIsCompleting] = useState(false)

  const hasMultipleVideos = !isIntro && typeof activeModule !== 'string' && activeModule?.videos && activeModule.videos.length > 0

  const handleManualComplete = async () => {
    if (!canComplete) {
      toast.error('Please watch all videos in this module before marking as complete.')
      return
    }
    
    setIsCompleting(true)
    try {
      await handleModuleComplete()
      toast.success('Module marked as complete!')
    } catch (err: any) {
      if (err?.response?.data?.message === 'complete all videos first') {
        toast.error('API Error: Please complete all videos first.')
      } else {
        toast.error('Failed to complete module')
      }
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        {isAssignment && typeof activeModule !== 'string' ? (
          <motion.div
            key={`assignment-${activeModule.uuid || activeModule.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white h-full"
          >
            <CourseAssignmentPanel
              courseUuid={courseUuid}
              moduleUuid={activeModule.uuid || activeModule.id}
              assignmentUuid={activeModule.assignment_uuid || ''}
              onNext={handleNextModule}
              onComplete={handleModuleComplete}
            />
          </motion.div>
        ) : isQuiz &&
          typeof activeModule !== 'string' &&
          activeModule?.quiz ? (
          <motion.div
            key={`quiz-${activeModule.uuid || activeModule.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white h-full"
          >
            <CourseQuizInterface
              quiz={activeModule.quiz}
              isLast={isLastModule}
              onComplete={handleModuleComplete}
              onNext={handleNextModule}
              onFinish={() => setIsCertModalOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`video-${isIntro ? 'intro' : typeof activeModule !== 'string' ? activeModule?.uuid || activeModule?.id : 'none'}-${activeVideoUuid || 'single'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CourseVideoPlayer
              moduleUuid={
                isIntro
                  ? 'intro'
                  : typeof activeModule !== 'string'
                    ? activeModule?.uuid || activeModule?.id || ''
                    : ''
              }
              videoUuid={activeVideoUuid || ''}
              url={activeVideo || ''}
              title={activeTitle}
              videoData={activeVideoData}
              poster={
                typeof course.thumbnail === 'string'
                  ? course.thumbnail
                  : course.thumbnail?.original
              }
              initialPosition={(() => {
                if (isIntro || typeof activeModule === 'string') return 0
                // Multi-video: resolve from active video's watch_progress
                if (activeModule?.videos?.length > 0) {
                  const vid = activeModule.videos.find((v: any) => v.uuid === activeVideoUuid)
                  const p = vid?.watch_progress
                  // Udemy/YouTube standard: fully-watched → restart from 0, partial → resume
                  if (!p || p.is_watched) return 0
                  return p.last_position_seconds || 0
                }
                // Legacy single-video module
                return activeModule?.meta?.position || 0
              })()}
              isLast={isLastModule && (!activeModule?.videos || activeModule.videos.findIndex((v: any) => v.uuid === activeVideoUuid) === activeModule.videos.length - 1)}
              nextVideoTitle={
                hasMultipleVideos && activeModule.videos.findIndex((v: any) => v.uuid === activeVideoUuid) < activeModule.videos.length - 1
                  ? activeModule.videos[activeModule.videos.findIndex((v: any) => v.uuid === activeVideoUuid) + 1].title
                  : undefined
              }
              onControllerReady={setPlayerController}
              onComplete={(!isIntro && !hasMultipleVideos) ? handleModuleComplete : undefined}
              onNext={handleNextVideo || handleNextModule}
              onFinish={() => setIsCertModalOpen(true)}
              markVideoCompleted={markVideoCompleted}
            />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
