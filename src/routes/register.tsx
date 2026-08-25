import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
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
import { isAuthenticated } from '@/lib/auth'
import { authService } from '@/services/auth.service'
import { usePlatformStore } from '@/hooks/use-platform'
import { useAuthStore } from '@/hooks/use-auth'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { useTranslation } from 'react-i18next'

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/register')({
  validateSearch: (search) => registerSearchSchema.parse(search),
  beforeLoad: () => {
    if (typeof window !== 'undefined' && isAuthenticated()) {
      throw redirect({ to: '/student/dashboard' })
    }
  },
  component: RegisterPage,
})

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name is required' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const calculatePasswordStrength = (password: string) => {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { redirect: redirectUrl } = Route.useSearch()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError: setFormError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const passwordValue = watch('password')
  const strength = calculatePasswordStrength(passwordValue || '')

  const { setAuth } = useAuthStore()
  const { profile } = usePlatformStore()

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await authService.register(data)
      const token = response.data?.access_token
      const user = response.data
      const onboardingRequired = response.data?.onboarding_required

      if (token && user) {
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
        await navigate({ to: '/student/dashboard' })
      } else {
        setIsSuccess(true)
      }
    } catch (err: any) {
      console.error('Register error:', err)
      const responseData = err.response?.data
      
      if (responseData?.errors) {
        Object.keys(responseData.errors).forEach((field) => {
          const fieldName = field as keyof RegisterFormValues
          const errorMessage = Array.isArray(responseData.errors[field]) 
            ? responseData.errors[field][0] 
            : responseData.errors[field]
            
          setFormError(fieldName, {
            type: 'server',
            message: errorMessage,
          })
        })
      } else {
        setServerError(
          responseData?.message ||
            'Failed to sign up. Please try again later.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 md:py-24 relative overflow-hidden brand-rings">
          <Card className="w-full max-w-sm shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-center">
                {t('auth.register.successTitle')}
              </CardTitle>
              <CardDescription className="text-center text-base">
                {t('auth.register.successDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full font-semibold" variant="outline">
                <Link to="/login">{t('auth.register.returnLogin')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
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
              {t('auth.register.title', { name: profile?.name || 'Platform' })}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.register.subtitle', { name: profile?.name || 'Platform' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={handleSubmit(onSubmit)}
            >
              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20 text-center animate-in slide-in-from-top-2 mt-3">
                  {serverError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.register.name')}</Label>
                <Input
                  autoComplete="name"
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  {...register('name')}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input
                  autoComplete="email"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.register.password')}</Label>
                </div>
                <div className="relative">
                  <Input
                    autoComplete="new-password"
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
                {/* Password Strength Meter */}
                {passwordValue && passwordValue.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    <div className={`h-1.5 w-1/3 rounded-full ${strength >= 1 ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 w-1/3 rounded-full ${strength >= 2 ? (strength < 4 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 w-1/3 rounded-full ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">{t('auth.register.passwordConfirm')}</Label>
                <div className="relative">
                  <Input
                    autoComplete="new-password"
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('password_confirmation')}
                    className={`pr-10 ${errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <Button
                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    </span>
                  </Button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs text-destructive font-medium">{errors.password_confirmation.message}</p>
                )}
              </div>

              <Button className="w-full font-semibold" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.register.signingUp')}
                  </>
                ) : (
                  t('auth.register.signUp')
                )}
              </Button>
            </form>

            <div className="relative flex items-center py-2 mt-4">
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
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                {t('auth.register.signIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}