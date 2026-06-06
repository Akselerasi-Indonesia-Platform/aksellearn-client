import * as React from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Building2,
  Mail,
  Sparkles,
  Loader2,
  AlertCircle,
  Award,
  BookOpen,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { userB2BService } from '@/services/user/b2b.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Skeleton } from '@/components/ui/skeleton'

function B2BActivationPage() {
  const { invitationUuid } = useParams({
    from: '/b2b/activate/$invitationUuid',
  })
  const navigate = useNavigate()

  // 1. Fetch Invitation Details
  const {
    data: invitation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['b2b', 'invitation', invitationUuid],
    queryFn: () => userB2BService.getInvitation(invitationUuid),
    retry: false,
  })

  // 2. Activate Mutation
  const activateMutation = useMutation({
    mutationFn: () => userB2BService.activate(invitationUuid),
    onSuccess: (_res) => {
      toast.success('Access Activated!', {
        description: 'You have been enrolled in the course successfully.',
      })
      // Redirect to classroom or dashboard
      navigate({ to: '/student/dashboard' })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        'Activation failed. The link might be expired.'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32 flex justify-center">
          <Card className="w-full max-w-xl p-12 rounded-2xl border-slate-100 shadow-2xl space-y-8">
            <Skeleton className="size-20 rounded-3xl mx-auto" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </Card>
        </div>
      </PublicLayout>
    )
  }

  if (isError || !invitation) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-32 text-center space-y-6">
          <div className="size-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-100 animate-bounce">
            <AlertCircle className="size-12" />
          </div>
          <h2 className="text-4xl font-black tracking-tight">
            Invalid Invitation
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            This invitation link is either invalid, expired, or has already been
            claimed.
          </p>
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
            className="h-12 px-8 rounded-xl font-bold"
          >
            Back to Home
          </Button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-12 md:p-16 rounded-2xl border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white relative overflow-hidden text-center space-y-12">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 size-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 size-64 bg-emerald-50/50 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="relative space-y-8">
              <div className="size-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200 rotate-3 animate-in zoom-in-50 duration-700">
                <Building2 className="size-12" />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  Secure Corporate Invite
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-slate-900">
                  Access Granted by{' '}
                  <span className="text-indigo-600">
                    {invitation.organization_name}
                  </span>
                </h1>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200 text-left space-y-6">
                <div className="flex items-start gap-6">
                  <div className="aspect-video w-32 rounded-2xl overflow-hidden shadow-lg shrink-0">
                    {invitation.course_thumbnail ? (
                      <img
                        src={invitation.course_thumbnail}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-900 flex items-center justify-center">
                        <Sparkles className="size-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Enrolling in Curriculum
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">
                      {invitation.course_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-emerald-600">
                      <CheckCircle className="size-3.5" />
                      <span className="text-xs font-bold">
                        Premium Enterprise License
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <span className="text-sm font-bold">
                      {invitation.invited_email}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => activateMutation.mutate()}
                  disabled={activateMutation.isPending}
                  className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white text-xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                >
                  {activateMutation.isPending ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <>
                      Activate My Access <ArrowRight className="size-6" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs font-bold text-slate-400 italic">
                By activating, you agree to the learning platform's terms of
                service and curriculum guidelines.
              </p>
            </div>
          </Card>

          <div className="mt-12 flex justify-center gap-12 grayscale opacity-40">
            <Award className="size-10" />
            <BookOpen className="size-10" />
            <ShieldCheck className="size-10" />
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  )
}

export const Route = createFileRoute('/b2b/activate/$invitationUuid')({
  component: B2BActivationPage,
})
