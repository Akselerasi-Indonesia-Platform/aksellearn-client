import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * AdminPage - Unified page wrapper for admin routes
 *
 * Unified Type Scale Convention:
 * - Page Title (h1):       text-2xl font-bold tracking-tight
 * - Section Title (h2):    text-xl font-semibold
 * - Card Title:            text-sm font-semibold uppercase tracking-widest text-muted-foreground
 * - Body:                  text-sm font-medium
 * - Micro Label:           text-[10px] font-bold uppercase tracking-widest
 */
interface AdminPageProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminPage({ children, className, ...props }: AdminPageProps) {
  return (
    <div 
      className={cn(
        "p-4 md:p-6 lg:p-8 pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
