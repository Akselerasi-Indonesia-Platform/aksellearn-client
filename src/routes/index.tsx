import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { CTASection } from '@/components/public/sections/cta-section'
import { FeaturedCourses } from '@/components/public/sections/featured-courses'
import { InstructorPromo } from '@/components/public/sections/instructor-promo'
import { Hero } from '@/components/public/sections/hero'
import { TrustedBy } from '@/components/public/sections/trusted-by'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { discoveryCourseService } from '@/services/discovery/course.service'
import { homepageService } from '@/services/discovery/homepage.service'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { data: homepageData, isLoading: isLoadingHomepage } = useQuery({
    queryKey: ['public', 'homepage'],
    queryFn: () => homepageService.getHomepageData(),
  })

  const { data: stats } = useQuery({
    queryKey: ['public', 'platform-stats'],
    queryFn: () => discoveryCourseService.getPlatformStats(),
  })

  const popularCourses = homepageData?.popular?.map(item => item.course).filter(Boolean) || []
  const latestCourses = homepageData?.latest || []

  return (
    <PublicLayout>
      <Hero stats={stats} />
      <TrustedBy />
      
      {/* Popular Courses (Curated) */}
      {popularCourses.length > 0 && (
        <FeaturedCourses
          courses={popularCourses}
          isLoading={isLoadingHomepage}
          categories={[]}
          title="Jumpstart your"
          titleAccent="learning"
          description="Hand-picked professional certifications and courses designed to accelerate your technical and business expertise."
          badgeLabel="Popular Collection"
          viewAllSort="popular"
        />
      )}
      
      {/* Latest Arrivals Section */}
      <FeaturedCourses
        courses={latestCourses}
        isLoading={isLoadingHomepage}
        categories={[]} 
        title="Fresh"
        titleAccent="new arrivals"
        description="Be the first to learn the latest skills with our newest course additions."
        badgeLabel="Latest"
        viewAllSort="latest"
        emptyStateMessage="No new courses at the moment."
      />

      <InstructorPromo />
      <CTASection />
    </PublicLayout>
  )
}
