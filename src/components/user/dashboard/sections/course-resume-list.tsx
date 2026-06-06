import { CourseCard } from '@/components/user/course/course-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CourseResumeListProps {
  courses: {
    id: string
    title: string
    category: string
    progress: number
    lessonsLeft?: number
    thumbnail?: string
    remainingDays?: number
    enrollment_uuid?: string
    slug: string
    rating: number
    reviewsCount: number | string
    lecturesCount: number
    duration: string
    priceFormatted: string
    is_active?: boolean
  }[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  searchParams: {
    page: number
    search?: string
    category?: string
    status?: string
    difficulty?: string
    sort_by: string
    sort: string
  }
  onFilterChange: (updates: any) => void
  onExtend: (courseUuid: string) => void
}

export function CourseResumeList({ 
  courses, 
  meta, 
  searchParams, 
  onFilterChange, 
  onExtend 
}: CourseResumeListProps) {
  const navigate = useNavigate()
  
  const [localSearch, setLocalSearch] = useState(searchParams.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchParams.search || '')) {
        onFilterChange({ search: localSearch || undefined })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, searchParams.search, onFilterChange])

  const currentPage = meta?.current_page || 1
  const totalPages = meta?.last_page || 1

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h4 className="text-xl md:text-2xl font-black tracking-tight text-[#0D3A6E]">
          Continue Learning
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#056FAE]/40" />
            <Input 
              placeholder="Search courses..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 h-10 w-full md:w-40 rounded-xl border-[#056FAE]/10 focus-visible:ring-[#056FAE]/20 bg-white"
            />
          </div>

          <Select 
            value={searchParams.status || 'all'} 
            onValueChange={(v) => onFilterChange({ status: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-[110px] h-10 bg-white border-[#056FAE]/10 rounded-xl font-bold text-[11px] text-[#0D3A6E]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={searchParams.difficulty || 'all'} 
            onValueChange={(v) => onFilterChange({ difficulty: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-[110px] h-10 bg-white border-[#056FAE]/10 rounded-xl font-bold text-[11px] text-[#0D3A6E]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Difficulty</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={searchParams.sort_by} 
            onValueChange={(v) => onFilterChange({ sort_by: v })}
          >
            <SelectTrigger className="w-[130px] h-10 bg-white border-[#056FAE]/10 rounded-xl font-bold text-[11px] text-[#0D3A6E]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="progress">Most Progress</SelectItem>
              <SelectItem value="last_accessed">Recently Accessed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              category={course.category}
              slug={course.slug}
              thumbnailUrl={course.thumbnail || ''}
              rating={course.rating}
              reviewsCount={course.reviewsCount}
              lecturesCount={course.lecturesCount}
              duration={course.duration}
              priceFormatted={course.priceFormatted}
              progress={course.progress}
              lessonsLeft={course.lessonsLeft}
              is_active={course.is_active}
              enrollmentUuid={course.enrollment_uuid}
              href={`/student/learn/${course.slug}`}
              actionText="Continue"
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-[#F0F7FF]/50 rounded-[2rem] border border-dashed border-[#056FAE]/20">
            <p className="text-[#0D3A6E]/60 font-bold">No courses match your filters.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            onClick={() => onFilterChange({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1}
            className="size-10 p-0 rounded-lg border-[#056FAE]/10"
          >
            <ArrowLeft className="size-4" />
          </Button>
          
          <div className="flex gap-1.5">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => onFilterChange({ page: i + 1 })}
                className={cn(
                  "size-10 p-0 rounded-lg font-bold transition-all",
                  currentPage === i + 1 
                    ? "bg-[#0D3A6E] text-white hover:bg-[#0D3A6E]/90 border-transparent" 
                    : "border-[#056FAE]/10 text-[#056FAE]/60 hover:text-[#056FAE] hover:bg-[#F0F7FF] bg-white"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => onFilterChange({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage === totalPages}
            className="size-10 p-0 rounded-lg border-[#056FAE]/10"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
