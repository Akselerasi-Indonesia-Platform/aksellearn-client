import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function InstructorPromo() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-brand-gradient text-white rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl brand-rings">
          
          <div className="space-y-4 relative z-10 w-full md:w-2/3 text-center md:text-left">
            <span className="font-sans text-[10px] sm:text-xs text-lime-300 tracking-[0.2em] font-extrabold uppercase">
              Join our community
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Share your craft. Teach on Clara.
            </h2>
            <p className="text-sm md:text-base text-teal-50 max-w-lg leading-relaxed font-medium mx-auto md:mx-0">
              We accept expert curriculum developers who value visual discipline and educational clarity. Inspire millions of technologists across the globe.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto pt-4 md:pt-0">
            <Button 
              asChild 
              size="lg" 
              className="w-full md:w-auto bg-white text-primary hover:bg-slate-50 hover:text-primary rounded-xl px-8 py-6 text-sm sm:text-base font-bold shadow-lg transition-all hover:-translate-y-1 duration-300 uppercase tracking-wide"
            >
              <Link to="/become-an-instructor">
                Apply as Instructor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
