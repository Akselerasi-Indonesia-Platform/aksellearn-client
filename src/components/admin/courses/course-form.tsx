'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import {
  Layout,
  Globe,
  Settings,
  MessageSquare,
  Megaphone,
  BookOpen,
  ListChecks,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FormInput,
  FormTextarea,
  FormSelectStatus,
  FormSearchableSelect,
  FormEditor,
  FormInputImage,
  FormInputVideo,
  FormInputDateTime,
  FormDynamicList,
  FormSwitch,
  FormSelect,
} from '@/components/admin/shared/form'
import type { Course } from '@/types/course'

import { ModuleManager } from './modules/module-manager'
import { AnnouncementManager } from './announcements/announcement-manager'
import { CommentManager } from './comments/comment-manager'
import { CourseCertificateSettings } from './course-certificate-settings'
import { ReviewManager } from './reviews/review-manager'
import { AttachmentManager } from './attachments/attachment-manager'
import { adminCourseService } from '@/services/admin/course.service'
import { adminMediaService } from '@/services/admin/media.service'
import { useBreadcrumbStore } from '@/lib/breadcrumb-store'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  course_category_uuid: z.string().min(1, 'Category is required'),
  thumbnail: z.string(),
  thumbnail_uuid: z.string().nullable(),
  video: z.string(),
  video_thumbnail: z.string(),
  video_uuid: z.string().nullable(),
  is_active: z.boolean(),
  is_corporate: z.boolean().default(false),
  price: z.coerce.number().min(0),
  base_price: z.coerce.number().min(0).optional(),
  access_duration_days: z.coerce.number().min(0).default(365),
  access_type: z.enum(['lifetime', 'duration']).default('lifetime'),
  published_at: z.string(),
  meta_title: z.string(),
  meta_description: z.string(),
  og_image_uuid: z.string().nullable().optional(),
  og_image_url: z.string().optional(),
  modules: z.array(z.any()).optional(),
  announcements: z.array(z.any()).optional(),
  comments: z.array(z.any()).optional(),
  images: z.array(z.string()),
  what_you_will_get: z.array(z.string()).optional(),
  who_is_this_for: z.array(z.string()).optional(),
  what_you_will_learn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  certificate_config: z
    .object({
      variant: z.enum(['modern', 'academic', 'vibrant']),
      title: z.string(),
      subtitle: z.string(),
      issuing_authority: z.string(),
      signature_name: z.string(),
      signature_title: z.string(),
      logo_url: z.string(),
      seal_url: z.string(),
      show_qr: z.boolean(),
      accent_color: z.string(),
      certificate_background_id: z.number().nullable().optional(),
      certificate_background_uuid: z.string().nullable().optional(),
      certificate_background_url: z.string().nullable().optional(),
      certificate_number_pattern: z.string().optional(),
    })
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CourseFormProps {
  course?: Course
  categories: { label: string; value: string }[]
  onSubmit: (data: FormValues, activeTab: string) => void
  onCancel: () => void
  onDelete?: () => void
}

