import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { CirclePlay, Star, Clock, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CourseCertificateModal } from '@/components/user/course/ui/course-certificate-modal'
import { toast } from 'sonner'
import { userCourseService } from '@/services/user/course.service'

export interface CourseCardProps {
  title: string
  category: string
  slug: string
  thumbnailUrl: string
  rating: number
  reviewsCount: number | string
  lecturesCount: number
  duration: string
  priceFormatted: string
  className?: string
  href?: string
  actionText?: string
  progress?: number
  lessonsLeft?: number
  is_active?: boolean
  enrollmentUuid?: string
}

export function CourseCard({
  title,
  category,
  slug,
  thumbnailUrl,
  rating,
  reviewsCount,
  lecturesCount,
  duration,
  priceFormatted,
  className,
  href,
  actionText = 'Enroll Now',
  progress,
  lessonsLeft,
  is_active = true,
  enrollmentUuid,
}: CourseCardProps) {
  // If href is provided, use it, otherwise default to public course page
  const linkProps = href 
    ? { to: href } as any
    : { to: "/course/$courseSlug", params: { courseSlug: slug } } as any

  const CardWrapper = is_active === false ? 'div' : Link as any
  const wrapperProps = is_active === false 
    ? { className: "group block h-full flex flex-col cursor-not-allowed opacity-80 grayscale-[20%]" }
    : { ...linkProps, className: "group block h-full flex flex-col" }

  const [isCertModalOpen, setIsCertModalOpen] = React.useState(false)

  const handleViewCertificate = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!enrollmentUuid) return
    setIsCertModalOpen(true)
  }

  const cardInner = (
    <div data-slot="card" className="text-card-foreground flex flex-col h-full border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#056FAE]/10 hover:border-[#056FAE]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white p-0 rounded-[6px] group">
      <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 p-0 relative grid-cols-1">
        <div className="aspect-video relative overflow-hidden bg-slate-50">
          <img 
            alt={title} 
            loading="lazy" 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-110 opacity-100" 
            src={thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
          />
          {is_active === false && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                Course Unavailable
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/30">
              <CirclePlay className="size-8 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col space-y-4" data-slot="card-content">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#5B5FA0] bg-[#5B5FA0]/10 px-2 py-0.5 rounded w-fit uppercase tracking-[0.2em]">
            {category}
          </p>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight transition-colors group-hover:text-primary tracking-tight">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-500">{rating.toFixed(1)}</span>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "size-3.5",
                  i < Math.floor(rating) ? "fill-current" : "fill-none"
                )} 
                aria-hidden="true" 
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">({reviewsCount})</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <CirclePlay className="size-4 text-slate-400" aria-hidden="true" />
            <span>{lecturesCount} {lecturesCount === 1 ? 'lecture' : 'lectures'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-400" aria-hidden="true" />
            <span>{duration}</span>
          </div>
        </div>
        <div className="pt-4 mt-auto border-t border-slate-50 flex flex-col gap-4">
          {progress !== undefined ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Course Progress</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {lessonsLeft !== undefined && (
                <p className="text-[10px] font-bold text-slate-400 pt-1">
                  {lessonsLeft} Lessons Remaining
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#0D3A6E] tracking-tighter">
                  {priceFormatted}
                </span>
              </div>
            </div>
          )}
          {progress === 100 && enrollmentUuid && (
            <button
              type="button"
              onClick={handleViewCertificate}
              className="inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 rounded-md gap-1.5 px-3 w-full text-xs h-9 uppercase tracking-wider font-bold"
            >
              <Award className="size-3.5" />
              View Certificate
            </button>
          )}
          <button 
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full text-xs h-9 uppercase tracking-wider font-bold transition-all shadow-sm hover:shadow-md",
              progress === 100 && enrollmentUuid
                ? "border border-[#056FAE]/20 text-[#056FAE] hover:bg-[#F0F7FF] hover:-translate-y-0.5"
                : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-primary/20"
            )}
            disabled={is_active === false}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  )

  const cardElement = (
    <CardWrapper {...wrapperProps}>
      {cardInner}
    </CardWrapper>
  )

  return (
    <div className={cn("opacity-100 transform-none h-full", className)}>
      {is_active === false ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {cardElement}
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>This course is currently unavailable</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        cardElement
      )}

      {enrollmentUuid && (
        <CourseCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          courseUuid={slug}
          courseTitle={title}
          enrollmentUuid={enrollmentUuid}
        />
      )}
    </div>
  )
}
