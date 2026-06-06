import { Edit2, BookOpen } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, Column } from '@/components/admin/shared/data'
import { StatusBadge } from '@/components/admin/shared/status/status-badge'
import { formatDate } from '@/lib/utils'
import type { FeaturedCourse } from '@/types/featured-course'

interface FeaturedCourseTableProps {
  featuredCourses: FeaturedCourse[]
  onEdit: (fc: FeaturedCourse) => void
  isLoading?: boolean
  pageSize?: number
}

export function FeaturedCourseTable({
  featuredCourses,
  onEdit,
  isLoading,
  pageSize = 10,
}: FeaturedCourseTableProps) {
  const { t } = useTranslation()

  const columns: Column<FeaturedCourse>[] = [
    {
      id: 'Thumbnail',
      header: t('common.thumbnail', 'Thumbnail'),
      cell: (item: FeaturedCourse) => {
        const thumbnail = item.course?.thumbnail
        let srcUrl = ''
        if (thumbnail) {
          if (typeof thumbnail === 'string') {
            srcUrl = thumbnail
          } else if (typeof thumbnail === 'object') {
            srcUrl = (thumbnail as any)['175x175'] || (thumbnail as any).original || ''
          }
        }
        return (
          <div className="size-16 rounded-lg overflow-hidden border bg-muted flex items-center justify-center shrink-0">
            {srcUrl ? (
              <img
                src={srcUrl}
                alt={item.course?.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="size-6 text-muted-foreground" />
            )}
          </div>
        )
      },
    },
    {
      id: 'Course',
      header: t('common.title', 'Course Title'),
      cell: (item: FeaturedCourse) => (
        <div className="space-y-1">
          <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.course?.title || 'Unknown Course'}</p>
          {item.course?.category?.name && (
            <Badge variant="secondary" className="text-[9px] font-bold py-0 h-4">
              {item.course.category.name}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'Order',
      header: t('featuredCourses.sortOrder', 'Order'),
      accessorKey: 'sort_order',
      className: 'text-center font-mono text-xs font-bold',
    },
    {
      id: 'Schedule',
      header: 'Feature Period',
      cell: (item: FeaturedCourse) => {
        if (!item.start_at && !item.end_at) {
          return <span className="text-xs text-slate-400 font-medium">Always Featured</span>
        }
        return (
          <div className="text-[10px] text-muted-foreground space-y-0.5 font-medium">
            {item.start_at && (
              <p>From: {formatDate(item.start_at)}</p>
            )}
            {item.end_at && (
              <p>Until: {formatDate(item.end_at)}</p>
            )}
          </div>
        )
      },
    },
    {
      id: 'Status',
      header: t('common.status', 'Status'),
      cell: (item: FeaturedCourse) => (
        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      id: 'Actions',
      header: t('common.actions', 'Actions'),
      headerClassName: 'text-center',
      cell: (item: FeaturedCourse) => (
        <div className="flex justify-center gap-1">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            title="Edit Settings"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={featuredCourses}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage={t('featuredCourses.noFeatured', 'No featured courses found.')}
    />
  )
}
