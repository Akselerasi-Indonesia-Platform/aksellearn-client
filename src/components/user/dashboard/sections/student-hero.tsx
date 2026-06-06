import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Play, Terminal, Zap } from 'lucide-react'

interface StudentHeroProps {
  name: string
  progress: number
  tier?: string
  streak?: number
  className?: string
  onResume?: () => void
  lastAccessedCourse?: string
  isLoading?: boolean
}

export function StudentHero({
  name,
  progress,
  tier = 'Premium',
  streak = 12,
  className,
  onResume,
  lastAccessedCourse,
  isLoading,
}: StudentHeroProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'relative p-8 md:p-12 overflow-hidden bg-brand-gradient brand-rings rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-12',
          className,
        )}
      >
        <div className="flex-1 space-y-6 w-full">
          <Skeleton className="h-6 w-32 bg-white/20 rounded-full" />
          <Skeleton className="h-16 w-3/4 bg-white/20 rounded-xl" />
          <Skeleton className="h-20 w-1/2 bg-white/20 rounded-xl" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-14 w-48 bg-white/20 rounded-xl" />
            <Skeleton className="h-14 w-48 bg-white/20 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-80 w-80 bg-white/20 rounded-2xl hidden md:block" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative p-8 md:p-12 overflow-hidden bg-brand-gradient brand-rings rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-12 group',
        className,
      )}
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/10 to-transparent pointer-events-none" />

      <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-white/20 rounded-full blur-[100px]"></div>

      {/* Main Content */}
      <div className="relative flex-1 text-center md:text-left z-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
            <Zap className="size-3" />
            <span>Active Tier: {tier}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Welcome back,{' '}
            <span className="text-[#70C942] italic">
              {name}!
            </span>
          </h2>
          <p className="text-white/80 text-lg max-w-lg mt-6 font-medium leading-relaxed">
            You've reached{' '}
            <span className="text-white font-bold">{progress}%</span> of your
            monthly learning goals. Keep the momentum going!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button
            onClick={onResume}
            variant="cta"
            className="h-14 px-8 rounded-xl gap-3 shadow-xl shadow-black/10 group active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            <Play className="size-4 fill-current group-hover:scale-110 transition-transform" />
            {lastAccessedCourse ? `Resume ${lastAccessedCourse}` : 'Resume Learning'}
          </Button>
          <Button
            variant="outline-white"
            className="h-14 px-8 rounded-xl gap-2 active:scale-95 transition-all hidden"
          >
            <Terminal className="size-4" /> Open Playground
          </Button>
        </div>
      </div>

      {/* Goal/Streak Card */}
      <div className="w-full md:w-80 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 z-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group/card text-left">
        <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none group-hover/card:scale-125 transition-transform duration-700">
          <Zap className="size-32 text-white" />
        </div>

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
            <Zap className="size-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
            Level {Math.floor((streak || 0) / 7) + 1}
          </span>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white/80">Overall Progress</span>
            <span className="text-xs font-bold text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-5 bg-black/20" />
        </div>

        <div className="mt-10 pt-10 border-t border-white/10 text-center relative z-10">
          <p className="text-[10px] font-bold text-[#70C942] uppercase tracking-widest leading-none">
            Learning Streak
          </p>
          <p className="text-4xl font-bold text-white mt-3 tracking-tight">
            {streak} Days
          </p>
        </div>
      </div>
    </div>
  )
}
