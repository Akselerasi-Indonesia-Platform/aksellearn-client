import * as React from 'react'
import { Loader2, AlertCircle, CheckCircle, ArrowRight, Trophy, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface VideoStatusOverlayProps {
  status: 'loading' | 'error' | 'idle' | 'completed' | 'pending' | 'processing' | 'failed'
  progress?: number
  hdStatus?: 'encoding' | 'completed' | 'failed' | string | null
  hdProgress?: number | null
  errorText?: string
  className?: string
  onNext?: () => void
  isLast?: boolean
  onFinish?: () => void
  nextVideoTitle?: string
}

export function VideoStatusOverlay({
  status,
  progress = 0,
  hdStatus,
  hdProgress = 0,
  errorText,
  className,
  onNext,
  isLast,
  onFinish,
  nextVideoTitle,
}: VideoStatusOverlayProps) {
  const [countdown, setCountdown] = React.useState(5)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'completed' && !isLast && onNext) {
      setCountdown(5)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            onNext()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [status, isLast, onNext])

  if (status === 'idle') {
    if (hdStatus === 'encoding') {
      return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-30">
          <div className="flex justify-end">
            <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg border border-white/10 animate-in fade-in duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Available (HD encoding...)
            </div>
          </div>
          <div className="w-full max-w-xs mx-auto mb-16 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur rounded-lg p-3 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300">HD Encoding Progress</span>
                <span className="text-xs font-black text-primary">{Math.round(hdProgress || 0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, hdProgress || 0))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center z-30 transition-all duration-300',
        status === 'loading' ? 'bg-transparent' : 'bg-slate-900',
        (status === 'error' || status === 'failed') && 'border-2 border-rose-500/20 bg-slate-900',
        status === 'completed' && 'bg-slate-900/95 backdrop-blur-xl',
        className,
      )}
    >
      {status === 'pending' ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-500">
          <Loader2 className="size-12 animate-spin text-primary" />
          <div>
            <h4 className="text-lg font-black text-white tracking-tight uppercase">Queueing video...</h4>
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest max-w-xs">
              Awaiting CPU allocation. Playback will begin shortly.
            </p>
          </div>
        </div>
      ) : status === 'processing' ? (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-500 w-full max-w-sm">
          <div className="relative size-16 flex items-center justify-center">
            <Loader2 className="absolute inset-0 size-full animate-spin text-primary" />
            <span className="text-sm font-black text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full space-y-2">
            <h4 className="text-lg font-black text-white tracking-tight uppercase">Processing video</h4>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Encoding low-latency 480p preview...
            </p>
          </div>
        </div>
      ) : status === 'loading' ? (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <style>{`
            @keyframes yt-loading {
              0% { left: -45%; width: 45%; }
              50% { left: 100%; width: 45%; }
              100% { left: -45%; width: 45%; }
            }
          `}</style>
          <div 
            className="absolute h-full bg-primary rounded-r-full"
            style={{
              animation: 'yt-loading 1.2s ease-in-out infinite'
            }}
          />
        </div>
      ) : (status === 'error' || status === 'failed') ? (
        <>
          <AlertCircle className="size-12 text-rose-500" />
          <div className="text-center mt-4">
            <p className="font-black uppercase tracking-tighter text-xl text-rose-500">
              Playback Error
            </p>
            <p className="text-xs font-bold text-rose-500/60 mt-1 uppercase tracking-widest">
              {errorText || 'Failed to load video'}
            </p>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
          <div
            className={cn(
              'size-16 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl transition-all duration-500',
              isLast
                ? 'bg-amber-500 shadow-amber-500/20 rotate-[360deg]'
                : 'bg-primary shadow-primary/20',
            )}
          >
            {isLast ? (
              <Trophy className="size-8" />
            ) : (
              <CheckCircle className="size-8" />
            )}
          </div>
          <div className="text-center space-y-2 mb-8">
            <h4 className="text-2xl font-black text-white tracking-tighter">
              {isLast ? 'Mastery Achieved!' : nextVideoTitle ? 'Video Completed' : 'Module Completed'}
            </h4>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-[0.2em]">
              {isLast
                ? 'You have conquered the entire curriculum'
                : nextVideoTitle
                  ? `Next Video: ${nextVideoTitle}`
                  : 'Ready for the next objective?'}
            </p>
          </div>
          {isLast ? (
            <Button
              onClick={onFinish}
              className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-xl shadow-amber-500/20 gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Claim Your Certificate <Award className="size-4" />
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={onNext}
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest relative overflow-hidden group"
              >
                {/* Progress bar background for countdown */}
                <div 
                  className="absolute inset-y-0 left-0 bg-black/10 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  {nextVideoTitle ? `Play Next in ${countdown}s` : `Next Module in ${countdown}s`} <ArrowRight className="size-4" />
                </span>
              </Button>
              <Button 
                onClick={onNext} 
                variant="ghost" 
                className="text-slate-400 hover:text-white text-[10px] font-bold tracking-widest uppercase h-6"
              >
                Skip timer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
