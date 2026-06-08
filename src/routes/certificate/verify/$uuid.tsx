import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { userCourseService } from '@/services/user/course.service'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Printer,
  Linkedin,
  ArrowLeft,
  Award,
  Calendar,
  Fingerprint,
  User,
} from 'lucide-react'
import { format } from 'date-fns'

interface VerifyCertificatePageProps {
  isPreview?: boolean
}

export function VerifyCertificatePage({ isPreview = false }: VerifyCertificatePageProps) {
  const navigate = useNavigate()
  const params = Route.useParams()
  const uuid = isPreview ? 'preview' : (params as any).uuid

  const { data: verification, isLoading, error } = useQuery({
    queryKey: ['certificate-verify', uuid],
    queryFn: () => userCourseService.verifyCertificate(uuid),
    retry: 1,
  })

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const issuedBy = verification?.issued_by && verification.issued_by !== 'Madacore Academy' && verification.issued_by !== 'Akselerasi Indonesia'
    ? verification.issued_by
    : 'Aksellearn Academy'
  const linkedInShareUrl = verification
    ? `https://www.linkedin.com/feed/?shareActive=true&text=I just completed the course "${verification.course_title}" on ${issuedBy}! Check out my verified certificate here: ${shareUrl}`
    : ''

  const renderDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return format(date, 'MMMM d, yyyy')
      }
    } catch (e) {
      // Return raw string if parsing fails
    }
    return dateStr
  }

  const handlePrint = () => {
    if (isPreview) {
      alert('Printing is disabled in preview mode.')
      return
    }
    const pdfUrl = userCourseService.getCertificateUrl(uuid, 'pdf')
    window.open(pdfUrl, '_blank')
  }

  const hasError = !!error || !verification || !verification.is_valid

  return (
    <PublicLayout>
      <div className="bg-slate-50/50 min-h-[85vh] flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-[80px] -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2AABAA]/5 rounded-full filter blur-[80px] -z-10" />

        <div className="w-full max-w-2xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="mb-8 rounded-xl font-bold text-[#0D3A6E] hover:bg-slate-100 flex items-center gap-2 group transition-all duration-300"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>

          {isLoading ? (
            <Card className="p-12 border-slate-200/60 shadow-2xl shadow-slate-100/50 relative overflow-hidden backdrop-blur-xl bg-white/90">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#056FAE] via-[#1A7AB8] to-[#2AABAA] animate-pulse" />
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative size-16 flex items-center justify-center">
                  <Loader2 className="size-12 animate-spin text-[#1A7AB8]" />
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-ping opacity-25" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-bold text-slate-800">Verifying Authenticity</h3>
                  <p className="text-sm text-slate-400 font-medium animate-pulse">
                    Connecting to secure ledger to validate credential...
                  </p>
                </div>

                {/* Skeleton Card */}
                <div className="w-full space-y-4 pt-8 border-t border-slate-100">
                  <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
                  <div className="h-8 bg-slate-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse pt-2" />
                  <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </Card>
          ) : hasError ? (
            <Card className="p-12 border-rose-100 shadow-2xl shadow-rose-50/50 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl bg-white/95">
              <div className="size-20 rounded-3xl bg-rose-50 flex items-center justify-center border border-rose-100/80 shadow-inner">
                <ShieldAlert className="size-10 text-rose-500" />
              </div>
              <div className="space-y-3 max-w-md">
                <Badge variant="destructive" className="bg-rose-500 text-white font-bold rounded-lg px-3 py-1">
                  ❌ Invalid Credential
                </Badge>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Verification Failed
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  This credential could not be verified. The certificate may have been revoked, or the ID does not exist in our database.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Branded Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-xs border border-emerald-200/60 shadow-sm">
                  <ShieldCheck className="size-4 text-emerald-600 animate-pulse" />
                  Official Verified Credential
                </div>
                <h1 className="text-3xl font-black text-[#0D3A6E] tracking-tight">
                  Aksellearn Certificate Verification
                </h1>
                <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
                  Aksellearn Academy verified record confirming the successful completion of training.
                </p>
              </div>

              {/* Certificate Detail Card */}
              <Card className="overflow-hidden border-slate-200/60 shadow-2xl shadow-slate-200/40 bg-white rounded-3xl">
                <div className="relative p-8 sm:p-12 space-y-8">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#2AABAA]/10 to-transparent rounded-bl-[100px] pointer-events-none" />

                  {/* Header/Issuer Branding */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#056FAE] to-[#2AABAA] flex items-center justify-center shadow-lg shadow-[#056FAE]/20">
                      <span className="font-black text-white text-xl">C</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0D3A6E] text-base">{issuedBy}</h4>
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <span className="size-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Verified Issuer
                      </p>
                    </div>
                  </div>

                  {/* Recipient info */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest flex items-center gap-1.5">
                      <User className="size-3.5" /> Recipient Name
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                      {verification.issued_to}
                    </p>
                  </div>

                  {/* Course info */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="size-3.5" /> Course Title
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-[#0D3A6E] leading-snug">
                      {verification.course_title}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="size-3.5" /> Completion Date
                      </p>
                      <p className="font-bold text-slate-700 text-sm sm:text-base">
                        {renderDate(verification.completion_date)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#056FAE] uppercase tracking-widest flex items-center gap-1.5">
                        <Fingerprint className="size-3.5" /> Certificate ID
                      </p>
                      <p className="font-mono text-sm sm:text-base font-extrabold text-slate-700 tracking-wider">
                        {verification.certificate_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action panel */}
                <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="w-full sm:w-auto border-slate-200 hover:bg-slate-100 text-[#0D3A6E] font-bold gap-2 rounded-xl h-11 px-6 shadow-sm transition-all"
                  >
                    <Printer className="size-4" />
                    Print Certificate
                  </Button>

                  <Button
                    onClick={() => window.open(linkedInShareUrl, '_blank')}
                    className="w-full sm:w-auto bg-[#0A66C2] hover:bg-[#004182] text-white font-bold gap-2 rounded-xl h-11 px-6 shadow-md shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Linkedin className="size-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export const Route = createFileRoute('/certificate/verify/$uuid')({
  component: VerifyCertificatePage,
})
