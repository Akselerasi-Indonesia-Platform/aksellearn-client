import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CourseCategory } from '@/services/discovery/course.service'

interface CategoryFilterTabsProps {
  categories: CourseCategory[]
  selected?: string
  onSelect: (slug: string | undefined) => void
  maxVisible?: number
  className?: string
}

export function CategoryFilterTabs({
  categories,
  selected,
  onSelect,
  maxVisible = 5,
  className
}: CategoryFilterTabsProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true) // assume true initially

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1)
    }
  }

  React.useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300 // Scroll by a good chunk
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={cn("relative flex items-center w-full max-w-full group", className)}>
      {/* Left Gradient & Button */}
      {canScrollLeft && (
        <div className="absolute left-0 z-10 h-full flex items-center pr-8 bg-gradient-to-r from-white via-white/90 to-transparent pb-2 -mb-2">
          <button
            onClick={() => scroll('left')}
            className="size-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-[#056FAE] hover:border-[#056FAE]/30 transition-all -ml-2"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      )}

      {/* Scrollable Track */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2 w-full"
      >
        <button
          onClick={() => onSelect(undefined)}
          className={cn(
            'px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shrink-0',
            !selected
              ? 'bg-[#056FAE] border-[#056FAE] text-white shadow-md shadow-primary/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-[#056FAE]/30 hover:bg-[#F0F7FF] hover:text-[#056FAE]',
          )}
        >
          All Courses
        </button>
        {categories.slice(0, maxVisible).map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.slug)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shrink-0',
              selected === category.slug
                ? 'bg-[#056FAE] border-[#056FAE] text-white shadow-md shadow-primary/20'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#056FAE]/30 hover:bg-[#F0F7FF] hover:text-[#056FAE]',
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Right Gradient & Button */}
      {canScrollRight && (
        <div className="absolute right-0 z-10 h-full flex items-center pl-8 bg-gradient-to-l from-white via-white/90 to-transparent pb-2 -mb-2">
          <button
            onClick={() => scroll('right')}
            className="size-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-[#056FAE] hover:border-[#056FAE]/30 transition-all -mr-2"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
