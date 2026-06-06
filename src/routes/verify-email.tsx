import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { z } from 'zod'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authService } from '@/services/auth.service'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'

const verifySearchSchema = z.object({
  token: z.string().optional().catch(''),
})

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search) => verifySearchSchema.parse(search),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Verifying your email address...')
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing. Please check your verification link.')
      toast.error('Verification token is missing.')
      return
    }

    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Your email has been verified successfully!')
        
        // Refresh user and try auto-login
        try {
          const freshUser = await authService.getProfile()
          if (freshUser) {
            const mappedUser = {
              id: String(freshUser.id || ''),
              uuid: freshUser.uuid || '',
              name: freshUser.name,
              email: freshUser.email,
              role: freshUser.role || freshUser.roles?.[0] || 'student',
              roles: freshUser.roles || [],
              permissions: freshUser.permissions || [],
            }
            if (freshUser.access_token) {
               setAuth(mappedUser, freshUser.access_token)
            } else if (localStorage.getItem('auth_token')) {
               setAuth(mappedUser, localStorage.getItem('auth_token') as string)
            }
          }
        } catch(e) {}
        
        toast.success('Email verified successfully!')
        
        setTimeout(() => {
          if (useAuthStore.getState().isAuthenticated) {
            navigate({ to: '/student/dashboard' })
          } else {
            navigate({ to: '/login' })
          }
        }, 3000)
      } catch (err: any) {
        console.error('Email verification error:', err)
        setStatus('error')
        setMessage(
          err.response?.data?.message ||
            'The verification link is invalid, expired, or has already been used.',
        )
        toast.error('Verification failed. Invalid or expired token.')
      }
    }

    verify()
  }, [token, navigate])

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 md:py-24 relative overflow-hidden brand-rings">
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300 bg-white">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-spin">
                  <Loader2 className="size-8" />
                </div>
              )}
              {status === 'success' && (
                <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </div>
              )}
              {status === 'error' && (
                <div className="size-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                  <XCircle className="size-8" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            {status === 'success' && (
              <p className="text-xs text-muted-foreground italic">
                Redirecting you to the login page in a few seconds...
              </p>
            )}
            <div className="pt-4 border-t border-border">
              <Button asChild className="w-full font-semibold gap-2">
                <Link to="/login">
                  Go to Login <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
