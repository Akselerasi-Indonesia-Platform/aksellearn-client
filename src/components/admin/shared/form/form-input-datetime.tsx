'use client'

import { format, setMonth, setYear } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FormInputDateTimeProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function FormInputDateTime<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  name,
  label,
  description,
  disabled,
  required,
  className,
  placeholder: _placeholder = 'Pick date & time',
}: FormInputDateTimeProps<TFieldValues>) {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const years = Array.from({ length: 21 }, (_, i) =>
    (new Date().getFullYear() - 10 + i).toString(),
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const dateValue = field.value ? new Date(field.value) : new Date()

        const handleDateSelect = (selectedDate: Date | undefined) => {
          if (!selectedDate) return
          const newDate = new Date(selectedDate)
          if (field.value) {
            newDate.setHours(dateValue.getHours())
            newDate.setMinutes(dateValue.getMinutes())
            newDate.setSeconds(0)
            newDate.setMilliseconds(0)
          }
          field.onChange(newDate.toISOString())
        }

        const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
          const newDate = new Date(dateValue)
          if (type === 'hour') newDate.setHours(parseInt(value))
          else newDate.setMinutes(parseInt(value))
          newDate.setSeconds(0)
          newDate.setMilliseconds(0)
          field.onChange(newDate.toISOString())
        }

        const handleMonthYearChange = (
          type: 'month' | 'year',
          value: string,
        ) => {
          let newDate = new Date(dateValue)
          if (type === 'month')
            newDate = setMonth(newDate, months.indexOf(value))
          else newDate = setYear(newDate, parseInt(value))
          field.onChange(newDate.toISOString())
        }

        return (
          <FormItem className={cn('flex flex-col gap-2', className)}>
            {label && (
              <FormLabel className="font-bold flex items-center text-sm text-slate-700">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full pl-0 text-left font-normal h-12 rounded-xl border-slate-200 hover:border-primary/50 hover:bg-slate-50/50 transition-all bg-white shadow-sm overflow-hidden',
                      !field.value && 'text-muted-foreground',
                    )}
                    disabled={disabled}
                  >
                    <div className="flex h-full w-full items-center divide-x divide-slate-100">
                      <div className="flex flex-1 items-center px-4 gap-3">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="truncate font-medium">
                          {field.value
                            ? format(new Date(field.value), 'PPP')
                            : 'Select Date'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 px-4 h-full bg-slate-50/30 min-w-[120px]">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-bold text-slate-900">
                          {field.value
                            ? format(new Date(field.value), 'HH:mm')
                            : '00:00'}
                        </span>
                      </div>
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-[2rem] shadow-2xl border-slate-100 overflow-hidden admin-theme"
                align="start"
              >
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  <div className="flex flex-col">
                    {/* Simplified Month/Year Picker Header */}
                    <div className="p-4 pb-0 flex gap-2">
                      <Select
                        value={months[dateValue.getMonth()]}
                        onValueChange={(v) => handleMonthYearChange('month', v)}
                      >
                        <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-0 font-bold text-xs ring-0 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                          {months.map((m) => (
                            <SelectItem
                              key={m}
                              value={m}
                              className="rounded-lg"
                            >
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={dateValue.getFullYear().toString()}
                        onValueChange={(v) => handleMonthYearChange('year', v)}
                      >
                        <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-0 font-bold text-xs ring-0 focus:ring-0 w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl border-slate-100">
                          {years.map((y) => (
                            <SelectItem
                              key={y}
                              value={y}
                              className="rounded-lg"
                            >
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateValue}
                      onSelect={handleDateSelect}
                      month={dateValue}
                      onMonthChange={(d) => field.onChange(d.toISOString())}
                      initialFocus
                    />
                  </div>

                  <div className="p-6 flex flex-col gap-6 bg-slate-50/30 min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Time Pick
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight px-1">
                          Hour
                        </label>
                        <Select
                          value={dateValue
                            .getHours()
                            .toString()
                            .padStart(2, '0')}
                          onValueChange={(v) => handleTimeChange('hour', v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm hover:border-primary/30 transition-all font-bold text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] rounded-2xl shadow-2xl border-slate-50">
                            {hours.map((h) => (
                              <SelectItem
                                key={h}
                                value={h}
                                className="rounded-lg font-medium"
                              >
                                {h}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight px-1">
                          Minute
                        </label>
                        <Select
                          value={dateValue
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}
                          onValueChange={(v) => handleTimeChange('minute', v)}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm hover:border-primary/30 transition-all font-bold text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] rounded-2xl shadow-2xl border-slate-50">
                            {minutes.map((m) => (
                              <SelectItem
                                key={m}
                                value={m}
                                className="rounded-lg font-medium"
                              >
                                {m}m
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        <span>Selected</span>
                        <span className="text-primary">
                          {format(dateValue, 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {description && (
              <FormDescription className="text-xs text-slate-400 italic">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
