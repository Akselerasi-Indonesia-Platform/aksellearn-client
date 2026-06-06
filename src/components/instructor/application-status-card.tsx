import { ApplicationStatusState } from '@/types/instructor-application'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Loader2, Calendar, CheckCircle2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'

interface ApplicationStatusCardProps {
  status: ApplicationStatusState
  reapplyAfter?: string | null
  submittedAt?: string
  rejectionNote?: string | null
}

export function ApplicationStatusCard({ status, reapplyAfter, submittedAt, rejectionNote }: ApplicationStatusCardProps) {
  const navigate = useNavigate()

  if (status === 'accepted') {
    return (
      <Card className="w-full max-w-md mx-auto mt-12 border-green-200 bg-green-50/50 shadow-sm">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <CardTitle className="text-2xl text-green-700">Application Approved!</CardTitle>
          <CardDescription className="text-green-600 text-base">
            Congratulations! You are now an instructor.
          </CardDescription>
          <Button onClick={() => navigate({ to: '/admin/dashboard' })} className="mt-6 w-full bg-green-600 hover:bg-green-700">
            Go to Admin Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === 'rejected' && reapplyAfter) {
    const isCooldownActive = new Date(reapplyAfter) > new Date()
    if (isCooldownActive) {
      return (
        <Card className="w-full max-w-md mx-auto mt-12 shadow-sm">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
            <Calendar className="w-16 h-16 text-gray-400" />
            <CardTitle className="text-2xl text-gray-800">Come back later</CardTitle>
            <CardDescription className="text-base text-gray-500">
              Unfortunately, your application was not approved at this time.
              You can reapply after <span className="font-medium text-gray-700">{format(new Date(reapplyAfter), 'd MMMM yyyy')}</span>.
            </CardDescription>
            {rejectionNote && (
              <div className="w-full bg-red-50 rounded-md p-4 text-sm text-left border border-red-100 text-red-800 mt-2">
                <span className="font-semibold block mb-1">Feedback:</span>
                {rejectionNote}
              </div>
            )}
            <Button disabled variant="outline" className="mt-6 w-full">
              Reapply on {format(new Date(reapplyAfter), 'd MMMM yyyy')}
            </Button>
          </CardContent>
        </Card>
      )
    }
  }

  if (status === 'under_review') {
    return (
      <Card className="w-full max-w-md mx-auto mt-12 border-blue-200 bg-blue-50/50 shadow-sm">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <CardTitle className="text-2xl text-blue-700">Under Review</CardTitle>
          <CardDescription className="text-blue-600 text-base">
            Your application is currently being reviewed by our team.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  // default to pending
  return (
    <Card className="w-full max-w-md mx-auto mt-12 shadow-sm border-amber-100 bg-amber-50/30">
      <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
        <Clock className="w-16 h-16 text-amber-500" />
        <CardTitle className="text-2xl text-amber-700">Application Pending</CardTitle>
        <CardDescription className="text-amber-600 text-base">
          We've received your application. We'll notify you within 3–5 business days.
        </CardDescription>
      </CardContent>
    </Card>
  )
}
