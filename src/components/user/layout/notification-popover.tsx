import * as React from 'react'
import { Bell, CheckCircle2, Inbox, Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { notificationService } from '@/services/notification.service'
import { Badge } from '@/components/ui/badge'

export function NotificationPopover() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'notifications', 'peek'],
    queryFn: () => notificationService.getAll({ limit: 5 }),
    enabled: open,
  })

  // Also pre-fetch unread count for the badge even when closed
  const { data: unreadData } = useQuery({
    queryKey: ['user', 'notifications', 'unread-count'],
    queryFn: () => notificationService.getAll({ limit: 1 }),
    refetchInterval: 60000, // Every minute
  })

  const markAsReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
    },
  })

  const notifications = data?.data || []
  const unreadCount = unreadData?.meta?.unread_count || 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 relative hover:bg-slate-100 rounded-full transition-all"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 size-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-sm shadow-rose-500/50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 md:w-96 p-0 mt-2 bg-white border-slate-200 shadow-2xl shadow-indigo-600/15 rounded-[28px] overflow-hidden animate-in slide-in-from-top-2"
        align="end"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-slate-900 tracking-tight">
              Recent Updates
            </h4>
            {unreadCount > 0 && (
              <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[10px] h-5 px-1.5 font-bold border-none">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Link
            to="/student/notification"
            onClick={() => setOpen(false)}
            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
          >
            Visit Inbox
          </Link>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3">
              <div className="size-8 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Syncing Inbox...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="size-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200 mx-auto border border-slate-100">
                <Inbox className="size-8" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                No new updates
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.uuid}
                  className={`p-6 flex gap-4 transition-all hover:bg-slate-50 cursor-pointer relative ${!n.read_at ? 'bg-indigo-50/30' : 'bg-white'}`}
                  onClick={() => {
                    if (!n.read_at) markAsReadMutation.mutate(n.uuid)
                  }}
                >
                  {!n.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  )}
                  <div
                    className={`mt-1.5 size-2 rounded-full shrink-0 ${!n.read_at ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}
                  />
                  <div className="flex-1 space-y-1.5">
                    <p
                      className={`text-[13px] leading-tight transition-colors ${!n.read_at ? 'font-black text-slate-900 group-hover:text-indigo-600' : 'font-bold text-slate-600'}`}
                    >
                      {n.title}
                    </p>
                    <div
                      className={cn(
                        'text-xs leading-relaxed line-clamp-2',
                        !n.read_at
                          ? 'text-slate-700 font-medium'
                          : 'text-slate-400 font-medium',
                      )}
                      dangerouslySetInnerHTML={{ __html: n.description }}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {formatDistanceToNow(new Date(n.created_at))} ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
          <Link
            to="/student/notification"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all rounded-xl hover:bg-white"
          >
            View Full History <Inbox className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
