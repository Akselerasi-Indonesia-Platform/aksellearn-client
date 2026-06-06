'use client'

import {
  Award,
  Check,
  Layout,
  Palette,
  Settings2,
  Type,
  Download,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormInput, FormInputImage } from '@/components/admin/shared/form'
import { adminMediaService } from '@/services/admin/media.service'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { CourseCertificatePreview } from './course-certificate-preview'
import { useQuery } from '@tanstack/react-query'
import { adminCourseService } from '@/services/admin/course.service'

const VARIANT_ASSETS: Record<string, { icon: any; color: string }> = {
  modern: { icon: Layout, color: 'bg-blue-600' },
  academic: { icon: Award, color: 'bg-slate-800' },
  vibrant: { icon: Settings2, color: 'bg-indigo-600' },
}

interface CourseCertificateSettingsProps {
  courseUuid: string
}

export function CourseCertificateSettings({
  courseUuid,
}: CourseCertificateSettingsProps) {
  const { t } = useTranslation()
  const { control, watch, setValue } = useFormContext()

  const { data: metadata, isLoading: isLoadingMeta } = useQuery({
    queryKey: ['course-certificate-metadata', courseUuid],
    queryFn: () => adminCourseService.getCertificateMetadata(courseUuid),
    enabled: !!courseUuid,
  })

  const variants = metadata?.available_variants || []

  const config = watch('certificate_config')
  const courseTitleFromForm = watch('title') || 'Complete Course Title'

  // Testing Overrides (Local State only, not saved to DB)
  const [testStudentName, setTestStudentName] = useState('')
  const [testCourseName, setTestCourseName] = useState('')

  const context = metadata?.context || {}

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!courseUuid) return

    try {
      setIsDownloading(true)
      const downloadUrl = adminCourseService.getCertificateUrl(
        courseUuid,
        'pdf',
        {
          ...config,
          // Include testing overrides in PDF generation too if desired
          ...(testStudentName && ({ student_name: testStudentName } as any)),
          ...(testCourseName && ({ course_name: testCourseName } as any)),
          certificate_background_id: config.certificate_background_id,
          certificate_number_pattern: config.certificate_number_pattern,
        },
      )
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Error initiating download:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {t('courses.certificateSettings')}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t('courses.chooseVariant', 'Choose Style')}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {isLoadingMeta ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 w-full bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <FormField
                  control={control}
                  name="certificate_config.variant"
                  render={({ field }) => (
                    <>
                      {variants.map((v) => {
                        const assets =
                          VARIANT_ASSETS[v.id] || VARIANT_ASSETS.modern
                        return (
                          <button
                            key={v.id}
                            className={cn(
                              'flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 group',
                              field.value === v.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'hover:border-primary/50 hover:bg-muted/50',
                            )}
                            type="button"
                            onClick={() => field.onChange(v.id)}
                          >
                            <div
                              className={cn(
                                'p-2 rounded-lg transition-transform group-hover:scale-110 shadow-sm',
                                assets.color,
                                'text-white',
                              )}
                            >
                              <assets.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold">{v.name}</span>
                                {field.value === v.id && (
                                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {v.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </>
                  )}
                />
              )}
            </div>
          </div>

          <div className="p-4 border rounded-xl bg-muted/30 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
              <Type className="h-4 w-4" />
              {t('courses.certificateContent')}
            </h4>

            <div className="space-y-3">
              <FormInput
                control={control}
                label={t('courses.numberingPattern', 'Numbering Pattern')}
                name="certificate_config.certificate_number_pattern"
                placeholder="CERT-{YEAR}-{ID}"
              />
              <div className="flex flex-wrap gap-2">
                {['{YEAR}', '{ID}', '{RAND:6}', '{COURSE_ID}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-primary/10 hover:text-primary text-[10px] font-mono font-bold text-slate-500 transition-colors border border-slate-200"
                    onClick={() => {
                      const current =
                        control._formValues.certificate_config
                          ?.certificate_number_pattern || ''
                      setValue(
                        'certificate_config.certificate_number_pattern',
                        current + tag,
                      )
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic leading-tight">
                {t('courses.saveFirstToPreview')}
              </p>
            </div>

            <div className="space-y-3">
              <FormInputImage
                control={control}
                label={t('courses.backgroundImage', 'Background Image')}
                name="certificate_config.certificate_background_url"
                onUpload={async (file) => {
                  const res = await adminMediaService.upload(file, 'branding' as any)
                  setValue(
                    'certificate_config.certificate_background_uuid',
                    res.uuid,
                    { shouldDirty: true, shouldValidate: true }
                  )
                  setValue(
                    'certificate_config.certificate_background_url',
                    res.url,
                    { shouldDirty: true, shouldValidate: true }
                  )
                }}
                onClear={() => {
                  setValue('certificate_config.certificate_background_uuid', null, { shouldDirty: true, shouldValidate: true })
                  setValue(
                    'certificate_config.certificate_background_url',
                    null,
                    { shouldDirty: true, shouldValidate: true }
                  )
                }}
              />
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="size-2 bg-amber-400 rounded-full animate-pulse shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-tight">
                  {t('common.areYouSure')} A4 Landscape (297x210mm).
                </p>
              </div>
            </div>

            <FormField
              control={control}
              name="certificate_config.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider opacity-60">
                    Headline
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 rounded-lg"
                      placeholder={context?.Headline || 'Certificate'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="certificate_config.subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider opacity-60">
                    Sub-headline
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 rounded-lg"
                      placeholder={context?.SubHeadline || 'OF COMPLETION'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="certificate_config.issuing_authority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider opacity-60">
                    Organization
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 rounded-lg"
                      placeholder={
                        context?.OrganizationName || 'Madacore Academy'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="certificate_config.signature_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider opacity-60">
                      Signatory Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-lg"
                        placeholder={context?.SignerName || 'Dr. Hamada'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="certificate_config.signature_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider opacity-60">
                      Signatory Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-lg"
                        placeholder={
                          context?.SignerTitle || 'Head of Education'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="certificate_config.show_qr"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold">
                      Verification QR Code
                    </FormLabel>
                    <FormDescription className="text-[10px]">
                      Include a code for instant verification
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="p-4 border rounded-xl bg-slate-900/5 dark:bg-slate-100/5 space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
                <Settings2 className="h-4 w-4" />
                {t('courses.testingOverrides')}
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight italic">
                Test how the design responds to different course lengths or
                student name sizes.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50">
                    Test Student Name
                  </label>
                  <Input
                    className="h-8 text-xs rounded-lg"
                    placeholder={context?.StudentName || 'Student Name'}
                    value={testStudentName}
                    onChange={(e) => setTestStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50">
                    Test Course Title
                  </label>
                  <Input
                    className="h-8 text-xs rounded-lg"
                    placeholder={context?.CourseName || 'Course Title'}
                    value={testCourseName}
                    onChange={(e) => setTestCourseName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="sticky top-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                <label className="text-sm font-extrabold tracking-tight">
                  {t('common.preview')}
                </label>
              </div>

              <Button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10 font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex-shrink-0"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t('common.downloadPreview')}
              </Button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono opacity-50 px-1">
              <span>A4 LANDSCAPE (297x210mm)</span>
            </div>

            <div className="border border-dashed rounded-2xl p-4 bg-muted/5">
              <CourseCertificatePreview
                config={{
                  ...config,
                  ...(testStudentName &&
                    ({ student_name: testStudentName } as any)),
                  ...(testCourseName &&
                    ({ course_name: testCourseName } as any)),
                }}
                courseTitle={courseTitleFromForm}
                courseUuid={courseUuid}
              />
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary/80 leading-relaxed italic">
              <strong>Tip:</strong> This preview is exactly what the user will
              see. When generated as a PDF, it will use high-resolution vector
              assets and proper paper metadata for professional printing.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
