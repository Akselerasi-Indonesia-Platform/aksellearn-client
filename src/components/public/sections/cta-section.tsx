import { Award, BarChart, ChevronRight, Layout, Users, Building2 } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { APP_CONFIG } from '@/config/app'
import { SectionHeader } from '@/components/public/ui/section-header'

/**
 * Background Role: `bg-white` outer, `bg-brand-gradient` inner.
 * Rule: Inner card provides strong visual weight before the footer.
 */
export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="rounded-2xl bg-brand-gradient brand-rings p-6 sm:p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-white/10 to-transparent"></div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-white/20 rounded-full blur-[100px]"></div>

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 text-white">
              <SectionHeader
                badge={{ icon: Building2, label: 'For Teams & Business' }}
                title="Train your team and track their progress"
                description="Give your team access to professional courses, easy progress reports, and simple team management tools."
                theme="dark"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  variant="cta"
                  size="xl"
                  className="w-full sm:w-auto"
                >
                  <a href={`mailto:${APP_CONFIG.contact.email}`}>
                    Talk to Us
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-md md:max-w-sm">
                {[
                  {
                    icon: BarChart,
                    label: 'Analyze',
                    sub: 'Performance Data',
                    color: 'text-[#70C942]',
                    bg: 'bg-[#70C942]/10',
                  },
                  {
                    icon: Users,
                    label: 'Manage',
                    sub: 'Team Access',
                    color: 'text-white',
                    bg: 'bg-white/10',
                  },
                  {
                    icon: Layout,
                    label: 'Curate',
                    sub: 'Custom Paths',
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-400/10',
                  },
                  {
                    icon: Award,
                    label: 'Verify',
                    sub: 'Certifications',
                    color: 'text-rose-400',
                    bg: 'bg-rose-400/10',
                  },
                ].map((item, i) => (
                  <div key={i} className="p-5 sm:p-6 rounded-2xl bg-black/20 border border-white/10 text-center hover:bg-black/40 backdrop-blur-md transition-colors shadow-xl">
                    <div className={cn("h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-xl flex items-center justify-center mb-3 sm:mb-4", item.bg, item.color)}>
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white mb-1">
                      {item.label}
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/80 font-medium">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Fixed missing import in previous step
import { cn } from '@/lib/utils'
