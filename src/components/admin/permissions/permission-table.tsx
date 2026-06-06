import * as React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatPermission } from '@/lib/utils'
import type { Permission } from '@/types/permission'

interface PermissionTableProps {
  permissions: Permission[]
  isLoading?: boolean
  pageSize?: number
}

export function PermissionTable({
  permissions,
  isLoading,
  pageSize = 10,
}: PermissionTableProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null

  return (
    <div className="rounded-md border bg-card shadow-filament transition-all duration-300">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Permission Name</TableHead>
            <TableHead className="text-right">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell className="flex justify-center">
                  <Skeleton className="h-5 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : permissions.length === 0 ? (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={2}>
                No permissions found.
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission) => (
              <TableRow
                key={permission.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {formatPermission(permission.name)}
                </TableCell>
                <TableCell className="text-right">
                  {formatDate(permission.createdAt || '')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
