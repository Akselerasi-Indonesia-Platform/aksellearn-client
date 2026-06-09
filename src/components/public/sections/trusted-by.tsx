import * as React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

/**
 * Background Role: `bg-[#F0F7FF]` (Ice Blue)
 * Rule: Alternates between the dark Hero and the white Categories section.
 */
export function TrustedBy() {
  const { t } = useTranslation()
  return (
    <section className="border-b bg-[#F0F7FF] py-10 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">
          {t('publicHome.trustedBy')}
        </p>
        {/* Fading Edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#F0F7FF] z-10 mt-12"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#F0F7FF] z-10 mt-12"></div>

        <div className="flex overflow-hidden w-full">
          <motion.div 
            className="flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          >
            {/* We render two identical sets of logos side-by-side to create the seamless infinite loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 md:gap-24 px-6 md:px-12 w-max">
                <span className="text-2xl font-black tracking-tighter text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  ORACLE
                </span>
                <span className="text-2xl font-black tracking-tighter italic text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  Cisco
                </span>
                <span className="text-2xl font-black tracking-tighter text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  intel.
                </span>
                <span className="text-2xl font-black tracking-tighter text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  Google
                </span>
                <span className="text-2xl font-black tracking-tighter text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  NETFLIX
                </span>
                <span className="text-2xl font-black tracking-tighter uppercase italic text-foreground shrink-0 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
                  SAP
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
