import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationSettingsForm } from '@/components/user/profile/notification-settings-form'

export const Route = createFileRoute('/student/notification-settings')({
  head: () => ({
    meta: [{ title: 'Aksellearn | Notification Settings' }],
  }),
  component: StudentNotificationSettingsPage,
})

function StudentNotificationSettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          <div className="flex items-center justify-center size-12 rounded-2xl bg-indigo-600/10 text-indigo-600 shrink-0">
            <BellRing className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 leading-none">
              Notification Settings
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">
              Manage your alerts and updates
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200">
        <NotificationSettingsForm />
      </div>
    </div>
  )
}
