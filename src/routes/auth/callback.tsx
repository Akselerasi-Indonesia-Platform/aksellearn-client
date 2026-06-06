import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { setToken } from '@/lib/auth'
import { z } from 'zod'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/hooks/use-auth'

const callbackSearchSchema = z.object({
  token: z.string().optional(),
  user_uuid: z.string().optional(),
  error: z.string().optional(),
  target: z.string().optional(),
})

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search) => callbackSearchSchema.parse(search),
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { token, user_uuid, error, target } = Route.useSearch()
  const [status, setStatus] = useState<'syncing' | 'error'>('syncing')
  const [errorMessage, setErrorMessage] = useState('')
  const { setAuth, isAdmin } = useAuthStore()

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Initial delay for premium "Synchronizing Account" UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (token) {
        try {
          // 2. Temporarily persist the token to allow getProfile to work (it uses the apiClient)
          setToken(token)

          // 3. Fetch full profile to populate the store
          const user = await authService.getProfile()

          // 4. Synchronize state with the unified Auth Store
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

          // 5. Clean up the URL for security
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', window.location.pathname)
          }

          // 6. Finalization redirect based on Role
          if (target) {
            navigate({ to: target as any })
          } else if (isAdmin()) {
            navigate({ to: '/admin' })
          } else {
            navigate({ to: '/student/dashboard' })
          }
        } catch (err: any) {
          console.error('Session persistence error:', err)
          setErrorMessage(
            err.response?.data?.message ||
              'System error during state synchronization',
          )
          setStatus('error')
        }
      } else if (error) {
        setErrorMessage(error)
        setStatus('error')
      } else {
        // No token or error - redirect to login
        navigate({ to: '/login' })
      }
    }

    handleAuth()
  }, [token, user_uuid, error, target, navigate, setAuth, isAdmin])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-sm space-y-8 text-center">
        {status === 'syncing' ? (
          <div className="space-y-6">
            {/* Pulsing Sync Icon */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse scale-90" />
              <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin duration-1000" />
              <ShieldCheck className="h-10 w-10 text-primary animate-bounce duration-1000" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground transition-all">
                Almost there!
              </h1>
              <p className="text-muted-foreground text-sm max-w-[300px] mx-auto leading-relaxed font-medium opacity-80">
                We're signing you in and getting things ready.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Verifying details...
                </span>
              </div>

              {/* Fake Progress Bar for UX */}
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-progress-indeterminate rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20 shadow-xl shadow-destructive/5">
              <ShieldCheck className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-destructive uppercase">
                Sign in failed
              </h1>
              <p className="text-muted-foreground text-sm max-w-[280px] mx-auto font-bold leading-tight">
                {errorMessage ||
                  "We couldn't sign you in right now. Please try again."}
              </p>
            </div>

            <button
              onClick={() => navigate({ to: '/login' })}
              className="px-8 h-12 rounded-xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/25 hover:opacity-90 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Try manual sign in
            </button>
          </div>
        )}
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 select-none">
        Clara Platforms &bull; Secure Authentication Gateway
      </div>
    </div>
  )
}
