import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface StatPillProps {
  value: string
  label: string
  icon?: LucideIcon
  variant?: 'glass' | 'ice'
  className?: string
}

export function StatPill({
  value,
  label,
  icon: Icon,
  variant = 'glass',
  className
}: StatPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm",
        variant === 'glass' ? "bg-white/10 border border-white/20 text-white" : "bg-[#F0F7FF] border border-primary/10 text-[#0D3A6E]",
        className
      )}
    >
      {Icon && (
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'glass' ? "bg-white/10" : "bg-[#056FAE]/10 text-[#056FAE]"
        )}>
          <Icon className="size-4" />
        </div>
      )}
      <div>
        <div className="font-bold">{value}</div>
        <div className={cn(
          "text-[10px] uppercase tracking-wider font-bold",
          variant === 'glass' ? "text-white/70" : "text-slate-500"
        )}>
          {label}
        </div>
      </div>
    </div>
  )
}
