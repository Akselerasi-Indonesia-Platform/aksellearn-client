import { Edit, Shield, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate, formatPermission } from '@/lib/utils'
import type { Role } from '@/types/role'
import { Badge } from '@/components/ui/badge'
import { Column, DataTable } from '../shared/data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RoleTableProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onAssignPermissions: (role: Role) => void
  isLoading?: boolean
  pageSize?: number
}

export function RoleTable({
  roles,
  onEdit,
  onAssignPermissions,
  isLoading,
  pageSize = 10,
}: RoleTableProps) {
  const columns: Column<Role>[] = [
    {
      header: 'Role Name',
      accessorKey: 'name',
      className: 'font-medium capitalize',
    },
    {
      header: 'Permissions',
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.permissions && item.permissions.length > 0 ? (
            item.permissions.map((p) => (
              <Badge key={p} variant="secondary">
                {formatPermission(p)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm italic">None</span>
          )}
        </div>
      ),
    },
    {
      header: 'Created At',
      cell: (item) => formatDate(item.createdAt || ''),
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
              <DropdownMenuItem
                onClick={() => onAssignPermissions(item)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Assign Permissions</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={roles}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No roles found."
    />
  )
}
