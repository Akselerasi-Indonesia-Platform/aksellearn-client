import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface GuideTipProps {
  type: 'tip' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

export function GuideTip({ type, children, className }: GuideTipProps) {
  const Icon = {
    tip: CheckCircle2,
    warning: AlertCircle,
    info: Info,
  }[type]

  const styles = {
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
  }[type]

  const iconStyles = {
    tip: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  }[type]

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', styles, className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconStyles)} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}
