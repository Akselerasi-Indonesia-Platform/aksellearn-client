import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Notification } from '@/types/notification'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NotificationCardProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const isUnread = !notification.read_at

  return (
    <Card 
      className={cn(
        "cursor-pointer p-4 transition-colors hover:bg-muted/50 border-x-0 border-t-0 rounded-none shadow-none first:border-t-0 border-b",
        isUnread ? "bg-muted/20" : "bg-background"
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium leading-none", isUnread && "font-semibold text-foreground")}>
              {notification.title}
            </p>
            {isUnread && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  )
}
