import { useState, useEffect } from 'react'
import { userCourseService } from '@/services/user/course.service'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Paperclip,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { HtmlContent } from '@/components/ui/html-content'

interface CourseAssignmentPanelProps {
  courseUuid: string
  moduleUuid: string
  assignmentUuid: string
  onComplete?: () => void
  onNext?: () => void
}

export function CourseAssignmentPanel({
  courseUuid,
  moduleUuid,
  assignmentUuid,
  onComplete,
  onNext,
}: CourseAssignmentPanelProps) {
  const [assignment, setAssignment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])

  useEffect(() => {
    setIsLoading(true)
    userCourseService
      .getAssignment(courseUuid, assignmentUuid)
      .then((data: any) => {
        setAssignment(data)
        setIsLoading(false)
      })
      .catch((err: any) => {
        console.error('Failed to load assignment:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [courseUuid, assignmentUuid])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSubmissionFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    if (submissionFiles.length === 0) {
      toast.error('Please select at least one file to submit')
      return
    }

    setIsSubmitting(true)
    try {
      await userCourseService.submitAssignment(
        courseUuid,
        assignmentUuid,
        submissionFiles,
      )
      toast.success('Assignment submitted successfully')
      if (onComplete) onComplete()
      
      // Refresh assignment data
      const updated = await userCourseService.getAssignment(courseUuid, assignmentUuid)
      setAssignment(updated)
    } catch (err) {
      toast.error('Failed to submit assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">
          Fetching Assignment Parameters...
        </p>
      </div>
    )
  }

  if (isError || !assignment) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl text-center">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-rose-900 mb-2">
          Error Loading Assignment
        </h3>
        <p className="text-rose-600 mb-6">
          We couldn't retrieve the assignment details. Please try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          Retry Connection
        </Button>
      </div>
    )
  }

  if (assignment.is_completed) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-10 rounded-2xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.15] group-hover:scale-125 transition-transform duration-1000">
            <CheckCircle2 className="size-40" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <span className="bg-white/20 text-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                Protocol Complete
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Objective Verified
              </h2>
              <p className="text-emerald-50 text-lg font-medium max-w-xl">
                You have successfully completed this assignment. Your submission
                has been processed and validated.
              </p>
            </div>
            {onNext && (
              <Button
                onClick={onNext}
                className="h-14 px-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-2xl transition-all active:scale-95 text-lg whitespace-nowrap"
              >
                Advance to Next Module <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <FileText className="size-5 text-primary" /> Assignment
                Parameters
              </h3>
              <div className="prose prose-slate max-w-none">
                <HtmlContent html={assignment.description} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                Status Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Completed On
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {assignment.completed_at
                      ? formatDistanceToNow(new Date(assignment.completed_at)) +
                        ' ago'
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Feedback Status
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-inner">
              <FileText className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Assignment Submission
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Ref: {assignment.uuid.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-100">
              Pending Submission
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none p-6 bg-slate-50/50 rounded-xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">
            Requirements & Guidelines
          </h3>
          <HtmlContent html={assignment.description} />
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Upload className="size-5 text-primary" /> Submission Portal
          </h3>

          <div className="space-y-6 bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/20 transition-all text-center">
            {submissionFiles.length === 0 ? (
              <div className="py-8 space-y-4">
                <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Upload className="size-8" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700">
                    Ready for submission?
                  </p>
                  <p className="text-sm text-slate-400">
                    Select your assignment files to begin the validation
                    process.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {submissionFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="size-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                        <FileText className="size-5" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSubmissionFiles((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="size-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <input
                type="file"
                id="assignment-file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-xl font-bold border-slate-200"
                  onClick={() =>
                    document.getElementById('assignment-file')?.click()
                  }
                >
                  <Paperclip className="size-4 mr-2" /> Add Files
                </Button>

                {submissionFiles.length > 0 && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="size-4 mr-2" />
                    )}
                    Submit Final Assignment
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Supported: PDF, ZIP, DOCX (Max 25MB)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
