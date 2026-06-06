import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface DataHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onClearFilters: () => void
  activeFiltersCount: number
  filterTrigger?: React.ReactNode
  columnToggle?: React.ReactNode
  resultsCount?: number
  resultsLabel?: string
}

export function DataHeader({
  searchQuery,
  onSearchChange,
  onClearFilters,
  activeFiltersCount,
  filterTrigger,
  columnToggle,
  resultsCount,
  resultsLabel = 'results found',
}: DataHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Atom */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
          <Input
            className="pl-10 bg-background border-border shadow-sm focus-visible:ring-offset-0 focus-visible:ring-1 transition-all h-10"
            placeholder={`${t('common.search')}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Molecule */}
        <div className="flex items-center gap-2">
          {filterTrigger}
          {columnToggle}

          <AnimatePresence>
            {(searchQuery || activeFiltersCount > 0) && (
              <motion.div
                key="clear-filters"
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="h-9 px-3 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 transition-all border border-transparent"
                  variant="ghost"
                  onClick={onClearFilters}
                >
                  <X className="mr-2 h-3 w-3" />
                  {t('common.clearAll')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Count Molecule */}
      <AnimatePresence mode="wait">
        {(searchQuery || activeFiltersCount > 0) && (
          <motion.div
            key="results-count"
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between py-1 border-b border-dashed border-border/60 overflow-hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            <motion.p
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"
              initial={{ scale: 0.98, opacity: 0 }}
            >
              <span className="w-1 h-1 bg-primary/40 rounded-full" />
              Showing{' '}
              <span className="text-foreground font-bold">
                {resultsCount}
              </span>{' '}
              {resultsLabel}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
