import * as React from 'react'
import { Bell, CheckCircle2, Inbox, Loader2, Clock } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { cn, safeParseDate } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { notificationService } from '@/services/notification.service'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  // Fetch notifications with polling
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'list'],
    queryFn: () => notificationService.getAll({ limit: 20 }),
    refetchInterval: 30000, // Poll every 30s
  })

  const markAsReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })

  const notifications = data?.data || []
  const unreadCount = data?.meta?.unread_count || 0

  const handleNotificationClick = async (n: any) => {
    if (!n.read_at) {
      await markAsReadMutation.mutateAsync(n.uuid)
    }
    setOpen(false)

    // Navigate to entity URL from data payload if available
    const targetUrl =
      n.data?.url ||
      n.data?.link ||
      n.data?.entity_url ||
      n.data?.path ||
      '/admin/dashboard'
    
    navigate({ to: targetUrl })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full px-0 py-0 text-[10px]"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="admin-theme w-full sm:max-w-md p-0 flex flex-col bg-background border-l shadow-2xl">
        <SheetHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-bold tracking-tight text-base">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] h-5 px-1.5 font-bold border-none">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary font-bold flex items-center gap-1.5 h-8 px-2 hover:bg-primary/10 rounded-md transition-all"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Mark all read
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Syncing Notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 px-6 text-center space-y-4">
              <div className="size-16 bg-muted/50 rounded-2xl flex items-center justify-center text-muted-foreground/50 mx-auto border">
                <Inbox className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll notify you when something important happens.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <div
                  key={n.uuid}
                  className={cn(
                    'p-4 flex gap-3 transition-colors hover:bg-muted/50 cursor-pointer relative group',
                    !n.read_at ? 'bg-primary/[0.03]' : 'bg-transparent'
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  {!n.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex w-full items-center justify-between">
                      <p
                        className={cn(
                          'text-[13px] leading-snug transition-colors',
                          !n.read_at ? 'font-semibold text-primary' : 'font-medium text-foreground'
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read_at && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'text-xs leading-relaxed',
                        !n.read_at ? 'text-foreground/80 font-normal' : 'text-muted-foreground font-normal'
                      )}
                      dangerouslySetInnerHTML={{ __html: n.description }}
                    />
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-medium text-primary/60">
                      <Clock className="size-3" />
                      {formatDistanceToNow(safeParseDate(n.created_at))} ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

