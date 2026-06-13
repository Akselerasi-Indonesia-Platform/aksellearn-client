import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Banner } from '@/types/banner'
import { Hero } from './hero-old'

interface BannerCarouselProps {
  banners: Banner[]
  isLoading?: boolean
}

export function BannerCarousel({ banners, isLoading }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (banners?.length <= 1 || isPaused || isLoading) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners, isPaused, isLoading])

  const handlePrevious = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  const handleNext = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  if (isLoading) {
    return (
      <section className="w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        <div className="relative w-full aspect-[3/1] md:aspect-[16/5] animate-pulse bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary dark:border-slate-600 dark:border-t-primary" />
        </div>
      </section>
    )
  }

  if (!banners || banners.length === 0) {
    return <Hero />
  }

  const currentBanner = banners[currentIndex]
  if (!currentBanner) return <Hero />

  return (
    <section 
      className="w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-[3/1] md:aspect-[16/5]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <picture>
              {currentBanner.mobile_image_url && (
                <source 
                  media="(max-width: 767px)" 
                  srcSet={currentBanner.mobile_image_url} 
                />
              )}
              <img
                src={currentBanner.image_url || currentBanner.mobile_image_url || ''}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 size-8 md:size-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 size-8 md:size-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5 md:size-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`size-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
