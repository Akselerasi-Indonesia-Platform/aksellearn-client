import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  color?: 'primary' | 'emerald' | 'amber' | 'rose' | 'teal' | 'lime'
  className?: string
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  color = 'primary',
  className,
}: StatsCardProps) {
  const colors = {
    primary: 'bg-primary/10 text-primary shadow-primary/10',
    emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-100',
    amber: 'bg-amber-50 text-amber-600 shadow-amber-100',
    rose: 'bg-rose-50 text-rose-600 shadow-rose-100',
    teal: 'bg-[#2AABAA]/10 text-[#2AABAA] shadow-[#2AABAA]/10',
    lime: 'bg-[#70C942]/10 text-[#70C942] shadow-[#70C942]/10',
  }

  return (
    <Card
      className={cn(
        'border-none shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden group rounded-2xl',
        className,
      )}
    >
      <CardContent className="p-6 flex items-center gap-5">
        <div
          className={cn(
            'p-4 rounded-2xl group-hover:rotate-6 transition-transform shadow-lg',
            colors[color],
          )}
        >
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-lg font-bold text-[#0D3A6E] mt-0.5 tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
