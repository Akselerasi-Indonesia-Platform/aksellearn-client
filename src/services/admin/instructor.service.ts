import apiClient from '@/lib/api-client'

export interface InstructorRevenueStat {
  total_revenue: number
  total_courses: number
  total_students: number
  total_sales: number
}

export interface RevenueBreakdown {
  course_uuid: string
  course_title: string
  sales_count: number
  revenue: number
}

export interface InstructorRevenueResponse {
  stats: InstructorRevenueStat
  breakdown: RevenueBreakdown[]
}

export const adminInstructorService = {
  async getRevenue(): Promise<InstructorRevenueResponse> {
    const response = await apiClient.get('/api/instructor/revenue')
    return response.data.data || response.data
  },
}
