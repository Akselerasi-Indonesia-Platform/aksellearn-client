import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { notificationService } from '@/services/notification.service'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/notification')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // 1. Fetch Notifications
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'notifications', currentPage],
    queryFn: () =>
      notificationService.getAll({ page: currentPage, limit: itemsPerPage }),
  })

  // 2. Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      toast.success('Notification marked as read')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => notificationService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      toast.success('Notification deleted')
    },
  })

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      toast.success('All notifications cleared')
    },
  })

  const notifications = data?.data || []
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: itemsPerPage,
    unread_count: 0,
  }
  const totalPages = Math.ceil(meta.total / itemsPerPage)

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-medium">
          Failed to load notifications
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <AdminPage className="admin-theme flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage and view all your system notifications.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/5 text-primary transition-all"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={
              markAllAsReadMutation.isPending || notifications.length === 0
            }
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/5 hover:border-destructive/30 border-destructive/10 transition-all"
            onClick={() => {
              if (
                confirm('Are you sure you want to clear all notifications?')
              ) {
                clearAllMutation.mutate()
              }
            }}
            disabled={clearAllMutation.isPending || notifications.length === 0}
          >
            {clearAllMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Clear all
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-filament overflow-hidden">
        <CardHeader className="pb-3 border-b bg-background">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-tight">
              All Notifications
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground font-bold">
              {meta.unread_count} Unread
            </Badge>
          </div>
          <CardDescription className="text-primary/60">
            {isLoading
              ? 'Syncing with server...'
              : `Showing ${notifications.length} of ${meta.total} items`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 bg-background min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-primary/60 font-medium">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground/80">
                  No Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-primary/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-4 p-5 transition-all hover:bg-primary/[0.03] ${
                    !notification.read_at
                      ? 'bg-primary/[0.05] border-l-4 border-l-primary'
                      : 'border-l-4 border-l-transparent bg-background'
                  }`}
                >
                  <div
                    className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                      !notification.read_at
                        ? 'bg-primary/20 text-primary shadow-sm'
                        : 'bg-primary/5 text-primary/40'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-semibold leading-none truncate ${
                            !notification.read_at
                              ? 'text-primary'
                              : 'text-foreground/80'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:flex items-center text-[11px] font-medium text-primary/60 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                          )}{' '}
                          ago
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {!notification.read_at && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  markAsReadMutation.mutate(notification.uuid)
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() =>
                                deleteMutation.mutate(notification.uuid)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center mt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={`transition-all ${currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-primary/10 hover:text-primary cursor-pointer'}`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(i + 1)
                    }}
                    className={`transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90'
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1)
                  }}
                  className={`transition-all ${currentPage === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-primary/10 hover:text-primary cursor-pointer'}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </AdminPage>
  )
}
