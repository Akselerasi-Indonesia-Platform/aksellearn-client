import {
  Upload,
  FileText,
  Download,
  Loader2,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adminEnrollmentService } from '@/services/admin/enrollment.service'
import { adminCourseService } from '@/services/admin/course.service'
import { adminOrganizationService } from '@/services/admin/organization.service'
import { SearchableSelect } from '@/components/admin/shared/searchable-select'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

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

/**
 * BulkImportForm Component
 * Implements CSV Bulk Import for course enrollments.
 * Includes domain authorization alerts for B2B organizations.
 */
export function BulkImportForm({ onSuccess }: { onSuccess: () => void }) {
  const [courses, setCourses] = React.useState<
    { label: string; value: string }[]
  >([])
  const [organizations, setOrganizations] = React.useState<
    { label: string; value: string }[]
  >([])
  const [courseUuid, setCourseUuid] = React.useState('')
  const [organizationUuid, setOrganizationUuid] = React.useState('')
  const [startsAt, setStartsAt] = React.useState<string | undefined>()
  const [expiresAt, setExpiresAt] = React.useState<string | undefined>()
  const [file, setFile] = React.useState<File | null>(null)

  React.useEffect(() => {
    adminCourseService.getAll({ limit: 100 }).then(({ courses }) => {
      setCourses(courses.map((c) => ({ label: c.title, value: String(c.id) })))
    })
    adminOrganizationService
      .getAll({ limit: 100 })
      .then(({ organizations }) => {
        setOrganizations(
          organizations.map((o) => ({ label: o.name, value: String(o.id) })),
        )
      })
  }, [])

  const mutation = useMutation({
    mutationFn: () =>
      adminEnrollmentService.importCSV(
        file!,
        courseUuid,
        organizationUuid,
        startsAt,
        expiresAt,
      ),
    onSuccess: (data) => {
      toast.success('Bulk Import Started', {
        description: `Batch UUID: ${data.batch_uuid}. Status: ${data.status}. Total rows: ${data.total_rows}`,
      })
      setFile(null)
      onSuccess()
    },
    onError: (error: any) => {
      const serverError = error.response?.data
      toast.error('Failed to start bulk import', {
        description:
          serverError?.message || 'Please check your CSV format and try again.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseUuid || !file)
      return toast.error('Please select a course and a CSV file')

    // Date Logic Validation
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      return toast.error('Start date must be earlier than expiration date')
    }

    mutation.mutate()
  }

  const downloadTemplate = () => {
    // 1. Define the CSV content
    const headers = 'email,name'
    const sample = 'student@example.com,John Doe'
    const csvContent = `${headers}\n${sample}`

    // 2. Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.setAttribute('href', url)
    link.setAttribute('download', 'enrollment_template.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Clean up
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="w-3 h-3" /> Targeted Course
          </Label>
          <SearchableSelect
            placeholder="Select course..."
            options={courses}
            onValueChange={setCourseUuid}
            value={courseUuid}
          />
        </div>

        {/* HIDDEN PER MEETING-290526 GAP-08
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            Organization (Optional)
          </Label>
          <SearchableSelect
            placeholder="Select organization for B2B..."
            options={organizations}
            onValueChange={setOrganizationUuid}
            value={organizationUuid}
          />
        </div>

        {organizationUuid && (
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-500/10 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[10px] leading-tight text-amber-700 dark:text-amber-300">
              <b>Domain Alert:</b> If an organization is selected, only users
              with authorized domains will be accepted.
            </p>
          </div>
        )}
        */}

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

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            CSV File Upload
          </Label>
          {!file ? (
            <div className="relative w-full rounded-2xl border-2 border-dashed border-primary/20 p-8 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-all group overflow-hidden">
              <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform shadow-inner">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">
                  Drop CSV here or click to upload
                </p>
                <p className="text-[10px] text-muted-foreground/70 font-medium">
                  Headers required: email, name
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  e.target.files?.[0] && setFile(e.target.files[0])
                }
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate text-foreground">
                    {file.name}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                    {(file.size / 1024).toFixed(1)} KB • CSV
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                onClick={() => setFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 w-full rounded-xl h-11"
          disabled={mutation.isPending || !file}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            'Start Bulk Import'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-dashed border-primary/30 text-primary font-bold h-10 hover:bg-primary/5 transition-all"
          onClick={downloadTemplate}
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
      </div>
    </form>
  )
}
