import apiClient from '@/lib/api-client'

export interface CourseAttachment {
  uuid: string
  course_uuid: string
  media_uuid: string
  title: string
  description?: string
  order_weight: number
  is_active?: boolean
  media?: {
    uuid: string
    name: string
    original_name: string
    mime_type: string
    size: number
    url: string
    extension: string
  }
  created_at?: string
  updated_at?: string
}

export const adminCourseAttachmentService = {
  async getAll(courseUuid: string): Promise<CourseAttachment[]> {
    const response = await apiClient.get('/api/admin/course/attachment', {
      params: { course_uuid: courseUuid },
    })
    return response.data.data || []
  },

  async create(data: { course_uuid: string; media_uuid: string; title: string; description?: string; order_weight?: number; is_active?: boolean }): Promise<CourseAttachment> {
    const response = await apiClient.post('/api/admin/course/attachment', data)
    return response.data.data
  },

  async update(uuid: string, data: { title?: string; description?: string; order_weight?: number; is_active?: boolean }): Promise<CourseAttachment> {
    const response = await apiClient.put(`/api/admin/course/attachment/${uuid}`, data)
    return response.data.data
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/course/attachment/${uuid}`)
  },
}
