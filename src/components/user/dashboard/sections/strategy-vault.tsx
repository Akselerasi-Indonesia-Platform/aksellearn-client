import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, StickyNote, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { userCourseService } from '@/services/user/course.service'
import { userNoteService } from '@/services/user/note.service'

export function StrategyVault() {
  const {
    data: notes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['user', 'notes', 'all'],
    queryFn: async () => {
      // Step 1: Get all enrolled courses
      const { data: courses } = await userCourseService.getAll({ limit: 100 })

      // Step 2: Fetch notes for each course in parallel
      const notesPromises = courses.map((course) =>
        userNoteService.getAll(course.uuid),
      )
      const notesResults = await Promise.all(notesPromises)

      // Step 3: Flatten and sort by updated_at desc
      return notesResults.flat().sort((a: any, b: any) => {
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return timeB - timeA
      })
    },
    refetchOnWindowFocus: true,
  })

  React.useEffect(() => {
    console.log('[Vault Debug] Notes received:', notes)
  }, [notes])

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  if (isLoading)
    return <div className="h-20 w-full bg-slate-50 animate-pulse rounded-2xl" />

  if (notes.length === 0)
    return (
      <div className="p-6 bg-slate-50/50 rounded-2xl text-center border border-dashed border-slate-200 group hover:bg-white transition-all duration-500 relative">
        <button
          onClick={() => refetch()}
          className={cn(
            'absolute top-4 right-4 text-slate-300 hover:text-indigo-600 transition-colors',
            isRefetching && 'animate-spin text-indigo-600',
          )}
        >
          <Sparkles className="size-3" />
        </button>
        <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
          <StickyNote className="size-6" />
        </div>
        <h5 className="text-sm font-black text-slate-800 tracking-tight">
          The vault is currently empty
        </h5>
        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[180px] mx-auto leading-relaxed">
          Start taking notes in the Overview tab to build your knowledge base.
        </p>
      </div>
    )

  return (
    <div className="space-y-3">
      {notes.slice(0, 3).map((note: any) => (
        <div
          key={note.uuid}
          className="p-4 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all border border-transparent hover:border-indigo-50 cursor-pointer group"
        >
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">
            {note.course?.title || 'General'}
          </p>
          <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed group-hover:text-slate-900 transition-colors">
            {stripHtml(note.content)}
          </p>
          <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-slate-400 font-bold">
              {formatDistanceToNow(new Date(note.created_at))} ago
            </span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1">
              Open Vault <ArrowRight className="size-2.5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
