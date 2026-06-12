import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

import { CourseCard, CourseCardSkeleton } from '@/components/public/ui/course-card'
import { SectionHeader } from '@/components/public/ui/section-header'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Course } from '@/types/course'

interface CourseSwiperProps {
  courses: Course[]
  isLoading?: boolean
  title?: string
  titleAccent?: string
  description?: string
  badgeLabel?: string
  emptyStateMessage?: string
}

export function CourseSwiper({
  courses,
  isLoading,
  title = "Popular Courses",
  titleAccent = "Right Now",
  description = "Hand-picked professional certifications and courses designed to accelerate your technical and business expertise.",
  badgeLabel = "Featured Collection",
  emptyStateMessage = "No courses found in this category.",
}: CourseSwiperProps) {
  return (
    <section className="py-8 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-8">
          <SectionHeader
            badge={{ icon: Sparkles, label: badgeLabel }}
            title={title}
            titleAccent={titleAccent}
            description={description}
            theme="gradient"
          />
        </div>

        {isLoading ? (
          <Carousel
            opts={{ align: "start", dragFree: true }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-6">
              {[...Array(4)].map((_, i) => (
                <CarouselItem key={i} className="pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex">
                  <div className="flex-1 w-full h-auto flex flex-col">
                    <CourseCardSkeleton className="flex-1 w-full" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-medium">
            {emptyStateMessage}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", dragFree: true }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-6">
              {courses.slice(0, 8).map((course) => (
                <CarouselItem key={course.id} className="pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex">
                  <Link
                    to="/course/$courseSlug"
                    params={{ courseSlug: course.slug || course.uuid }}
                    className="flex-1 w-full h-auto flex flex-col group"
                  >
                    <CourseCard course={course} className="flex-1 w-full" />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Show navigation buttons on desktop to make it a true swiper */}
            <CarouselPrevious className="hidden md:flex -left-5 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-primary shadow-sm size-12 [&_svg]:size-6" />
            <CarouselNext className="hidden md:flex -right-5 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:text-primary shadow-sm size-12 [&_svg]:size-6" />
          </Carousel>
        )}
      </div>
    </section>
  )
}
