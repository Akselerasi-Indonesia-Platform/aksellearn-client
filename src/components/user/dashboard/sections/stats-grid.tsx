import { StatsCard } from '../ui/stats-card'
import { Play, BookMarked, Clock, LayoutGrid } from 'lucide-react'

interface StatsGridProps {
  stats: {
    activeCourses: number
    completedModules: number
    dailyTime: string
    gpa: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
      <StatsCard
        icon={Play}
        label="Courses In Progress"
        value={`${stats.activeCourses} Active`}
        color="primary"
      />
      <StatsCard
        icon={BookMarked}
        label="Completed Modules"
        value={`${stats.completedModules} Total`}
        color="teal"
      />
      <StatsCard
        icon={Clock}
        label="Learning Momentum"
        value={stats.dailyTime}
        color="amber"
      />
      <StatsCard
        icon={LayoutGrid}
        label="Overall GPA"
        value={`${stats.gpa.toFixed(1)}`}
        color="rose"
      />
    </div>
  )
}
