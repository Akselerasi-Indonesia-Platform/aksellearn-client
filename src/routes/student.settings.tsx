import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, UserCog } from 'lucide-react'

import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/hooks/use-auth'
import { SettingsForm } from '@/components/user/profile/settings-form'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/student/settings')({
  head: () => ({
    meta: [{ title: 'Clara | Account Settings' }],
  }),
  component: StudentSettingsPage,
})

function StudentSettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'fresh'],
    queryFn: () => authService.getProfile(),
  })

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { organization_id, ...profileData } = data
      const response = await authService.updateProfile(profileData)
      if (organization_id !== undefined && organization_id !== null && organization_id !== '') {
        await authService.updateUserOrganization(Number(organization_id))
      }
      return response
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully!')
      // Refresh user data from API
      const updatedUser = await authService.getProfile()
      setUser(updatedUser as any)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    },
  })

  if (!mounted || isLoading || !user) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mt-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/student/profile' })}
          className="h-10 w-10 rounded-2xl hover:bg-slate-100 shrink-0 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-[#056FAE]/10 text-[#056FAE] shrink-0">
            <UserCog className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-[#0D3A6E] leading-none">
              Account Settings
            </h1>
            <p className="text-sm font-semibold text-[#056FAE]/60 mt-1 uppercase tracking-widest">
              Manage your personal and professional profile
            </p>
          </div>
        </div>
      </div>

      <SettingsForm 
        user={user as any} 
        isPending={updateMutation.isPending}
        onSubmit={(data) => updateMutation.mutate(data)} 
      />
    </div>
  )
}
