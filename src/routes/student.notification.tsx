import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  Loader2,
  Package,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notificationService } from '@/services/notification.service'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/student/notification')({
  component: StudentInboxPage,
})

type NotificationCategory = 'all' | 'unread' | 'order' | 'system'

function StudentInboxPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = React.useState<NotificationCategory>('all')
  const [search, setSearch] = React.useState('')
  const [currentPage, _setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  // 1. Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ['user', 'notifications', category, currentPage],
    queryFn: () =>
      notificationService.getAll({ page: currentPage, limit: itemsPerPage }),
  })

  // 2. Mutations
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
      toast.success('Inbox updated: All notifications marked as read', {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] })
      toast.info('Notification removed')
    },
  })

  const rawNotifications = data?.data || []
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    unread_count: 0,
  }

  // 3. Client-side filtering for UX responsiveness
  const filteredNotifications = React.useMemo(() => {
    return rawNotifications.filter((n) => {
      const title = n.title || ''
      const description = n.description || ''
      const matchSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase())

      const matchCategory =
        category === 'all'
          ? true
          : category === 'unread'
            ? !n.read_at
            : n.type === category

      return matchSearch && matchCategory
    })
  }, [rawNotifications, search, category])

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="size-4" />
      case 'security':
        return <ShieldAlert className="size-4" />
      default:
        return <Bell className="size-4" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Inbox className="size-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Inbox
            </h1>
          </div>
          <p className="text-slate-400 font-medium text-lg">
            Manage your notifications and system updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all h-11 px-6 shadow-sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={
              markAllAsReadMutation.isPending || meta.unread_count === 0
            }
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            Mark all read
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as NotificationCategory)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-12">
            <TabsTrigger
              value="all"
              className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              Unread{' '}
              {meta.unread_count > 0 && (
                <span className="ml-2 size-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {meta.unread_count}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="order"
              className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              Orders
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search in inbox..."
            className="h-12 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inbox List */}
      <Card className="rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardContent className="p-0">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div key="loading" className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="size-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-32 text-center space-y-6"
              >
                <div className="size-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto border border-dashed border-slate-200">
                  <Filter className="size-10" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800">
                    Clear Skies!
                  </p>
                  <p className="text-slate-400 font-medium">
                    No notifications matching your current filters.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div key="list" className="divide-y divide-slate-100">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.uuid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group p-6 md:p-8 flex items-start gap-6 transition-all hover:bg-slate-50 cursor-pointer relative overflow-hidden ${!notification.read_at ? 'bg-indigo-50/20' : ''}`}
                    onClick={() => {
                      if (!notification.read_at)
                        markAsReadMutation.mutate(notification.uuid)
                    }}
                  >
                    {!notification.read_at && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 shadow-[2px_0_10px_rgba(79,70,229,0.3)]" />
                    )}

                    <div
                      className={`mt-1 size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        !notification.read_at
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <h4
                          className={`text-base font-black truncate tracking-tight transition-colors ${
                            !notification.read_at
                              ? 'text-slate-900 group-hover:text-indigo-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                            <Clock className="size-3" />
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                            )}{' '}
                            ago
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteMutation.mutate(notification.uuid)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'text-sm leading-relaxed prose prose-slate prose-sm max-w-none',
                          !notification.read_at
                            ? 'text-slate-600 font-medium'
                            : 'text-slate-400',
                        )}
                        dangerouslySetInnerHTML={{
                          __html: notification.description,
                        }}
                      />

                      {notification.type === 'order' && (
                        <div className="pt-2">
                          <Badge className="rounded-lg bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase tracking-wider">
                            Transaction Approved
                          </Badge>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.2em] animate-pulse">
          End of updates
        </p>
      </div>
    </div>
  )
}
