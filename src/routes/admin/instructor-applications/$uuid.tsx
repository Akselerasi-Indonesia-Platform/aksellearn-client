import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Check, 
  X, 
  ExternalLink, 
  AlertCircle, 
  Calendar, 
  User, 
  Briefcase, 
  Award,
  BookOpen,
  MessageSquare,
  GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/admin/instructor-applications/$uuid')({
  component: AdminInstructorApplicationDetailPage,
})

function AdminInstructorApplicationDetailPage() {
  const { uuid } = Route.useParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [rejectNote, setRejectNote] = React.useState('')
  const [showRejectForm, setShowRejectForm] = React.useState(false)

  // Fetch single application details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-instructor-application', uuid],
    queryFn: () => instructorApplicationService.adminFind(uuid),
  })

  const application = data?.data

  const reviewMutation = useMutation({
    mutationFn: (id: string) => instructorApplicationService.adminReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-application', uuid] })
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-applications'] })
    }
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => instructorApplicationService.adminAccept(id),
    onSuccess: () => {
      toast.success('Application approved successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-application', uuid] })
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-applications'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to approve application')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string, note: string }) => 
      instructorApplicationService.adminReject(id, note),
    onSuccess: () => {
      toast.success('Application rejected successfully')
      setShowRejectForm(false)
      setRejectNote('')
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-application', uuid] })
      queryClient.invalidateQueries({ queryKey: ['admin-instructor-applications'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to reject application')
    }
  })

  // Auto-mark as Under Review on mount if status is pending
  React.useEffect(() => {
    if (application && application.status === 'pending') {
      reviewMutation.mutate(uuid)
    }
  }, [application?.status, uuid])

  if (isLoading) {
    return (
      <AdminPage>
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </AdminPage>
    )
  }

  if (isError || !application) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <AlertCircle className="size-12 text-rose-500" />
          <h3 className="text-xl font-bold">Error Loading Application</h3>
          <p className="text-muted-foreground max-w-md">
            {error instanceof Error ? error.message : 'The application details could not be found.'}
          </p>
          <Button asChild variant="outline" className="rounded-xl mt-4">
            <Link to="/admin/instructor-applications">Back to Applications</Link>
          </Button>
        </div>
      </AdminPage>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'under_review': 
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Under Review</Badge>
      case 'accepted': 
        return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>
      case 'rejected': 
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Rejected</Badge>
      default: 
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isActionLoading = acceptMutation.isPending || rejectMutation.isPending

  return (
    <AdminPage>
      {/* Header & Back Action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl h-11 w-11 shrink-0">
            <Link to="/admin/instructor-applications">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Review Application</h2>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Evaluate professional credentials and teaching capability.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Applicant Credentials Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: User Profile & Headline */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-4 border-b pb-6">
              <Avatar className="h-16 w-16 border shadow-sm">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(application.full_name)}&background=random`} />
                <AvatarFallback>{application.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">{application.full_name}</h3>
                <p className="text-sm font-medium text-slate-500">{application.user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="size-3.5" /> Professional Headline
              </Label>
              <p className="text-base font-semibold text-slate-900">{application.headline}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5" /> Biography & Background
              </Label>
              <p className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                {application.bio}
              </p>
            </div>
          </div>

          {/* Card 2: Competency & Teaching Proposals */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Award className="size-3.5" /> Teaching Experience
                </Label>
                <p className="text-sm font-bold text-slate-800 capitalize bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                  {application.teaching_exp}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Submitted Date
                </Label>
                <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                  {formatDate(application.created_at)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="size-3.5" /> First Course Idea / Proposal
              </Label>
              <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {application.sample_topic}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> Areas of Expertise
              </Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.expertise?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Contact Links */}
        <div className="space-y-6">
          {/* Card 1: Review Decision Actions Panel */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare className="size-4" /> Application Decision
            </h3>

            {(application.status === 'pending' || application.status === 'under_review') ? (
              <div className="space-y-4">
                {showRejectForm ? (
                  <div className="space-y-4 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <div className="space-y-2">
                      <Label className="text-rose-900 font-bold text-xs uppercase tracking-wider">Reason for Rejection (Optional)</Label>
                      <Textarea 
                        placeholder="Explain to the applicant why their request was rejected..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="bg-white resize-none h-28 text-sm"
                      />
                      <p className="text-[10px] text-rose-600 font-semibold leading-tight">
                        Confirming rejection enforces a 30-day reapplication cooldown for this applicant.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowRejectForm(false)} 
                        disabled={isActionLoading}
                        className="text-slate-600 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => rejectMutation.mutate({ id: application.uuid, note: rejectNote })} 
                        disabled={isActionLoading}
                        className="font-bold rounded-lg"
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md"
                      onClick={() => acceptMutation.mutate(application.uuid)}
                      disabled={isActionLoading}
                    >
                      <Check className="w-5 h-5 mr-2" /> Approve Application
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white font-bold h-11 rounded-xl"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isActionLoading}
                    >
                      <X className="w-5 h-5 mr-2" /> Reject Application
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reviewed By</span>
                    <span className="text-sm font-semibold text-slate-800">{application.reviewed_by?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reviewed At</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {application.reviewed_at ? formatDate(application.reviewed_at) : '-'}
                    </span>
                  </div>
                </div>
                {application.rejection_note && (
                  <div className="border-t pt-3 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">Rejection Note</span>
                    <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
                      {application.rejection_note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Contact & Social Links */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Applicant Profiles
            </h3>
            
            {application.linkedin_url || application.portfolio_url ? (
              <div className="flex flex-col gap-3">
                {application.linkedin_url && (
                  <a 
                    href={application.linkedin_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50/50 hover:border-slate-300 transition-all text-sm font-semibold text-blue-600 group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="bg-[#0077B5] text-white p-1.5 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="size-3.5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </span>
                      LinkedIn Profile
                    </span>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                )}
                {application.portfolio_url && (
                  <a 
                    href={application.portfolio_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50/50 hover:border-slate-300 transition-all text-sm font-semibold text-slate-700 group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="bg-slate-700 text-white p-1.5 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="size-3.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </span>
                      Portfolio / Website
                    </span>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No external links provided by the applicant.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminPage>
  )
}
