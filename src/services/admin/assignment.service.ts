import apiClient from '@/lib/api-client'

export interface Assignment {
  id: number
  uuid: string
  module_id: number
  title: string
  description: string
  max_score: number
  passing_score: number
  attachment_uuid?: string | null
  attachment?: any
  created_at?: string
  updated_at?: string
}

export interface AssignmentSubmission {
  id: number
  uuid: string
  assignment_id: number
  user_id: number
  status: 'pending' | 'graded' | 'returned'
  content: string
  attachment_uuid?: string | null
  attachment?: any
  score?: number | null
  feedback?: string | null
  submitted_at: string
  user?: {
    name: string
    email: string
  }
}

export const adminAssignmentService = {
  create: async (
    courseUuid: string,
    moduleUuid: string,
    data: Partial<Assignment>
  ): Promise<Assignment> => {
    const response = await apiClient.post(
      `/admin/course/${courseUuid}/module/${moduleUuid}/assignment`,
      data
    )
    return response.data.data
  },

  update: async (
    courseUuid: string,
    moduleUuid: string,
    assignmentUuid: string,
    data: Partial<Assignment>
  ): Promise<Assignment> => {
    const response = await apiClient.put(
      `/admin/course/${courseUuid}/module/${moduleUuid}/assignment/${assignmentUuid}`,
      data
    )
    return response.data.data
  },

  getSubmissions: async (
    courseUuid: string,
    moduleUuid: string,
    assignmentUuid: string
  ): Promise<AssignmentSubmission[]> => {
    const response = await apiClient.get(
      `/admin/course/${courseUuid}/module/${moduleUuid}/assignment/${assignmentUuid}/submission`
    )
    return response.data.data
  },

  gradeSubmission: async (
    courseUuid: string,
    moduleUuid: string,
    assignmentUuid: string,
    submissionUuid: string,
    data: { score: number; feedback?: string; status: 'graded' | 'returned' }
  ): Promise<AssignmentSubmission> => {
    const response = await apiClient.put(
      `/admin/course/${courseUuid}/module/${moduleUuid}/assignment/${assignmentUuid}/submission/${submissionUuid}/grade`,
      data
    )
    return response.data.data
  },
}
