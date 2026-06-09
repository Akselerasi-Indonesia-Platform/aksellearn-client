import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Filter, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { Link } from '@tanstack/react-router'

interface CourseSearchSidebarProps {
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
  rating?: string
  onRatingChange?: (val: string | undefined) => void
  onClear: () => void
  hideCategory?: boolean
  className?: string
}

export function CourseSearchSidebar({
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
  rating,
  onRatingChange,
  onClear,
  hideCategory = false,
  className,
}: CourseSearchSidebarProps) {
  const { t } = useTranslation()
  const isFiltersActive = !!difficulty || !!priceMin || !!priceMax || !!categorySlug || !!rating

  const [localMin, setLocalMin] = React.useState(priceMin || '')
  const [localMax, setLocalMax] = React.useState(priceMax || '')

  React.useEffect(() => {
    setLocalMin(priceMin || '')
    setLocalMax(priceMax || '')
  }, [priceMin, priceMax])

  const handlePriceApply = () => {
    onPriceChange(localMin || undefined, localMax || undefined)
  }

  const difficultyOptions = [
    { label: t('search.beginner', 'Beginner'), value: 'beginner' },
    { label: t('search.intermediate', 'Intermediate'), value: 'intermediate' },
    { label: t('search.advanced', 'Advanced'), value: 'advanced' },
  ]

  const ratingOptions = [
    { label: '4.5 & up', value: '4.5', stars: 4.5 },
    { label: '4.0 & up', value: '4.0', stars: 4.0 },
    { label: '3.5 & up', value: '3.5', stars: 3.5 },
    { label: '3.0 & up', value: '3.0', stars: 3.0 },
  ]

  const FilterContent = () => (
    <div className="space-y-4">
      {isFiltersActive && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="w-full text-slate-500 hover:text-rose-600 justify-start px-2 h-8"
        >
          <X className="size-4 mr-2" />
          {t('search.clear', 'Clear Filters')}
        </Button>
      )}

      <Accordion type="multiple" defaultValue={['category', 'difficulty', 'rating', 'price']} className="w-full">
        {/* Categories Accordion */}
        {!hideCategory && categories && categories.length > 0 && onCategoryChange && (
          <AccordionItem value="category" className="border-b-0">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline py-3">
              {t('search.categoryFilter', 'Category')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1 pb-3">
                {categories.map((c) => {
                  return (
                    <Link
                      key={c.id} 
                      to="/categories/$slug" 
                      params={{ slug: c.slug }}
                      className="flex items-center space-x-3 group"
                    >
                      <div className="size-4 border border-slate-300 rounded-[4px] flex items-center justify-center group-hover:border-primary transition-colors">
                        {categorySlug === c.slug && <div className="size-2 bg-primary rounded-[1px]" />}
                      </div>
                      <span className="text-sm text-slate-700 cursor-pointer font-normal group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Difficulty Accordion - Hidden as requested */}
        {/*
        <AccordionItem value="difficulty" className="border-b-0 border-t border-slate-200">
          <AccordionTrigger className="font-bold text-slate-900 hover:no-underline py-3">
            {t('search.level', 'Level')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1 pb-3">
              {difficultyOptions.map((opt) => {
                const selectedDiffs = difficulty ? difficulty.split(',') : []
                const isChecked = selectedDiffs.includes(opt.value)
                return (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`diff-${opt.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newSelected = [...selectedDiffs]
                        if (checked) {
                          newSelected.push(opt.value)
                        } else {
                          newSelected = newSelected.filter(v => v !== opt.value)
                        }
                        onDifficultyChange(newSelected.length > 0 ? newSelected.join(',') : undefined)
                      }}
                      className="rounded-[4px]"
                    />
                    <Label htmlFor={`diff-${opt.value}`} className="text-sm text-slate-700 cursor-pointer font-normal">
                      {opt.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
        */}

        {/* Rating Accordion */}
        {onRatingChange && (
          <AccordionItem value="rating" className="border-b-0 border-t border-slate-200">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline py-3">
              {t('search.rating', 'Rating')}
            </AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={rating || 'all'}
                onValueChange={(v) => onRatingChange(v === 'all' ? undefined : v)}
                className="space-y-3 pt-1 pb-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="all" id="rating-all" className="size-4 border-slate-300" />
                  <Label htmlFor="rating-all" className="text-sm text-slate-700 cursor-pointer font-normal">
                    {t('search.allRatings', 'Any Rating')}
                  </Label>
                </div>
                {ratingOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt.value} id={`rating-${opt.value}`} className="size-4 border-slate-300" />
                    <Label htmlFor={`rating-${opt.value}`} className="flex items-center gap-1 text-sm text-slate-700 cursor-pointer font-normal">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("size-3.5", i < Math.floor(opt.stars) ? "fill-current" : i < opt.stars ? "fill-current opacity-50" : "fill-none")} />
                        ))}
                      </div>
                      <span className="ml-1">{opt.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price Accordion */}
        <AccordionItem value="price" className="border-b-0 border-t border-slate-200">
          <AccordionTrigger className="font-bold text-slate-900 hover:no-underline py-3">
            {t('search.priceFilter', 'Price')}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">{t('search.priceMin', 'Min')}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">{t('search.priceMax', 'Max')}</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              <Button onClick={handlePriceApply} className="w-full h-9" variant="secondary">
                {t('common.apply', 'Apply')}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <div className={className}>
      {/* Desktop View */}
      <div className="hidden md:block w-64 pr-6 shrink-0">
        <FilterContent />
      </div>

      {/* Mobile View (Drawer) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 bg-white w-full justify-center">
              <Filter className="size-4 mr-2" />
              {t('search.filters', 'Filters')} {isFiltersActive && <span className="ml-1 flex h-2 w-2 rounded-full bg-primary"></span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl sm:max-w-none w-full flex flex-col p-0 gap-0">
            <SheetHeader className="border-b p-4 shrink-0">
              <SheetTitle className="text-left font-bold text-lg">{t('search.filtersAndSort', 'Filters & Sort')}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
              <FilterContent />
            </div>
            <SheetFooter className="p-4 border-t shrink-0 bg-white shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]">
              <SheetClose asChild>
                <Button className="w-full h-12">
                  {t('search.showResults', 'Show Results')} ({total})
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
