import { AnimatePresence, motion } from 'framer-motion'
import { Trash2, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onDeleteSelected?: () => void
  onExportSelected?: () => void
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onExportSelected,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-foreground px-6 py-3 shadow-2xl"
        >
          <span className="text-sm font-semibold text-background">
            {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
          </span>
          <div className="h-4 w-px bg-background/20" />
          {onDeleteSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSelected}
              className="text-background hover:bg-background/20 hover:text-background h-8 px-3"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
          {onExportSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportSelected}
              className="text-background hover:bg-background/20 hover:text-background h-8 px-3"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          <div className="h-4 w-px bg-background/20" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="text-background hover:bg-background/20 hover:text-background rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
