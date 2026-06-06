import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataColumnToggleProps {
  columns: string[]
  visibleColumns: string[]
  onToggle: (column: string) => void
}

export function DataColumnToggle({
  columns,
  visibleColumns,
  onToggle,
}: DataColumnToggleProps) {
  // Never let the user hide all columns, keep at least one
  const disableHide = visibleColumns.length === 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 gap-2 border-border font-semibold shadow-sm ml-2"
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] admin-theme">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-3">
          Toggle Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((col) => {
          const isVisible = visibleColumns.includes(col)
          return (
            <DropdownMenuCheckboxItem
              key={col}
              checked={isVisible}
              onCheckedChange={() => onToggle(col)}
              disabled={isVisible && disableHide}
              className="text-xs py-2 capitalize"
            >
              {col}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
