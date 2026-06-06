import apiClient from '@/lib/api-client'

export interface UserAssignment {
  uuid: string
  title: string
  description: string
  max_score: number
  passing_score: number
  attachment_uuid?: string | null
  submission?: UserAssignmentSubmission | null
}

export interface UserAssignmentSubmission {
  uuid: string
  status: 'pending' | 'graded' | 'returned'
  content: string
  attachment_uuid?: string | null
  score?: number | null
  feedback?: string | null
  submitted_at: string
}

export const userAssignmentService = {
  getAssignment: async (_courseUuid: string, moduleUuid: string): Promise<UserAssignment> => {
    // Actually the BE endpoint as per 10.2.2 is GET /api/course/assignment/{module_uuid}
    // But since it's nested under course, maybe it's /api/course/{course_uuid}/module/{module_uuid}/assignment
    // Let's assume /course/assignment/{module_uuid} if that's what was written in the spec,
    // or we'll use /user/course/${courseUuid}/module/${moduleUuid}/assignment if following REST pattern.
    // The spec says: GET /api/course/assignment/{module_uuid}
    const response = await apiClient.get(`/course/assignment/${moduleUuid}`)
    return response.data.data
  },

  submitAssignment: async (
    moduleUuid: string,
    data: { content: string; attachment_uuid?: string | null }
  ): Promise<UserAssignmentSubmission> => {
    // Spec: POST /api/course/assignment/{module_uuid}/submit
    const response = await apiClient.post(`/course/assignment/${moduleUuid}/submit`, data)
    return response.data.data
  },
}
