import React from 'react'
import { Notification } from '@/types/notification'
import { NotificationCard } from './notification-card'
import { Skeleton } from '@/components/ui/skeleton'

interface NotificationListProps {
  notifications: Notification[]
  isLoading?: boolean
  onNotificationClick?: (notification: Notification) => void
  emptyMessage?: string
}

export function NotificationList({
  notifications,
  isLoading,
  onNotificationClick,
  emptyMessage = "You're all caught up!"
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-3 w-[100px] mt-2" />
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
        <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="font-medium text-foreground">{emptyMessage}</p>
        <p className="text-sm mt-1">No new notifications right now.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.uuid}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  )
}
