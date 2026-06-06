import { Bell, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { EmptyState } from '@/components/public/ui/empty-state'
import { HtmlContent } from '@/components/ui/html-content'

interface CourseUpdatesTabProps {
  announcements: any[]
}

const safeDate = (dateStr: string | undefined) => {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

export function CourseUpdatesTab({ announcements }: CourseUpdatesTabProps) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="All quiet on the learning front"
        description="There are currently no active announcements or updates for this curriculum."
        variant="ice-blue"
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <h4 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">
        Curriculum Updates
      </h4>
      <div className="relative border-l-2 border-slate-100 ml-4 space-y-10 pb-4">
        {announcements.map((ann, i) => {
          // Determine if it's considered recent/urgent (e.g., last 7 days)
          const isRecent = (new Date().getTime() - safeDate(ann.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000

          return (
            <div key={ann.id} className="relative pl-8">
              {/* Timeline Marker */}
              <div
                className={`absolute -left-[11px] top-1 size-5 rounded-full border-4 border-white flex items-center justify-center ${
                  isRecent ? 'bg-amber-400' : 'bg-slate-200'
                }`}
              >
                {isRecent && (
                  <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-50" />
                )}
              </div>

              {/* Content Card */}
              <div
                className={`rounded-2xl p-6 border transition-all ${
                  isRecent
                    ? 'bg-amber-50/30 border-amber-100 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 hover:border-primary/20 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  {isRecent ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-100/50 px-2.5 py-1 rounded-lg">
                      <Bell className="size-3.5 animate-pulse" /> New Update
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      <Clock className="size-3.5" /> Past Update
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {formatDistanceToNow(safeDate(ann.createdAt))} ago
                  </span>
                </div>
                <h5 className="text-lg font-bold text-slate-900 tracking-tight mb-3">
                  {ann.title}
                </h5>
                <HtmlContent className="text-sm text-slate-600 font-medium leading-relaxed" html={ann.content} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
