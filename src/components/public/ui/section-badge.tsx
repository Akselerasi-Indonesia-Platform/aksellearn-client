import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface SectionBadgeProps {
  icon: LucideIcon
  label: string
  variant?: 'primary' | 'white'
  className?: string
}

export function SectionBadge({
  icon: Icon,
  label,
  variant = 'primary',
  className
}: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit",
        variant === 'primary' && "bg-primary/10 border border-primary/20 text-primary",
        variant === 'white' && "bg-white/10 border border-white/20 text-white",
        className
      )}
    >
      <Icon className="size-3" />
      <span>{label}</span>
    </div>
  )
}
