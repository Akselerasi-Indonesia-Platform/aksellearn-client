import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TriangleAlert, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/hooks/use-auth'

export function AccountDeletionCard() {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await authService.deleteAccount()
      toast.success('Account successfully scheduled for deletion')
      logout()
      navigate({ to: '/login' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border border-destructive/20 shadow-filament rounded-xl overflow-hidden mt-8 bg-destructive/5">
      <CardHeader className="bg-destructive/10 border-b border-destructive/20 pb-6">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-destructive flex items-center gap-2">
          <TriangleAlert className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="font-medium text-xs text-destructive/80">
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-sm max-w-lg">
            <p className="font-bold">Delete Account</p>
            <p className="text-muted-foreground">
              Once you delete your account, there is no going back. All your active sessions will be revoked, and your data will be queued for permanent deletion.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs shrink-0">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black uppercase tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium">
                  This action cannot be undone. This will permanently delete your account, remove your data from our servers, and revoke all active sessions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Yes, delete account
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
