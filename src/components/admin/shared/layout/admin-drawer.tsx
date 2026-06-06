import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AdminDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  isLoading?: boolean
}

export function AdminDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  isLoading = false,
}: AdminDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-[600px] lg:max-w-[800px] sm:max-w-[100%] flex flex-col gap-0 p-0 sm:p-0 admin-theme border-l border-border shadow-2xl">
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm font-medium">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="p-6">
              {children}
            </div>
          </ScrollArea>
          
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">Saving changes...</p>
            </div>
          )}
        </div>

        {footer && (
          <SheetFooter className="px-6 py-4 border-t border-border bg-muted/10 sm:justify-between flex-row items-center">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
