import { Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { OrganizationTag } from '@/types/organization'
import { Column, DataTable } from '../shared/data'

interface OrganizationTagTableProps {
  tags: OrganizationTag[]
  onEdit: (tag: OrganizationTag) => void
  isLoading?: boolean
  pageSize?: number
}

export function OrganizationTagTable({
  tags,
  onEdit,
  isLoading,
  pageSize = 10,
}: OrganizationTagTableProps) {
  const columns: Column<OrganizationTag>[] = [
    {
      header: 'Name',
      cell: (item) => (
        <span className="font-semibold text-slate-900">{item.name}</span>
      ),
    },
    {
      header: 'Description',
      cell: (item) => (
        <div className="max-w-[400px] truncate text-muted-foreground">{item.description || '-'}</div>
      ),
    },
    {
      header: 'Created At',
      cell: (item) => (item.createdAt ? formatDate(item.createdAt) : '-'),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item) => (
        <div className="flex justify-center gap-2">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
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
      data={tags}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No industry tags found."
    />
  )
}
