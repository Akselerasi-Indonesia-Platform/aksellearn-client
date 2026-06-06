import apiClient from '@/lib/api-client'
import type { CourseReview } from '@/types/course'

export const adminCourseReviewService = {
  /**
   * List Reviews (Global or Scoped per-course)
   * Uses the Flat Endpoint Pattern for better performance and moderation.
   */
  async getAll(params?: {
    course_uuid?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: CourseReview[]; meta: any }> {
    const response = await apiClient.get('/api/admin/course/review', {
      params: {
        course_uuid: params?.course_uuid,
        search: params?.search,
        current_page: params?.page,
        per_page: params?.limit,
      },
    })

    // Support both flattened and wrapped responses
    const data = response.data.data || response.data
    const meta = response.data.meta || {}

    return { data: Array.isArray(data) ? data : [], meta }
  },

  /**
   * Toggle Review Status (Visible / Hidden)
   * Uses the review UUID directly via the new flat moderation endpoint.
   */
  async toggleStatus(reviewUuid: string): Promise<void> {
    await apiClient.post(`/api/admin/course/review/${reviewUuid}/toggle`)
  },

  /**
   * Delete Review
   * Permanently removes a review using its direct UUID.
   */
  async delete(reviewUuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/course/review/${reviewUuid}`)
  },
}
