import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { InstructorApplication } from '@/types/instructor-application'
import { DataTable, Column } from '@/components/admin/shared/data'

interface ApplicationTableProps {
  applications: InstructorApplication[]
  onView: (app: InstructorApplication) => void
  isLoading?: boolean
  pageSize?: number
  visibleColumns?: string[]
}

export function ApplicationTable({
  applications,
  onView,
  isLoading,
  pageSize = 10,
  visibleColumns,
}: ApplicationTableProps) {
  const allColumns: Column<InstructorApplication>[] = [
    {
      header: 'Name',
      accessorKey: 'full_name',
      className: 'font-semibold text-slate-900',
    },
    {
      header: 'Headline',
      cell: (item) => (
        <span className="text-muted-foreground line-clamp-1 max-w-[200px]" title={item.headline}>
          {item.headline || '-'}
        </span>
      ),
    },
    {
      header: 'Expertise',
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.expertise?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 font-normal">
              {tag}
            </Badge>
          ))}
          {(item.expertise?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 text-slate-400 font-normal">
              +{(item.expertise?.length || 0) - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Submitted',
      cell: (item) => (
        <span className="text-muted-foreground whitespace-nowrap text-sm">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => {
        switch (item.status) {
          case 'pending': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Pending</Badge>
          case 'under_review': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Under Review</Badge>
          case 'accepted': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Accepted</Badge>
          case 'rejected': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Rejected</Badge>
          default: return <Badge variant="outline">{item.status}</Badge>
        }
      },
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item) => (
        <div className="flex justify-center gap-1">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            size="icon"
            variant="ghost"
            onClick={() => onView(item)}
            title={item.status === 'pending' || item.status === 'under_review' ? 'Review Application' : 'View Details'}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const columns = visibleColumns 
    ? allColumns.filter(col => visibleColumns.includes(col.header))
    : allColumns

  return (
    <DataTable
      data={applications}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No applications found."
    />
  )
}
