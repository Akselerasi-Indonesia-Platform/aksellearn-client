import apiClient from '@/lib/api-client'
import type { CourseComment } from '@/types/course'


export const adminCourseCommentService = {
  async getAll(courseUuid: string): Promise<CourseComment[]> {
    const response = await apiClient.get(
      `/api/admin/course/${courseUuid}/comment`,
    )
    const data = response.data.data || response.data
    return Array.isArray(data) ? data : []
  },

  async toggleStatus(courseUuid: string, commentUuid: string, isActive: boolean): Promise<void> {
    await apiClient.post(
      `/api/admin/course/${courseUuid}/comment/${commentUuid}/toggle`,
      { is_active: isActive }
    )
  },

  async delete(courseUuid: string, commentUuid: string): Promise<void> {
    await apiClient.delete(
      `/api/admin/course/${courseUuid}/comment/${commentUuid}`,
    )
  },
}
