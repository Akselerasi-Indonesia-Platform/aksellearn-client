import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'

export function EmailVerificationBanner() {
  const { user, refreshUser } = useAuthStore()
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  // Automatically hide banner if verified (e.g. from polling/refresh)
  if (!user || user.email_verified_at !== null) {
    return null
  }

  const handleResendVerification = async () => {
    if (cooldown > 0) return

    try {
      setIsResending(true)
      await authService.resendVerification()
      toast.success('Verification email sent!')
      setCooldown(120) // 2 minutes cooldown
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('Please wait before requesting another email.')
        setCooldown(120)
      } else {
        toast.error(err.response?.data?.message || 'Failed to resend verification email.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-amber-500 text-white px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-[100] animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-5" />
        <p className="text-sm font-semibold">
          Please verify your email address to access all features.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleResendVerification}
          disabled={isResending || cooldown > 0}
          variant="secondary"
          size="sm"
          className="h-8 text-xs font-bold uppercase tracking-wider"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 size-3 animate-spin" /> Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            'Resend Email'
          )}
        </Button>
      </div>
    </div>
  )
}
