import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  columnWidths?: string[]
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  columnWidths,
}: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead
                key={i}
                className={`py-5 first:pl-6 last:pr-6 ${i === columns - 1 ? 'text-right' : ''}`}
                style={{ width: columnWidths?.[i] }}
              >
                <Skeleton
                  className={`h-4 opacity-70 ${i === columns - 1 ? 'ml-auto w-16' : 'w-24'}`}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow
              key={i}
              className="hover:bg-transparent border-b last:border-0 even:bg-muted/10"
            >
              {Array.from({ length: columns }).map((_, j) => (
                <TableCell
                  key={j}
                  className={`py-5 first:pl-6 last:pr-6 ${j === columns - 1 ? 'text-right' : ''}`}
                >
                  <Skeleton
                    className={`h-4 opacity-50 ${j === columns - 1 ? 'ml-auto w-12' : 'w-full max-w-[200px]'}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
