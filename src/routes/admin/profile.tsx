import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Shield, User as UserIcon, Mail, Lock, Camera, Briefcase, FileText } from 'lucide-react'
import { useAuthStore } from '@/hooks/use-auth'
import { useState, useEffect, useRef } from 'react'
import { authService } from '@/services/auth.service'
import { adminMediaService } from '@/services/admin/media.service'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/profile')({
  component: ProfilePage,
})

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local state for form

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')

  // Initialize form with user data
  useEffect(() => {
    setIsMounted(true)
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setHeadline(user.profile?.headline || '')
      setBio(user.profile?.bio || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.updateProfile({ 
        name, 
        email,
        profile: {
          ...user?.profile,
          headline,
          bio
        }
      })
      toast.success('Profile updated successfully')

      // Update global auth store
      if (user) {
        const token = localStorage.getItem('auth_token') || ''
        setAuth({ 
          ...user, 
          name, 
          email,
          profile: {
            ...user.profile,
            headline,
            bio
          }
        }, token)
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Uploading your new profile picture...')

    try {
      // 1. Upload to media service
      const media = await adminMediaService.upload(file, 'user')
      const avatarUrl = media.url || media.images?.original

      if (!avatarUrl) throw new Error('No URL returned')

      // 2. Update user profile with new avatar URL
      await authService.updateProfile({
        name: name || user?.name || '',
        email: email || user?.email || '',
        avatar: avatarUrl,
      })

      // 3. Update global state
      if (user) {
        const token = localStorage.getItem('auth_token') || ''
        setAuth({ ...user, avatar: avatarUrl }, token)
      }

      toast.success('Profile picture updated!', { id: toastId })
    } catch (error) {
      console.error('Avatar upload failed:', error)
      toast.error('Failed to upload profile picture', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  if (!isMounted) {
    return <ProfileSkeleton />
  }

  return (
    <AdminPage className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
          Profile Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-none shadow-2xl bg-gradient-to-b from-primary/10 via-background to-background overflow-hidden relative rounded-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Shield className="w-32 h-32" />
          </div>
          <CardContent className="pt-12 flex flex-col items-center text-center space-y-5 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
              <Avatar
                className={`w-32 h-32 border-4 border-background shadow-2xl transition-all duration-500 group-hover:scale-105 relative cursor-pointer ${isUploading ? 'opacity-50 grayscale' : ''}`}
                onClick={handleAvatarClick}
              >
                <AvatarImage src={isMounted && user?.avatar ? user.avatar : undefined} />
                <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                  {isMounted
                    ? user?.name?.substring(0, 2).toUpperCase() || 'AD'
                    : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 pointer-events-none">
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-xl border-2 border-background bg-primary hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight">
                {isMounted ? user?.name : 'Admin User'}
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full">
                {isMounted ? user?.role || 'Administrator' : 'Administrator'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {isMounted &&
                user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="text-[9px] uppercase tracking-[0.15em] font-black px-2.5 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10"
                  >
                    {role}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="md:col-span-2 border border-border shadow-filament rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-6">
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Personal Information
            </CardTitle>
            <CardDescription className="font-medium text-xs">
              Update your profile details and email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all font-bold"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all font-bold"
                      placeholder="e.g. john@aksellearn.dev"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="headline"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Headline / Job Title
                  </Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <Input
                      id="headline"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="pl-10 h-12 rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all font-bold"
                      placeholder="e.g. Senior Instructor & Cloud Expert"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="bio"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Biography
                  </Label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="pl-10 pt-3 min-h-[120px] rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-all font-bold"
                      placeholder="Tell us about your background, experience, and what you teach..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button
                  type="submit"
                  className="px-10 h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card className="border border-border shadow-filament rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="text-xl font-black uppercase tracking-tight">
            Security & Privacy
          </CardTitle>
          <CardDescription className="font-medium text-xs">
            Keep your account secure with robust password management.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-600 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <p className="text-sm font-black uppercase tracking-tight">
                Update Password
              </p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-md">
                It's a good practice to use a strong password that you're not
                using elsewhere.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-600 transition-all"
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  )
}

function ProfileSkeleton() {
  return (
    <AdminPage className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-2xl rounded-xl overflow-hidden p-12 flex flex-col items-center space-y-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        </Card>

        <Card className="md:col-span-2 border border-border shadow-filament rounded-xl overflow-hidden p-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t">
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        </Card>
      </div>

      <Card className="border border-border shadow-filament rounded-xl overflow-hidden p-8 flex items-center gap-6">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </Card>
    </AdminPage>
  )
}
