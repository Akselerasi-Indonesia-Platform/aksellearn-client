import { Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { CourseCategory } from '@/types/course'
import { Column, DataTable } from '../shared/data'

interface CourseCategoryTableProps {
  categories: CourseCategory[]
  onEdit: (category: CourseCategory) => void
  isLoading?: boolean
  pageSize?: number
}

export function CourseCategoryTable({
  categories,
  onEdit,
  isLoading,
  pageSize = 10,
}: CourseCategoryTableProps) {
  const columns: Column<CourseCategory>[] = [
    {
      header: 'Name',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{item.name}</span>
          <span className="text-xs text-slate-500">/{item.slug}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (item) => (
        <div className="max-w-[300px] truncate">{item.description || '-'}</div>
      ),
    },
    {
      header: 'Created At',
      cell: (item) => formatDate(item.createdAt),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item) => (
        <div className="flex justify-center gap-2">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={categories}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No course categories found."
    />
  )
}
