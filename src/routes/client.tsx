import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { CLIENT_LOGOS } from '@/config/clients'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/client')({ component: ClientPage })

function ClientPage() {
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <div className="bg-[#F0F7FF] py-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm font-bold tracking-wide text-primary shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#70C942] animate-pulse"></span>
              <span className="uppercase">Trusted By</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground mb-6 leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#056FAE] to-[#2AABAA]">
                 Our Clients
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Building Bridges, Delivering Results: Our Valued Clients
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
            {CLIENT_LOGOS.map((url, index) => (
              <div 
                key={index}
                className="w-full h-28 flex justify-center items-center p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-border hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(index * 0.05, 1.5)}s` }}
              >
                <img 
                  src={url} 
                  alt={`Client ${index + 1}`} 
                  loading="lazy"
                  className="w-full h-14 object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
