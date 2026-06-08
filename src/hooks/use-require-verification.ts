import { useAuthStore } from './use-auth'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export function useRequireVerification() {
  const navigate = useNavigate()
  
  const verifyAndProceed = async (callback: () => void) => {
    const user = useAuthStore.getState().user
    
    // If the user seems unverified, fetch the freshest data from BE to be absolutely sure.
    if (user && !user.email_verified_at) {
      toast.loading("Verifying account status...", { id: "verify-email" })
      try {
        const freshUser = await authService.getProfile()
        useAuthStore.getState().setUser(freshUser as any)
        
        if (!freshUser.email_verified_at) {
          toast.dismiss("verify-email")
          toast.error("Please verify your email to continue.")
          navigate({ to: '/student/profile' })
          return
        }
        toast.dismiss("verify-email")
      } catch (error) {
        toast.dismiss("verify-email")
        toast.error("Please verify your email to continue.")
        navigate({ to: '/student/profile' })
        return
      }
    }
    
    // Email is verified, proceed with the original action
    callback()
  }

  return { verifyAndProceed }
}
