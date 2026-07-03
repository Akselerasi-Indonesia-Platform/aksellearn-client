'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Settings2,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  FileText,
  Loader2,
  Check,
  PlayCircle,
  HelpCircle,
  FileEdit,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { adminCourseModuleService } from '@/services/admin/course-module.service'
import { adminCourseService } from '@/services/admin/course.service'
import { adminMediaService } from '@/services/admin/media.service'
import { CourseModule } from '@/types/course'
import { Form } from '@/components/ui/form'
import {
  FormInput,
  FormTextarea,
  FormEditor,
  FormInputVideo,
  FormSelectStatus,
  FormInputDateTime,
  FormSearchableSelect,
} from '@/components/admin/shared/form'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { adminQuizService } from '@/services/admin/quiz.service'
import { Quiz } from '@/types/course'
import { QuizModal } from '@/components/admin/quiz/quiz-modal'
import { QuizBuilderSheet } from '@/components/admin/quiz/builder/quiz-builder-sheet'
import { AssignmentEditor } from './assignment/assignment-editor'
import { VideoPlaylistManager } from './video-playlist-manager'

const moduleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['lesson', 'quiz', 'assignment']),
  description: z.string().optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .optional()
    .or(z.literal('')),
  video: z.string().optional(),
  video_uuid: z.string().optional(),
  videos: z.array(z.object({
    title: z.string(),
    media_uuid: z.string().optional(),
    stream_url: z.string().optional(),
  })).optional(),
  is_active: z.boolean(),
  published_at: z.string().optional(),
  quiz_uuid: z.string().optional(),
})

type ModuleFormValues = z.infer<typeof moduleSchema>

interface ModuleManagerProps {
  courseUuid: string
}

