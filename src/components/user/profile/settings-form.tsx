import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, User as UserIcon, Settings, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { PhoneInput } from '@/components/ui/phone-input'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldHint } from '@/components/admin/shared/form/field-hint'
import { User } from '@/services/auth.service'

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  headline: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().optional().nullable(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  is_public: z.boolean(),
  social_links: z.object({
    website: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
    linkedin: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
    github: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
    twitter: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  }).optional(),
  organization_id: z.string().optional()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface SettingsFormProps {
  user: User
  onSubmit: (data: any) => void
  isPending: boolean
}

export function SettingsForm({ user, onSubmit, isPending }: SettingsFormProps) {
  const [activeTab, setActiveTab] = React.useState<'general' | 'contact' | 'social' | 'privacy'>('general')
  const [orgOptions, setOrgOptions] = React.useState<{label: string, value: string}[]>([])

  React.useEffect(() => {
    authService.getUserOrganizations().then((res) => {
      setOrgOptions(res.map(o => ({ label: o.name, value: String(o.id) })))
    })
  }, [])

  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      headline: user.profile?.headline || '',
      bio: user.profile?.bio || '',
      phone: user.phone || '',
      timezone: user.profile?.timezone || defaultTimezone || 'UTC',
      language: user.profile?.language || 'en',
      is_public: user.profile?.is_public ?? false,
      social_links: {
        website: user.profile?.social_links?.website || '',
        linkedin: user.profile?.social_links?.linkedin || '',
        github: user.profile?.social_links?.github || '',
        twitter: user.profile?.social_links?.twitter || '',
      },
      organization_id: user.organizations && user.organizations.length > 0 ? String(user.organizations[0].id) : ''
    },
  })

  function handleSubmit(data: ProfileFormValues) {
    // Clean up empty strings for URLs to be null or removed
    const cleanedSocialLinks = { ...data.social_links }
    Object.keys(cleanedSocialLinks).forEach((key) => {
      const k = key as keyof typeof cleanedSocialLinks
      if (cleanedSocialLinks[k] === '') {
        cleanedSocialLinks[k] = null as any
      }
    })

    onSubmit({
      name: data.name,
      email: user.email,
      phone: data.phone,
      profile: {
        headline: data.headline,
        bio: data.bio,
        timezone: data.timezone,
        language: data.language,
        is_public: data.is_public,
        social_links: cleanedSocialLinks
      },
      organization_id: data.organization_id ? Number(data.organization_id) : undefined
    })
  }

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.trim()
    if (value && !/^https?:\/\//i.test(value)) {
      value = `https://${value}`
      onChange(value)
    }
  }

  const tabs = [
    { id: 'general', label: 'General Profile', icon: UserIcon },
    { id: 'contact', label: 'General Information', icon: Settings },
    { id: 'social', label: 'Social Links', icon: LinkIcon },
  ] as const

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground'
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit) as any} className="space-y-8">
              
              {/* GENERAL TAB */}
              <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">General Profile</h3>
                  <p className="text-sm text-muted-foreground">Manage your basic identity information.</p>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control as any}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="rounded-xl h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="font-bold">Professional Headline</FormLabel>
                          <FieldHint>Displayed right below your name.</FieldHint>
                        </div>
                        <FormControl>
                          <Input placeholder="e.g. Senior Software Engineer at Acme" {...field} value={field.value || ''} className="rounded-xl h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Short Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a little bit about yourself..." 
                            className="resize-none rounded-xl min-h-[120px]" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* CONTACT TAB */}
              <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">General Information</h3>
                  <p className="text-sm text-muted-foreground">Information for course delivery and support.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FormLabel className="font-bold">Email Address</FormLabel>
                      <FieldHint>Email cannot be changed here. Contact support if you need to update it.</FieldHint>
                    </div>
                    <Input value={user.email} disabled className="rounded-xl h-11 bg-slate-50 text-slate-500" />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput 
                            value={field.value || ''} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder="Select a timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                              <SelectItem value="Asia/Jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                              <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Language Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English (US)</SelectItem>
                              <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control as any}
                    name="organization_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel className="font-bold">Organization</FormLabel>
                          <FieldHint>The organization you are affiliated with.</FieldHint>
                        </div>
                        <FormControl>
                          <SearchableSelect
                            placeholder="Select organization..."
                            options={orgOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SOCIAL TAB */}
              <div className={activeTab === 'social' ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">Social Links</h3>
                  <p className="text-sm text-muted-foreground">Add your professional links to your public profile.</p>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control as any}
                    name="social_links.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Personal Website</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://yourdomain.com" 
                            {...field} 
                            value={field.value || ''} 
                            onBlur={(e) => {
                              handleUrlBlur(e, field.onChange)
                              field.onBlur()
                            }}
                            className="rounded-xl h-11" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="social_links.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://linkedin.com/in/username" 
                            {...field} 
                            value={field.value || ''} 
                            onBlur={(e) => {
                              handleUrlBlur(e, field.onChange)
                              field.onBlur()
                            }}
                            className="rounded-xl h-11" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="social_links.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">GitHub URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://github.com/username" 
                            {...field} 
                            value={field.value || ''} 
                            onBlur={(e) => {
                              handleUrlBlur(e, field.onChange)
                              field.onBlur()
                            }}
                            className="rounded-xl h-11" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="social_links.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">X (Twitter) URL</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://x.com/username" 
                            {...field} 
                            value={field.value || ''} 
                            onBlur={(e) => {
                              handleUrlBlur(e, field.onChange)
                              field.onBlur()
                            }}
                            className="rounded-xl h-11" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* PRIVACY TAB */}
              <div className={activeTab === 'privacy' ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">Privacy & Visibility</h3>
                  <p className="text-sm text-muted-foreground">Control who can see your profile and information.</p>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control as any}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center">
                          <FormLabel className="text-base font-semibold text-slate-800">Public Profile</FormLabel>
                          <FieldHint>Allow other students and instructors to view your profile page.</FieldHint>
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
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-[#056FAE] hover:bg-[#056FAE]/90 text-white font-semibold rounded-xl h-11 px-8"
                >
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
