'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FormInput, FormEditor } from '@/components/admin/shared/form'
import { adminCourseAnnouncementService } from '@/services/admin/course-announcement.service'
import type { CourseAnnouncement } from '@/types/course'
import { useState } from 'react'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

type FormValues = z.infer<typeof formSchema>

interface CourseAnnouncementFormProps {
  courseUuid: string
  announcement?: CourseAnnouncement
  onSuccess: () => void
  onCancel: () => void
}

export function CourseAnnouncementForm({
  courseUuid,
  announcement,
  onSuccess,
  onCancel,
}: CourseAnnouncementFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      if (announcement) {
        await adminCourseAnnouncementService.update(
          courseUuid,
          announcement.id,
          values,
        )
        toast.success(t('common.updateSuccess', 'Announcement updated'))
      } else {
        await adminCourseAnnouncementService.create(courseUuid, values)
        toast.success(t('common.createSuccess', 'Announcement created'))
      }
      onSuccess()
    } catch (error: any) {
      console.error('ANNOUNCEMENT_SAVE_ERROR:', error)

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        Object.keys(serverErrors).forEach((key) => {
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
      } else {
        toast.error(t('common.saveFailed', 'Failed to save announcement'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit(onSubmit)(e)
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <div className="space-y-6">
          <FormInput
            control={form.control}
            label={t('common.title')}
            name="title"
            placeholder={t(
              'courses.announcementTitlePlaceholder',
              'Announcement title',
            )}
            required
          />

          <FormEditor
            control={form.control}
            label={t('common.content')}
            name="content"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
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
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {t('common.saving', 'Saving...')}
              </span>
            ) : announcement ? (
              t('common.update')
            ) : (
              t('common.create')
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