export function ModuleManager({ courseUuid }: ModuleManagerProps) {
  const { t } = useTranslation()
  const [modules, setModules] = useState<CourseModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isQuizzesLoading, setIsQuizzesLoading] = useState(false)

  const fetchQuizzes = async () => {
    setIsQuizzesLoading(true)
    try {
      const data = await adminQuizService.getAll()
      setQuizzes(data)
    } catch {
      toast.error('Failed to fetch quizzes')
    } finally {
      setIsQuizzesLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchModules = async () => {
    setIsLoading(true)
    try {
      const data = await adminCourseModuleService.getAll(courseUuid)
      setModules(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    } catch (error) {
      toast.error('Failed to fetch modules')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (courseUuid) {
      fetchModules()
    }
  }, [courseUuid])

  const handleAdd = async (type: 'lesson' | 'quiz' | 'assignment' = 'lesson') => {
    setIsCreating(true)
    try {
      const newModule = await adminCourseModuleService.create(courseUuid, {
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} #${modules.length + 1}`,
        module_type: type,
        content: type === 'lesson' ? '<p>Module content goes here...</p>' : '',
        order: modules.length,
        is_active: false,
      })
      const moduleWithFrontendType = {
        ...newModule,
        type: newModule.type || newModule.module_type || type,
      }
      setModules((prev) => [...prev, moduleWithFrontendType])
      setExpandedId(newModule.id)

      if (type === 'quiz') {
        toast.success('Quiz Module created. Please link it to a specific quiz.')
      } else if (type === 'assignment') {
        toast.success('Assignment Module created. Please set the assignment details.')
      } else {
        toast.success('Lesson Module created')
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create module')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= modules.length) return

    const newModules = [...modules]
    const [movedItem] = newModules.splice(index, 1)
    newModules.splice(newIndex, 0, movedItem)

    // Update orders locally for immediate feedback
    const updatedModules = newModules.map((m, i) => ({ ...m, order: i }))
    setModules(updatedModules)

    // Save orders to server using atomic atomic endpoint
    try {
      const uuids = updatedModules.map((m) => m.id)
      await adminCourseModuleService.reorder(courseUuid, uuids)
    } catch {
      toast.error('Failed to update order')
      fetchModules()
    }
  }

  const handleDelete = async (moduleUuid: string) => {
    try {
      await adminCourseModuleService.delete(courseUuid, moduleUuid)
      setModules((prev) => prev.filter((m) => m.id !== moduleUuid))
      toast.success('Module deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              Curriculum Manager
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage {modules.length} modules for this course
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-full gap-2 px-6 shadow-md hover:shadow-primary/20 transition-all font-bold"
              disabled={isCreating}
              size="sm"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t('courses.addModule')}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl shadow-xl border-primary/10"
          >
            <DropdownMenuItem
              className="gap-3 py-2.5 font-bold cursor-pointer"
              onClick={() => handleAdd('lesson')}
            >
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <PlayCircle className="h-4 w-4" />
              </div>
              Lesson Module
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3 py-2.5 font-bold cursor-pointer"
              onClick={() => handleAdd('quiz')}
            >
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <HelpCircle className="h-4 w-4" />
              </div>
              Quiz Module
            </DropdownMenuItem>
            {/* Assignment Module hidden per user request
            <DropdownMenuItem
              className="gap-3 py-2.5 font-bold cursor-pointer"
              onClick={() => handleAdd('assignment')}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileEdit className="h-4 w-4" />
              </div>
              Assignment Module
            </DropdownMenuItem>
            */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4 relative px-1">
        <div className="absolute left-[1.375rem] top-[1.875rem] bottom-[1.875rem] w-px bg-border/60 z-0" />

        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl bg-muted/20 text-muted-foreground transition-all duration-500 hover:bg-muted/30 hover:border-primary/20 group">
            <div className="p-6 rounded-full bg-primary/5 text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-500 shadow-inner">
              <FileText className="h-12 w-12" />
            </div>
            <p className="mt-4 font-bold tracking-tight">
              {t('courses.noModules')}
            </p>
            <p className="text-xs opacity-60">
              Add your first lesson or quiz to start building your course
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {modules.map((module, index) => (
                <ModuleItem
                  key={module.id}
                  courseUuid={courseUuid}
                  index={index}
                  isExpanded={expandedId === module.id}
                  isFirst={index === 0}
                  isLast={index === modules.length - 1}
                  module={module}
                  onDelete={() => handleDelete(module.id)}
                  onExpand={() =>
                    setExpandedId(expandedId === module.id ? null : module.id)
                  }
                  onMove={(dir) => handleMove(index, dir)}
                  onUpdate={(updated) => {
                    setModules((prev) =>
                      prev.map((m) =>
                        m.id === module.id ? { ...m, ...updated } : m,
                      ),
                    )
                  }}
                  quizzes={quizzes}
                  isQuizzesLoading={isQuizzesLoading}
                  onQuizCreated={(newQuiz) =>
                    setQuizzes((prev) => [newQuiz, ...prev])
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

interface ModuleItemProps {
  module: CourseModule
  index: number
  courseUuid: string
  isExpanded: boolean
  onExpand: () => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
  isFirst: boolean
  isLast: boolean
  onUpdate: (updated: CourseModule) => void
  quizzes: Quiz[]
  isQuizzesLoading: boolean
  onQuizCreated: (quiz: Quiz) => void
}

function ModuleItem({
  module,
  index,
  courseUuid,
  isExpanded,
  onExpand,
  onDelete,
  onMove,
  isFirst,
  isLast,
  onUpdate,
  quizzes,
  isQuizzesLoading,
  onQuizCreated,
}: ModuleItemProps) {
  const { t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoStatus, setVideoStatus] = useState<{
    status:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | 'finished'
      | 'transcoding'
      | 'uploading'
      | null
    progress: number
    duration?: number
    uuid?: string | null
  }>({
    status: module.video
      ? 'finished'
      : (module as any).video_data?.status ||
        ((module as any).video_uuid ? 'processing' : null),
    progress: module.video ? 100 : (module as any).video_data?.progress || 0,
    duration: (module as any).video_data?.duration,
    uuid:
      (module as any).video_uuid || (module as any).video_data?.uuid || null,
  })
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module.title,
      type: (module.type || (module as any).module_type || 'lesson') as
        | 'lesson'
        | 'quiz'
        | 'assignment',
      description: module.description || '',
      content: module.content || '',
      video: module.video || '',
      video_uuid: (module as any).video_uuid || '',
      videos: module.videos?.map(v => ({ title: v.title, media_uuid: v.uuid, stream_url: v.stream_url })) || 
              ((module as any).video_uuid ? [{ title: 'Video 1', media_uuid: (module as any).video_uuid, stream_url: module.video }] : []),
      is_active: module.is_active ?? false,
      published_at: module.published_at
        ? new Date(module.published_at).toISOString()
        : '',
      quiz_uuid: module.quiz_uuid || module.quiz?.uuid || '',
    },
  })

  useEffect(() => {
    if (isExpanded) {
      // Support both naming conventions (module_type vs type)
      const mType = (module.type || (module as any).module_type || 'lesson') as
        | 'lesson'
        | 'quiz'
        | 'assignment'

      // Handle nested quiz data from API (quiz.uuid vs quiz_uuid)
      let quizUuid = module.quiz_uuid || module.quiz?.uuid || ''

      // Optimization: if it's a quiz and none is selected, but exactly one quiz exists, auto-select it
      if (mType === 'quiz' && !quizUuid && quizzes.length === 1) {
        quizUuid = quizzes[0].uuid
      }

      // Handle initial videos
      let initialVideos: {title: string, media_uuid: string, stream_url?: string}[] = []
      if (module.videos && module.videos.length > 0) {
        initialVideos = module.videos.map(v => ({
          title: v.title,
          media_uuid: v.uuid,
          stream_url: v.stream_url
        }))
      } else if ((module as any).video_uuid || module.video) {
        initialVideos = [{
          title: 'Video 1',
          media_uuid: (module as any).video_uuid || '',
          stream_url: module.video || ''
        }]
      }

      form.reset({
        title: module.title,
        type: mType,
        description: module.description || '',
        content: module.content || '',
        video: module.video || '',
        video_uuid: (module as any).video_uuid || '',
        videos: initialVideos,
        is_active: module.is_active ?? false,
        published_at: module.published_at
          ? new Date(module.published_at).toISOString()
          : '',
        quiz_uuid: quizUuid,
      })

      // Update video status when expanding
      setVideoStatus({
        status: module.video
          ? 'finished'
          : (module as any).video_data?.status ||
            ((module as any).video_uuid ? 'processing' : null),
        progress: module.video
          ? 100
          : (module as any).video_data?.progress || 0,
        duration: (module as any).video_data?.duration,
        uuid:
          (module as any).video_uuid ||
          (module as any).video_data?.uuid ||
          null,
      })
    }
  }, [isExpanded, module, form, quizzes])

  useEffect(() => {
    // Stop polling if we reach a terminal state
    const isPollingStatus =
      videoStatus.status &&
      !['completed', 'finished', 'available', 'failed'].includes(videoStatus.status)

    const videoUuid = videoStatus.uuid

    if (videoUuid && isPollingStatus) {
      pollingInterval.current = setInterval(async () => {
        try {
          const status = await adminCourseService.getVideoStatus(videoUuid)
          const progress = status.progress || 0

          // Update internal state
          setVideoStatus({
            status: status.status as any,
            progress: progress,
            duration: status.duration,
            uuid: status.uuid,
          })

          // Terminal success states
          if (['completed', 'finished', 'available'].includes(status.status)) {
            if (status.stream_url)
              form.setValue('video', status.stream_url, {
                shouldDirty: true,
                shouldValidate: true,
              })
            if (status.thumbnail_url)
              form.setValue('video_thumbnail', status.thumbnail_url, {
                shouldDirty: true,
                shouldValidate: true,
              })
            if (status.uuid)
              form.setValue('video_uuid', status.uuid, {
                shouldDirty: true,
                shouldValidate: true,
              })

            if (pollingInterval.current) {
              clearInterval(pollingInterval.current)
              pollingInterval.current = null
            }
            toast.success('Video processing completed')
          } else if (status.status === 'failed') {
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current)
              pollingInterval.current = null
            }
            setVideoStatus((prev) => ({
              ...prev,
              status: 'failed',
              uuid: null,
            }))
            toast.error('Video processing failed')
          }
        } catch (error) {
          console.error('Video polling error:', error)
        }
      }, 3000)
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
    }
  }, [videoStatus.status, videoStatus.uuid, form])

  const moduleType = form.watch('type')

  const onSubmit = async (values: ModuleFormValues) => {
    setIsSaving(true)
    try {
      const payload = {
        ...values,
        module_type: values.type,
      }

      // Cleanup payload based on type to ensure backend integrity
      if (values.type === 'lesson') {
        delete (payload as any).quiz_uuid
        
        // Remove empty videos and ensure activation rules
        if (payload.videos) {
          payload.videos = payload.videos.filter((v: any) => v.media_uuid)
        }
        if (payload.is_active && (!payload.videos || payload.videos.length === 0)) {
          toast.error('Cannot activate a lesson module without videos')
          setIsSaving(false)
          return
        }
      } else if (values.type === 'quiz') {
        // Ensure quiz_uuid is present; if it's an empty string, we can send null if required,
        // but typically a required select ensures it's there
        if (!payload.quiz_uuid) {
          toast.error('Please select a quiz for this module')
          return
        }
      }

      const updated = await adminCourseModuleService.update(
        courseUuid,
        module.id,
        payload as any,
      )

      // If the API response doesn't include the videos array (common),
      // preserve the form's current video list so the isExpanded reset
      // effect doesn't wipe the playlist on the next render.
      const currentFormVideos = values.videos
      const mergedModule: CourseModule = {
        ...updated,
        videos:
          updated.videos && updated.videos.length > 0
            ? updated.videos
            : currentFormVideos
                ?.filter((v) => v.media_uuid)
                .map((v, i) => ({
                  uuid: v.media_uuid || '',
                  title: v.title || `Video ${i + 1}`,
                  order_weight: i,
                  stream_url: v.stream_url || '',
                  watch_progress: null,
                })) ?? [],
      }

      onUpdate(mergedModule)
      toast.success('Module saved')
      // Keep module open after save
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach((key) => {
          const fieldError = error.response.data.errors[key]
          const message =
            typeof fieldError === 'object'
              ? (Object.values(fieldError)[0] as string)
              : fieldError

          form.setError(key as any, {
            type: 'server',
            message: message,
          })
        })
      }
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Save failed')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    setIsUploadingVideo(true)
    setVideoStatus({ status: 'uploading', progress: 0, uuid: null })
    try {
      const data = await adminCourseService.uploadVideo(file)
      form.setValue('video_uuid', data.uuid, { shouldDirty: true })
      setVideoStatus({
        status: data.status as any,
        progress: data.progress || 0,
        uuid: data.uuid,
      })

      if (['completed', 'finished', 'available'].includes(data.status)) {
        form.setValue('video', data.stream_url || '', { shouldDirty: true })
      }
    } catch {
      setVideoStatus({ status: 'failed', progress: 0, uuid: null })
      toast.error('Video upload failed')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex gap-6 p-1',
        !isExpanded && 'hover:translate-x-1 transition-transform',
      )}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ type: 'tween', duration: 0.2 }}
    >
      {/* Timeline Indicator */}
      <div className="flex flex-col items-start pt-3 shrink-0">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm font-black text-[10px] transition-all duration-500',
            isExpanded
              ? 'bg-primary border-primary text-primary-foreground scale-110'
              : 'bg-background border-muted text-muted-foreground',
          )}
        >
          {(index + 1).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Module Card */}
      <div
        className={cn(
          'flex-1 rounded-2xl border transition-all duration-500 overflow-hidden bg-card',
          isExpanded
            ? 'border-primary/20 shadow-xl ring-2 ring-primary/5'
            : 'border-muted shadow-sm hover:shadow-md hover:border-primary/10',
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'p-4 flex items-center justify-between cursor-pointer select-none transition-colors',
            isExpanded ? 'bg-primary/5' : 'hover:bg-muted/30',
          )}
          onClick={onExpand}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'p-2 rounded-lg transition-colors',
                isExpanded
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {module.type === 'quiz' || module.module_type === 'quiz' ? (
                <HelpCircle className="size-4" />
              ) : (
                <PlayCircle className="size-4" />
              )}
              {module.type === 'assignment' || module.module_type === 'assignment' && (
                <FileEdit className="size-4" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <h4
                className={cn(
                  'font-bold tracking-tight truncate transition-all duration-300',
                  isExpanded
                    ? 'text-lg text-primary'
                    : 'text-sm text-foreground',
                )}
              >
                {module.title}
              </h4>
              {!isExpanded && (
                <div className="flex items-center gap-3 mt-1.5 animate-in fade-in duration-700">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[9px] uppercase font-bold border-none ring-1',
                      module.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
                    )}
                  >
                    {module.is_active ? 'Active' : 'Draft'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase font-bold bg-muted/30 border-none ring-1 ring-border"
                  >
                    {module.type || module.module_type || 'LESSON'}
                  </Badge>
                  {module.type !== 'quiz' && module.module_type !== 'quiz' && videoStatus.status && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] uppercase font-bold border-none ring-1',
                        videoStatus.status === 'completed' || videoStatus.status === 'finished'
                          ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                          : (videoStatus.status as string) === 'available'
                          ? 'bg-emerald-100/90 text-emerald-700 ring-emerald-500/20'
                          : videoStatus.status === 'processing'
                          ? 'bg-amber-100/90 text-amber-700 ring-amber-500/20 animate-pulse'
                          : videoStatus.status === 'pending'
                          ? 'bg-slate-100/90 text-slate-700 ring-slate-500/20'
                          : videoStatus.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-600 ring-rose-500/20'
                          : 'bg-blue-500/10 text-blue-600 ring-blue-500/20'
                      )}
                    >
                      {videoStatus.status === 'completed' || videoStatus.status === 'finished' ? 'HD READY' 
                      : (videoStatus.status as string) === 'available' ? 'WATCHABLE (HD PENDING)' 
                      : videoStatus.status === 'processing' ? 'ENCODING 480P...' 
                      : videoStatus.status === 'pending' ? 'QUEUED' 
                      : videoStatus.status === 'failed' ? 'FAILED' 
                      : videoStatus.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              <Button
                className="size-7 rounded-lg"
                disabled={isFirst}
                size="icon"
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onMove('up')
                }}
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                className="size-7 rounded-lg"
                disabled={isLast}
                size="icon"
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onMove('down')
                }}
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
            <ConfirmDialog
              title="Delete Module"
              description={`This action cannot be undone. This will permanently delete the module "${module.title}" and remove its data from our servers.`}
              confirmText="Delete Module"
              onConfirm={onDelete}
              trigger={
                <Button
                  className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-500',
                isExpanded && 'rotate-180',
              )}
              onClick={onExpand}
            />
          </div>
        </div>

        {/* Inline Form */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="p-6 pt-4 space-y-8 border-t border-border/50">
                <Form {...form}>
                  <div
                    className="space-y-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        const target = e.target as HTMLElement
                        const isTextArea = target.tagName === 'TEXTAREA'
                        const isEditor =
                          target.closest('.ql-editor') ||
                          target.classList.contains('tox-edit-area')

                        if (!isTextArea && !isEditor) {
                          e.preventDefault()
                          e.stopPropagation()
                          form.handleSubmit(onSubmit)()
                        }
                      }
                    }}
                  >
                    {/* Module Type Tabs */}
                    <Tabs
                      className="w-full"
                      value={moduleType}
                      onValueChange={(val) =>
                        form.setValue('type', val as 'lesson' | 'quiz', {
                          shouldDirty: true,
                        })
                      }
                    >
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
                            Module Definition
                          </label>
                          <TabsList className="bg-muted/50 p-1 border rounded-xl w-full grid grid-cols-2 h-11">
                            <TabsTrigger
                              className="flex-1 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold gap-2"
                              value="lesson"
                            >
                              <PlayCircle className="size-4" />
                              Lesson
                            </TabsTrigger>
                            <TabsTrigger
                              className="flex-1 data-[state=active]:bg-background data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold gap-2"
                              value="quiz"
                            >
                              <HelpCircle className="size-4" />
                              Quiz
                            </TabsTrigger>
                            {/* Assignment Tab hidden per user request
                            <TabsTrigger
                              className="flex-1 data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold gap-2"
                              value="assignment"
                            >
                              <FileEdit className="size-4" />
                              Assignment
                            </TabsTrigger>
                            */}
                          </TabsList>
                        </div>

                        <div className="pt-2">
                          <TabsContent
                            className="space-y-8 mt-0 outline-none animate-in fade-in zoom-in-95 duration-200"
                            value="lesson"
                          >
                            {/* Row 1: Title and Short Description */}
                            <div className="grid gap-6 md:grid-cols-2">
                              <FormInput
                                control={form.control}
                                label="Module Title"
                                name="title"
                                placeholder="e.g. Introduction to React"
                                required
                              />
                              <FormTextarea
                                control={form.control}
                                label="Short Description"
                                name="description"
                                placeholder="Brief summary of this module..."
                              />
                            </div>

                            {/* Row 2: Video Playlist Manager */}
                            <div className="py-8 border-y border-border/50 bg-muted/20 -mx-6 px-6">
                              <VideoPlaylistManager 
                                control={form.control} 
                                setValue={form.setValue}
                                name="videos" 
                                label="Lesson Videos"
                                description="Add one or more videos to this lesson. Drag to reorder."
                              />
                            </div>

                            {/* Row 3: Content */}
                            <FormEditor
                              control={form.control}
                              label="Learn Content"
                              name="content"
                              required
                            />
                          </TabsContent>

                          <TabsContent
                            className="space-y-6 mt-0 outline-none animate-in fade-in zoom-in-95 duration-200"
                            value="quiz"
                          >
                            {/* Row 1: Title (Quiz needs title too) */}
                            <div className="grid gap-6 md:grid-cols-2">
                              <FormInput
                                control={form.control}
                                label="Module Title"
                                name="title"
                                placeholder="e.g. Weekly Quiz #1"
                                required
                              />
                              <FormTextarea
                                control={form.control}
                                label="Objective"
                                name="description"
                                placeholder="What should students expect in this quiz?"
                              />
                            </div>

                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 mb-2">
                              <div className="p-3 rounded-xl bg-orange-500 text-white shadow-lg">
                                <HelpCircle className="size-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-orange-900 leading-tight">
                                  Quiz Assessment Selection
                                </h4>
                                <p className="text-xs text-orange-700/70 mt-1 max-w-[400px]">
                                  Connect this module to a pre-defined
                                  evaluation. Students will need to complete the
                                  quiz to progress.
                                </p>
                              </div>
                              <Button
                                className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 rounded-lg px-4 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none transition-all"
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setIsQuizModalOpen(true)}
                              >
                                <Plus className="size-3" />
                                New Quiz
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                <label className="text-xs font-bold text-foreground">
                                  Linked Quiz Database Item
                                </label>
                              </div>
                              <FormSearchableSelect
                                control={form.control}
                                description="Select from your shared quiz bank to link to this course module."
                                disabled={isQuizzesLoading}
                                name="quiz_uuid"
                                options={quizzes.map((q) => ({
                                  label: q.title,
                                  value: q.uuid,
                                }))}
                                placeholder={
                                  isQuizzesLoading
                                    ? 'Synchronizing database...'
                                    : 'Search for a quiz title...'
                                }
                                required
                              />
                            </div>

                            <QuizModal
                              isOpen={isQuizModalOpen}
                              onClose={() => setIsQuizModalOpen(false)}
                              onSuccess={(newQuiz) => {
                                onQuizCreated(newQuiz)
                                form.setValue('quiz_uuid', newQuiz.uuid, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setIsQuizModalOpen(false)
                              }}
                            />

                            {form.watch('quiz_uuid') && (
                              <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    <span className="text-sm font-bold text-primary">
                                      Success: Module Connected to Quiz
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      className="h-7 text-[10px] font-bold gap-1.5 rounded-lg pr-2 bg-background border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all"
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsBuilderOpen(true)}
                                    >
                                      <ExternalLink className="size-3" />
                                      Configure Questions
                                    </Button>
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-black text-[10px]">
                                      READY
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}

                            <QuizBuilderSheet
                              quizUuid={form.watch('quiz_uuid') || null}
                              isOpen={isBuilderOpen}
                              onClose={() => setIsBuilderOpen(false)}
                            />
                          </TabsContent>

                          <TabsContent
                            className="space-y-6 mt-0 outline-none animate-in fade-in zoom-in-95 duration-200"
                            value="assignment"
                          >
                            <div className="p-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl relative overflow-hidden">
                              <AssignmentEditor
                                courseUuid={courseUuid}
                                moduleUuid={module.id}
                                initialData={module.assignment}
                                onSaved={(updatedAssignment) => {
                                  onUpdate({ ...module, assignment: updatedAssignment, assignment_uuid: updatedAssignment.uuid } as any)
                                }}
                              />
                            </div>
                          </TabsContent>
                        </div>
                      </div>
                    </Tabs>

                    {/* Row 4: Status and Published At */}
                    <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-border/30">
                      <FormSelectStatus
                        control={form.control}
                        label="Module Status"
                        name="is_active"
                      />
                      <FormInputDateTime
                        control={form.control}
                        label="Publish Date"
                        name="published_at"
                        placeholder="Immediate"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="ghost" onClick={onExpand}>
                        {t('common.cancel')}
                      </Button>
                      <Button
                        disabled={isSaving}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          form.handleSubmit(onSubmit)(e)
                        }}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {t('common.save', 'Save Module')}
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
