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

import { PublicLayout } from '@/components/public/layout/main-layout'
import { CourseCard, CourseCardSkeleton } from '@/components/public/ui/course-card'
import { EmptyState } from '@/components/public/ui/empty-state'
import { Button } from '@/components/ui/button'
import { CourseFilterBar } from '@/components/public/ui/course-filter-bar'
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
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  page: z.number().optional().catch(1),
})

export const Route = createFileRoute('/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchPage,
})

function SearchPage() {
  const { q, category, difficulty, sort_by, price_min, price_max, page } = useSearch({ from: '/search' })
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
    page: page || 1,
    limit: 12,
  })

  const courses = courseResults?.data || []
  const total = courseResults?.meta?.total || courses.length

  const handleCategoryChange = (slug: string | undefined) => {
    if (slug) {
      navigate({
        to: '/categories/$slug',
        params: { slug },
      })
    } else {
      navigate({
        to: '/search',
        search: (prev) => ({ ...prev, category: undefined, page: 1 }),
      })
    }
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

  const clearFilters = () => {
    navigate({
      to: '/search',
      search: { q: undefined, category: undefined, difficulty: undefined, sort_by: undefined, price_min: undefined, price_max: undefined, page: 1 },
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
        {/* Zone 1: Brand-Aligned Hero Header */}
        <div className="bg-gradient-to-br from-[#056FAE] via-[#1A7AB8] to-[#2AABAA] pt-32 pb-24 relative overflow-hidden shrink-0">
          {/* Background Decorative Rings */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] border-[60px] border-white/5 rounded-full"></div>
            <div className="absolute -bottom-[30%] -right-[15%] w-[600px] h-[600px] border-[40px] border-white/5 rounded-full"></div>
            <div className="absolute -bottom-[10%] -right-[5%] w-[400px] h-[400px] border-[20px] border-white/5 rounded-full"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 max-w-7xl">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black text-white backdrop-blur-xl shadow-lg shadow-black/5">
                <Sparkles className="size-3 text-[#70C942]" />
                <span>Course Catalog</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                {q ? (
                  <>Results for <span className="text-[#70C942] italic">"{q}"</span></>
                ) : category ? (
                  <>Explore <span className="text-[#70C942]">{selectedCategory?.name || category}</span></>
                ) : (
                  <>Master the <span className="text-[#70C942] italic">Best Skills</span></>
                )}
              </h1>
              <p className="text-white/80 font-medium max-w-2xl text-lg">
                {coursesLoading ? "Searching for courses..." : `${total} courses available.`}
              </p>
            </div>
          </div>
        </div>

        {/* Zone 2: Sticky Filter Bar */}
        <CourseFilterBar 
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
          onClear={clearFilters}
        />

        {/* Zone 3: Full-Width Course Grid */}
        <div className="container mx-auto px-4 max-w-7xl relative z-20 flex-1 pt-12">
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center space-y-6 bg-rose-50/30 rounded-3xl border border-rose-100 max-w-2xl mx-auto">
              <AlertCircle className="size-12 text-rose-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Something went wrong
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  We couldn't load the courses. Please try again.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-300">
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
                        className="group block h-full flex flex-col"
                      >
                        <CourseCard course={course} />
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
                    Previous
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
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title="No courses found"
              description="Try adjusting your filters, trying a different search term, or browsing categories."
              variant="light"
              action={{ label: 'Clear All Filters', onClick: clearFilters }}
            />
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
