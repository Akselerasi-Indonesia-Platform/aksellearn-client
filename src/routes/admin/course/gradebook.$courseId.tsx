import * as React from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { adminCourseService } from '@/services/admin/course.service'
import apiClient from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Loader2, Users, Target, BookOpen } from 'lucide-react'
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

function GradebookPage() {
  const { courseId } = useParams({ from: '/admin/course/gradebook/$courseId' })
  const navigate = useNavigate()

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isAnalyticsError,
  } = useQuery({
    queryKey: ['admin', 'course', courseId, 'analytics'],
    queryFn: () => adminCourseService.getAnalytics(courseId),
    retry: 1, // Don't retry much since it might be 404
  })

  const {
    data: gradebook,
    isLoading: isLoadingGradebook,
    isError: isGradebookError,
  } = useQuery({
    queryKey: ['admin', 'course', courseId, 'gradebook'],
    queryFn: () => adminCourseService.getGradebook(courseId),
    retry: 1,
  })

  const isLoading = isLoadingAnalytics || isLoadingGradebook

  if (isLoading) {
    return (
      <AdminPage>
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AdminPage>
    )
  }

  // Graceful fallback while BE endpoints are under development
  if (isAnalyticsError || isGradebookError || (!analytics && !gradebook)) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
          <div className="size-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
            <BookOpen className="size-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Gradebook Coming Soon
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            The advanced Instructor Gradebook and Cohort Analytics engine is currently in the final stages of integration. 
            Check back soon to unlock deep insights into student progress, quiz performance, and completion heatmaps.
          </p>
          <Button
            onClick={() => navigate({ to: '/admin/course' })}
            variant="outline"
            className="mt-4 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="mr-2 size-4" /> Return to Courses
          </Button>
        </div>
      </AdminPage>
    )
  }

  // Fallbacks if data structure varies
  const totalEnrolled = analytics?.total_enrolled || gradebook?.length || 0
  const completionRate = analytics?.completion_rate || 0
  const avgGpa = analytics?.avg_gpa || 0

  const dropOffData = analytics?.drop_off || []
  const students = gradebook || []

  const handleExportCsv = async () => {
    try {
      const response = await apiClient.get(
        `/admin/course/${courseId}/gradebook`,
        {
          params: { format: 'csv' },
          responseType: 'blob',
        }
      )
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `gradebook_${courseId}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to export CSV', error)
      // Fallback to client-side if backend is not ready
      if (!students.length) return
      const headers = ['Name', 'Email', 'Progress (%)', 'GPA', 'Status', 'Last Accessed']
      const rows = students.map((s: any) => [
        s.name,
        s.email,
        s.progress_percentage || 0,
        s.gpa || 'N/A',
        s.status || 'Active',
        s.last_accessed ? format(new Date(s.last_accessed), 'yyyy-MM-dd') : 'N/A'
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map((r: any) => r.join(','))
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `gradebook_${courseId}_fallback.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <AdminPage>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            className="rounded-full"
            size="icon"
            variant="ghost"
            onClick={() => navigate({ to: '/admin/course' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Instructor Gradebook</h2>
            <p className="text-muted-foreground">
              Course analytics and student progress tracking.
            </p>
          </div>
        </div>
        <Button onClick={handleExportCsv} variant="outline" className="gap-2">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Module Drop-off Heatmap/Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Module Drop-off</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dropOffData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropOffData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="module_name" hide />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="drop_off_rate" fill="#818cf8" radius={[4, 4, 0, 0]} name="Drop-off %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No drop-off data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Student Progress Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {students.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={students.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="progress_percentage" stroke="#4f46e5" strokeWidth={3} name="Progress %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No progress data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gradebook Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">Student</th>
                  <th scope="col" className="px-6 py-3">Progress</th>
                  <th scope="col" className="px-6 py-3">GPA</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg">Last Access</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any, i: number) => (
                  <tr key={student.uuid || i} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{student.name}</span>
                        <span className="text-xs text-slate-400">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${student.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{student.progress_percentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {student.gpa || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${student.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.last_accessed ? format(new Date(student.last_accessed), 'MMM d, yyyy') : 'Never'}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No students enrolled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export const Route = createFileRoute('/admin/course/gradebook/$courseId')({
  component: GradebookPage,
})
