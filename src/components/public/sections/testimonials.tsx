import * as React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Quote } from 'lucide-react'

export function Testimonials() {
  const { t } = useTranslation()
  
  // Explicitly type the items we expect from translation
  const items = t('publicHome.testimonials.items', { returnObjects: true }) as Array<{
    quote: string;
    name: string;
    title: string;
    avatar: string;
  }>

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 max-w-2xl">
            {t('publicHome.testimonials.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(items) && items.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Decorative Quote Icon Background */}
              <Quote className="absolute -top-4 -right-4 size-24 text-slate-50 rotate-12 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative z-10 flex-grow">
                <Quote className="size-8 text-primary/40 fill-primary/40 mb-4" />
                <p className="text-slate-700 leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 relative z-10">
                <div className="size-12 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5 line-clamp-2">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
