import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionPillProps {
  text: string
  isCorrect: boolean
  className?: string
}

export function OptionPill({ text, isCorrect, className }: OptionPillProps) {
  return (
    <div
      className={cn(
        'text-[10px] font-bold px-3 py-1.5 border shadow-sm rounded-xl flex items-center gap-2 transition-all duration-300',
        isCorrect
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-50 text-slate-600 border-slate-100',
        className,
      )}
    >
      {isCorrect ? (
        <CheckCircle2 className="size-3 text-emerald-600" />
      ) : (
        <div className="size-1.5 rounded-full bg-slate-300 ml-0.5" />
      )}
      {text}
    </div>
  )
}
