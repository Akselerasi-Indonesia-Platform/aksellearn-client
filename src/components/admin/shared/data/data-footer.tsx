import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface DataFooterProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function DataFooter({
  page,
  total,
  limit,
  onPageChange,
}: DataFooterProps) {
  const totalPages = Math.ceil(total / limit)
  if (!total || totalPages <= 1 || isNaN(totalPages)) return null

  // Generate pagination range logic (Atom logic)
  const getRange = () => {
    const range: (number | string)[] = []
    const siblings = 1
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - siblings && i <= page + siblings)
      ) {
        range.push(i)
      } else if (i === page - siblings - 1 || i === page + siblings + 1) {
        range.push('...')
      }
    }
    return range.filter(
      (item, index) => item !== '...' || range[index - 1] !== '...',
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between border-t mt-4">
      <div className="flex items-center gap-1.5 order-2 md:order-1">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest bg-muted/50 px-2 py-1 rounded">
          Page <span className="text-foreground font-bold">{page}</span> of{' '}
          <span className="text-foreground font-bold">{totalPages}</span>
        </span>
        <span className="text-[10px] text-muted-foreground italic ml-2">
          Total items: {total}
        </span>
      </div>

      <Pagination className="mx-0 w-auto order-1 md:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={
                page === 1
                  ? 'pointer-events-none opacity-50 shrink-0'
                  : 'cursor-pointer shrink-0'
              }
              onClick={() => onPageChange(Math.max(1, page - 1))}
            />
          </PaginationItem>
          {getRange().map((p, i) => (
            <PaginationItem key={i}>
              {p === '...' ? (
                <PaginationEllipsis className="shrink-0" />
              ) : (
                <PaginationLink
                  className="cursor-pointer shrink-0"
                  isActive={page === p}
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              className={
                page === totalPages
                  ? 'pointer-events-none opacity-50 shrink-0'
                  : 'cursor-pointer shrink-0'
              }
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
