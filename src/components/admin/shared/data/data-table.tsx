import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { cn } from '@/lib/utils'

import { DataEmptyState } from './data-empty-state'
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

export interface Column<T> {
  id?: string
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
  sortKey?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  emptyMessage?: string
  emptyState?: React.ReactNode
  pageSize?: number
  rowKey?: keyof T | ((item: T) => string)
  className?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
}

/**
 * DataTable Organism
 * A unified data table for admin modules with built-in:
 * - Loading states (using TableSkeleton Atom)
 * - Empty states (using DataEmptyState)
 * - Empty states (using DataEmptyState)
 * - Consistent Filament-inspired styling
 */
export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No results found.',
  emptyState,
  pageSize = 10,
  rowKey = 'id' as keyof T,
  className,
  sortBy,
  sortDir,
  onSortChange,
  selectable,
  selectedKeys = new Set(),
  onSelectionChange,
}: DataTableProps<T>) {
  // Temporarily hide bulk delete checklist as requested
  selectable = false

  // Prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getRowKey = React.useCallback((item: T) => {
    if (typeof rowKey === 'function') return rowKey(item)
    // Robust key fallback to prevent 'removeChild' errors caused by duplicate/undefined keys
    return String(
      item?.[rowKey as keyof T] ||
        (item as any)?.uuid ||
        (item as any)?.id ||
        Math.random(),
    )
  }, [rowKey])

  const safeData = Array.isArray(data) ? data : []
  const allPageKeys = React.useMemo(() => safeData.map(getRowKey), [safeData, getRowKey])
  const isAllSelected = safeData.length > 0 && allPageKeys.every(k => selectedKeys.has(k))
  const isSomeSelected = safeData.length > 0 && allPageKeys.some(k => selectedKeys.has(k))

  if (!mounted) {
    return <TableSkeleton columns={columns.length} rows={pageSize} />
  }

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={pageSize} />
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    const newSelected = new Set(selectedKeys)
    if (checked) {
      allPageKeys.forEach(k => newSelected.add(k))
    } else {
      allPageKeys.forEach(k => newSelected.delete(k))
    }
    onSelectionChange(newSelected)
  }

  const handleSelectOne = (key: string, checked: boolean) => {
    if (!onSelectionChange) return
    const newSelected = new Set(selectedKeys)
    if (checked) {
      newSelected.add(key)
    } else {
      newSelected.delete(key)
    }
    onSelectionChange(newSelected)
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden transition-all duration-300',
        className,
      )}
    >
      <Table>
        <TableHeader className="bg-muted/50 border-b">
          <TableRow className="hover:bg-transparent border-none">
            {selectable && (
              <TableHead className="w-12 px-4 text-center first:pl-6">
                <Checkbox
                  checked={isAllSelected}
                  // @ts-ignore
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={cn(isSomeSelected && !isAllSelected ? "data-[state=unchecked]:bg-primary data-[state=unchecked]:text-primary-foreground" : "")}
                />
              </TableHead>
            )}
            {columns.map((column, i) => (
              <TableHead
                key={i}
                className={cn(
                  'font-semibold text-muted-foreground py-5 text-sm first:pl-6 last:pr-6',
                  column.headerClassName,
                  column.sortable &&
                    'cursor-pointer select-none hover:text-foreground transition-colors',
                )}
                onClick={() => {
                  if (!column.sortable || !onSortChange) return
                  const key = column.sortKey || String(column.accessorKey)
                  if (!key || key === 'undefined') return

                  if (sortBy === key) {
                    onSortChange(key, sortDir === 'asc' ? 'desc' : 'asc')
                  } else {
                    onSortChange(key, 'asc')
                  }
                }}
              >
                <div className={cn(
                  "flex items-center gap-2",
                  column.headerClassName?.includes('text-center') && "justify-center",
                  column.headerClassName?.includes('text-right') && "justify-end"
                )}>
                  {column.header}
                  {column.sortable && (
                    <div className="flex flex-col">
                      {sortBy === (column.sortKey || String(column.accessorKey)) ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-foreground" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!Array.isArray(data) || data.length === 0 ? (
            <TableRow>
              <TableCell
                className="p-0"
                colSpan={columns.length + (selectable ? 1 : 0)}
              >
                {emptyState || <DataEmptyState title={emptyMessage} />}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => (
              <TableRow
                key={getRowKey(item) || idx}
                className="group even:bg-muted/10 hover:bg-muted/30 transition-all duration-200 border-b last:border-0"
              >
                {selectable && (
                  <TableCell className="w-12 px-4 text-center first:pl-6">
                    <Checkbox
                      checked={selectedKeys.has(getRowKey(item))}
                      // @ts-ignore
                      onCheckedChange={(checked) => handleSelectOne(getRowKey(item), !!checked)}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((column, j) => (
                  <TableCell
                    key={j}
                    className={cn(
                      'py-5 first:pl-6 last:pr-6 whitespace-nowrap',
                      column.className,
                    )}
                  >
                    {column.cell
                      ? column.cell(item)
                      : column.accessorKey
                        ? String(item[column.accessorKey] ?? '')
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
