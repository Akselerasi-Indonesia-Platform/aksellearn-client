import * as React from 'react'
import { Plus, Users, Search, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-6">
      <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <Link to="/admin/course">
          <Plus className="w-4 h-4 text-emerald-500" />
          Add Course
        </Link>
      </Button>

      <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <Link to="/admin/user">
          <Users className="w-4 h-4 text-blue-500" />
          Add User
        </Link>
      </Button>

      <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <Link to="/admin/order" search={{ status: 'pending', page: 1, limit: 10, search: '' }}>
          <Search className="w-4 h-4 text-amber-500" />
          Pending Orders
        </Link>
      </Button>

      <Button variant="outline" className="h-10 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
        <DownloadCloud className="w-4 h-4 text-indigo-500" />
        Export Report
      </Button>
    </div>
  )
}
