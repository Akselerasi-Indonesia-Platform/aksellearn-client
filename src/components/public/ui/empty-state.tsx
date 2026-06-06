import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps {
  icon: LucideIcon
  title?: string
  description: string
  action?: { label: string; onClick: () => void }
  variant?: 'light' | 'ice-blue'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'light',
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-24 text-center space-y-6 rounded-xl border shadow-inner flex flex-col items-center justify-center",
        variant === 'light' ? "bg-white border-slate-200 border-dashed" : "bg-[#F0F7FF] border-primary/10",
        className
      )}
    >
      <div
        className={cn(
          "size-20 rounded-full flex items-center justify-center mx-auto",
          variant === 'light' ? "bg-slate-50 text-slate-300" : "bg-white text-[#056FAE]/40"
        )}
      >
        <Icon className="size-10" />
      </div>
      
      <div className="space-y-2 px-4">
        {title && (
          <h3 className={cn("text-xl font-bold", variant === 'light' ? "text-slate-900" : "text-[#0D3A6E]")}>
            {title}
          </h3>
        )}
        <p className={cn("font-medium max-w-sm mx-auto", variant === 'light' ? "text-slate-500 italic" : "text-slate-500")}>
          {description}
        </p>
      </div>

      {action && (
        <Button
          variant={variant === 'light' ? "outline" : "cta"}
          onClick={action.onClick}
          className={cn("mt-4", variant === 'light' && "border-slate-200 text-slate-600")}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
