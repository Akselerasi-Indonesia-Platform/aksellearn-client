import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adminCourseService } from '@/services/admin/course.service'
import { adminUserService } from '@/services/admin/user.service'
import { adminEnrollmentService } from '@/services/admin/enrollment.service'
import { toast } from 'sonner'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import {
  ShieldCheck,
  User as UserIcon,
  BookOpen,
  Calendar as CalendarIcon,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

function StandaloneDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string
  onChange: (val: string | undefined) => void
  placeholder?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-3 text-left font-normal h-10 rounded-xl border-border hover:border-primary/50 transition-all',
            !value && 'text-muted-foreground',
          )}
        >
          {value ? (
            format(new Date(value), 'PPP')
          ) : (
            <span>{placeholder || 'Pick a date'}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl shadow-2xl border-primary/10"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date?.toISOString())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function GrantAccessForm({ onSuccess }: { onSuccess: () => void }) {
  const [students, setStudents] = React.useState<
    { label: string; value: string }[]
  >([])
  const [courses, setCourses] = React.useState<
    { label: string; value: string }[]
  >([])
  const [userUuid, setUserUuid] = React.useState('')
  const [courseUuid, setCourseUuid] = React.useState('')
  const [startsAt, setStartsAt] = React.useState<string | undefined>()
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>()

  React.useEffect(() => {
    adminUserService.getAll({ limit: 100 }).then(({ users }) => {
      setStudents(
        users.map((u) => ({ label: `${u.name} (${u.email})`, value: u.id })),
      )
    })
    adminCourseService.getAll({ limit: 100 }).then(({ courses }) => {
      setCourses(courses.map((c) => ({ label: c.title, value: c.id })))
    })
  }, [])

  const mutation = useMutation({
    mutationFn: (data: {
      user_uuid: string
      course_uuid: string
      starts_at?: string
      expires_at?: string
    }) => adminEnrollmentService.grantManualAccess(data),
    onSuccess: () => {
      toast.success('Access Authorization Successful', {
        description:
          'The student has been granted immediate access to the course content.',
      })
      setUserUuid('')
      setCourseUuid('')
      onSuccess()
    },
    onError: (error: any) => {
      const serverError = error.response?.data
      if (
        serverError?.status === 'error' &&
        serverError?.message === 'Already enrolled'
      ) {
        return toast.error(serverError.message, {
          description:
            serverError.errors?.error ||
            'User is already actively enrolled in this course.',
        })
      }
      toast.error('Failed to grant access', {
        description:
          serverError?.message ||
          'Please verify the student credentials and try again.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userUuid || !courseUuid)
      return toast.error('Please select both a student and a course')

    // Date Logic Validation
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      return toast.error('Start date must be earlier than expiration date')
    }

    mutation.mutate({
      user_uuid: userUuid,
      course_uuid: courseUuid,
      starts_at: startsAt,
      expires_at: expiresAt,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <UserIcon className="w-3 h-3" /> Student
          </Label>
          <SearchableSelect
            placeholder="Search student..."
            options={students}
            onValueChange={setUserUuid}
            value={userUuid}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BookOpen className="w-3 h-3" /> Course
          </Label>
          <SearchableSelect
            placeholder="Select course..."
            options={courses}
            onValueChange={setCourseUuid}
            value={courseUuid}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" /> Start Date
            </Label>
            <StandaloneDatePicker
              value={startsAt}
              onChange={setStartsAt}
              placeholder="Immediate"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" /> End Date
            </Label>
            <StandaloneDatePicker
              value={expiresAt}
              onChange={setExpiresAt}
              placeholder="Never (Forever)"
            />
          </div>
        </div>
      </div>

      <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10 flex gap-4">
        <div className="p-2 bg-primary/10 rounded-full h-fit">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <p className="text-[11px] leading-tight text-primary/80 dark:text-primary/90">
          This will grant the student access to the course content.
          {startsAt && ` Starting from ${format(new Date(startsAt), 'PP')}.`}
          {expiresAt && ` Valid until ${format(new Date(expiresAt), 'PP')}.`}
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 w-full md:w-auto rounded-xl h-11"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Granting...' : 'Authorize Access'}
        </Button>
      </div>
    </form>
  )
}
