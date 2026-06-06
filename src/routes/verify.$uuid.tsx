import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { userCourseService } from '@/services/user/course.service'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Linkedin, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

function VerifyCertificatePage() {
  const { uuid } = Route.useParams()

  const { data: verification, isLoading } = useQuery({
    queryKey: ['certificate', 'verify', uuid],
    queryFn: () => userCourseService.verifyCertificate(uuid),
    retry: 1,
  })

  // Pre-fill LinkedIn post URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const issuedBy = verification?.issued_by && verification.issued_by !== 'Madacore Academy' && verification.issued_by !== 'Akselerasi Indonesia'
    ? verification.issued_by
    : 'Clara Academy'
  const linkedInShareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=I just completed the course "${verification?.course_title}" on ${issuedBy}! Check out my verified certificate here: ${shareUrl}`

  return (
    <PublicLayout>
      <div className="bg-[#f8f9fb] min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="font-medium animate-pulse">Verifying certificate authenticity...</p>
            </div>
          ) : !verification || !verification.is_valid ? (
            <Card className="p-10 text-center border-slate-200 shadow-lg flex flex-col items-center gap-6">
              <div className="size-20 rounded-full bg-rose-50 flex items-center justify-center">
                <XCircle className="size-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Certificate Not Found</h1>
                <p className="text-slate-500 font-medium">
                  We couldn't verify this certificate. The ID might be invalid or the certificate has been revoked.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Branded Verification Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="size-4" />
                  Official Verified Credential
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Certificate Authenticity
                </h1>
                <p className="text-slate-500 font-medium">
                  This confirms the successful completion of a Clara Academy course.
                </p>
              </div>

              {/* Certificate Card */}
              <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="bg-white p-8 sm:p-12 space-y-8">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Issued To
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">
                      {verification.issued_to}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      For Successfully Completing
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {verification.course_title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Completion Date
                      </p>
                      <p className="font-semibold text-slate-700">
                        {verification.completion_date
                          ? format(new Date(verification.completion_date), 'MMMM do, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Certificate ID
                      </p>
                      <p className="font-mono text-sm font-semibold text-slate-700">
                        {uuid.split('-')[0].toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-black text-primary text-xl">C</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{issuedBy}</p>
                      <p className="text-xs text-slate-500 font-medium">Verified Issuer</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => window.open(linkedInShareUrl, '_blank')}
                    className="w-full sm:w-auto bg-[#0A66C2] hover:bg-[#004182] text-white font-bold gap-2 rounded-lg h-11 px-6 shadow-md shadow-blue-900/20"
                  >
                    <Linkedin className="size-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </Card>

              {/* View Full PDF Link */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  className="text-primary font-semibold gap-2 hover:bg-primary/5"
                  onClick={() => {
                    const pdfUrl = userCourseService.getCertificateUrl(uuid, 'pdf')
                    window.open(pdfUrl, '_blank')
                  }}
                >
                  View Full Certificate PDF
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export const Route = createFileRoute('/verify/$uuid')({
  component: VerifyCertificatePage,
})
