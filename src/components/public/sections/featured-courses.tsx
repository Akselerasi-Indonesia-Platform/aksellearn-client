import * as React from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'
import { useNavigate, Link } from '@tanstack/react-router'

import { CourseCard, CourseCardSkeleton } from '@/components/public/ui/course-card'
import { SectionHeader } from '@/components/public/ui/section-header'
import { CategoryFilterTabs } from '@/components/public/ui/category-filter-tabs'
import { Button } from '@/components/ui/button'
import type { Course, CourseCategory } from '@/types/course'

interface FeaturedCoursesProps {
  courses: Course[]
  isLoading?: boolean
  categories?: CourseCategory[]
  selectedCategorySlug?: string
  onCategorySelect?: (slug: string | undefined) => void
  title?: string
  titleAccent?: string
  description?: string
  badgeLabel?: string
  isTrendingSection?: boolean
  viewAllSort?: 'popular' | 'latest' | 'trending' | 'recommended'
  emptyStateMessage?: string
}

/**
 * Background Role: `bg-white`
 * Rule: Standard alternating white background block.
 */
export function FeaturedCourses({
  courses,
  isLoading,
  categories = [],
  selectedCategorySlug,
  onCategorySelect,
  title = "Jumpstart your",
  titleAccent = "learning",
  description = "Hand-picked professional certifications and courses designed to accelerate your technical and business expertise.",
  badgeLabel = "Featured Collection",
  isTrendingSection = false,
  viewAllSort,
  emptyStateMessage = "No courses found in this category.",
}: FeaturedCoursesProps) {
  const navigate = useNavigate()

  const handleViewAll = () => {
    if (viewAllSort) {
      navigate({
        to: '/search',
        search: { sort_by: viewAllSort },
      })
    } else {
      navigate({
        to: '/search',
        search: { category: selectedCategorySlug },
      })
    }
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10 mb-10 md:mb-16">
          <SectionHeader
            badge={{ icon: Sparkles, label: badgeLabel }}
            title={title}
            titleAccent={titleAccent}
            description={description}
            theme="gradient"
          />
          
          {categories.length > 0 && onCategorySelect && (
            <div className="flex justify-start md:justify-end max-w-xl">
              <CategoryFilterTabs
                categories={categories}
                selected={selectedCategorySlug}
                onSelect={onCategorySelect}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-medium">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {courses.slice(0, 8).map((course) => (
              <Link
                key={course.id}
                to="/course/$courseSlug"
                params={{ courseSlug: course.slug || course.uuid }}
                className="group block h-full flex flex-col"
              >
                <CourseCard course={course} isTrending={isTrendingSection} />
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-16">
          <Button
            onClick={handleViewAll}
            variant="outline"
            size="lg"
            className="rounded-full px-8 font-bold border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all gap-2"
          >
            Explore All Courses
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}