import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CourseAssignmentPanel } from '@/components/user/course/assignment/course-assignment-panel'
import { CourseQuizInterface } from '@/components/user/course/quiz/course-quiz-interface'
import {
  CourseVideoPlayer,
  CourseVideoPlayerController,
} from '@/components/user/course/video/course-video-player'

interface CoursePlayerAreaProps {
  isAssignment: boolean
  isQuiz: boolean
  isIntro: boolean
  activeModule: any
  course: any
  activeVideo: string | null
  activeTitle: string
  isLastModule: boolean
  handleNextModule: () => void
  handleModuleComplete: () => void
  courseUuid: string
  setIsCertModalOpen: (open: boolean) => void
  setPlayerController: (controller: CourseVideoPlayerController | null) => void
}

export function CoursePlayerArea({
  isAssignment,
  isQuiz,
  isIntro,
  activeModule,
  course,
  activeVideo,
  activeTitle,
  isLastModule,
  handleNextModule,
  handleModuleComplete,
  courseUuid,
  setIsCertModalOpen,
  setPlayerController,
}: CoursePlayerAreaProps) {
  const activeVideoData = isIntro
    ? course?.video_data
    : typeof activeModule !== 'string'
      ? activeModule?.video_data
      : undefined

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
            key={`video-${isIntro ? 'intro' : typeof activeModule !== 'string' ? activeModule?.uuid || activeModule?.id : 'none'}`}
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
              url={activeVideo || ''}
              title={activeTitle}
              videoData={activeVideoData}
              poster={
                typeof course.thumbnail === 'string'
                  ? course.thumbnail
                  : course.thumbnail?.original
              }
              initialPosition={
                !isIntro && typeof activeModule !== 'string'
                  ? activeModule?.meta?.position
                  : 0
              }
              isLast={isLastModule}
              onControllerReady={setPlayerController}
              onComplete={!isIntro ? handleModuleComplete : undefined}
              onNext={handleNextModule}
              onFinish={() => setIsCertModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
