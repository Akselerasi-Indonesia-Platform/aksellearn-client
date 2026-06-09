import {
  createFileRoute,
  Link,
  useSearch,
  useNavigate,
} from '@tanstack/react-router'
import {
  Search as SearchIcon,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/public/layout/main-layout'
import { CourseListItem, CourseListItemSkeleton } from '@/components/public/ui/course-list-item'
import { EmptyState } from '@/components/public/ui/empty-state'
import { Button } from '@/components/ui/button'
import { CourseSearchSidebar } from '@/components/public/ui/course-search-sidebar'
import {
  usePublicCourseSearch,
  useCourseCategories,
} from '@/hooks/use-discovery'
import { cn } from '@/lib/utils'

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional().catch(undefined),
  sort_by: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  page: z.coerce.number().optional().catch(1),
})

export const Route = createFileRoute('/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchPage,
})

function SearchPage() {
  const { t } = useTranslation()
  const { q, category, difficulty, sort_by, price_min, price_max, rating, page } = useSearch({ from: '/search' })
  const navigate = useNavigate()

  const { data: categories, isLoading: categoriesLoading } = useCourseCategories()
  const selectedCategory = React.useMemo(
    () => categories?.find((c) => c.slug === category),
    [categories, category],
  )

  const {
    data: courseResults,
    isLoading: coursesLoading,
    isError,
  } = usePublicCourseSearch({
    query: q,
    category: category,
    difficulty: difficulty,
    sort_by: sort_by,
    price_min: price_min,
    price_max: price_max,
    rating: rating,
    page: page || 1,
    limit: 12,
  })

  const courses = courseResults?.data || []
  const total = courseResults?.meta?.total || courses.length

  const handleCategoryChange = (val: string | undefined) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, category: val || undefined, page: 1 }),
    })
  }

  const handleSearchChange = (val: string | undefined) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, q: val || undefined, page: 1 }),
    })
  }

  const handleSortChange = (val: string) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, sort_by: val, page: 1 }),
    })
  }

  const handleDifficultyChange = (val: string | undefined) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, difficulty: val, page: 1 }),
    })
  }

  const handlePriceChange = (min?: string, max?: string) => {
    navigate({
      to: '/search',
      search: (prev) => ({
        ...prev,
        price_min: min ? parseInt(min) : undefined,
        price_max: max ? parseInt(max) : undefined,
        page: 1,
      }),
    })
  }

  const handleRatingChange = (val: string | undefined) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, rating: val ? parseFloat(val) : undefined, page: 1 }),
    })
  }

  const clearFilters = () => {
    navigate({
      to: '/search',
      search: { q: undefined, category: undefined, difficulty: undefined, sort_by: undefined, price_min: undefined, price_max: undefined, rating: undefined, page: 1 },
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/search',
      search: (prev) => ({ ...prev, page: newPage }),
    })
  }

  return (
    <PublicLayout>
      <div className="bg-[#fcfdfe] min-h-screen pb-20 flex flex-col">
        {/* Zone 1: Minimal Header */}
        <div className="bg-white border-b border-slate-200 py-8 shrink-0">
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {q ? (
                <>{t('search.resultsFor')} "{q}"</>
              ) : (
                <>{t('search.masterThe')} {t('search.bestSkills')}</>
              )}
            </h1>
          </div>
        </div>

        {/* Zone 2: Main Layout (Sidebar + Results) */}
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8 py-8 relative z-20 flex-1">
          {/* Sidebar Area */}
          <CourseSearchSidebar 
            total={total}
            searchQuery={q}
            onSearchChange={handleSearchChange}
            categories={categories}
            categorySlug={category}
            onCategoryChange={handleCategoryChange}
            sortBy={sort_by}
            onSortChange={handleSortChange}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            priceMin={price_min?.toString()}
            priceMax={price_max?.toString()}
            onPriceChange={handlePriceChange}
            rating={rating?.toString()}
            onRatingChange={handleRatingChange}
            onClear={clearFilters}
          />

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Sort & Count Header (Desktop) */}
            <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="text-xl font-bold text-slate-900">{total} results</div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">{t('search.sortBy', 'Sort By')}</label>
                <select 
                  className="h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={sort_by || 'newest'}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">{t('search.newest', 'Newest')}</option>
                  <option value="popular">{t('search.popular', 'Most Popular')}</option>
                  <option value="top_rated">{t('search.topRated', 'Top Rated')}</option>
                  <option value="price_asc">{t('search.priceLow', 'Price: Low to High')}</option>
                  <option value="price_desc">{t('search.priceHigh', 'Price: High to Low')}</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pills */}
            {(q || category || difficulty || price_min || price_max || rating) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-medium text-slate-500 mr-2">{t('search.activeFilters', 'Active Filters:')}</span>
                {q && (
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => handleSearchChange(undefined)}>
                    "{q}" <X className="size-3 ml-1.5" />
                  </Button>
                )}
                {category && category.split(',').map(catSlug => (
                  <Button key={`cat-${catSlug}`} variant="secondary" size="sm" className="h-7 px-3 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => {
                    const newCats = category.split(',').filter(c => c !== catSlug)
                    handleCategoryChange(newCats.length > 0 ? newCats.join(',') : undefined)
                  }}>
                    {categories?.find(c => c.slug === catSlug)?.name || catSlug} <X className="size-3 ml-1.5" />
                  </Button>
                ))}
                {difficulty && difficulty.split(',').map(diff => (
                  <Button key={`diff-${diff}`} variant="secondary" size="sm" className="h-7 px-3 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => {
                    const newDiffs = difficulty.split(',').filter(d => d !== diff)
                    handleDifficultyChange(newDiffs.length > 0 ? newDiffs.join(',') : undefined)
                  }}>
                    {diff} <X className="size-3 ml-1.5" />
                  </Button>
                ))}
                {(price_min || price_max) && (
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => handlePriceChange(undefined, undefined)}>
                    Price: {price_min ? `Rp ${price_min}` : '0'} - {price_max ? `Rp ${price_max}` : 'Max'} <X className="size-3 ml-1.5" />
                  </Button>
                )}
                {rating && (
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => handleRatingChange(undefined)}>
                    {rating} & up <X className="size-3 ml-1.5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={clearFilters}>
                  {t('search.clearAll', 'Clear All')}
                </Button>
              </div>
            )}

          {coursesLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(8)].map((_, i) => (
                <CourseListItemSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center space-y-6 bg-rose-50/30 rounded-3xl border border-rose-100 max-w-2xl mx-auto">
              <AlertCircle className="size-12 text-rose-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {t('search.error')}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {t('search.errorHint')}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => window.location.reload()}
              >
                {t('search.errorButton')}
              </Button>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <AnimatePresence mode="popLayout">
                  {courses.map((course: any, idx: number) => (
                    <motion.div
                      key={course.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to="/course/$courseSlug"
                        params={{ courseSlug: course.slug || course.uuid }}
                        className="group block"
                      >
                        <CourseListItem course={course} />
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Zone 4: Pagination Controls */}
              {courseResults?.meta && courseResults.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((page || 1) - 1)}
                    disabled={(page || 1) <= 1}
                    className="h-10 px-4 rounded-lg font-semibold"
                  >
                    {t('common.previous')}
                  </Button>
                  
                  <div className="flex gap-1.5 hidden sm:flex">
                    {[...Array(courseResults.meta.last_page)].map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "outline"}
                        onClick={() => handlePageChange(i + 1)}
                        className={cn(
                          "size-10 p-0 rounded-lg font-bold",
                          page === i + 1 ? "bg-slate-900 text-white" : ""
                        )}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((page || 1) + 1)}
                    disabled={(page || 1) >= courseResults.meta.last_page}
                    className="h-10 px-4 rounded-lg font-semibold"
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title={t('search.noResults')}
              description={t('search.noResultsHint')}
              variant="light"
              action={{ label: t('search.resetFilters'), onClick: clearFilters }}
            />
          )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
