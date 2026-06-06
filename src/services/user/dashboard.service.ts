import apiClient from '@/lib/api-client'

export interface DashboardSummary {
  streak: number
  gpa: number
  total_enrolled: number
  completion_rate: number
  recent_courses: any[]
  recent_activities: any[]
  in_progress_courses?: number
  completed_courses?: number
  total_certificates?: number
  pending_assignments_count?: number
  certificates?: any[]
  pending_assignments?: any[]
}

export const userDashboardService = {
  /**
   * Get the dashboard summary data for the authenticated student
   */
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get('/api/dashboard')
    return response.data.data || response.data
  },
}
