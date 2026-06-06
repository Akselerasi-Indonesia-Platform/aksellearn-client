import { Edit, UserCog, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, Column } from '@/components/admin/shared/data'
import { StatusBadge } from '@/components/admin/shared/status/status-badge'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onAssignRoles?: (user: User) => void
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

export function UserTable({
  users,
  onEdit,
  onAssignRoles,
  isLoading,
  pageSize = 10,
  sortBy,
  sortDir,
  onSortChange,
  visibleColumns,
  selectable,
  selectedKeys,
  onSelectionChange,
}: UserTableProps) {
  const { t } = useTranslation()

  const columns: Column<any>[] = [
    {
      id: 'Name',
      header: t('common.name', 'Name'),
      accessorKey: 'name',
      sortable: true,
      sortKey: 'name',
      className: 'font-medium',
    },
    {
      id: 'Email',
      header: t('common.email', 'Email'),
      sortable: true,
      sortKey: 'email',
      cell: (item: any) => (
        <span className="text-muted-foreground">{item.email}</span>
      ),
    },
    {
      id: 'Role',
      header: t('common.role', 'Role'),
      cell: (item: any) => {
        const roles =
          item.roles && item.roles.length > 0 ? item.roles : [item.role]

        return (
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r: any) => (
              <Badge
                key={r}
                variant="secondary"
                className="capitalize text-[10px] font-medium px-2 py-0 h-5 rounded-md border-none bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                {r}
              </Badge>
            ))}
          </div>
        )
      },
    },

    {
      id: 'Status',
      header: t('common.status', 'Status'),
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      id: 'Created At',
      header: t('common.createdAt', 'Created At'),
      sortable: true,
      sortKey: 'created_at',
      cell: (item: any) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {item.createdAt}
        </span>
      ),
    },
    {
      id: 'Actions',
      header: t('common.actions', 'Actions'),
      headerClassName: 'text-center',
      cell: (item: any) => (
        <div className="flex justify-center gap-1">
          <Button
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 hover:bg-slate-100 transition-colors"
                size="icon"
                variant="ghost"
                title="More Actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAssignRoles && (
                <DropdownMenuItem
                  onClick={() => onAssignRoles(item)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserCog className="h-4 w-4 text-blue-500" />
                  <span>Assign Roles</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ].filter(col => !visibleColumns || visibleColumns.includes(col.id || col.header))

  return (
    <DataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No users found."
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={onSortChange}
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
    />
  )
}
