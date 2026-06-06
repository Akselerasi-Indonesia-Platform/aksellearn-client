import { cn } from '@/lib/utils'
import { CourseModule } from '@/types/course'
import {
  Play,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Lock,
  Clock,
  Layout,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'

interface CourseSyllabusSidebarProps {
  courseTitle?: string
  modules: CourseModule[]
  activeModuleUuid?: string | 'intro'
  onSelectModule?: (module: CourseModule | 'intro') => void
  completedModuleUuids?: string[] // Kept for backward compatibility but module.is_completed is preferred
  className?: string
  hasIntroVideo?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
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
}: CourseSyllabusSidebarProps) {
  return (
    <div
      className={cn(
        'bg-slate-50 rounded-2xl overflow-hidden flex flex-col h-full',
        className,
      )}
    >
      <div className={cn("border-b bg-slate-50/50 relative transition-all duration-300", isCollapsed ? "p-4 flex justify-center" : "p-8")}>
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
                   <div className="h-full bg-[#2AABAA] rounded-full transition-all duration-500" style={{ width: `${Math.round((modules.filter((m) => m.is_completed).length / (modules.length || 1)) * 100)}%` }} />
               </div>
            </div>
          </>
        )}
      </div>

      <div className={cn("flex-1 overflow-y-auto custom-scrollbar space-y-2", isCollapsed ? "p-2 px-1" : "p-4")}>
        {hasIntroVideo && (
          <button
            onClick={() => onSelectModule?.('intro')}
            className={cn(
              'w-full text-left transition-all group active:scale-[0.98] relative',
              isCollapsed ? 'p-2 rounded-xl' : 'p-4 rounded-xl',
              activeModuleUuid === 'intro' && !isCollapsed
                ? 'bg-primary/5 text-primary border-l-2 border-primary rounded-l-none'
                : activeModuleUuid === 'intro' && isCollapsed
                  ? 'bg-slate-100 text-primary'
                  : 'hover:bg-white bg-transparent',
            )}
          >
            {activeModuleUuid === 'intro' && isCollapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md shadow-[2px_0_8px_rgba(5,111,174,0.4)]" />
            )}
            <div className={cn("flex w-full", isCollapsed ? "justify-center items-center gap-0" : "items-start gap-4")}>
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center shrink-0',
                  activeModuleUuid === 'intro'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-emerald-50 text-emerald-600',
                )}
              >
                {activeModuleUuid === 'intro' ? (
                  <Sparkles className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded leading-none',
                        activeModuleUuid === 'intro' 
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-100 text-emerald-700'
                      )}
                    >
                      GETTING STARTED
                    </span>
                  </div>
                  <h5
                    className={cn(
                      'font-bold text-sm leading-tight line-clamp-1',
                      activeModuleUuid === 'intro'
                        ? 'text-primary'
                        : 'text-slate-900',
                    )}
                  >
                    Introduction & Objectives
                  </h5>
                </div>
              )}
            </div>
          </button>
        )}

        {[...modules]
          .sort((a, b) => (a.order_weight ?? a.order ?? 0) - (b.order_weight ?? b.order ?? 0))
          .map((module, i, sortedModules) => {
            const moduleId = module.uuid || module.id
            const isActive = activeModuleUuid === moduleId
            const isQuiz =
              module.type === 'quiz' || module.module_type === 'quiz'
              
            let isPassedLocally = false
            if (isQuiz) {
              if (module.is_passed !== undefined) {
                isPassedLocally = module.is_passed
              } else if (module.my_progress?.score !== undefined && module.quiz?.passing_percentage !== undefined) {
                isPassedLocally = module.my_progress.score >= module.quiz.passing_percentage
              }
            }

            const isCompleted = isQuiz 
              ? module.is_completed && isPassedLocally 
              : module.is_completed
              
            const hasAttempted = !!module.my_progress || module.is_passed !== undefined
            const isFailedQuiz = isQuiz && hasAttempted && !isPassedLocally

            // Strict Sequence: Locked if previous not fully completed AND not the current one
            let prevIsCompleted = true
            if (i > 0) {
              const prevModule = sortedModules[i - 1]
              const prevIsQuiz = prevModule.type === 'quiz' || prevModule.module_type === 'quiz'
              
              let prevIsPassedLocally = false
              if (prevIsQuiz) {
                if (prevModule.is_passed !== undefined) {
                  prevIsPassedLocally = prevModule.is_passed
                } else if (prevModule.my_progress?.score !== undefined && prevModule.quiz?.passing_percentage !== undefined) {
                  prevIsPassedLocally = prevModule.my_progress.score >= prevModule.quiz.passing_percentage
                }
              }
              
              prevIsCompleted = prevIsQuiz 
                ? (prevModule.is_completed && prevIsPassedLocally) ?? false 
                : prevModule.is_completed ?? false
            }
            
            // A failed quiz itself should never be locked — user must be able to retake
            const isLocked =
              i > 0 && !prevIsCompleted && !isActive && !isCompleted && !isFailedQuiz


            return (
              <button
                key={moduleId}
                disabled={isLocked}
                onClick={() => onSelectModule?.(module)}
                className={cn(
                  'w-full text-left transition-all group active:scale-[0.98] relative',
                  isCollapsed ? 'p-2 rounded-xl' : 'p-4 rounded-xl',
                  isActive && !isCollapsed
                    ? 'bg-primary/5 text-primary border-l-2 border-primary rounded-l-none'
                    : isActive && isCollapsed
                      ? 'bg-slate-100 text-primary'
                      : 'hover:bg-white bg-transparent',
                  isLocked &&
                    'opacity-60 grayscale cursor-not-allowed border-dashed border-slate-200 bg-transparent hover:bg-transparent',
                )}
              >
                {isActive && isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md shadow-[2px_0_8px_rgba(5,111,174,0.4)]" />
                )}
                <div className={cn("flex w-full", isCollapsed ? "justify-center items-center gap-0" : "items-start gap-4")}>
                  <div
                    className={cn(
                      'size-10 rounded-xl flex items-center justify-center shrink-0',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-600'
                          : isFailedQuiz
                            ? 'bg-rose-50 text-rose-500'
                            : isLocked
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-slate-200 text-slate-500',
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : isLocked ? (
                      <Lock className="size-5" />
                    ) : isQuiz ? (
                      <HelpCircle className="size-5" />
                    ) : (
                      <Play className="size-5" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded leading-none bg-slate-200 text-slate-600',
                            isActive && 'bg-primary/10 text-primary',
                            isLocked && 'bg-slate-200 text-slate-400',
                            isCompleted && 'bg-emerald-100 text-emerald-700',
                            isFailedQuiz && 'bg-rose-100 text-rose-600'
                          )}
                        >
                          {isQuiz ? 'ASSESSMENT' : 'LESSON'} {i + 1}
                        </span>
                        {isActive && (
                          <ChevronRight className="size-4 animate-bounce-x text-primary" />
                        )}
                      </div>
                      <h5
                        className={cn(
                          'font-bold text-sm leading-tight line-clamp-1',
                          isActive ? 'text-primary' : 'text-slate-900',
                        )}
                      >
                        {module.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        {!isActive && !isCompleted && !isLocked && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock className="size-2.5" /> Pending
                          </span>
                        )}
                        {module.meta?.duration && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock className="size-2.5" /> {module.meta.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-slate-50/50 flex flex-col gap-2 transition-all duration-300">
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
