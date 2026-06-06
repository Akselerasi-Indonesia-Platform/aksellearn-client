import { CheckCircle, Gift, Target, Key } from 'lucide-react'
import { HtmlContent } from '@/components/ui/html-content'

interface CourseOverviewTabProps {
  course: any
  activeContent: string
  isIntro: boolean
}

export function CourseOverviewTab({
  course,
  activeContent,
  isIntro,
}: CourseOverviewTabProps) {
  return (
    <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <h4 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
        {isIntro ? 'Learning Path Overview' : 'Curriculum Objective'}
      </h4>
      <HtmlContent
        html={
          activeContent ||
          '<p>Detailed summary is currently unavailable.</p>'
        }
      />

      <div className="mt-12 pt-10 border-t border-slate-100">
        <h4 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
          Course Summary
        </h4>
        <HtmlContent html={course.description} />
      </div>
      
      {/* Qualitative Info Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {/* What You Will Learn */}
        {course.what_you_will_learn &&
          course.what_you_will_learn.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="size-5" />
                <h5 className="font-bold text-sm uppercase tracking-widest">
                  What you will learn
                </h5>
              </div>
              <ul className="space-y-2.5">
                {course.what_you_will_learn.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-slate-600 font-bold leading-snug"
                  >
                    <span className="size-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* What You Will Get */}
        {course.what_you_will_get &&
          course.what_you_will_get.length > 0 && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Gift className="size-5" />
                <h5 className="font-bold text-sm uppercase tracking-widest">
                  Course Perks
                </h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.what_you_will_get.map((item: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-white border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        {/* Who Is This For */}
        {course.who_is_this_for &&
          course.who_is_this_for.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/30 border border-amber-100/50 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Target className="size-5" />
                <h5 className="font-bold text-sm uppercase tracking-widest">
                  Target Audience
                </h5>
              </div>
              <p className="text-sm text-slate-600 font-bold leading-relaxed">
                {Array.isArray(course.who_is_this_for)
                  ? course.who_is_this_for.join(', ')
                  : course.who_is_this_for}
              </p>
            </div>
          )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Key className="size-5" />
              <h5 className="font-bold text-sm uppercase tracking-widest">
                Requirements
              </h5>
            </div>
            <ul className="space-y-2">
              {course.requirements.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-600 font-bold"
                >
                  <div className="size-1 bg-emerald-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
