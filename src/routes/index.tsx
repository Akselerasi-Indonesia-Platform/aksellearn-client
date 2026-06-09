import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
          title={t('publicHome.popularCourses.title')}
          titleAccent={t('publicHome.popularCourses.titleAccent')}
          description={t('publicHome.popularCourses.description')}
          badgeLabel={t('publicHome.popularCourses.badge')}
          viewAllSort="popular"
        />
      )}
      
      {/* Latest Arrivals Section */}
      <FeaturedCourses
        courses={latestCourses}
        isLoading={isLoadingHomepage}
        categories={[]} 
        title={t('publicHome.latestCourses.title')}
        titleAccent={t('publicHome.latestCourses.titleAccent')}
        description={t('publicHome.latestCourses.description')}
        badgeLabel={t('publicHome.latestCourses.badge')}
        viewAllSort="latest"
        emptyStateMessage={t('publicHome.latestCourses.empty')}
      />

      <InstructorPromo />
      <CTASection />
    </PublicLayout>
  )
}
