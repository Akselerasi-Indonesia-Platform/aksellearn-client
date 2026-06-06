'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

import type { CourseCertificateConfig } from '@/types/course'
import { adminCourseService } from '@/services/admin/course.service'
import apiClient from '@/lib/api-client'

interface CourseCertificatePreviewProps {
  config: CourseCertificateConfig
  courseTitle: string
  courseUuid?: string
}

function CertificateSkeleton() {
  return (
    <div className="w-full h-full bg-white rounded-sm shadow-2xl p-16 flex flex-col items-center justify-between border-[12px] border-slate-100">
      <div className="w-24 h-24 rounded-full bg-slate-50 animate-pulse mb-8" />
      <div className="space-y-4 w-full flex flex-col items-center">
        <div className="h-4 w-32 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-10 w-3/4 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-4 w-1/2 bg-slate-50 animate-pulse rounded-full" />
      </div>
      <div className="h-12 w-2/3 bg-slate-100 animate-pulse rounded-xl my-12" />
      <div className="w-full flex justify-between items-end px-12 pb-8">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 animate-pulse rounded-full" />
          <div className="h-0.5 w-40 bg-slate-200" />
          <div className="h-3 w-24 bg-slate-50 animate-pulse rounded-full" />
        </div>
        <div className="w-20 h-20 bg-slate-50 animate-pulse rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 animate-pulse rounded-full" />
          <div className="h-0.5 w-40 bg-slate-200" />
          <div className="h-3 w-24 bg-slate-50 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function CourseCertificatePreview({
  config,
  courseUuid,
}: CourseCertificatePreviewProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [srcDoc, setSrcDoc] = useState('')
  const [debouncedConfig, setDebouncedConfig] = useState(config)
  const [isDebouncing, setIsDebouncing] = useState(false)

  // Certificate Dimensions (A4 Landscape at 96 DPI - 1123px x 794px)
  const BASE_WIDTH = 1123
  const BASE_HEIGHT = 794

  // Debounce config changes to avoid flooding the backend with template render requests
  useEffect(() => {
    setIsDebouncing(true)
    const timer = setTimeout(() => {
      setDebouncedConfig(config)
      setIsDebouncing(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [config])

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const padding = 32 // Account for p-4 (16px * 2)
      const availableWidth = containerWidth - padding

      // Calculate how much we need to shrink the fixed 1123px canvas to fit the current container
      const newScale = Math.min(availableWidth / BASE_WIDTH, 1)
      setScale(newScale)
    }

    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    updateScale()
    return () => observer.disconnect()
  }, [])

  const previewUrl = courseUuid
    ? adminCourseService.getCertificateUrl(courseUuid, 'html', debouncedConfig)
    : null

  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true)
      apiClient
        .get(previewUrl)
        .then((res) => {
          let htmlStr = res.data || ''

          // Inject styling to hide broken default/organization signatures and placeholder images
          const styleInjection = `
  <style>
    .signature-image,
    img[alt="Signature"],
    img[alt="Org Signature"],
    .sig-image-placeholder img {
      display: none !important;
    }
  </style>
`
          htmlStr = htmlStr.replace('</head>', `${styleInjection}</head>`)
          
          // Also explicitly strip the image tags just in case
          htmlStr = htmlStr.replace(/<img[^>]*alt="Signature"[^>]*>/gi, '')
          htmlStr = htmlStr.replace(/<img[^>]*alt="Org Signature"[^>]*>/gi, '')

          // Normalize default signer & organization references to Clara Academy
          htmlStr = htmlStr.replaceAll('Dr. Hamada', 'Clara Academy')
          htmlStr = htmlStr.replaceAll('Head of Education', 'Verified Authority')
          htmlStr = htmlStr.replaceAll('Madacore Board', 'Clara Board')
          htmlStr = htmlStr.replaceAll('Madacore Academy', 'Clara Academy')
          htmlStr = htmlStr.replaceAll('Madacore Governance', 'Clara Academy')
          htmlStr = htmlStr.replaceAll('Akselerasi Indonesia', 'Clara Academy')
          htmlStr = htmlStr.replaceAll('<div class="seal">M</div>', '<div class="seal">C</div>')

          setSrcDoc(htmlStr)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('[MirrorRendering] Failed to fetch preview:', err)
          setIsLoading(false)
        })
    }
  }, [previewUrl])

  const showLoader = isLoading || isDebouncing

  return (
    <div
      ref={containerRef}
      className="w-full bg-slate-900/5 dark:bg-slate-100/5 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative border border-dashed border-slate-200 dark:border-slate-800 transition-all duration-300"
      style={{ minHeight: '450px', aspectRatio: '1.414 / 1' }}
    >
      {courseUuid ? (
        <div
          className="relative transition-all duration-500 ease-in-out"
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
            pointerEvents: 'none',
          }}
        >
          {showLoader && (
            <div className="absolute inset-0 z-10">
              <CertificateSkeleton />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-sm">
                <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col items-center border border-slate-100">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 animate-pulse">
                    {isDebouncing
                      ? 'Awaiting Changes...'
                      : 'Synchronizing Mirror...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Layer 1: Instant Background Preview (Elite Strategy) */}
          {config.certificate_background_url && (
            <img
              src={config.certificate_background_url}
              className="absolute inset-0 w-full h-full object-cover rounded-sm"
              alt="Certificate Background"
            />
          )}

          <iframe
            srcDoc={srcDoc}
            className={cn(
              'w-full h-full border-0 shadow-2xl rounded-sm bg-transparent overflow-hidden transition-opacity duration-700 relative z-10',
              showLoader ? 'opacity-0' : 'opacity-100',
            )}
            title="Certificate Preview"
          />
        </div>
      ) : (
        <div className="text-center p-12 space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg">
            {t('courses.previewUnavailable', 'Preview Unavailable')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
            {t(
              'courses.saveFirstToPreview',
              'Please save the course first to enable the Mirror Rendering engine for this serial.',
            )}
          </p>
        </div>
      )}
    </div>
  )
}
