import {
  MoreHorizontal,
  RefreshCcw,
  XCircle,
  Undo2,
  ExternalLink,
} from 'lucide-react'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { Order } from '@/services/admin/order.service'
import { DataTable, Column } from '@/components/admin/shared/data'
import { ChevronDown, ChevronUp, ArrowUpDown, Receipt } from 'lucide-react'
import { formatIDR } from '@/lib/currency'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Link } from '@tanstack/react-router'
import { isAdmin, getUser, can } from '@/lib/auth'

interface OrderTableProps {
  orders: Order[]
  onRefresh: (uuid: string) => void
  onRefund: (uuid: string) => void
  onCancel: (uuid: string) => void
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

export function OrderTable({
  orders,
  onRefresh,
  onRefund,
  onCancel,
  isLoading,
  pageSize = 10,
  sortBy,
  sortDir,
  onSortChange,
  visibleColumns,
  selectable,
  selectedKeys,
  onSelectionChange,
}: OrderTableProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
      pending:
        'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
      processing:
        'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
      cancelled:
        'bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/20',
      refunded:
        'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
    }

    return (
      <Badge
        variant="outline"
        className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded-md ${styles[status] || styles.pending}`}
      >
        {status}
      </Badge>
    )
  }

  const columns: Column<any>[] = [
    {
      header: 'Order ID',
      accessorKey: 'uuid',
      sortable: true,
      sortKey: 'uuid',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground" />
          <span className="font-mono text-[11px] font-bold text-muted-foreground">
            {item.uuid.split('-')[0]}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      sortable: true,
      sortKey: 'user_name',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight">
            {item.user?.name || item.user_name || 'Unknown User'}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.user?.email || item.user_email || 'No email'}
          </span>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (item: any) => {
        if (!item.items || item.items.length === 0) return <span className="text-muted-foreground text-xs">No items</span>
        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs truncate max-w-[200px]">
              {item.items[0]?.title_snapshot || item.items[0]?.name || 'Unknown Item'}
            </span>
            {item.items.length > 1 && (
              <span className="text-[10px] font-bold text-primary">
                + {item.items.length - 1} more item(s)
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Amount',
      sortable: true,
      sortKey: 'total_amount',
      cell: (item: any) => (
        <span className="font-bold tabular-nums">
          {formatIDR(item.total_amount || item.amount || 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      sortable: true,
      sortKey: 'payment_status',
      cell: (item: any) => getStatusBadge(item.payment_status || item.status || 'pending'),
    },
    {
      header: 'Date',
      sortable: true,
      sortKey: 'created_at',
      cell: (item: any) => (
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          {item.created_at || '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-center',
      cell: (item: any) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-xl h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 transition-all duration-300"
            >
              <Link to={`/admin/order/${item.uuid}` as any}>
                <ExternalLink className="h-3.5 w-3.5" />
                View Details
              </Link>
            </Button>
          </div>
        )
      },
    },
  ].filter(col => !visibleColumns || visibleColumns.includes(col.header))

  return (
    <DataTable
      data={orders}
      columns={columns}
      isLoading={isLoading}
      pageSize={pageSize}
      emptyMessage="No orders found."
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={onSortChange}
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
    />
  )
}
