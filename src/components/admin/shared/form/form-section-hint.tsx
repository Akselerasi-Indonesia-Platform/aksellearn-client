import * as React from 'react'
import { ChevronDown, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface FormSectionHintProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  variant?: 'info' | 'warning'
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function FormSectionHint({
  title,
  children,
  icon,
  variant = 'info',
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionHintProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const variantStyles = {
    info: 'bg-blue-50/50 border-blue-100/60 text-blue-900',
    warning: 'bg-amber-50/50 border-amber-100/60 text-amber-900',
  }

  const DefaultIcon = variant === 'warning' ? AlertTriangle : Info

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex shrink-0 items-center justify-center size-8 rounded-lg shadow-sm border",
        variant === 'info' ? "bg-white border-blue-100 text-blue-600" : "bg-white border-amber-100 text-amber-600"
      )}>
        {icon || <DefaultIcon className="size-4" />}
      </div>
      <h4 className="text-sm font-bold">{title}</h4>
    </div>
  )

  const contentWrap = (
    <div className={cn(
      "text-xs leading-relaxed mt-3 space-y-2",
      variant === 'info' ? "text-blue-800/80" : "text-amber-800/80"
    )}>
      {children}
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "rounded-2xl border p-4 transition-all duration-200",
          variantStyles[variant],
          className
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180 hover:opacity-80 transition-opacity">
          {headerContent}
          <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-200">
          {contentWrap}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={cn(
      "rounded-2xl border p-4",
      variantStyles[variant],
      className
    )}>
      {headerContent}
      {contentWrap}
    </div>
  )
}
