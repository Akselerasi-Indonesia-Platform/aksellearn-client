import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  children: React.ReactNode
  variant?: 'indigo' | 'orange' | 'emerald' | 'amber'
  className?: string
}

export function StatusBadge({
  children,
  variant = 'indigo',
  className,
}: StatusBadgeProps) {
  const variants = {
    indigo: 'bg-indigo-505/10 text-indigo-500 border-indigo-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border animate-pulse transition-all',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
