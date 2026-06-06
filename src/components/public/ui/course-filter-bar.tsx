import * as React from 'react'
import { Filter, X, Search, Check, ChevronsUpDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface CategoryFilterBarProps {
  total: number
  searchQuery?: string
  onSearchChange: (val: string | undefined) => void
  categories?: { id: string; slug: string; name: string }[]
  categorySlug?: string
  onCategoryChange?: (slug: string | undefined) => void
  sortBy?: string
  onSortChange: (val: string) => void
  difficulty?: string
  onDifficultyChange: (val: string | undefined) => void
  priceMin?: string
  priceMax?: string
  onPriceChange: (min?: string, max?: string) => void
  onClear: () => void
  className?: string
}

function FilterCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = 'Search...',
  triggerClassName,
  contentClassName,
}: {
  options: { label: string; value: string }[]
  value: string
  onValueChange: (val: string) => void
  placeholder: string
  searchPlaceholder?: string
  triggerClassName?: string
  contentClassName?: string
}) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("bg-white justify-between font-normal text-slate-700 hover:bg-slate-50", triggerClassName)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", contentClassName)} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label} // Used for filtering
                  onSelect={() => {
                    onValueChange(o.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function CourseFilterBar({
  total,
  searchQuery,
  onSearchChange,
  categories,
  categorySlug,
  onCategoryChange,
  sortBy,
  onSortChange,
  difficulty,
  onDifficultyChange,
  priceMin,
  priceMax,
  onPriceChange,
  onClear,
  className,
}: CategoryFilterBarProps) {
  const isFiltersActive = !!difficulty || !!priceMin || !!priceMax || !!searchQuery || !!categorySlug

  const [localSearch, setLocalSearch] = React.useState(searchQuery || '')
  const [localMin, setLocalMin] = React.useState(priceMin || 'any')
  const [localMax, setLocalMax] = React.useState(priceMax || 'any')

  React.useEffect(() => {
    setLocalSearch(searchQuery || '')
    setLocalMin(priceMin || 'any')
    setLocalMax(priceMax || 'any')
  }, [searchQuery, priceMin, priceMax])

  const handleSearchApply = () => {
    onSearchChange(localSearch || undefined)
  }

  const handleMinChange = (v: string) => {
    setLocalMin(v)
    onPriceChange(v === 'any' ? undefined : v, localMax === 'any' ? undefined : localMax)
  }

  const handleMaxChange = (v: string) => {
    setLocalMax(v)
    onPriceChange(localMin === 'any' ? undefined : localMin, v === 'any' ? undefined : v)
  }

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    ...(categories?.map(c => ({ label: c.name, value: c.slug })) || [])
  ]

  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Top Rated', value: 'top_rated' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ]

  const difficultyOptions = [
    { label: 'All Levels', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ]

  const priceMinOptions = [
    { label: 'Any Min', value: 'any' },
    { label: 'Rp 0', value: '0' },
    { label: 'Rp 50K', value: '50000' },
    { label: 'Rp 100K', value: '100000' },
    { label: 'Rp 250K', value: '250000' },
    { label: 'Rp 500K', value: '500000' },
    { label: 'Rp 1M', value: '1000000' },
  ]

  const priceMaxOptions = [
    { label: 'Any Max', value: 'any' },
    { label: 'Rp 50K', value: '50000' },
    { label: 'Rp 100K', value: '100000' },
    { label: 'Rp 250K', value: '250000' },
    { label: 'Rp 500K', value: '500000' },
    { label: 'Rp 1M', value: '1000000' },
    { label: 'Rp 2M', value: '2000000' },
  ]

  // Desktop view
  const DesktopFilters = () => (
    <div className="hidden md:flex items-center gap-4 w-full">
      <div className="relative flex items-center">
        <Input 
          type="text"
          placeholder="Search courses..."
          className="w-[180px] h-10 bg-white pr-10"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchApply()}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 h-10 w-10 text-slate-400 hover:text-slate-600 rounded-l-none"
          onClick={handleSearchApply}
        >
          <Search className="size-4" />
        </Button>
      </div>

      {categories && categories.length > 0 && onCategoryChange && (
        <FilterCombobox
          options={categoryOptions}
          value={categorySlug || 'all'}
          onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}
          placeholder="Category"
          searchPlaceholder="Search category..."
          triggerClassName="w-[180px] h-10"
          contentClassName="w-[240px]"
        />
      )}

      <FilterCombobox
        options={sortOptions}
        value={sortBy || 'newest'}
        onValueChange={onSortChange}
        placeholder="Sort By"
        searchPlaceholder="Search options..."
        triggerClassName="w-[160px] h-10"
        contentClassName="w-[200px]"
      />

      <FilterCombobox
        options={difficultyOptions}
        value={difficulty || 'all'}
        onValueChange={(v) => onDifficultyChange(v === 'all' ? undefined : v)}
        placeholder="Level"
        searchPlaceholder="Search levels..."
        triggerClassName="w-[160px] h-10"
        contentClassName="w-[200px]"
      />

      <div className="flex items-center gap-2">
        <FilterCombobox
          options={priceMinOptions}
          value={localMin}
          onValueChange={handleMinChange}
          placeholder="Min Rp"
          searchPlaceholder="Search price..."
          triggerClassName="w-[120px] h-10"
          contentClassName="w-[160px]"
        />
        <span className="text-slate-400">-</span>
        <FilterCombobox
          options={priceMaxOptions}
          value={localMax}
          onValueChange={handleMaxChange}
          placeholder="Max Rp"
          searchPlaceholder="Search price..."
          triggerClassName="w-[120px] h-10"
          contentClassName="w-[160px]"
        />
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        {isFiltersActive && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="text-slate-500 hover:text-rose-600 h-10"
          >
            <X className="size-4 mr-2" />
            Clear
          </Button>
        )}
        <div className="text-sm font-semibold text-slate-500">
          <span className="text-slate-900">{total}</span> results
        </div>
      </div>
    </div>
  )

  // Mobile view
  const MobileFilters = () => (
    <div className="flex md:hidden items-center justify-between w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-10 bg-white">
            <Filter className="size-4 mr-2" />
            Filters {isFiltersActive && <span className="ml-1 flex h-2 w-2 rounded-full bg-primary"></span>}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl sm:max-w-none w-full">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Filters & Sort</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6 overflow-y-auto">
            {categories && categories.length > 0 && onCategoryChange && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900">Category</label>
                <FilterCombobox
                  options={categoryOptions}
                  value={categorySlug || 'all'}
                  onValueChange={(v) => onCategoryChange(v === 'all' ? undefined : v)}
                  placeholder="Category"
                  searchPlaceholder="Search category..."
                  triggerClassName="w-full h-12"
                  contentClassName="w-[calc(100vw-2rem)] sm:w-[380px]"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900">Sort By</label>
              <FilterCombobox
                options={sortOptions}
                value={sortBy || 'newest'}
                onValueChange={onSortChange}
                placeholder="Sort By"
                searchPlaceholder="Search options..."
                triggerClassName="w-full h-12"
                contentClassName="w-[calc(100vw-2rem)] sm:w-[380px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900">Level</label>
              <FilterCombobox
                options={difficultyOptions}
                value={difficulty || 'all'}
                onValueChange={(v) => onDifficultyChange(v === 'all' ? undefined : v)}
                placeholder="Level"
                searchPlaceholder="Search levels..."
                triggerClassName="w-full h-12"
                contentClassName="w-[calc(100vw-2rem)] sm:w-[380px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900">Price Range</label>
              <div className="flex items-center gap-3">
                <FilterCombobox
                  options={priceMinOptions}
                  value={localMin}
                  onValueChange={handleMinChange}
                  placeholder="Min Rp"
                  searchPlaceholder="Search price..."
                  triggerClassName="w-full h-12 flex-1"
                  contentClassName="w-[200px]"
                />
                <span className="text-slate-400">-</span>
                <FilterCombobox
                  options={priceMaxOptions}
                  value={localMax}
                  onValueChange={handleMaxChange}
                  placeholder="Max Rp"
                  searchPlaceholder="Search price..."
                  triggerClassName="w-full h-12 flex-1"
                  contentClassName="w-[200px]"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 pt-4 border-t mt-auto absolute bottom-0 left-0 right-0 p-4 bg-white">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={onClear}
              disabled={!isFiltersActive}
            >
              Clear
            </Button>
            <SheetClose asChild>
              <Button className="flex-1 h-12">
                Show Results
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <div className="text-sm font-semibold text-slate-500">
        <span className="text-slate-900">{total}</span> results
      </div>
    </div>
  )

  return (
    <div className={cn('sticky top-[64px] z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200 py-3 transition-all duration-300 shadow-sm', className)}>
      <div className="container mx-auto px-4 max-w-7xl">
        <DesktopFilters />
        <MobileFilters />
      </div>
    </div>
  )
}
