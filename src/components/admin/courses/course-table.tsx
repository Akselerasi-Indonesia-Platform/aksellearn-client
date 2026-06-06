import { Edit, BarChart3, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import type { Course } from '@/types/course'
import { MediaImage } from '@/components/admin/shared/media-image'
import { Column, DataTable } from '@/components/admin/shared/data'
import { StatusBadge } from '@/components/admin/shared/status'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface CourseTableProps {
  courses: Course[]
  categories: { label: string; value: string }[]
  onEdit: (course: Course) => void
  onShowInsights?: (course: Course) => void
  isLoading?: boolean
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void
  visibleColumns?: string[]
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
}

export function CourseTable({
  courses,
  categories,
  onEdit,
  onShowInsights,
  isLoading,
  pageSize = 10,
  sortBy,
  sortDir,
  onSortChange,
  visibleColumns,
  selectable,
  selectedKeys,
  onSelectionChange,
}: CourseTableProps) {
  const { t } = useTranslation()

  const getCategoryName = (course: Course) => {
    if (course.category?.name) return course.category.name
    return (
      categories.find(
          (c) =>
              c.value === course.course_category_uuid ||
              c.value === String(course.course_category_id),
      )?.label || 'Unknown'
    )
  }

  const columns: Column<any>[] = [
    {
      header: 'Title',
      sortable: true,
      sortKey: 'title',
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          {item.thumbnail && (
            <MediaImage
              alt=""
              className="h-10 w-16 rounded object-cover shadow-sm bg-muted"
              src={item.thumbnail}
            />
          )}
          <div>
            <div className="font-bold">{item.title}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {item.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (item: any) => (
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/10 text-primary font-bold"
        >
          {getCategoryName(item)}
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: (item: any) => (
        <StatusBadge
          status={item.is_active}
          labels={{
            true: t('common.active', 'Active'),
            false: t('common.inactive', 'Inactive'),
          }}
        />
      ),
    },
    {
      header: 'Price',
      sortable: true,
      sortKey: 'price',
      cell: (item: any) => {
        const hasDiscount = item.price_discount !== null && item.price_discount !== undefined && item.price_discount < (item.price || 0)
        return (
          <div className="flex flex-col items-start gap-1">
            {hasDiscount ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{formatCurrency(item.price_discount)}</span>
                  <Badge className="h-5 px-1.5 text-[9px] font-bold tracking-wider bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shrink-0 uppercase">Promo Active</Badge>
                </div>
                <span className="text-xs text-slate-400 line-through font-medium">{formatCurrency(item.price || 0)}</span>
              </>
            ) : (
              <span className="font-bold text-sm text-slate-900">{formatCurrency(item.price || 0)}</span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Published At',
      sortable: true,
      sortKey: 'published_at',
      cell: (item: any) =>
        item.published_at ? (
          <span className="text-xs">{item.published_at}</span>
        ) : (
          <span className="text-muted-foreground text-xs italic">N/A</span>
        ),
    },
    {
      header: 'Created At',
      sortable: true,
      sortKey: 'created_at',
      cell: (item: any) => <span className="text-xs">{item.createdAt}</span>,
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item: any) => (
        <div className="flex justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                size="icon"
                variant="ghost"
                onClick={() => onEdit(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Course</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-8 w-8 hover:bg-slate-100 transition-colors"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More Actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {onShowInsights && (
                <DropdownMenuItem
                  onClick={() => onShowInsights(item)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span>Deep Insights</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ].filter(col => !visibleColumns || visibleColumns.includes(col.header))

  return (
    <DataTable
      data={courses}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No courses found."
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={onSortChange}
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
    />
  )
}
