import * as React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  title?: string
  description?: string
  action?: React.ReactNode
}

export function DataEmptyState({
  icon: Icon = Inbox,
  title = 'No results found',
  description = "We couldn't find any data matching your criteria.",
  action,
  className,
  ...props
}: DataEmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)} 
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
