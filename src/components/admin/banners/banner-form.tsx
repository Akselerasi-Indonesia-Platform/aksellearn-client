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
  image_uuid: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  mobile_image_uuid: z.string().nullable().optional(),
  mobile_image_url: z.string().nullable().optional(),
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
  const [isUploadingMobile, setIsUploadingMobile] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      cta_label: banner?.cta_label || '',
      cta_url: banner?.cta_url || '',
      image_uuid: banner?.image_uuid || null,
      image_url: banner?.image_url || '',
      mobile_image_uuid: banner?.mobile_image_uuid || null,
      mobile_image_url: banner?.mobile_image_url || '',
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
      image_uuid: values.image_uuid || null,
      mobile_image_uuid: values.mobile_image_uuid || null,
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
      if (res.uuid) {
        form.setValue('image_uuid', res.uuid, { shouldDirty: true })
      }
      form.setValue('image_url', res.url || '', { shouldDirty: true })
    } catch {
      // Handled globally or toast in calling page
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    form.setValue('image_uuid', null, { shouldDirty: true })
    form.setValue('image_url', '', { shouldDirty: true })
  }

  const handleUploadMobileImage = async (file: File) => {
    setIsUploadingMobile(true)
    try {
      const res = await adminMediaService.upload(file, 'platform')
      if (res.uuid) {
        form.setValue('mobile_image_uuid', res.uuid, { shouldDirty: true })
      }
      form.setValue('mobile_image_url', res.url || '', { shouldDirty: true })
    } catch {
      // Handled globally or toast in calling page
    } finally {
      setIsUploadingMobile(false)
    }
  }

  const handleClearMobileImage = () => {
    form.setValue('mobile_image_uuid', null, { shouldDirty: true })
    form.setValue('mobile_image_url', '', { shouldDirty: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Details & Settings */}
          <div className="space-y-8">
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">General Information</h3>
              
              <FormInput
                control={form.control}
                label={t('banners.titleField', 'Banner Title')}
                name="title"
                placeholder="e.g. Mega Midyear Promotion"
                required
              />


            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">Display Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="pt-2">
                  <FormSwitch
                    control={form.control}
                    label={t('banners.isActive', 'Set as Active')}
                    name="is_active"
                  />
                </div>
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
            </div>
          </div>

          {/* Right Column: Media Assets */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2">Media Assets</h3>
            
            <div className="space-y-6">
              <div>
                <FormInputImage
                  control={form.control}
                  name="image_url"
                  label={t('banners.imageField', 'Desktop Banner Image')}
                  isUploading={isUploading}
                  onUpload={handleUploadImage}
                  onClear={handleClearImage}
                  aspect="video"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 1440×450 px (16:5 ratio), max 2 MB, JPG/WebP
                </p>
              </div>

              <div className="pt-4 border-t border-dashed">
                <FormInputImage
                  control={form.control}
                  name="mobile_image_url"
                  label={t('banners.mobileImageField', 'Mobile Banner Image')}
                  isUploading={isUploadingMobile}
                  onUpload={handleUploadMobileImage}
                  onClear={handleClearMobileImage}
                  aspect="video"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 750×250 px (3:1 ratio), max 500 KB, JPG/WebP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t">
          <div>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="gap-2 font-bold shadow-sm"
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
              className="font-bold shadow-sm"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className="font-bold shadow-sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {banner ? t('common.save', 'Save Changes') : t('common.create', 'Create Banner')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}