import { Edit, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Organization } from '@/types/organization'
import { DataTable, Column } from '@/components/admin/shared/data'

interface OrganizationTableProps {
  organizations: Organization[]
  onEdit: (org: Organization) => void
  isLoading?: boolean
  pageSize?: number
}

export function OrganizationTable({
  organizations,
  onEdit,
  isLoading,
  pageSize = 10,
}: OrganizationTableProps) {
  const { t } = useTranslation()

  const columns: Column<Organization>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      className: 'font-semibold text-slate-900',
    },
    {
      header: 'Contact Email',
      cell: (item) => (
        <span className="text-muted-foreground">{item.contact_email || '-'}</span>
      ),
    },
    {
      header: 'Industry / Tag',
      cell: (item) => (
        <span className="font-semibold text-slate-700">
          {item.organization_tag?.name || '-'}
        </span>
      ),
    },
    {
      header: t('common.createdAt', 'Created At'),
      cell: (item) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      headerClassName: 'text-center',
      cell: (item) => (
        <div className="flex justify-center gap-1">
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            title="View Details"
          >
            <Link to={`/admin/organization/${item.uuid}` as any}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
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
      data={organizations}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No organizations found."
    />
  )
}
