import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
  Code2,
  BarChart,
  Palette,
  Cpu,
  TrendingUp,
  Layout,
  Briefcase,
  Zap,
  Globe,
  Database,
  Lock,
  Layers,
} from 'lucide-react'
import * as React from 'react'
import type { CourseCategory } from '@/services/discovery/course.service'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/public/ui/section-header'

const ICON_MAP: Record<string, any> = {
  code: Code2,
  business: BarChart,
  design: Palette,
  cpu: Cpu,
  marketing: TrendingUp,
  layout: Layout,
  briefcase: Briefcase,
  zap: Zap,
  globe: Globe,
  database: Database,
  lock: Lock,
  layers: Layers,
}

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  rose: 'bg-rose-50 text-rose-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
}

interface CategoriesProps {
  categories: CourseCategory[]
}

/**
 * Background Role: `bg-white`
 * Rule: Standard alternating white background block.
 */
export function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <SectionHeader
            badge={{ icon: Layers, label: 'Learning Paths' }}
            title="Explore Top Categories"
            description="Find the perfect path for your career growth across a wide range of professional subjects."
            theme="light"
          />
          <Link to="/search">
            <Button
              className="font-bold px-6 border-[#056FAE]/30 text-[#056FAE] hover:bg-[#056FAE]/5 transition-colors"
              variant="outline"
            >
              Browse all categories
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon || 'layout'] || Layout
            const colorClass = COLOR_MAP[cat.color || 'blue'] || COLOR_MAP.blue

            return (
              <Link
                key={cat.id || i}
                className="group"
                to="/search"
                search={{ category: cat.slug }}
              >
                <Card className="h-full border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-white p-0 rounded-xl">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorClass}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        {cat.courses_count || 0}+ Courses
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
