import { cn } from '@/lib/utils'
import { LucideIcon, ArrowRight } from 'lucide-react'

interface ToolCardProps {
  title: string
  desc: string
  icon: LucideIcon
  color?: 'indigo' | 'amber' | 'slate'
  className?: string
  onClick?: () => void
}

export function ToolCard({
  title,
  desc,
  icon: Icon,
  color = 'indigo',
  className,
  onClick,
}: ToolCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    amber: 'bg-amber-500 text-white shadow-amber-200',
    slate: 'bg-slate-900 text-white shadow-slate-200',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all active:scale-[0.98]',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg',
            colorClasses[color],
          )}
        >
          <Icon className="size-6" />
        </div>
        <div>
          <p className="font-bold text-slate-800 truncate">{title}</p>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
      </div>
      <ArrowRight className="size-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </div>
  )
}
