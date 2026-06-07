import { motion } from 'framer-motion'
import { ArrowRight, Play, Search } from 'lucide-react'
import * as React from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import type { PlatformStats } from '@/services/discovery/course.service'

import { Button } from '@/components/ui/button'
import { OrganizationTracker } from '../ui/organization-tracker'
import { CourseTracker } from '../ui/course-tracker'
import { StatPill } from '../ui/stat-pill'

interface HeroProps {
  stats?: PlatformStats
}

/**
 * Background Role: `bg-brand-gradient`
 * Rule: Hero sections should always use the brand gradient background.
 */
export function Hero({ stats }: HeroProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({
        to: '/search',
        search: { q: searchQuery.trim(), page: 1 },
      })
    }
  }

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#056FAE] via-[#1A7AB8] to-[#2AABAA] brand-rings py-16 md:py-20 lg:py-28">

      <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start gap-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-300 backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              <span>
                Trusted Learning Platform
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Learn skills that <br className="hidden sm:block" />
                <span className="text-[#70C942] italic">
                  open new doors.
                </span>
              </h1>
              <p className="max-w-[540px] text-lg leading-relaxed text-white/80 md:text-xl font-medium">
                Grow your career with expert-led courses and professional certifications. Join thousands of learners today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Button
                asChild
                variant="cta"
                size="xl"
                className="w-full sm:w-auto"
              >
                <Link to="/search">Start for Free</Link>
              </Button>
              <Button
                asChild
                variant="outline-white"
                size="xl"
                className="w-full sm:w-auto"
              >
                <Link to="/search">Browse Courses</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-8">
              {[
                {
                  label: 'Learners',
                  value: stats?.total_students !== undefined
                    ? stats.total_students >= 1000 ? `${(stats.total_students / 1000).toFixed(1)}k+` : `${stats.total_students}`
                    : '0',
                },
                {
                  label: 'Certifications',
                  value: stats?.total_courses !== undefined
                    ? `${stats.total_courses}+`
                    : '0+',
                },
                {
                  label: 'Hours Delivered',
                  value: stats?.total_hours_watched !== undefined
                    ? stats.total_hours_watched >= 1000 ? `${(stats.total_hours_watched / 1000).toFixed(0)}k+` : `${stats.total_hours_watched}`
                    : '0',
                },
              ].map((stat, i) => (
                <StatPill
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  variant="glass"
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main Visual Container */}
            <div className="relative p-1 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
              <div className="relative rounded-[1.8rem] bg-slate-900 overflow-hidden aspect-[16/10]">
                <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
                    alt="Learning Platform"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-all group">
                        <Play className="size-8 text-white fill-white group-hover:scale-110 transition-transform" />
                    </div>
                </div>
              </div>

              {/* Minimal Trackers */}
              <OrganizationTracker />
              <CourseTracker />
            </div>

            {/* Subtle Gloom */}
            <div className="absolute -top-10 -left-10 size-40 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-10 -right-10 size-40 bg-blue-500/10 rounded-full blur-[80px]"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
