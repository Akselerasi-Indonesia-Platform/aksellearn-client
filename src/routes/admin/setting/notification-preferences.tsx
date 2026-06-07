import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BellRing } from 'lucide-react'
import { NotificationSettingsForm } from '@/components/user/profile/notification-settings-form'

export const Route = createFileRoute('/admin/setting/notification-preferences')({
  component: AdminNotificationPreferencesPage,
})

function AdminNotificationPreferencesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 admin-theme">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BellRing className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notification Preferences</h2>
            <p className="text-muted-foreground">
              Manage your personal notification alerts.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mt-8">
        <NotificationSettingsForm />
      </div>
    </div>
  )
}
