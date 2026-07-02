import * as React from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminCourseService } from '@/services/admin/course.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Users, Target, BookOpen, Clock, CheckCircle, Eye, ArrowLeft } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { format } from 'date-fns'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'
import { PageHeader } from '@/components/admin/shared/layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getToken } from '@/lib/auth'
import { Column, DataTable } from '@/components/admin/shared/data'
import { StatusBadge } from '@/components/admin/shared/status'

export interface ModuleProgress {
  module_id: number;
  is_completed: boolean;
  score: number | null;
  last_position_seconds: number | null;
}

export interface StudentGrade {
  name: string;
  email: string;
  progress_percentage: number;
  gpa: number;
  completed_at: string | null;
  last_accessed: string | null;
  module_progress: ModuleProgress[];
}

function GradebookPage() {
  const { courseId } = useParams({ from: '/admin/course/gradebook/$courseId' })
  const navigate = useNavigate()

  // 1. Fetch course details for module mapping
  const {
    data: course,
    isLoading: isLoadingCourse,
  } = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => adminCourseService.getOne(courseId),
  })

  // 2. Fetch Gradebook
  const {
    data: gradebook,
    isLoading: isLoadingGradebook,
  } = useQuery({
    queryKey: ['admin', 'course', courseId, 'gradebook'],
    queryFn: () => adminCourseService.getGradebook(courseId),
    retry: 1,
  })

  // 3. Analytics (Optional, just keep the chart if data comes)
  const {
    data: analytics,
  } = useQuery({
    queryKey: ['admin', 'course', courseId, 'analytics'],
    queryFn: () => adminCourseService.getAnalytics(courseId),
    retry: false,
  })

  const isLoading = isLoadingCourse || isLoadingGradebook

  const students: StudentGrade[] = Array.isArray(gradebook) ? gradebook : (gradebook?.data || [])
  const totalEnrolled = students.length
  
  const totalProgress = students.reduce((sum, s) => sum + (s.progress_percentage || 0), 0)
  const completionRate = totalEnrolled ? Math.round(totalProgress / totalEnrolled) : 0
  
  const gpaStudents = students.filter(s => s.gpa !== null && s.gpa !== undefined && !isNaN(s.gpa))
  const totalGpa = gpaStudents.reduce((sum, s) => sum + Number(s.gpa), 0)
  const avgGpa = gpaStudents.length ? (totalGpa / gpaStudents.length).toFixed(1) : 0

  const dropOffData = analytics?.drop_off || []

  const getModuleTitle = (moduleId: number) => {
    if (!course || !course.modules) return `Module ${moduleId}`
    const mod = course.modules.find(m => (m as any).db_id === moduleId || m.id === String(moduleId) || (m as any).id === moduleId)
    return mod?.title || `Module ${moduleId}`
  }

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleExportCsv = () => {
    const baseUrl =
      (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL) ||
      import.meta.env.VITE_API_URL ||
      ''
    
    let url = `${baseUrl}/api/admin/course/${courseId}/gradebook?format=csv`
    const token = getToken()
    if (token) {
      url += `&token=${token}`
    }
    
    const a = document.createElement('a')
    a.href = url
    a.download = `gradebook_${courseId}.csv`
    a.click()
  }

  const columns: Column<StudentGrade>[] = [
    {
      header: 'Student',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.email}</span>
        </div>
      ),
    },
    {
      header: 'Progress',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${item.progress_percentage || 0}%` }}
            />
          </div>
          <span className="text-xs font-bold">{item.progress_percentage || 0}%</span>
        </div>
      ),
    },
    {
      header: 'GPA',
      cell: (item) => (
        <span className="font-semibold text-slate-700">
          {item.gpa !== null && item.gpa !== undefined && !isNaN(item.gpa) ? Number(item.gpa).toFixed(1) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => (
        <StatusBadge
          status={(item.progress_percentage || 0) === 100}
          labels={{
            true: 'Completed',
            false: 'Active',
          }}
        />
      ),
    },
    {
      header: 'Last Access',
      cell: (item) => (
        item.last_accessed ? format(new Date(item.last_accessed), 'MMM d, yyyy') : 'Never'
      ),
    },
    {
      header: 'Action',
      headerClassName: 'text-center',
      cell: (item) => (
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="size-4" /> Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Progress Details: {item.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {!item.module_progress || item.module_progress.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">No module progress data available.</div>
                ) : (
                  <div className="grid gap-3">
                    {item.module_progress.map((mod, midx) => (
                      <div key={midx} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          {mod.is_completed ? (
                            <CheckCircle className="size-5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="size-5 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800">
                              {getModuleTitle(mod.module_id)}
                            </span>
                            {mod.last_position_seconds !== null && mod.last_position_seconds > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Clock className="size-3" />
                                Left off at {formatSeconds(mod.last_position_seconds)}
                              </div>
                            )}
                          </div>
                        </div>
                        {mod.score !== null && (
                          <Badge variant="outline" className="bg-white">
                            Score: {mod.score}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ]

  return (
    <AdminPage>
      <div className="mb-4">
        <Button
          className="rounded-full gap-2 mb-4"
          size="sm"
          variant="ghost"
          onClick={() => navigate({ to: '/admin/course' })}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Button>
      </div>

      <PageHeader
        title="Instructor Gradebook"
        description={`Course analytics and student progress tracking for ${course?.title || 'the course'}`}
        actions={
          <Button onClick={handleExportCsv} variant="outline" className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">Active students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGpa || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">From quizzes</p>
          </CardContent>
        </Card>
      </div>

      {dropOffData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Module Drop-off</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropOffData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="module_name" hide />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="drop_off_rate" fill="#818cf8" radius={[4, 4, 0, 0]} name="Drop-off %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Student Progress Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={students.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="progress_percentage" stroke="#4f46e5" strokeWidth={3} name="Progress %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        <DataTable
          data={students}
          columns={columns}
          isLoading={isLoadingGradebook}
          emptyMessage="No students enrolled yet."
        />
      </div>
    </AdminPage>
  )
}

export const Route = createFileRoute('/admin/course/gradebook/$courseId')({
  component: GradebookPage,
})
