import { Edit, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { ArticleCategory } from '@/types/article-category'
import { Column, DataTable } from '../shared/data'

interface CategoryTableProps {
  categories: ArticleCategory[]
  onEdit: (category: ArticleCategory) => void
  onDelete: (category: ArticleCategory) => void
  isLoading?: boolean
  pageSize?: number
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading,
  pageSize = 10,
}: CategoryTableProps) {
  const columns: Column<ArticleCategory>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      className: 'font-medium',
    },
    {
      header: 'Description',
      accessorKey: 'description',
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
          <Button
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
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
      emptyMessage="No article categories found."
    />
  )
}
