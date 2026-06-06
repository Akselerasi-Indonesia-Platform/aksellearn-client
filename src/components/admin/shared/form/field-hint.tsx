import * as React from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface FieldHintProps {
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function FieldHint({ children, side = 'top', className }: FieldHintProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Info 
            className={cn(
              "inline-block size-3.5 text-slate-400 hover:text-primary transition-colors cursor-help ml-1.5 align-text-bottom",
              className
            )} 
          />
        </PopoverTrigger>
        <PopoverContent 
          side={side} 
          className="max-w-[280px] text-xs leading-relaxed text-slate-700 p-3 rounded-xl shadow-lg"
          align="start"
        >
          {children}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info 
            className={cn(
              "inline-block size-3.5 text-slate-400 hover:text-primary transition-colors cursor-help ml-1.5 align-text-bottom",
              className
            )} 
          />
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-[280px] text-[11px] leading-relaxed bg-slate-800 text-slate-100 p-3 rounded-xl shadow-lg border-slate-700"
          sideOffset={6}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
