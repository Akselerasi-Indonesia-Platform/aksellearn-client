import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { userCourseService } from '@/services/user/course.service'

interface CourseUpdatesProps {
  courseUuid: string
}

export function CourseUpdates({ courseUuid }: CourseUpdatesProps) {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['user', 'course', courseUuid, 'announcements'],
    queryFn: () => userCourseService.getAnnouncements(courseUuid),
    staleTime: 60000,
  })

  if (isLoading)
    return <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />

  if (announcements.length === 0)
    return (
      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider italic">
        No recent updates
      </p>
    )

  return (
    <div className="space-y-4 pl-3 border-l-2 border-slate-100">
      {announcements.slice(0, 2).map((ann) => (
        <div key={ann.id} className="group cursor-default">
          <h5 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
            {ann.title}
          </h5>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1.5 capitalize">
            <Clock className="size-3" />{' '}
            {formatDistanceToNow(new Date(ann.createdAt))} ago
          </p>
        </div>
      ))}
    </div>
  )
}
