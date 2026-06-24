import * as React from 'react'
import { Star, PlayCircle, Clock, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'
import type { Course } from '@/types/course'

export interface CourseListItemProps {
  course: Course
  isTrending?: boolean
  className?: string
}

export function CourseListItem({
  course,
  isTrending = false,
  className
}: CourseListItemProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Card
      className={cn(
        "flex flex-col sm:flex-row h-full border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 overflow-hidden bg-white p-3 rounded-xl group gap-4",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="sm:w-64 shrink-0 aspect-video relative overflow-hidden bg-slate-50 rounded-lg">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}
          alt={course.title}
          loading="lazy"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
            isHovered && (course as any).preview_url ? "opacity-0" : "opacity-100"
          )}
        />
        {isHovered && (course as any).preview_url && (
          <video
            src={(course as any).preview_url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
        
        {course.is_corporate && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-slate-900/90 text-white border-none font-bold backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[8px] uppercase tracking-wider">
              CORPORATE
            </Badge>
          </div>
        )}
        {isTrending && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-orange-500/90 text-white border-none font-bold backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame className="size-3 fill-white" />
              TRENDING
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-0 flex-1 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1.5">
          {course.category?.name && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              {course.category.name}
            </p>
          )}
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight transition-colors group-hover:text-primary tracking-tight">
            {course.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 hidden sm:block">
            {course.description || (course as any).excerpt || 'A comprehensive course covering essential topics to help you master new skills.'}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            By {course.instructor?.name || 'Aksellearn Instructor'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-bold text-amber-600">
              {(course.summary?.stats?.average_rating ?? 0).toFixed(1)}
            </span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("size-3.5", i < Math.floor(course.summary?.stats?.average_rating ?? 0) ? "fill-current" : "fill-none")} />
              ))}
            </div>
            <span className="text-xs text-slate-400">
              ({course.summary?.stats?.total_reviews ?? 0} ratings)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal text-slate-500 pt-1">
            <span>{course.summary?.stats?.total_duration || '0 total hours'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>
              {course.summary?.stats?.total_videos ?? course.summary?.stats?.total_lessons ?? course.summary?.stats?.total_modules ?? 0} lectures
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{(course as any).difficulty_level || 'All Levels'}</span>
          </div>
        </div>

        {/* Price column (right aligned on desktop) */}
        <div className="sm:w-32 flex flex-col sm:items-end justify-start shrink-0">
          <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
            {course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0) ? (
              <>
                <span className="text-lg font-bold text-slate-900 tracking-tighter">
                  {formatCurrency(course.price_discount)}
                </span>
                <span className="text-sm text-slate-400 line-through font-medium">
                  {formatCurrency(course.price || 0)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-900 tracking-tighter">
                {formatCurrency(course.price || 0)}
              </span>
            )}
          </div>
          {course.badge_text && (
            <Badge className="bg-amber-100 text-amber-800 border-none font-bold rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-widest mt-2 hidden sm:inline-flex">
                {course.badge_text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseListItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row h-full border border-slate-200 shadow-sm overflow-hidden bg-white p-3 rounded-xl gap-4">
      <div className="sm:w-64 shrink-0 aspect-video relative overflow-hidden bg-slate-50 rounded-lg">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-0 flex-1 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full hidden sm:block" />
          <Skeleton className="h-4 w-5/6 hidden sm:block" />
          <Skeleton className="h-3 w-32 mt-2" />
          <Skeleton className="h-4 w-40 mt-2" />
          <Skeleton className="h-3 w-48 mt-2" />
        </div>
        <div className="sm:w-32 flex flex-col sm:items-end gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
