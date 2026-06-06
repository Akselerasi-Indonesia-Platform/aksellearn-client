import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Loader2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  FormInput,
  FormInputImage,
  FormSelect,
  FormSwitch,
  FormTextarea,
  FormInputDateTime,
} from '@/components/admin/shared/form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import type { Banner, BannerPayload } from '@/types/banner'
import { adminMediaService } from '@/services/admin/media.service'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
  image_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  target_audience: z.enum(['all', 'guest', 'authenticated']),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
})

interface BannerFormProps {
  banner?: Banner
  onSubmit: (data: BannerPayload) => void
  onCancel: () => void
  onDelete?: () => void
}

export function BannerForm({
  banner,
  onSubmit,
  onCancel,
  onDelete,
}: BannerFormProps) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      cta_label: banner?.cta_label || '',
      cta_url: banner?.cta_url || '',
      image_id: banner?.image_id || null,
      image_url: banner?.image_url || '',
      target_audience: banner?.target_audience || 'all',
      start_at: banner?.start_at || null,
      end_at: banner?.end_at || null,
      is_active: banner?.is_active ?? true,
      sort_order: banner?.sort_order ?? 0,
    },
  }) as any

  const handleOnSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      title: values.title,
      subtitle: values.subtitle || null,
      cta_label: values.cta_label || null,
      cta_url: values.cta_url || null,
      image_id: values.image_id || null,
      target_audience: values.target_audience,
      start_at: values.start_at || null,
      end_at: values.end_at || null,
      is_active: values.is_active,
      sort_order: values.sort_order,
    })
  }

  const handleUploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const res = await adminMediaService.upload(file, 'platform')
      const mediaId = (res as any).id || (res as any).ID
      if (mediaId) {
        form.setValue('image_id', mediaId, { shouldDirty: true })
      }
      form.setValue('image_url', res.url || '', { shouldDirty: true })
    } catch {
      // Handled globally or toast in calling page
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    form.setValue('image_id', null, { shouldDirty: true })
    form.setValue('image_url', '', { shouldDirty: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          label={t('banners.titleField', 'Banner Title')}
          name="title"
          placeholder="e.g. Mega Midyear Promotion"
          required
        />

        <FormTextarea
          control={form.control}
          label={t('banners.subtitleField', 'Subtitle (optional)')}
          name="subtitle"
          placeholder="e.g. Get up to 50% discount on all development courses"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            label={t('banners.ctaLabel', 'Button Text')}
            name="cta_label"
            placeholder="e.g. Enroll Now"
          />
          <FormInput
            control={form.control}
            label={t('banners.ctaUrl', 'Button Link')}
            name="cta_url"
            placeholder="e.g. /search?category=development"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            control={form.control}
            label={t('banners.targetAudience', 'Show To')}
            name="target_audience"
            options={[
              { label: t('banners.audienceAll', 'Everyone'), value: 'all' },
              { label: t('banners.audienceGuest', 'Visitors only'), value: 'guest' },
              { label: t('banners.audienceAuth', 'Logged-in users only'), value: 'authenticated' },
            ]}
          />
          <FormInput
            control={form.control}
            label={t('banners.sortOrder', 'Display Order')}
            name="sort_order"
            type="number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInputDateTime
            control={form.control}
            label={t('banners.startAt', 'Show From')}
            name="start_at"
          />
          <FormInputDateTime
            control={form.control}
            label={t('banners.endAt', 'Show Until')}
            name="end_at"
          />
        </div>

        <FormInputImage
          control={form.control}
          name="image_url"
          label={t('banners.imageField', 'Banner Image')}
          isUploading={isUploading}
          onUpload={handleUploadImage}
          onClear={handleClearImage}
          aspect="video"
        />

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="gap-2 font-bold"
              >
                <Trash2 className="size-4" />
                {t('common.delete', 'Delete')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="font-bold"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className="font-bold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {banner ? t('common.save', 'Save') : t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}