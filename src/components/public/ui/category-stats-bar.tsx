import * as React from 'react'
import { Users, BookOpen, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CategoryStatsBarProps {
  totalLearners?: number
  totalCourses?: number
  averageRating?: number
  isLoading?: boolean
  className?: string
}

export function CategoryStatsBar({
  totalLearners,
  totalCourses,
  averageRating,
  isLoading,
  className,
}: CategoryStatsBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Learners */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md shadow-sm">
        <Users className="size-4 text-emerald-400" />
        {isLoading || totalLearners === undefined ? (
          <Skeleton className="h-4 w-16 bg-white/20" />
        ) : (
          <span>{totalLearners.toLocaleString()} Learners</span>
        )}
      </div>

      {/* Courses */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md shadow-sm">
        <BookOpen className="size-4 text-emerald-400" />
        {isLoading || totalCourses === undefined ? (
          <Skeleton className="h-4 w-16 bg-white/20" />
        ) : (
          <span>{totalCourses.toLocaleString()} Courses</span>
        )}
      </div>

      {/* Rating */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md shadow-sm">
        <Star className="size-4 text-amber-400 fill-amber-400" />
        {isLoading || averageRating === undefined ? (
          <Skeleton className="h-4 w-16 bg-white/20" />
        ) : (
          <span>{averageRating.toFixed(1)} Avg Rating</span>
        )}
      </div>
    </div>
  )
}
