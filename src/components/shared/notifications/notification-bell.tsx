import React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  unreadCount?: number
  onClick?: () => void
}

export function NotificationBell({ unreadCount = 0, onClick }: NotificationBellProps) {
  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
