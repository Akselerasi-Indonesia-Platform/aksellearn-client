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

export const Route = createFileRoute('/register')({
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
  const navigate = useNavigate()
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
                Check Your Email
              </CardTitle>
              <CardDescription className="text-center text-base">
                We've sent a verification link to your email address. Please click the link to verify your account before logging in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full font-semibold" variant="outline">
                <Link to="/login">Return to Login</Link>
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
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Join {profile?.name || 'Platform'} and start learning today
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
                <Label htmlFor="name">Full Name</Label>
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
                <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Password</Label>
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
                      {showPassword ? 'Hide password' : 'Show password'}
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
                <Label htmlFor="password_confirmation">Confirm Password</Label>
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
                      {showConfirmPassword ? 'Hide password' : 'Show password'}
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
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>

              <div className="mt-4 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}