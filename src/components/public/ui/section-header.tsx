import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { SectionBadge } from './section-badge'

export interface SectionHeaderProps {
  badge?: { icon: LucideIcon; label: string }
  title: string
  titleAccent?: string
  description?: string
  align?: 'left' | 'center'
  theme?: 'light' | 'dark' | 'gradient'
  className?: string
}

export function SectionHeader({
  badge,
  title,
  titleAccent,
  description,
  align = 'left',
  theme = 'light',
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", align === 'center' && "text-center flex flex-col items-center", className)}>
      {badge && (
        <SectionBadge
          icon={badge.icon}
          label={badge.label}
          variant={theme === 'dark' ? 'white' : 'primary'}
        />
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight leading-tight",
          theme === 'dark' ? "text-white" : theme === 'gradient' ? "text-brand-gradient" : "text-[#0D3A6E]"
        )}
      >
        {title}{' '}
        {titleAccent && (
          <span className={cn(
            "italic px-1",
            theme === 'dark' ? "text-[#70C942]" : theme === 'gradient' ? '' : "text-primary"
          )}>
            {titleAccent}
          </span>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            "font-medium max-w-2xl text-base md:text-lg",
            theme === 'dark' ? "text-white/80" : "text-slate-500"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
