import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export function CourseTracker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="absolute -bottom-12 -left-20 z-20 w-64 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-2xl shadow-2xl hidden lg:block"
    >
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
          Trending Tracks
        </div>
        <div className="text-sm font-bold text-white">Highest Enrollment</div>
      </div>

      <div className="space-y-3">
        {[
          { name: 'Advanced React Architecture', progress: 85 },
          { name: 'Enterprise Cloud Security', progress: 62 },
        ].map((course, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-300 truncate pr-2">
                {course.name}
              </span>
              <span className="text-white">{course.progress}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ delay: 1.5 + i * 0.2, duration: 1 }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="size-4 text-primary" />
        </div>
        <div className="text-[10px] text-slate-400 font-medium leading-tight">
          <span className="text-white">250+</span> specialized tracks available
        </div>
      </div>
    </motion.div>
  )
}
