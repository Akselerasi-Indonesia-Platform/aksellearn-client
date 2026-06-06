'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4 bg-white', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center mb-4',
        caption_label:
          'text-sm font-bold text-foreground capitalize tracking-tight',
        nav: 'space-x-1 flex items-center bg-white',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100 absolute left-2 z-10 border-slate-200 rounded-xl transition-all',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 opacity-80 hover:opacity-100 absolute right-2 z-10 border-slate-200 rounded-xl transition-all',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex mb-2',
        weekday:
          'text-muted-foreground rounded-md w-9 font-bold text-[11px] uppercase text-center',
        week: 'flex w-full mt-1.5 justify-center',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200',
        ),
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-md shadow-primary/20 scale-105 z-10',
        today:
          'bg-primary/10 text-primary font-black ring-2 ring-primary/20 ring-offset-2',
        outside:
          'day-outside text-muted-foreground/30 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground/30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        // Dropdown styling for Month/Year selection
        dropdowns: 'flex gap-2 font-bold',
        dropdown:
          'bg-transparent hover:bg-slate-50 p-1 rounded-lg border-0 cursor-pointer font-bold text-sm outline-none transition-colors',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
