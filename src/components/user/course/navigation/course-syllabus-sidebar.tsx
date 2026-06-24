import { cn } from '@/lib/utils'
import { CourseModule } from '@/types/course'
import {
  Play,
  HelpCircle,
  CheckCircle2,
  Lock,
  Clock,
  Layout,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface CourseSyllabusSidebarProps {
  courseTitle?: string
  modules: CourseModule[]
  activeModuleUuid?: string | 'intro'
  onSelectModule?: (module: CourseModule | 'intro') => void
  completedModuleUuids?: string[]
  className?: string
  hasIntroVideo?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  activeVideoUuid?: string | null
  onSelectVideo?: (module: CourseModule, videoUuid: string) => void
  sessionCompletedVideos?: Set<string>
}

export function CourseSyllabusSidebar({
  courseTitle,
  modules,
  activeModuleUuid,
  onSelectModule,
  className,
  hasIntroVideo = true,
  isCollapsed = false,
  onToggleCollapse,
  activeVideoUuid,
  onSelectVideo,
  sessionCompletedVideos,
}: CourseSyllabusSidebarProps) {
  // Track which module sections are open (accordion state)
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(new Set())

  // When active module changes, auto-expand it
  useEffect(() => {
    if (activeModuleUuid && activeModuleUuid !== 'intro') {
      setOpenModuleIds(prev => {
        const next = new Set(prev)
        next.add(activeModuleUuid)
        return next
      })
    }
  }, [activeModuleUuid])

  const toggleModuleOpen = (moduleId: string) => {
    setOpenModuleIds(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const sortedModules = [...modules].sort(
    (a, b) => (a.order_weight ?? a.order ?? 0) - (b.order_weight ?? b.order ?? 0)
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)

  // Restore scroll position after active video changes (which can cause DOM shifts)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current
    }
  }, [activeVideoUuid])

  return (
    <div
      className={cn(
        'bg-slate-50 rounded-2xl overflow-hidden flex flex-col h-full',
        className,
      )}
    >
      {/* Header */}
      <div className={cn("border-b bg-slate-50/50 relative transition-all duration-300", isCollapsed ? "p-4 flex justify-center" : "p-6 pb-4")}>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelRightClose className="size-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
            title="Expand Sidebar"
          >
            <PanelRightOpen className="size-4" />
          </button>
        )}

        {!isCollapsed && (
          <>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
              Curriculum Stage
            </h4>
            <h4 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1 pr-8">
              {courseTitle || 'Course Syllabus'}
            </h4>
            <div className="flex items-center gap-4 mt-1.5 font-bold text-xs text-slate-400 uppercase tracking-widest leading-none">
              <Layout className="size-3 text-primary" />
              <span>
                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>{modules.filter((m) => m.is_completed).length} Completed</span>
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.round((modules.filter((m) => m.is_completed).length / (modules.length || 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2AABAA] rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((modules.filter((m) => m.is_completed).length / (modules.length || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Module List */}
      <div 
        ref={scrollContainerRef}
        onScroll={(e) => { scrollPositionRef.current = e.currentTarget.scrollTop }}
        className={cn("flex-1 overflow-y-auto custom-scrollbar scroll-smooth", isCollapsed ? "p-2 px-1 space-y-2" : "p-3 space-y-1")}
      >
        {/* Intro */}
        {hasIntroVideo && (
          <button
            onClick={() => onSelectModule?.('intro')}
            className={cn(
              'w-full text-left transition-all group active:scale-[0.98] relative',
              isCollapsed ? 'p-2 rounded-lg' : 'px-3 py-2.5 rounded-lg',
              activeModuleUuid === 'intro' && !isCollapsed
                ? 'bg-slate-100 text-primary font-medium'
                : activeModuleUuid === 'intro' && isCollapsed
                  ? 'bg-slate-100 text-primary'
                  : 'hover:bg-slate-50 bg-transparent',
            )}
          >
            {activeModuleUuid === 'intro' && isCollapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
            )}
            {activeModuleUuid === 'intro' && !isCollapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
            )}
            <div className={cn("flex w-full", isCollapsed ? "justify-center items-center" : "items-center gap-3")}>
              <div
                className={cn(
                  'size-8 rounded-lg flex items-center justify-center shrink-0',
                  activeModuleUuid === 'intro'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-emerald-50 text-emerald-600',
                )}
              >
                {activeModuleUuid === 'intro' ? (
                  <Sparkles className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                    GETTING STARTED
                  </div>
                  <div className={cn(
                    'font-semibold text-sm leading-tight line-clamp-1',
                    activeModuleUuid === 'intro' ? 'text-primary' : 'text-slate-800',
                  )}>
                    Introduction & Objectives
                  </div>
                </div>
              )}
            </div>
          </button>
        )}

        {/* Modules */}
        {sortedModules.map((module, i, arr) => {
          const moduleId = module.uuid || module.id
          const isActive = activeModuleUuid === moduleId
          const isOpen = openModuleIds.has(moduleId) || isActive
          const isQuiz = module.type === 'quiz' || module.module_type === 'quiz'

          let isPassedLocally = false
          if (isQuiz) {
            if (module.is_passed !== undefined) {
              isPassedLocally = module.is_passed
            } else if (module.my_progress?.score !== undefined && module.quiz?.passing_percentage !== undefined) {
              isPassedLocally = module.my_progress.score >= module.quiz.passing_percentage
            }
          }

          const isCompleted = isQuiz ? module.is_completed && isPassedLocally : module.is_completed
          const hasAttempted = !!module.my_progress || module.is_passed !== undefined
          const isFailedQuiz = isQuiz && hasAttempted && !isPassedLocally

          let prevIsCompleted = true
          if (i > 0) {
            const prevModule = arr[i - 1]
            const prevIsQuiz = prevModule.type === 'quiz' || prevModule.module_type === 'quiz'
            let prevPassed = false
            if (prevIsQuiz) {
              if (prevModule.is_passed !== undefined) prevPassed = prevModule.is_passed
              else if (prevModule.my_progress?.score !== undefined && prevModule.quiz?.passing_percentage !== undefined) {
                prevPassed = prevModule.my_progress.score >= prevModule.quiz.passing_percentage
              }
            }
            prevIsCompleted = prevIsQuiz
              ? (prevModule.is_completed && prevPassed) ?? false
              : prevModule.is_completed ?? false
          }

          const isLocked = i > 0 && !prevIsCompleted && !isActive && !isCompleted && !isFailedQuiz

          const hasVideos = !isQuiz && module.videos && module.videos.length > 0
          const videoCount = module.videos?.length || 0
          const watchedCount = module.videos?.filter(v =>
            v.watch_progress?.is_watched || sessionCompletedVideos?.has(v.uuid)
          ).length || 0

          // If quiz/assignment, clicking the header directly selects the module
          const handleHeaderClick = () => {
            if (isLocked) return
            if (hasVideos) {
              toggleModuleOpen(moduleId)
              // Also select the module so the player knows which module is active
              onSelectModule?.(module)
            } else {
              onSelectModule?.(module)
            }
          }

          return (
            <div key={moduleId} className="rounded-xl overflow-hidden">
              {/* Module Header Row */}
              <button
                disabled={isLocked}
                onClick={handleHeaderClick}
                aria-expanded={hasVideos ? isOpen : undefined}
                className={cn(
                  'w-full text-left transition-all group active:scale-[0.98] relative',
                  isCollapsed ? 'p-2 rounded-lg' : 'px-3 py-3 w-full rounded-lg',
                  isActive && !isCollapsed
                    ? 'bg-slate-100 text-primary font-medium'
                    : isActive && isCollapsed
                      ? 'bg-slate-100 text-primary'
                      : isCompleted && !isCollapsed
                        ? 'hover:bg-slate-100/60 bg-transparent'
                        : 'hover:bg-slate-50 bg-transparent',
                  isLocked && 'opacity-50 grayscale cursor-not-allowed hover:bg-transparent',
                )}
              >
                {isActive && isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                )}
                <div className={cn("flex w-full", isCollapsed ? "justify-center items-center" : "items-center gap-3")}>
                  {/* Status Icon */}
                  <div
                    className={cn(
                      'size-8 rounded-lg flex items-center justify-center shrink-0',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-500'
                          : isFailedQuiz
                            ? 'bg-rose-50 text-rose-500'
                            : isLocked
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-4" />
                    ) : isLocked ? (
                      <Lock className="size-4" />
                    ) : isQuiz ? (
                      <HelpCircle className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 pr-1">
                      {/* Badge row */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={cn(
                            'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none',
                            isActive ? 'bg-primary/10 text-primary'
                              : isCompleted ? 'bg-emerald-100 text-emerald-700'
                                : isFailedQuiz ? 'bg-rose-100 text-rose-600'
                                  : isLocked ? 'bg-slate-200 text-slate-400'
                                    : 'bg-slate-200 text-slate-500',
                          )}
                        >
                          {isQuiz ? 'ASSESSMENT' : 'LESSON'} {i + 1}
                        </span>
                        {hasVideos && (
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                            {watchedCount}/{videoCount} watched
                          </span>
                        )}
                      </div>
                      {/* Title */}
                      <div className={cn(
                        'font-semibold text-sm leading-snug line-clamp-1',
                        isActive ? 'text-primary' : 'text-slate-800',
                      )}>
                        {module.title}
                      </div>
                      {/* Meta: duration */}
                      {module.meta?.duration && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-slate-400">
                          <Clock className="size-3" />
                          <span>{module.meta.duration}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Accordion chevron — only for multi-video lessons, not collapsed */}
                  {!isCollapsed && hasVideos && (
                    <ChevronDown
                      className={cn(
                        'size-4 text-slate-400 shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  )}
                </div>
              </button>

              {/* Video Sub-list (accordion) */}
              {!isCollapsed && hasVideos && isOpen && (
                <div className="pb-2 overflow-hidden">
                  <div className="ml-3 mr-1 border-l-2 border-slate-200 pl-3 space-y-0.5">
                    {module.videos!.map((video, vIdx) => {
                      const isVideoActive = activeVideoUuid === video.uuid
                      const isVideoWatched = video.watch_progress?.is_watched || sessionCompletedVideos?.has(video.uuid)

                      return (
                        <button
                          key={video.uuid}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectModule?.(module)
                            onSelectVideo?.(module, video.uuid)
                          }}
                          aria-current={isVideoActive ? 'true' : undefined}
                          className={cn(
                            'w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all relative overflow-hidden',
                            isVideoActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900',
                          )}
                        >
                          {/* Video status icon */}
                          <div className={cn(
                            'size-5 rounded-md flex items-center justify-center shrink-0 mt-0.5',
                            isVideoActive
                              ? 'bg-primary text-white'
                              : isVideoWatched
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-200 text-slate-400',
                          )}>
                            {isVideoWatched && !isVideoActive ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <Play className="size-3" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'text-xs font-semibold leading-snug line-clamp-2',
                              isVideoActive ? 'text-primary' : isVideoWatched ? 'text-slate-500 font-medium' : 'text-slate-600',
                            )}>
                              {video.title || `Video ${vIdx + 1}`}
                            </div>
                            {video.duration && (
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                                <Clock className="size-2.5" />
                                <span>{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                              </div>
                            )}
                          </div>

                          {isVideoWatched && (
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-1" />
                          )}

                          {/* Progress Bar (Udemy-style) */}
                          {(() => {
                            let percent = 0
                            if (isVideoWatched) {
                              percent = 100
                            } else if (video.watch_progress?.last_position_seconds && video.duration) {
                              percent = Math.min(100, Math.max(0, (video.watch_progress.last_position_seconds / video.duration) * 100))
                            }
                            if (percent === 0) return null
                            return (
                              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-200/50">
                                <div 
                                  className={cn("h-full transition-all duration-500 rounded-r-full", isVideoWatched ? "bg-emerald-500" : "bg-amber-500")} 
                                  style={{ width: `${percent}%` }} 
                                />
                              </div>
                            )
                          })()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quiz / Assignment: no sub-list, just the single row */}
              {!isCollapsed && !hasVideos && !isQuiz && (
                <></>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-slate-50/50 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {modules.filter((m) => m.is_completed).length} of {modules.length} Modules Completed
            </span>
          </div>
          <a
            href="/student/dashboard"
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 w-max"
          >
            ← Back to Dashboard
          </a>
        </div>
      )}
    </div>
  )
}
