import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Award, Linkedin } from 'lucide-react'
import { userCourseService } from '@/services/user/course.service'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api-client'

interface CourseCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  courseUuid: string
  courseTitle: string
  variant?: string
  enrollmentUuid?: string
  certificate?: {
    url?: string
    serial_number?: string
    variant?: string
  } | null
  issuingAuthority?: string
}

export function CourseCertificateModal({
  isOpen,
  onClose,
  courseUuid,
  courseTitle,
  variant = 'modern',
  enrollmentUuid,
  certificate: passedCertificate,
  issuingAuthority,
}: CourseCertificateModalProps) {
  const [loading, setLoading] = React.useState(true)
  const [scale, setScale] = React.useState(1)
  const [srcDoc, setSrcDoc] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { data: certifierData } = useQuery({
    queryKey: ['user', 'enrollments', enrollmentUuid, 'certifier-certificate'],
    queryFn: () => userCourseService.getCertifierCertificate(enrollmentUuid!),
    enabled: !!enrollmentUuid && isOpen,
    retry: false,
  })

  const { data: certificate } = useQuery({
    queryKey: ['user', 'course', courseUuid, 'certificate'],
    queryFn: () => userCourseService.getCertificate(courseUuid),
    enabled: isOpen && !passedCertificate,
  })

  const activeCertificate = passedCertificate || certificate

  // Target dimensions for A4 Landscape (Fixed as per integration guide)
  const TARGET_WIDTH = 1123
  const TARGET_HEIGHT = 794

  const previewUrl = React.useMemo(
    () => userCourseService.getCertificateUrl(courseUuid, 'html', variant),
    [courseUuid, variant],
  )

  const downloadUrl = React.useMemo(
    () => userCourseService.getCertificateUrl(courseUuid, 'pdf', variant),
    [courseUuid, variant],
  )

  const finalCertUrl = React.useMemo(() => {
    if (certifierData?.certificate_url) {
      return certifierData.certificate_url
    }
    if (activeCertificate?.serial_number) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `${origin}/certificate/verify/${activeCertificate.serial_number}`
    }
    return downloadUrl
  }, [certifierData, activeCertificate, downloadUrl])

  // Handle scaling logic to fit fixed A4 canvas into responsive dialog
  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const updateScale = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth - 40 // Padding
      const containerHeight = window.innerHeight * 0.7 // Max 70% of viewport height

      const scaleX = containerWidth / TARGET_WIDTH
      const scaleY = containerHeight / TARGET_HEIGHT

      // Use the smaller scale to fit both width and height within bounds
      const newScale = Math.min(scaleX, scaleY, 1) // Maintain fixed aspect ratio
      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [isOpen])

  // Mirror Rendering: Fetch HTML via apiClient for secure injection into srcDoc
  React.useEffect(() => {
    if (previewUrl && isOpen) {
      setLoading(true)
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

          // Normalize default signer & organization references to Aksellearn Academy
          htmlStr = htmlStr.replaceAll('Dr. Hamada', 'Aksellearn Academy')
          htmlStr = htmlStr.replaceAll('Head of Education', 'Verified Authority')
          htmlStr = htmlStr.replaceAll('Madacore Board', 'Aksellearn Board')
          htmlStr = htmlStr.replaceAll('Madacore Academy', 'Aksellearn Academy')
          htmlStr = htmlStr.replaceAll('Madacore Governance', 'Aksellearn Academy')
          htmlStr = htmlStr.replaceAll('Akselerasi Indonesia', 'Aksellearn Academy')
          htmlStr = htmlStr.replaceAll('<div class="seal">M</div>', '<div class="seal">C</div>')

          setSrcDoc(htmlStr)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[MirrorRendering] Failed to fetch certificate:', err)
          setLoading(false)
        })
    }
  }, [previewUrl, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:!max-w-7xl w-[98vw] sm:!w-[95vw] h-[95vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-50 border-none shadow-2xl rounded-2xl sm:rounded-xl">
        <DialogHeader className="p-4 sm:p-6 bg-white border-b flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 space-y-0">
          <div className="flex-1 min-w-0 pr-4">
            <DialogTitle className="text-lg sm:text-xl font-black text-slate-800 tracking-tight line-clamp-1">
              Certificate of Achievement
            </DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 sm:mt-1 line-clamp-1">
              Official certification for {courseTitle}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">

            {(certifierData?.certificate_url || activeCertificate?.serial_number) && (
              <Button
                size="sm"
                className="flex-1 sm:flex-none h-9 sm:h-10 rounded-xl font-black gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-[10px] sm:text-xs uppercase tracking-widest text-white"
                onClick={() => window.open(certifierData?.certificate_url || `${window.location.origin}/certificate/verify/${activeCertificate?.serial_number}`, '_blank')}
              >
                <Award className="size-3.5" />
                <span>Verify Credential</span>
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1 sm:flex-none h-9 sm:h-10 rounded-xl font-black gap-2 bg-[#0077B5] hover:bg-[#0077B5]/90 shadow-lg shadow-[#0077B5]/20 text-[10px] sm:text-xs uppercase tracking-widest text-white"
              onClick={() => {
                const issuedBy = issuingAuthority || 'Aksellearn Academy'
                const text = encodeURIComponent(
                  `I just completed the course "${courseTitle}" on ${issuedBy}! Check out my verified certificate here: ${finalCertUrl}`
                )
                window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank')
              }}
            >
              <Linkedin className="size-3.5" fill="currentColor" />
              <span className="hidden xs:inline">Share</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none h-9 sm:h-10 rounded-xl font-black gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-[10px] sm:text-xs uppercase tracking-widest text-primary-foreground"
              onClick={() => window.open(downloadUrl, '_blank')}
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-2 sm:p-10 flex items-center justify-center relative bg-slate-50/30"
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-50/50 backdrop-blur-sm">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                Synchronizing Mirror Instance...
              </p>
            </div>
          )}

          <div
            style={{
              width: TARGET_WIDTH,
              height: TARGET_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
              pointerEvents: 'none',
            }}
            className={cn(
              'bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-sm overflow-hidden border border-slate-200',
              loading
                ? 'invisible'
                : 'visible animate-in fade-in zoom-in duration-500',
            )}
          >
            <iframe
              srcDoc={srcDoc}
              className="w-full h-full border-none"
              title="Certificate Preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
