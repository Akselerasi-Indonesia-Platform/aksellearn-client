import apiClient from '@/lib/api-client'

export interface DashboardStats {
  courses: {
    total: number
    total_views: number
    total_enrolled: number
    average_progress: number
    total_modules: number
    total_video_time: number
  }
  revenue: {
    total: number
    monthly: number
    currency: string
  }
  engagement: {
    total_students: number
  }
  meta: {
    can_manage_all: boolean
    server_time: string
  }
}

export interface DashboardParams {
  course_uuid?: string
  period?: string
  month?: number
  year?: number
  date_from?: string
  date_to?: string
}

export interface TrendData {
  date: string
  views: number
  enrollments: number
}

export interface TrendParams {
  period?: string
  month?: number
  year?: number
  course_uuid?: string
  date_from?: string
  date_to?: string
}

export const adminDashboardService = {
  async getStats(params?: DashboardParams): Promise<DashboardStats> {
    const response = await apiClient.get('/api/admin/dashboard/stats', {
      params,
    })
    return response.data.data || response.data
  },

  async getTrends(params: TrendParams): Promise<TrendData[]> {
    const response = await apiClient.get('/api/admin/dashboard/trends', {
      params,
    })
    return response.data.data || response.data
  },
}
