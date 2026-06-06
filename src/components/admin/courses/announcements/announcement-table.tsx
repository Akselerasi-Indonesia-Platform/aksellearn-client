'use client'

import { Edit2, Trash2, Megaphone, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/shared/alert/confirm-dialog'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CourseAnnouncement } from '@/types/course'

interface CourseAnnouncementTableProps {
  announcements: CourseAnnouncement[]
  onEdit: (announcement: CourseAnnouncement) => void
  onDelete: (announcement: CourseAnnouncement) => void
  onBroadcast: (announcement: CourseAnnouncement) => void
}

export function CourseAnnouncementTable({
  announcements,
  onEdit,
  onDelete,
  onBroadcast,
}: CourseAnnouncementTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b bg-muted/30">
            <TableHead className="font-bold py-4">
              {t('common.title')}
            </TableHead>
            <TableHead className="font-bold py-4">
              {t('common.createdAt')}
            </TableHead>
            <TableHead className="w-[70px] py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.length === 0 ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={4}>
                {t('common.noResults', 'No announcements found.')}
              </TableCell>
            </TableRow>
          ) : (
            announcements.map((announcement) => (
              <TableRow
                key={announcement.id}
                className="group transition-colors hover:bg-muted/30"
              >
                <TableCell className="font-bold text-foreground">
                  {announcement.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {announcement.createdAt
                        ? format(new Date(announcement.createdAt), 'PPP')
                        : '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-center gap-1">
                    <Button
                      className={cn(
                        'h-8 px-2 transition-all shadow-none flex items-center gap-1.5 font-semibold text-xs',
                        announcement.is_broadcasted || announcement.pending_broadcast_count === 0
                          ? 'text-slate-400 bg-slate-50'
                          : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700',
                      )}
                      disabled={announcement.is_broadcasted || announcement.pending_broadcast_count === 0}
                      size="sm"
                      title={
                        announcement.is_broadcasted
                          ? 'Already Broadcasted'
                          : 'Broadcast'
                      }
                      type="button"
                      variant="ghost"
                      onClick={() => onBroadcast(announcement)}
                    >
                      <Megaphone
                        className={cn(
                          'h-3.5 w-3.5',
                          announcement.is_broadcasted && 'fill-current',
                        )}
                      />
                      <span>Broadcast</span>
                      {announcement.pending_broadcast_count !== undefined && !announcement.is_broadcasted && (
                        <span className="ml-1 bg-blue-600/10 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px] leading-none">
                          {announcement.pending_broadcast_count} unsent
                        </span>
                      )}
                    </Button>
                    <Button
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shadow-none"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => onEdit(announcement)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      title="Delete Announcement"
                      description={`Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`}
                      confirmText="Delete"
                      onConfirm={() => onDelete(announcement)}
                      trigger={
                        <Button
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shadow-none"
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
