import * as React from 'react'
import { Bell, CheckCircle2, Inbox, Loader2, X } from 'lucide-react'
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
  SheetClose,
} from '@/components/ui/sheet'
import { notificationService } from '@/services/notification.service'
import { Badge } from '@/components/ui/badge'

export function NotificationSheet() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  // Fetch notifications with polling
  const { data, isLoading } = useQuery({
    queryKey: ['user', 'notifications', 'list'],
    queryFn: () => notificationService.getAll({ limit: 20 }),
    refetchInterval: 30000, // Poll every 30s
  })

  const markAsReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
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
      '/student/dashboard'
    
    navigate({ to: targetUrl })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 relative hover:bg-[#F0F7FF] hover:text-[#056FAE] rounded-full transition-all"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-slate-100 shadow-2xl">
        <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="font-bold text-slate-900 tracking-tight text-lg">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[10px] h-5 px-1.5 font-bold border-none">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 h-8 px-2 hover:bg-indigo-50/50 rounded-lg transition-all"
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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 text-indigo-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Syncing Notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 px-6 text-center space-y-4">
              <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto border border-slate-100">
                <Inbox className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-400">
                  We'll notify you when something important happens.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.uuid}
                  className={cn(
                    'p-5 flex gap-4 transition-all hover:bg-slate-50/80 cursor-pointer relative group',
                    !n.read_at ? 'bg-indigo-50/20' : 'bg-white'
                  )}
                  onClick={() => handleNotificationClick(n)}
                >
                  {!n.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  )}
                  <div
                    className={cn(
                      'mt-1 size-2 rounded-full shrink-0 transition-transform group-hover:scale-125',
                      !n.read_at
                        ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]'
                        : 'bg-slate-300'
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        'text-[13px] leading-snug transition-colors group-hover:text-indigo-600',
                        !n.read_at ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                      )}
                    >
                      {n.title}
                    </p>
                    <div
                      className={cn(
                        'text-xs leading-relaxed',
                        !n.read_at ? 'text-slate-700 font-normal' : 'text-slate-400 font-normal'
                      )}
                      dangerouslySetInnerHTML={{ __html: n.description }}
                    />
                    <p className="text-[10px] text-slate-400 pt-1 font-medium">
                      {formatDistanceToNow(safeParseDate(n.created_at))} ago
                    </p>
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
