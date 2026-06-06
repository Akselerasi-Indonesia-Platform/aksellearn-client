import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  CheckCircle2, 
  UserPlus, 
  BookOpen, 
  ShoppingCart,
  ShieldAlert
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'order_paid' | 'course_published' | 'user_registered' | 'role_assigned'
  actor: string
  target: string
  timestamp: string
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'order_paid',
    actor: 'John Doe',
    target: 'Fullstack Next.js Course',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: '2',
    type: 'user_registered',
    actor: 'Jane Smith',
    target: 'Platform',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: '3',
    type: 'course_published',
    actor: 'Admin',
    target: 'Advanced React Patterns',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '4',
    type: 'role_assigned',
    actor: 'Admin',
    target: 'Jane Smith (Instructor)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
]

export function ActivityTimeline() {
  const getActivityConfig = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order_paid':
        return { icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      case 'course_published':
        return { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'user_registered':
        return { icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
      case 'role_assigned':
        return { icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' }
    }
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {MOCK_ACTIVITIES.map((activity, index) => {
        const config = getActivityConfig(activity.type)
        const Icon = config.icon

        return (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${config.bg} ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {activity.type.replace('_', ' ')}
                </span>
                <time className="text-xs font-medium text-slate-500">
                  {formatDistanceToNow(new Date(activity.timestamp))} ago
                </time>
              </div>
              <div className="text-sm font-medium text-slate-700">
                <span className="font-bold text-slate-900">{activity.actor}</span>
                {' interacted with '}
                <span className="font-bold text-slate-900">{activity.target}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
