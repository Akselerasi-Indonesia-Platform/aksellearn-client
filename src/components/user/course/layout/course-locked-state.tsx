import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Key, Zap, Loader2 } from 'lucide-react'

interface CourseLockedStateProps {
  course: {
    title: string
  }
  handleExtendAccess: () => void
  isPending: boolean
  onReturnToDashboard: () => void
}

export function CourseLockedState({
  course,
  handleExtendAccess,
  isPending,
  onReturnToDashboard,
}: CourseLockedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] gap-8 text-center animate-in fade-in zoom-in duration-700 relative">
      <div className="absolute inset-0 z-[-1] overflow-hidden rounded-3xl opacity-20 blur-[100px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full" />
      </div>
      <div className="relative">
        <div className="size-24 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl backdrop-blur-md bg-slate-950/90">
          <Key className="size-10" />
        </div>
        <div className="absolute -top-2 -right-2 size-8 bg-rose-500 rounded-full border-4 border-slate-50 flex items-center justify-center">
          <div className="size-2 bg-white rounded-full animate-ping" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          Curriculum Locked
        </h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Your access period for{' '}
          <span className="text-primary font-bold">"{course.title}"</span> has
          ended. Reactivate now to continue your learning journey and retain
          your progress.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={handleExtendAccess}
          disabled={isPending}
          className="h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 flex gap-3 text-xs uppercase tracking-[0.2em]"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Zap className="size-4 fill-current" />
          )}
          Reactivate Access
        </Button>
        <Button
          onClick={onReturnToDashboard}
          variant="ghost"
          className="h-12 rounded-xl font-bold text-slate-400"
        >
          Return to Dashboard
        </Button>
      </div>

      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 italic">
        All progress and certificates remain safe in your account.
      </p>
    </div>
  )
}