export function CourseForm({
  course,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: CourseFormProps) {
  const { t } = useTranslation()
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoStatus, setVideoStatus] = useState<{
    status:
      | 'pending'
      | 'processing'
      | 'available'
      | 'completed'
      | 'failed'
      | 'finished'
      | 'transcoding'
      | null
    progress: number
    duration?: number
    uuid?: string | null
  }>({
    status: (() => {
      const hasHD = course?.video_data?.qualities?.some((q: string) => ['720p', '1080p', '480p+'].includes(q))
      const backendStatus = course?.video_data?.status
      if (course?.video) return 'finished'
      if (backendStatus === 'available' && hasHD) return 'finished'
      return backendStatus || (course?.video_uuid ? 'processing' : null)
    })(),
    progress: course?.video ? 100 : course?.video_data?.progress || 0,
    duration: course?.video_data?.duration,
    uuid: course?.video_uuid || course?.video_data?.uuid || null,
  })
  const [videoUuid, setVideoUuid] = useState<string | null>(
    course?.video_uuid || course?.video_data?.uuid || null,
  )
  const [activeTab, setActiveTab] = useState('content')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [previewMode, setPreviewMode] = useState<'search' | 'social'>('search')
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: course?.title || '',
      slug: course?.slug || '',
      description: course?.description || '',
      content: course?.content || '',
      course_category_uuid: course?.course_category_uuid || '',
      thumbnail: course?.thumbnail || '',
      thumbnail_uuid: course?.thumbnail_uuid || null,
      video: course?.video || '',
      video_thumbnail: course?.video_thumbnail || '',
      video_uuid: course?.video_uuid || null,
      is_active: course?.is_active ?? true,
      published_at: course?.published_at
        ? new Date(course.published_at).toISOString()
        : '',
      meta_title: course?.meta_title || '',
      meta_description: course?.meta_description || '',
      og_image_uuid: course?.og_image_uuid || '',
      og_image_url: course?.og_image_url || '',
      price: course?.price || 0,
      base_price: course?.base_price || 0,
      access_duration_days: course?.access_duration_days || 365,
      access_type: course?.access_type || 'lifetime',
      is_corporate: course?.is_corporate ?? false,
      modules: course?.modules || [],
      announcements: course?.announcements || [],
      comments: course?.comments || [],
      images: course?.images || [],
      certificate_config: (course?.certificate_config || {
        variant: 'modern',
        title: 'Certificate of Achievement',
        subtitle: 'This is to certify that',
        issuing_authority: 'Madacoda Engineering System',
        signature_name: 'John Madacoda',
        signature_title: 'CTO & Founder',
        logo_url: '',
        seal_url: '',
        show_qr: true,
        accent_color: '',
        certificate_background_id: null,
        certificate_background_uuid: null,
        certificate_background_url: '',
        certificate_number_pattern: '',
      }) as any,
      what_you_will_get: course?.what_you_will_get || [],
      who_is_this_for: Array.isArray(course?.who_is_this_for)
        ? course?.who_is_this_for
        : [],
      what_you_will_learn: course?.what_you_will_learn || [],
      requirements: course?.requirements || [],
    } as any,
  }) as any

  const setBreadcrumbLabel = useBreadcrumbStore((state) => state.setLabel)

  // Synchronize form with course data when it changes (e.g., after initial fetch)
  useEffect(() => {
    if (course) {
      const courseId = course.uuid
      if (courseId && course.title) {
        setBreadcrumbLabel(courseId, course.title)
      }
      form.reset({
        title: course.title || '',
        slug: course.slug || '',
        description: course.description || '',
        content: course.content || '',
        course_category_uuid: course.course_category_uuid || '',
        thumbnail: course.thumbnail || '',
        thumbnail_uuid: course.thumbnail_uuid ?? null,
        video: course.video || '',
        video_thumbnail: course.video_thumbnail || '',
        video_uuid: course.video_uuid ?? null,
        is_active: !!course.is_active,
        published_at: course.published_at
          ? new Date(course.published_at).toISOString()
          : '',
        meta_title: course.meta_title || '',
        meta_description: course.meta_description || '',
        og_image_uuid: course.og_image_uuid || '',
        og_image_url: course.og_image_url || '',
        price: course.price || 0,
        base_price: course.base_price || 0,
        access_duration_days: course.access_duration_days || 365,
        access_type: course.access_type || 'lifetime',
        is_corporate: !!course.is_corporate,
        modules: course.modules || [],
        announcements: course.announcements || [],
        comments: course.comments || [],
        images: course.images || [],
        certificate_config: course.certificate_config || {
          variant: 'modern',
          title: 'Certificate of Achievement',
          subtitle: 'This is to certify that',
          issuing_authority: 'Madacoda Engineering System',
          signature_name: 'John Madacoda',
          signature_title: 'CTO & Founder',
          logo_url: '',
          seal_url: '',
          show_qr: true,
          accent_color: '',
          certificate_background_id: null,
          certificate_background_uuid: null,
          certificate_background_url: '',
          certificate_number_pattern: '',
        },
        what_you_will_get: course.what_you_will_get || [],
        who_is_this_for: Array.isArray(course.who_is_this_for)
          ? course.who_is_this_for
          : [],
        what_you_will_learn: course.what_you_will_learn || [],
        requirements: course.requirements || [],
      })
    }
  }, [course, form])

  useEffect(() => {
    // Stop polling if we reach a terminal state
    const isPollingStatus =
      videoStatus.status &&
      !['completed', 'finished', 'failed'].includes(videoStatus.status)

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

          // 'available' = 480p ready — update form so player shows, but KEEP POLLING for HD
          if (['available'].includes(status.status)) {
            if (status.stream_url)
              form.setValue('video', status.stream_url, {
                shouldDirty: true,
                shouldValidate: true,
              })
            if (status.uuid)
              form.setValue('video_uuid', status.uuid, {
                shouldDirty: true,
                shouldValidate: true,
              })

            // Smart HD detection: check if HD qualities already arrived
            const hasHD = status.qualities?.some((q) => ['720p', '1080p', '480p+'].includes(q))
            const hdFailed = status.hd_status === 'failed'

            if (hasHD) {
              // HD is in the playlist — treat as completed
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current)
                pollingInterval.current = null
              }
              setVideoStatus((prev) => ({ ...prev, status: 'completed' as any }))
              toast.success('HD video is now available')
            } else if (hdFailed) {
              // HD job failed — stop polling, accept 480p as final
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current)
                pollingInterval.current = null
              }
              setVideoStatus((prev) => ({ ...prev, status: 'completed' as any }))
              toast.info('Video available in 480p (HD encoding unavailable for this video)')
            }
            // else: keep polling until HD arrives or fails
          }

          // Terminal success: HD is ready — update form and stop polling
          if (['completed', 'finished'].includes(status.status)) {
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
        } catch (error: any) {
          // 404 = media is fully processed (status endpoint only exists during processing)
          if (error?.response?.status === 404) {
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current)
              pollingInterval.current = null
            }
            setVideoStatus((prev) => ({ ...prev, status: 'completed' as any }))
            console.info('Video polling stopped: media endpoint returned 404 (fully processed)')
          } else {
            console.error('Video polling error:', error)
            // Don't stop polling on transient errors, only on terminal API responses
          }
        }
      }, 3000)
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
    }
  }, [videoUuid, videoStatus.status, form])

  const slugWatch = form.watch('slug')
  const titleWatch = form.watch('title')

  useEffect(() => {
    // Disable auto-generation on initial mount for existing courses to preserve their true slug
    if (course && titleWatch === course.title) {
      return
    }

    // Auto-generate slug when title changes, ONLY if user hasn't manually edited the slug
    if (!form.getFieldState('slug').isDirty && titleWatch) {
      const generatedSlug = titleWatch
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      form.setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [titleWatch, form, course])
  useEffect(() => {
    if (!slugWatch) {
      setSlugStatus('idle')
      return
    }
    // Skip check if the slug hasn't changed from original course slug
    if (course?.slug && slugWatch === course.slug) {
      setSlugStatus('available')
      form.clearErrors('slug')
      return
    }

    setSlugStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const courseId = course?.uuid
        const result = await adminCourseService.checkSlug(slugWatch, courseId)
        setSlugStatus(result.is_available ? 'available' : 'taken')
        if (!result.is_available) {
          form.setError('slug', { type: 'manual', message: 'This slug is already taken. Please modify it.' })
        } else {
          form.clearErrors('slug')
        }
      } catch (err) {
        setSlugStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [slugWatch, course?.uuid, course?.slug, form])

  const handleOnSubmit = async (values: FormValues) => {
    try {
      // Send only necessary IDs/UUIDs according to Protocol V1
      const { ...data } = values
      await onSubmit(data as any, activeTab)
    } catch (error: any) {
      console.error('SERVER ERROR:', error)

      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        Object.keys(serverErrors).forEach((key) => {
          // Flatten standard error format from Go/Laravel: { field: { rule: "message" } } or { field: ["message"] }
          const fieldError = serverErrors[key]
          const message =
            typeof fieldError === 'object'
              ? (Object.values(fieldError)[0] as string)
              : fieldError

          form.setError(key as any, {
            type: 'server',
            message: message,
          })
        })

        // Also show a generic toast with the primary message if available
        if (error.response.data.message) {
          toast.error(error.response.data.message)
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(handleOnSubmit, (err: any) =>
          console.log('FORM VALIDATION ERRORS:', err),
        )}
      >
        <Tabs
          className="w-full"
          defaultValue="content"
          onValueChange={setActiveTab}
        >
          <div className="overflow-x-auto pb-1 mb-6 -mx-2 px-2">
            <TabsList className="flex w-full min-w-max gap-1 bg-muted/50 p-1 border rounded-xl h-12">
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="content"
              >
                <Layout className="h-4 w-4 mr-2" />
                {t('common.content')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="module"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t('common.module', 'Module')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="summary"
              >
                <ListChecks className="h-4 w-4 mr-2" />
                {t('courses.summary', 'Summary')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="announcement"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                {t('courses.announcements', 'Announcements')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="resources"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {t('courses.resources', 'Resources')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="comment"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('common.comments', 'Comments')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="review"
              >
                <Star className="h-4 w-4 mr-2" />
                {t('courses.reviews', 'Reviews')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="certificate"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('common.certificate', 'Certificate')}
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all h-full rounded-lg font-bold"
                value="seo"
              >
                <Globe className="h-4 w-4 mr-2" />
                {t('common.seo')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Tab */}
          <TabsContent
            className="space-y-6 animate-in fade-in-50 duration-300 outline-none"
            value="content"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormInput
                control={form.control}
                label={t('common.title')}
                name="title"
                placeholder={t('courses.titlePlaceholder', 'Course title')}
                required
              />
              <FormInput
                control={form.control}
                label="Slug"
                name="slug"
                placeholder="e.g. advanced-go-react"
                required
                description={
                  <span className="block -mt-1 leading-none">
                    {slugStatus === 'checking' && (
                      <span className="text-xs text-slate-500 animate-pulse">Checking availability...</span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-xs text-emerald-600 font-medium">✓ Slug is available</span>
                    )}
                  </span>
                }
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormSearchableSelect
                control={form.control}
                label={t('common.category')}
                name="course_category_uuid"
                options={categories}
                placeholder={t('common.selectCategory', 'Select Category')}
                description="Used for catalog filtering and promotion scope targeting."
                required
              />

            </div>

            <FormTextarea
              control={form.control}
              label={t('common.description')}
              name="description"
              placeholder={t(
                'courses.descriptionPlaceholder',
                'Brief overview of the course',
              )}
              required
            />

            <div className="flex flex-col md:flex-row items-start justify-around py-6">
              <div className="w-full md:w-1/3 max-w-[420px]">
                <FormInputImage
                  control={form.control}
                  isUploading={isUploadingThumbnail}
                  label={t('common.thumbnail')}
                  name="thumbnail"
                  description="Recommended: 1280x720px (16:9). This is the first image students see on the course card."
                  onClear={() => {
                    form.setValue('thumbnail', '')
                    form.setValue('thumbnail_uuid', null)
                  }}
                  onUpload={async (file) => {
                    setIsUploadingThumbnail(true)
                    try {
                      const res = await adminMediaService.upload(file, 'course')
                      let url = res.url || ''
                      if (res.images) {
                        url =
                          res.images['original'] ||
                          res.images['175x175'] ||
                          Object.values(res.images)[0] ||
                          ''
                      }
                      form.setValue('thumbnail', url)
                      form.setValue('thumbnail_uuid', res.uuid)
                    } finally {
                      setIsUploadingThumbnail(false)
                    }
                  }}
                />
              </div>

              <div className="w-full md:w-1/3 max-w-[420px]">
                <FormInputVideo
                  control={form.control}
                  isUploading={isUploadingVideo}
                  label={t('common.video')}
                  name="video"
                  videoStatus={videoStatus as any}
                  onClear={() => {
                    form.setValue('video', '')
                    form.setValue('video_uuid', null)
                    setVideoUuid(null)
                    setVideoStatus({ status: null, progress: 0 })
                  }}
                  onUpload={async (file) => {
                    setIsUploadingVideo(true)
                    try {
                      const res = await adminMediaService.upload(file, 'course')
                      form.setValue('video', res.url || '')
                      form.setValue('video_uuid', res.uuid)
                      setVideoUuid(res.uuid)
                      setVideoStatus({
                        status: (res.status as any) || 'pending',
                        progress: res.progress || 0,
                      })
                    } finally {
                      setIsUploadingVideo(false)
                    }
                  }}
                />
              </div>
            </div>

            {/* Hidden UUID fields to ensure they are tracked and sent in payload */}
            <FormField
              control={form.control}
              name="thumbnail_uuid"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_uuid"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormEditor
              className="mt-6"
              control={form.control}
              label={t('common.content')}
              name="content"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <FormInput
                control={form.control}
                label={t('common.price', 'Price')}
                name="price"
                type="number"
                placeholder="0"
                required
                leftAddon="Rp"
              />
              <FormSelectStatus
                control={form.control}
                label={t('common.status')}
                name="is_active"
                placeholder={t('common.selectStatus', 'Select Status')}
                description="Only active courses appear in the student catalog. Use Draft to prepare before publishing."
                required
              />
              {(() => {
                const initialAccessType = course?.access_type || (course && !course.access_duration_days ? 'lifetime' : 'duration')
                const hasEnrollments = course?.summary?.stats?.total_students ? course.summary.stats.total_students > 0 : false
                const isInitiallyLifetime = initialAccessType === 'lifetime'
                const disableAccessType = isInitiallyLifetime && hasEnrollments

                const accessTypeField = (
                  <FormSelect
                    control={form.control}
                    label={t('courses.accessType', 'Access Type')}
                    name="access_type"
                    disabled={disableAccessType}
                    options={[
                      { label: t('courses.lifetime', 'Lifetime'), value: 'lifetime' },
                      { label: t('courses.limitedDuration', 'Limited Duration'), value: 'duration' },
                    ]}
                    onValueChange={(val) => {
                      if (val === 'lifetime') {
                        form.setValue('access_duration_days', 0)
                      } else {
                        form.setValue('access_duration_days', 365)
                      }
                    }}
                  />
                )

                if (disableAccessType) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          {accessTypeField}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Cannot change access type: this course already has active enrollments
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return accessTypeField
              })()}

              {form.watch('access_type') === 'duration' && (
                <FormInput
                  control={form.control}
                  label={t('courses.accessDuration', 'Access Duration (Days)')}
                  name="access_duration_days"
                  type="number"
                  placeholder="365"
                  required
                />
              )}

              <FormInputDateTime
                control={form.control}
                label={t('common.publishedAt')}
                name="published_at"
              />
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent
            className="space-y-8 animate-in fade-in-50 duration-300 outline-none"
            value="summary"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
                <FormDynamicList
                  control={form.control}
                  label={t('courses.whatYouWillLearn', 'What You Will Learn')}
                  name="what_you_will_learn"
                  placeholder="e.g. Master the basics of Go"
                />
                <FormDynamicList
                  control={form.control}
                  label={t('courses.whatYouWillGet', 'What You Will Get')}
                  name="what_you_will_get"
                  placeholder="e.g. 50+ HD Video Lessons"
                />
              </div>
              <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
                <FormDynamicList
                  control={form.control}
                  label={t('courses.whoIsThisFor', 'Who Is This For')}
                  name="who_is_this_for"
                  placeholder="e.g. Beginners in Software Engineering"
                />
                <FormDynamicList
                  control={form.control}
                  label={t('courses.requirements', 'Requirements')}
                  name="requirements"
                  placeholder="e.g. Basic understanding of programming"
                />
              </div>
            </div>
          </TabsContent>

          {/* Module Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="module"
          >
            {course?.uuid ? (
              <ModuleManager courseUuid={course.uuid as string} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border shadow-sm">
                <div className="p-4 rounded-full bg-primary/5 text-primary mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Save Course First</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">
                  You need to save the course general information before
                  managing modules.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Announcement Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="announcement"
          >
            {course?.uuid ? (
              <AnnouncementManager courseUuid={course.uuid as string} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border shadow-sm">
                <div className="p-4 rounded-full bg-primary/5 text-primary mb-4">
                  <Megaphone className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Save Course First</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">
                  You need to save the course general information before
                  creating announcements.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="resources"
          >
            {course?.uuid ? (
              <AttachmentManager courseUuid={course.uuid as string} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border shadow-sm">
                <div className="p-4 rounded-full bg-primary/5 text-primary mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Save Course First</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">
                  You need to save the course general information before
                  adding course resources.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Comment Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="comment"
          >
            {course?.uuid ? (
              <CommentManager courseUuid={course.uuid as string} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border shadow-sm">
                <div className="p-4 rounded-full bg-primary/5 text-primary mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Save Course First</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">
                  Comments management will be available after saving the course.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="review"
          >
            {course?.uuid ? (
              <ReviewManager courseUuid={course.uuid as string} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-2xl border shadow-sm">
                <div className="p-4 rounded-full bg-primary/5 text-primary mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Save Course First</h3>
                <p className="text-muted-foreground text-sm max-w-[300px]">
                  Reviews management will be available after saving the course.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Certificate Tab */}
          <TabsContent
            className="animate-in fade-in-50 duration-300 outline-none"
            value="certificate"
          >
            <CourseCertificateSettings courseUuid={course?.uuid as string} />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent
            className="space-y-6 animate-in fade-in-50 duration-300 outline-none"
            value="seo"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-6">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs uppercase tracking-wider opacity-60 font-bold">
                          {t('common.metaTitle', 'Meta Title')}
                        </label>
                        <span className={cn(
                          "text-[10px] font-mono",
                          (field.value || '').length > 60 ? "text-destructive font-bold" : "text-muted-foreground"
                        )}>
                          {(field.value || '').length}/60
                        </span>
                      </div>
                      <FormControl>
                        <Input
                          className="h-10 rounded-lg"
                          placeholder="Meta Title for Google Search"
                          maxLength={60}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground leading-none">
                        Recommended: 50-60 characters
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs uppercase tracking-wider opacity-60 font-bold">
                          {t('common.metaDescription', 'Meta Description')}
                        </label>
                        <span className={cn(
                          "text-[10px] font-mono",
                          (field.value || '').length > 160 ? "text-destructive font-bold" : "text-muted-foreground"
                        )}>
                          {(field.value || '').length}/160
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          className="rounded-lg resize-none"
                          placeholder="Short summary for search results..."
                          rows={4}
                          maxLength={160}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground leading-none">
                        Recommended: 120-160 characters
                      </p>
                    </FormItem>
                  )}
                />

                <FormInputImage
                  control={form.control}
                  isUploading={isUploadingOgImage}
                  label="OG Social Image"
                  name="og_image_url"
                  onClear={() => {
                    form.setValue('og_image_url', '')
                    form.setValue('og_image_uuid', null)
                  }}
                  onUpload={async (file) => {
                    setIsUploadingOgImage(true)
                    try {
                      const res = await adminMediaService.upload(file, 'course')
                      let url = res.url || ''
                      if (res.images) {
                        url =
                          res.images['original'] ||
                          res.images['175x175'] ||
                          Object.values(res.images)[0] ||
                          ''
                      }
                      form.setValue('og_image_url', url)
                      form.setValue('og_image_uuid', res.uuid)
                    } finally {
                      setIsUploadingOgImage(false)
                    }
                  }}
                />

                <FormField
                  control={form.control}
                  name="og_image_uuid"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* SEO Preview Panel */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs uppercase tracking-wider opacity-60 font-bold">
                    Interactive Previews
                  </span>
                  <div className="flex gap-1 bg-muted p-0.5 rounded-lg border text-xs">
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 rounded-md transition-all duration-200 font-bold",
                        previewMode === 'search'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setPreviewMode('search')}
                    >
                      Google Search
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1 rounded-md transition-all duration-200 font-bold",
                        previewMode === 'social'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setPreviewMode('social')}
                    >
                      Social Media
                    </button>
                  </div>
                </div>

                <div className="p-6 border rounded-2xl bg-white border-slate-200/80 shadow-sm min-h-[220px] flex flex-col justify-center">
                  {previewMode === 'search' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">G</span>
                        <span>maksellearn.test › course › {form.watch('slug') || (form.watch('title') || '').toLowerCase().replace(/\s+/g, '-')}</span>
                      </div>
                      <h3 className="text-[19px] text-[#1a0dab] font-normal hover:underline cursor-pointer transition-all leading-tight">
                        {form.watch('meta_title') ||
                          form.watch('title') ||
                          'Your Course Title Will Appear Here'}
                      </h3>
                      <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                        {form.watch('meta_description') ||
                          form.watch('description') ||
                          'Your detailed meta description will show up here to convince students to click on your course...'}
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-[#f2f3f5]">
                      <div className="aspect-[1.91/1] w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
                        {form.watch('og_image_url') || form.watch('thumbnail') ? (
                          <img
                            src={form.watch('og_image_url') || form.watch('thumbnail')}
                            className="w-full h-full object-cover"
                            alt="Social Share Thumbnail"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                            <Globe className="h-10 w-10 mb-2 opacity-40 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Image Selected</span>
                            <span className="text-[9px] mt-0.5">Falls back to course thumbnail</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          MAKSELLEARN.TEST
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 leading-snug">
                          {form.watch('meta_title') ||
                            form.watch('title') ||
                            'Your Course Title'}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-normal">
                          {form.watch('meta_description') ||
                            form.watch('description') ||
                            'Course description goes here...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {['content', 'summary', 'certificate', 'seo'].includes(activeTab) && (
          <div className="flex justify-between items-center pt-6 border-t animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              {course && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 p-0"
                  onClick={onDelete}
                  title={t('common.delete')}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                className="hover:bg-accent/50 transition-all duration-200 rounded-xl"
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 shadow-filament hover:shadow-filament-hover active:scale-[0.98] transition-all duration-200 px-8 rounded-xl font-bold"
                type="submit"
              >
                {course ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
