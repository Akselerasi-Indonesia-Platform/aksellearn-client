import * as React from 'react'
import { cn } from '@/lib/utils'

interface GuideStepProps {
  step: number
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function GuideStep({ step, title, description, children, className }: GuideStepProps) {
  return (
    <div className={cn('flex gap-5 group', className)}>
      {/* Step number */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm shadow-md">
          {step}
        </div>
        {/* Connector line */}
        <div className="flex-1 w-px bg-border mt-2 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 group-last:pb-0">
        <h4 className="font-bold text-base text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
        {children && (
          <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
