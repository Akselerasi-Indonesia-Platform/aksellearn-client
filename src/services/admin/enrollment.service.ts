import apiClient from '@/lib/api-client'

export interface EnrollmentFilters {
  page?: number
  limit?: number
  search?: string
  user_uuid?: string
  course_uuid?: string
  category_uuid?: string
  organization_uuid?: string
  status?: string
  created_from?: string
  created_to?: string
  expired_from?: string
  expired_to?: string
}

export interface Enrollment {
  uuid: string
  user_id: number
  course_id: number
  organization_id?: number
  user: {
    uuid: string
    name: string
    email: string
  }
  course: {
    uuid: string
    title: string
  }
  organization?: {
    uuid: string
    name: string
    logo?: string
  }
  status: string
  progress_percentage: number
  gpa: number
  created_at: string
  expired_at?: string
}

export const adminEnrollmentService = {
  async getAll(
    params?: EnrollmentFilters,
  ): Promise<{ data: Enrollment[]; meta: any }> {
    const response = await apiClient.get('/api/admin/course/enrollment', {
      params: {
        ...params,
        per_page: params?.limit || 10,
        current_page: params?.page || 1,
      },
    })
    return response.data
  },

  async grantManualAccess(data: {
    user_uuid: string
    course_uuid: string
    starts_at?: string
    expires_at?: string
  }) {
    const response = await apiClient.post('/api/admin/course/enrollment', data)
    return response.data
  },

  async revokeAccess(uuid: string) {
    const response = await apiClient.delete(
      `/api/admin/course/enrollment/${uuid}`,
    )
    return response.data
  },

  async importCSV(
    file: File,
    courseUuid: string,
    organizationUuid?: string,
    startsAt?: string,
    expiresAt?: string,
  ) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('course_uuid', courseUuid)
    if (organizationUuid) {
      formData.append('organization_uuid', organizationUuid)
    }
    if (startsAt) {
      formData.append('starts_at', startsAt)
    }
    if (expiresAt) {
      formData.append('expires_at', expiresAt)
    }
    const response = await apiClient.post(
      '/api/admin/course/enrollment/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data.data
  },
}
