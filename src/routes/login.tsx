import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/hooks/use-auth'
import { usePlatformStore } from '@/hooks/use-platform'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { useTranslation } from 'react-i18next'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  message: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    // Only redirect on client to avoid server-side localStorage issues
    if (typeof window !== 'undefined' && isAuthenticated()) {
      if (search.redirect) {
        throw redirect({
          to: search.redirect as any,
        })
      }
      if (isAdmin()) {
        throw redirect({
          to: '/admin',
        })
      } else {
        throw redirect({
          to: '/student/dashboard',
        })
      }
    }
  },
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { redirect: redirectUrl, message: searchMessage } = Route.useSearch()
  const [error, setError] = useState<string | null>(searchMessage || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { setAuth } = useAuthStore()
  const { profile } = usePlatformStore()

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(data)
      const token = response.data.access_token
      const user = response.data
      const onboardingRequired = response.data.onboarding_required

      if (token && user) {
        // Standard session persistence
        setAuth(
          {
            id: String(user.id || ''),
            uuid: user.uuid || '',
            name: user.name,
            email: user.email,
            email_verified_at: user.email_verified_at,
            role: user.role || user.roles?.[0] || 'student',
            roles: user.roles || [],
            permissions: user.permissions || [],
          },
          token,
          onboardingRequired
        )

        // Handle redirect logic (Unified Redirect Strategy)
        if (response.redirect_to) {
          const targetPath = response.redirect_to === '/dashboard' ? '/student/dashboard' : response.redirect_to
          window.location.href = targetPath
        } else if (redirectUrl) {
          window.location.href = redirectUrl
        } else if (isAdmin()) {
          await navigate({ to: '/admin' })
        } else {
          await navigate({ to: '/student/dashboard' })
        }
      } else {
        setError('Authentication successful but no session received.')
      }
    } catch (err: any) {
      console.error('Login error:', err)

      // Security: Rate Limiting (429)
      if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a minute before trying again.')
        return
      }

      // Portal Conflict Handling (403)
      if (err.response?.status === 403) {
        setError('Unauthorized access. Please check your account permissions.')
        return
      }

      setError(
        err.response?.data?.message ||
          'Failed to sign in. Please check your credentials.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 md:py-24 relative overflow-hidden brand-rings">
        <Card className="w-full max-w-sm shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300 bg-white">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              {profile?.logo?.url ? (
                <img
                  src={profile.logo.url}
                  alt={profile?.name || 'Platform Logo'}
                  className="h-12 w-auto object-contain"
                />
              ) : profile?.logo_dark?.url ? (
                <img
                  src={profile.logo_dark.url}
                  alt={profile?.name || 'Platform Logo'}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {profile?.name?.charAt(0) || 'M'}
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              {t('auth.login.title', { name: profile?.name || 'Platform' })}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(onSubmit)(e)
              }}
            >
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20 text-center animate-in slide-in-from-top-2 mt-3">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input
                  autoComplete="email"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  {...register('email')}
                  className={
                    errors.email
                      ? 'border-destructive focus-visible:ring-destructive'
                      : ''
                  }
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                </div>
                <div className="relative">
                  <Input
                    autoComplete="current-password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <Button
                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full font-semibold"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.login.signingIn')}
                  </>
                ) : (
                  t('auth.login.signIn')
                )}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-border" />
                <span className="mx-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  {t('auth.login.orContinueWith')}
                </span>
                <div className="grow border-t border-border" />
              </div>

              <Button
                className="w-full font-bold h-10 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm transition-all active:scale-95"
                type="button"
                onClick={() => {
                  const backendUrl = '/api-proxy/api/auth/social/google'
                  let callbackUrl = window.location.origin + '/auth/callback'
                  if (redirectUrl) {
                    callbackUrl += '?target=' + encodeURIComponent(redirectUrl)
                  }
                  window.location.assign(
                    `${backendUrl}?redirect_url=${encodeURIComponent(callbackUrl)}`,
                  )
                }}
              >
                {/* Google Brand SVG */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                {t('auth.login.loginWithGoogle')}
              </Button>

              <div className="mt-4 text-center text-sm text-slate-500">
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  {t('auth.login.signUp')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
