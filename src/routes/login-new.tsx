import { zodResolver } from '@hookform/resolvers/zod'
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { Eye, EyeOff, Loader2, BookOpen, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/hooks/use-auth'
import { usePlatformStore } from '@/hooks/use-platform'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login-new')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    // Already authenticated?
    if (typeof window !== 'undefined' && isAuthenticated()) {
      if (search.redirect) {
        throw redirect({ to: search.redirect as any })
      }
      if (isAdmin()) {
        throw redirect({ to: '/admin/dashboard' })
      } else {
        throw redirect({ to: '/student/dashboard' })
      }
    }
  },
  component: UserLoginPage,
})

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid student email' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

function UserLoginPage() {
  const navigate = useNavigate()
  const { redirect: redirectUrl } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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

      if (token && user) {
        // Guard: If admin tries to login via student portal
        const userIsAdmin = isAdmin({
          id: String(user.id || ''),
          uuid: user.uuid || '',
          name: user.name || '',
          email: user.email || '',
          role: user.roles?.[0] || 'student',
          roles: user.roles || [],
          permissions: user.permissions || [],
        })

        if (userIsAdmin) {
          setError('Admins must log in via the admin portal.')
          setIsLoading(false)
          return
        }

        setAuth(
          {
            id: String(user.id || ''),
            uuid: user.uuid || '',
            name: user.name,
            email: user.email,
            role: user.roles?.[0] || 'student',
            roles: user.roles || [],
            permissions: user.permissions || [],
          },
          token,
        )

        if (redirectUrl) {
          window.location.href = redirectUrl
        } else {
          await navigate({ to: '/student/dashboard' })
        }
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Admins must log in via the admin portal.')
        return
      }
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <div className="w-full max-w-md z-10 space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
        <div className="text-center group">
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xl shadow-indigo-500/10 border border-white transition-all hover:scale-105 active:scale-95 mb-6"
          >
            {profile?.logo?.url ? (
              <img
                src={profile.logo.url}
                alt={profile?.name || 'Platform Logo'}
                className="size-10 object-contain"
              />
            ) : profile?.logo_dark?.url ? (
              <img
                src={profile.logo_dark.url}
                alt={profile?.name || 'Platform Logo'}
                className="size-10 object-contain"
              />
            ) : (
              <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <BookOpen className="size-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {profile?.name || 'Aksellearn'}
            </span>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome back!
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Resume your learning journey today.
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-500/5 rounded-2xl p-2 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-2xl bg-rose-500/5 p-4 text-xs text-rose-500 font-bold border border-rose-500/10 text-center animate-bounce">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label
                  className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1"
                  htmlFor="email"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  {...register('email')}
                  className="h-12 bg-slate-100 hover:bg-slate-200/50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1 pr-1">
                  <Label
                    className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                    htmlFor="password"
                  >
                    Password
                  </Label>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-indigo-600 hover:indigo-700 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="h-12 bg-slate-100 hover:bg-slate-200/50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium pr-12"
                  />
                  <Button
                    className="absolute right-0 top-0 h-12 w-12 text-slate-400 hover:text-indigo-600 transition-colors"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                className="w-full h-12 font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest gap-3"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <GraduationCap className="size-5" /> Start Learning
                  </>
                )}
              </Button>

              <div className="relative flex items-center py-4">
                <div className="grow border-t border-slate-100" />
                <span className="mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Social Login
                </span>
                <div className="grow border-t border-slate-100" />
              </div>

              <Button
                className="w-full h-12 bg-white border border-slate-100 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl shadow-sm transition-all active:scale-95 gap-3"
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
                <svg className="size-4" viewBox="0 0 48 48">
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
                </svg>
                Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs font-bold text-slate-400 pt-4">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Join {profile?.name || 'Aksellearn'} Academy
          </Link>
        </p>
      </div>
    </div>
  )
}
