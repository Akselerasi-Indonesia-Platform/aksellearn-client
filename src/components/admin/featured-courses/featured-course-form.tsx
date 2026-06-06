import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Loader2, BookOpen, Hash, Power, Calendar, Clock } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import { adminCourseService } from '@/services/admin/course.service'
import type { Course } from '@/types/course'
import type { FeaturedCourse, FeaturedCoursePayload } from '@/types/featured-course'

import { format, setMonth, setYear } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  course_uuid: z.string().min(1, 'Please select a course'),
  sort_order: z.coerce.number().default(0),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

interface FeaturedCourseFormProps {
  featuredCourse?: FeaturedCourse
  onSubmit: (data: FeaturedCoursePayload & { course_uuid?: string }) => void
  onCancel: () => void
  onDelete?: () => void
}

function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = 'Select Date',
}: {
  value?: string | null
  onChange: (val: string | null) => void
  disabled?: boolean
  placeholder?: string
}) {
  const dateValue = value ? new Date(value) : new Date()

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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    const newDate = new Date(selectedDate)
    if (value) {
      newDate.setHours(dateValue.getHours())
      newDate.setMinutes(dateValue.getMinutes())
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)
    }
    onChange(newDate.toISOString())
  }

  const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
    const newDate = new Date(dateValue)
    if (type === 'hour') newDate.setHours(parseInt(val))
    else newDate.setMinutes(parseInt(val))
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    onChange(newDate.toISOString())
  }

  const handleMonthYearChange = (type: 'month' | 'year', val: string) => {
    let newDate = new Date(dateValue)
    if (type === 'month')
      newDate = setMonth(newDate, months.indexOf(val))
    else newDate = setYear(newDate, parseInt(val))
    onChange(newDate.toISOString())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-0 text-left font-normal h-12 rounded-xl border-slate-200 hover:border-primary/50 hover:bg-slate-50/50 transition-all bg-white shadow-sm overflow-hidden text-muted-foreground',
            disabled && 'pointer-events-none opacity-50',
          )}
          disabled={disabled}
          type="button"
        >
          <div className="flex h-full w-full items-center divide-x divide-slate-100">
            <div className="flex flex-1 items-center px-4 gap-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="truncate font-medium text-slate-700">
                {value ? format(new Date(value), 'PPP') : placeholder}
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 h-full bg-slate-50/30 min-w-[120px]">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-bold text-slate-900">
                {value ? format(new Date(value), 'HH:mm') : '00:00'}
              </span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-[2rem] shadow-2xl border-slate-100 overflow-hidden admin-theme"
        align="start"
      >
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="flex flex-col">
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
                    <SelectItem key={m} value={m} className="rounded-lg">
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
                    <SelectItem key={y} value={y} className="rounded-lg">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CalendarComponent
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              month={dateValue}
              onMonthChange={(d) => onChange(d.toISOString())}
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
                  value={dateValue.getHours().toString().padStart(2, '0')}
                  onValueChange={(v) => handleTimeChange('hour', v)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm hover:border-primary/30 transition-all font-bold text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] rounded-2xl shadow-2xl border-slate-50">
                    {hours.map((h) => (
                      <SelectItem key={h} value={h} className="rounded-lg font-medium">
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
                  value={dateValue.getMinutes().toString().padStart(2, '0')}
                  onValueChange={(v) => handleTimeChange('minute', v)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 shadow-sm hover:border-primary/30 transition-all font-bold text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] rounded-2xl shadow-2xl border-slate-50">
                    {minutes.map((m) => (
                      <SelectItem key={m} value={m} className="rounded-lg font-medium">
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
                <span className="text-primary">{format(dateValue, 'HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function FeaturedCourseForm({
  featuredCourse,
  onSubmit,
  onCancel,
  onDelete,
}: FeaturedCourseFormProps) {
  const { t } = useTranslation()
  const [courses, setCourses] = React.useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(true)

  React.useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminCourseService.getAll({ limit: 1000 })
        setCourses(res.courses)
      } catch {
        // failed silently or handled in parent
      } finally {
        setIsLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      course_uuid: featuredCourse?.course?.uuid || '',
      sort_order: featuredCourse?.sort_order ?? 0,
      start_at: featuredCourse?.start_at || null,
      end_at: featuredCourse?.end_at || null,
      is_active: featuredCourse?.is_active ?? true,
    },
  })

  const handleOnSubmit = (values: z.infer<typeof formSchema>) => {
    const course = courses.find((c) => c.uuid === values.course_uuid)
    onSubmit({
      course_id: course?.db_id || 0,
      course_uuid: values.course_uuid,
      sort_order: values.sort_order,
      start_at: values.start_at || null,
      end_at: values.end_at || null,
      is_active: values.is_active,
    })
  }

  const courseOptions = React.useMemo(() => {
    return courses.map((c) => ({
      label: c.title,
      value: c.uuid,
    }))
  }, [courses])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
        {isLoadingCourses ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading courses list...
          </div>
        ) : (
          <FormField
            control={form.control}
            name="course_uuid"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <BookOpen className="w-3 h-3" /> {t('featuredCourses.selectCourse', 'Select Course to Feature')}
                </FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={courseOptions}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={!!featuredCourse}
                    placeholder={t('featuredCourses.selectCoursePlaceholder', 'Search and select a course...')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <Hash className="w-3 h-3" /> {t('featuredCourses.sortOrder', 'Display Order')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="h-11 rounded-xl"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : (isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center pt-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm w-full">
                  <div className="space-y-0.5">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                      <Power className="w-3 h-3" /> {t('common.active', 'Active')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_at"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <Calendar className="w-3 h-3" /> {t('featuredCourses.startAt', 'Feature From')}
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_at"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  <Calendar className="w-3 h-3" /> {t('featuredCourses.endAt', 'Feature Until')}
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="gap-2 font-bold h-11 rounded-xl px-4"
              >
                <Trash2 className="size-4" />
                {t('common.delete', 'Remove')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="hover:bg-accent/50 transition-all duration-200 rounded-xl h-11 px-4 font-bold border border-slate-200 shadow-sm"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 w-full md:w-auto rounded-xl h-11"
              disabled={form.formState.isSubmitting || isLoadingCourses}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {featuredCourse ? t('common.save', 'Save') : t('common.create', 'Feature Course')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}