import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface NotificationPreference {
  category: string
  email_enabled: boolean
  push_enabled: boolean
  digest_enabled: boolean
}

export function NotificationSettingsForm() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await apiClient.get<{data: NotificationPreference[]}>('/api/v1/users/notification-preferences')
      return res.data.data
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (preferences: NotificationPreference[]) => {
      const res = await apiClient.put('/api/v1/users/notification-preferences', { preferences })
      return res.data
    },
    onSuccess: () => {
      toast.success('Notification preferences updated')
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
    onError: () => {
      toast.error('Failed to update preferences')
    }
  })

  const [localPrefs, setLocalPrefs] = React.useState<NotificationPreference[]>([])

  React.useEffect(() => {
    if (data && data.length > 0) {
      setLocalPrefs(data)
    } else if (data !== undefined) {
        // Fallback default categories if empty array returned
        setLocalPrefs([
            { category: 'Course Announcements', email_enabled: true, push_enabled: true, digest_enabled: false },
            { category: 'Q&A Replies', email_enabled: true, push_enabled: true, digest_enabled: false },
            { category: 'Promotional Offers', email_enabled: true, push_enabled: false, digest_enabled: false }
        ])
    }
  }, [data])

  const handleToggle = (index: number, field: keyof NotificationPreference, value: boolean) => {
    const newPrefs = [...localPrefs]
    newPrefs[index] = { ...newPrefs[index], [field]: value }
    setLocalPrefs(newPrefs)
  }

  const handleSave = () => {
    updateMutation.mutate(localPrefs)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin size-8 text-indigo-600" /></div>
  }

  return (
    <div className="space-y-6">
      {localPrefs.map((pref, i) => (
        <Card key={pref.category} className="border-slate-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="capitalize text-lg font-bold text-slate-800">{pref.category.replace(/_/g, ' ')}</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Manage how you receive {pref.category.replace(/_/g, ' ')} notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-700">Email Notifications</p>
                <p className="text-xs text-slate-400 font-medium">Receive an email when this happens.</p>
              </div>
              <Switch checked={pref.email_enabled} onCheckedChange={(v) => handleToggle(i, 'email_enabled', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-700">In-App Notifications</p>
                <p className="text-xs text-slate-400 font-medium">Receive an alert inside the application.</p>
              </div>
              <Switch checked={pref.push_enabled} onCheckedChange={(v) => handleToggle(i, 'push_enabled', v)} />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-11 font-bold shadow-md shadow-indigo-600/20">
          {updateMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
