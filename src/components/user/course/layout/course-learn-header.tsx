import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, BookOpen, Award, FileText, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CourseLearnHeaderProps {
  course: any
  activeModule: any
  isIntro: boolean
  activeTitle: string
  certificate: any
  handleExtendAccess: () => void
  setIsCertModalOpen: (open: boolean) => void
  onBack: () => void
}

export function CourseLearnHeader({
  course,
  activeModule,
  isIntro,
  activeTitle,
  certificate,
  handleExtendAccess,
  setIsCertModalOpen,
  onBack,
}: CourseLearnHeaderProps) {
  const progress = Math.round(course.progress_percentage || 0)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center justify-between -mt-6 md:-mt-8 pt-6 md:pt-8 px-4 md:px-6 pb-4 border-b border-slate-200/60 sticky top-[72px] bg-white/95 backdrop-blur-xl z-20 mb-8 transition-all">
      {/* Left: Back & Course Title Breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <Button
          onClick={onBack}
          variant="ghost"
          className="size-10 md:size-12 rounded-xl hover:bg-slate-100 hover:shadow-sm transition-all active:scale-90 flex-shrink-0"
        >
          <ChevronLeft className="size-5 md:size-6 text-slate-600" />
        </Button>
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Course
          </span>
          <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-none line-clamp-1 max-w-[200px] lg:max-w-[300px]">
            {course.title}
          </h1>
        </div>
        <div className="md:hidden">
          <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none line-clamp-1 max-w-[200px]">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Center: Module Info (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center gap-2">
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 leading-none">
          {isIntro
            ? 'Introduction'
            : typeof activeModule !== 'string'
              ? activeModule?.module_type || 'Module'
              : 'Module'}
        </span>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          •
        </span>
        <span className="text-xs font-bold text-slate-600 truncate max-w-[250px]">
          {activeTitle}
        </span>
        {course.remaining_days !== undefined &&
          course.remaining_days > 0 &&
          course.remaining_days <= 30 && (
            <>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                •
              </span>
              <button
                onClick={handleExtendAccess}
                className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse hover:bg-amber-100 transition-colors"
              >
                Expiring in {course.remaining_days} days — Extend
              </button>
            </>
          )}
      </div>

      {/* Right: Progress Ring & Actions */}
      <div className="flex items-center justify-end gap-3 md:gap-6 flex-1">
        {/* Circular Progress Ring */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative size-10 flex items-center justify-center">
            <svg className="size-full -rotate-90 transform" viewBox="0 0 40 40">
              <circle
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="20"
                cy="20"
              />
              <circle
                className="text-[#2AABAA] transition-all duration-1000 ease-in-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="20"
                cy="20"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-700">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Resources Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 md:h-10 rounded-xl font-bold gap-2 bg-white border-slate-200 shadow-sm active:scale-95 transition-all text-xs md:text-sm px-3 md:px-4"
            >
              <BookOpen className="size-3.5 md:size-4" />{' '}
              <span className="hidden md:inline">Resources</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 p-2 rounded-2xl border-slate-200 shadow-2xl"
          >
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-2">
              Available Materials
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {course.attachments && course.attachments.length > 0 ? (
              course.attachments.map((att: any) => (
                <DropdownMenuItem
                  key={att.uuid}
                  onClick={() => window.open(att.media?.url || '', '_blank')}
                  className="rounded-xl p-3 cursor-pointer group"
                >
                  <div className="size-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <FileText className="size-4" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-bold text-slate-700 line-clamp-1">
                      {att.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {att.media?.size
                        ? `${(att.media.size / 1024 / 1024).toFixed(2)} MB`
                        : 'File'}
                    </p>
                  </div>
                  <Download className="size-3.5 text-slate-300 group-hover:text-primary" />
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  No resources linked
                </p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Certification Button */}
        <Button
          onClick={() => setIsCertModalOpen(true)}
          disabled={!certificate}
          className={cn(
            'h-9 md:h-10 rounded-xl font-bold gap-2 shadow-lg transition-all active:scale-95 text-xs md:text-sm px-3 md:px-4',
            certificate
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none',
          )}
        >
          <Award className="size-3.5 md:size-4" />{' '}
          <span className="hidden md:inline">Certificate</span>
        </Button>
      </div>
    </div>
  )
}
