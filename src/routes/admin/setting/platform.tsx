import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

import { usePlatformStore } from '@/hooks/use-platform'
import { platformService } from '@/services/platform.service'
import { adminMediaService } from '@/services/admin/media.service'
import { Loader2, Save, FileUp, Image as ImageIcon, Trash2 } from 'lucide-react'

// Note: In a real app we'd use a dedicated file upload component
// For this implementation we'll keep the schema aligned with what the BE expects
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tagline: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  address: z.string().optional(),
  social_links: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),
  logo_uuid: z.string().optional().nullable(),
  logo_dark_uuid: z.string().optional().nullable(),
  favicon_uuid: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export const Route = createFileRoute('/admin/setting/platform')({
  component: PlatformSettingsPage,
})

function PlatformSettingsPage() {
  const queryClient = useQueryClient()
  const { profile, setProfile } = usePlatformStore()
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
  const [isUploadingLogoDark, setIsUploadingLogoDark] = React.useState(false)
  const [isUploadingFavicon, setIsUploadingFavicon] = React.useState(false)

  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [logoDarkPreview, setLogoDarkPreview] = React.useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      tagline: profile?.tagline || '',
      email: profile?.email || '',
      whatsapp_number: profile?.whatsapp_number || '',
      address: profile?.address || '',
      social_links: {
        instagram: profile?.social_links?.instagram || '',
        facebook: profile?.social_links?.facebook || '',
        youtube: profile?.social_links?.youtube || '',
        linkedin: profile?.social_links?.linkedin || '',
      },
      logo_uuid: profile?.logo?.uuid || null,
      logo_dark_uuid: profile?.logo_dark?.uuid || null,
      favicon_uuid: profile?.favicon?.uuid || null,
    },
  })

  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        tagline: profile.tagline || '',
        email: profile.email || '',
        whatsapp_number: profile.whatsapp_number || '',
        address: profile.address || '',
        social_links: {
          instagram: profile.social_links?.instagram || '',
          facebook: profile.social_links?.facebook || '',
          youtube: profile.social_links?.youtube || '',
          linkedin: profile.social_links?.linkedin || '',
        },
        logo_uuid: profile.logo?.uuid || null,
        logo_dark_uuid: profile.logo_dark?.uuid || null,
        favicon_uuid: profile.favicon?.uuid || null,
      })
      setLogoPreview(profile.logo?.url || null)
      setLogoDarkPreview(profile.logo_dark?.url || null)
      setFaviconPreview(profile.favicon?.url || null)
    }
  }, [profile, form])

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'logo_uuid' | 'logo_dark_uuid' | 'favicon_uuid',
    setUploading: (v: boolean) => void,
    setPreview: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show temporary local object URL preview instantly
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    setUploading(true)
    try {
      const media = await adminMediaService.upload(file, 'platform')
      form.setValue(fieldName, media.uuid, { shouldDirty: true })
      if (media.url) {
        setPreview(media.url)
        if (profile) {
          const updatedProfile = { ...profile }
          if (fieldName === 'logo_uuid') {
            updatedProfile.logo = { uuid: media.uuid, url: media.url }
          } else if (fieldName === 'logo_dark_uuid') {
            updatedProfile.logo_dark = { uuid: media.uuid, url: media.url }
          } else if (fieldName === 'favicon_uuid') {
            updatedProfile.favicon = { uuid: media.uuid, url: media.url }
          }
          setProfile(updatedProfile)
        }
      }
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
      // Fallback to original url
      if (fieldName === 'logo_uuid') setPreview(profile?.logo?.url || null)
      else if (fieldName === 'logo_dark_uuid') setPreview(profile?.logo_dark?.url || null)
      else if (fieldName === 'favicon_uuid') setPreview(profile?.favicon?.url || null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileRemove = (
    fieldName: 'logo_uuid' | 'logo_dark_uuid' | 'favicon_uuid',
    setPreview: (v: string | null) => void
  ) => {
    form.setValue(fieldName, null, { shouldDirty: true })
    setPreview(null)
    if (profile) {
      const updatedProfile = { ...profile }
      if (fieldName === 'logo_uuid') updatedProfile.logo = undefined
      else if (fieldName === 'logo_dark_uuid') updatedProfile.logo_dark = null
      else if (fieldName === 'favicon_uuid') updatedProfile.favicon = undefined
      setProfile(updatedProfile)
    }
    toast.success('Image removed (Save to apply changes)')
  }

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => platformService.updateProfile(values),
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: ['platform'] })
      toast.success('Platform profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update profile: ${error.response?.data?.message || error.message}`
      )
    },
  })

  function onSubmit(values: FormValues) {
    updateMutation.mutate(values)
  }

  return (
    <AdminPage className="mx-auto flex w-full max-w-4xl flex-col">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Platform Profile</h1>
        <p className="text-muted-foreground">
          Manage your white-label branding, contact information, and social links.
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6">
            
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>
                  The primary name and tagline of your LMS platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Aksellearn LMS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Learn Anything" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3 pt-2">
                  {/* Platform Logo (Light Mode) */}
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Platform Logo (Light Mode)</FormLabel>
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 transition-all duration-200 hover:border-slate-300 min-h-[160px] p-4"
                      style={{
                        backgroundSize: '20px 20px',
                        backgroundImage: 'conic-gradient(#ffffff 25%, #f8fafc 25% 50%, #ffffff 50% 75%, #f8fafc 75%)'
                      }}
                    >
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo Light" className="max-h-24 max-w-full object-contain transition-transform duration-200 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <label className="flex items-center justify-center p-2 rounded-lg bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
                              <FileUp className="size-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'logo_uuid', setIsUploadingLogo, setLogoPreview)}
                                disabled={isUploadingLogo}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFileRemove('logo_uuid', setLogoPreview)}
                              className="flex items-center justify-center p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full py-4 text-center">
                          {isUploadingLogo ? (
                            <Loader2 className="size-8 text-primary animate-spin" />
                          ) : (
                            <ImageIcon className="size-8 text-slate-400" />
                          )}
                          <span className="text-xs font-semibold text-slate-600">Upload Light Logo</span>
                          <span className="text-[10px] text-slate-400">PNG, SVG, JPG</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'logo_uuid', setIsUploadingLogo, setLogoPreview)}
                            disabled={isUploadingLogo}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Default brand logo</span>
                      {form.watch('logo_uuid') !== (profile?.logo?.uuid || null) && form.watch('logo_uuid') !== undefined && (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          Unsaved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platform Logo (Dark Mode) */}
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Platform Logo (Dark Mode)</FormLabel>
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl overflow-hidden bg-slate-950 transition-all duration-200 hover:border-slate-750 min-h-[160px] p-4"
                      style={{
                        backgroundSize: '20px 20px',
                        backgroundImage: 'conic-gradient(#1e293b 25%, #0f172a 25% 50%, #1e293b 50% 75%, #0f172a 75%)'
                      }}
                    >
                      {logoDarkPreview ? (
                        <>
                          <img src={logoDarkPreview} alt="Logo Dark" className="max-h-24 max-w-full object-contain transition-transform duration-200 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <label className="flex items-center justify-center p-2 rounded-lg bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
                              <FileUp className="size-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'logo_dark_uuid', setIsUploadingLogoDark, setLogoDarkPreview)}
                                disabled={isUploadingLogoDark}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFileRemove('logo_dark_uuid', setLogoDarkPreview)}
                              className="flex items-center justify-center p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full py-4 text-center">
                          {isUploadingLogoDark ? (
                            <Loader2 className="size-8 text-primary animate-spin" />
                          ) : (
                            <ImageIcon className="size-8 text-slate-500" />
                          )}
                          <span className="text-xs font-semibold text-slate-300">Upload Dark Logo</span>
                          <span className="text-[10px] text-slate-500">PNG, SVG, JPG</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'logo_dark_uuid', setIsUploadingLogoDark, setLogoDarkPreview)}
                            disabled={isUploadingLogoDark}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Used on dark backgrounds</span>
                      {form.watch('logo_dark_uuid') !== (profile?.logo_dark?.uuid || null) && form.watch('logo_dark_uuid') !== undefined && (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          Unsaved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platform Favicon */}
                  <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Platform Favicon</FormLabel>
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 transition-all duration-200 hover:border-slate-300 min-h-[160px] p-4"
                      style={{
                        backgroundSize: '20px 20px',
                        backgroundImage: 'conic-gradient(#ffffff 25%, #f8fafc 25% 50%, #ffffff 50% 75%, #f8fafc 75%)'
                      }}
                    >
                      {faviconPreview ? (
                        <>
                          <img src={faviconPreview} alt="Favicon" className="size-16 object-contain transition-transform duration-200 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <label className="flex items-center justify-center p-2 rounded-lg bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
                              <FileUp className="size-4" />
                              <input
                                type="file"
                                accept="image/png,image/x-icon,image/ico,image/jpeg"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'favicon_uuid', setIsUploadingFavicon, setFaviconPreview)}
                                disabled={isUploadingFavicon}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFileRemove('favicon_uuid', setFaviconPreview)}
                              className="flex items-center justify-center p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full py-4 text-center">
                          {isUploadingFavicon ? (
                            <Loader2 className="size-8 text-primary animate-spin" />
                          ) : (
                            <ImageIcon className="size-8 text-slate-400" />
                          )}
                          <span className="text-xs font-semibold text-slate-600">Upload Favicon</span>
                          <span className="text-[10px] text-slate-400">ICO, PNG (32x32)</span>
                          <input
                            type="file"
                            accept="image/png,image/x-icon,image/ico,image/jpeg"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'favicon_uuid', setIsUploadingFavicon, setFaviconPreview)}
                            disabled={isUploadingFavicon}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Tab icon in browser</span>
                      {form.watch('favicon_uuid') !== (profile?.favicon?.uuid || null) && form.watch('favicon_uuid') !== undefined && (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          Unsaved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Details displayed in the footer and email communications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="support@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Education St..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Your platform's social media presence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="social_links.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="social_links.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Platform Settings
              </Button>
            </div>
            
          </div>
        </form>
      </Form>
    </AdminPage>
  )
}
