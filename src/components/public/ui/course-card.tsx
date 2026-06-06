import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Star, PlayCircle, Clock, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'
import type { Course } from '@/types/course'

export interface CourseCardProps {
  course: Course
  showCTA?: boolean
  showHoverOverlay?: boolean
  isTrending?: boolean
  className?: string
}

export function CourseCard({
  course,
  showCTA = true,
  showHoverOverlay = true,
  isTrending = false,
  className
}: CourseCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Card
      className={cn(
        "flex flex-col h-full border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#056FAE]/10 hover:border-[#056FAE]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white p-0 rounded-[6px] group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative grid-cols-1">
        <div className="aspect-video relative overflow-hidden bg-slate-50">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'}
            alt={course.title}
            loading="lazy"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-110",
              isHovered && showHoverOverlay && (course as any).preview_url ? "opacity-0" : "opacity-100"
            )}
          />
          {isHovered && showHoverOverlay && (course as any).preview_url && (
            <video
              src={(course as any).preview_url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-300"
            />
          )}
          {showHoverOverlay && (
            <>
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              {(!isHovered || !(course as any).preview_url) && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/30">
                    <PlayCircle className="size-8 text-white" />
                  </div>
                </div>
              )}
            </>
          )}
          {course.is_corporate && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-slate-900/90 text-white border-none font-bold backdrop-blur-sm rounded-md px-2 py-0.5 text-[9px] uppercase tracking-wider">
                CORPORATE
              </Badge>
            </div>
          )}
          {isTrending && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-orange-500/90 text-white border-none font-bold backdrop-blur-sm rounded-md px-2 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Flame className="size-3 fill-white" />
                TRENDING
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col space-y-4">
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#5B5FA0] bg-[#5B5FA0]/10 px-2 py-0.5 rounded w-fit uppercase tracking-[0.2em]">
            {course.category?.name || 'Uncategorized'}
            </p>
            <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight transition-colors group-hover:text-primary tracking-tight">
            {course.title}
            </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-500">
            {(course.summary?.stats?.average_rating ?? 0).toFixed(1)}
          </span>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("size-3.5", i < Math.floor(course.summary?.stats?.average_rating ?? 0) ? "fill-current" : "fill-none")} />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            ({course.summary?.stats?.total_reviews ?? 0})
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <PlayCircle className="size-4 text-slate-400" />
            <span>
              {course.summary?.stats?.total_videos ??
                course.summary?.stats?.total_lessons ??
                course.summary?.stats?.total_modules ??
                0}{' '}
              lectures
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-400" />
            <span>{course.summary?.stats?.total_duration || '0m'}</span>
          </div>
        </div>

        <div className="pt-4 mt-auto border-t border-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0) ? (
                <>
                  <span className="text-xl font-bold text-[#0D3A6E] tracking-tighter">
                    {formatCurrency(course.price_discount)}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-medium">
                    {formatCurrency(course.price || 0)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-[#0D3A6E] tracking-tighter">
                  {formatCurrency(course.price || 0)}
                </span>
              )}
            </div>
            {course.badge_text && (
              <Badge className="bg-amber-100 text-amber-800 border-none font-bold rounded-md px-2 py-0.5 text-[9px] uppercase tracking-widest shrink-0">
                  {course.badge_text}
              </Badge>
            )}
          </div>
          {showCTA && (() => {
            const isFree = course.price_discount !== null && course.price_discount !== undefined && course.price_discount < (course.price || 0)
              ? course.price_discount === 0 
              : (course.price || 0) === 0
            return (
              <Button
                variant={isFree ? 'enroll-free' : 'card-enroll'}
                size="sm"
                className="w-full text-xs h-9 uppercase tracking-wider font-bold"
              >
                {isFree ? 'Start Free' : 'Enroll Now'}
              </Button>
            )
          })()}
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-sm overflow-hidden bg-white rounded-[6px]">
      <div className="aspect-video relative overflow-hidden bg-slate-50">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-5 flex-1 flex flex-col space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="pt-4 mt-auto border-t border-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}
