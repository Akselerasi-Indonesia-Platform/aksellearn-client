import apiClient from '@/lib/api-client'
import { ApplicationStatus, InstructorApplication, ApplyPayload } from '@/types/instructor-application'

export const instructorApplicationService = {
  async getStatus(): Promise<{ data: ApplicationStatus | null }> {
    return apiClient.get('/api/instructor/apply/status').then(res => res.data)
  },

  async apply(payload: ApplyPayload): Promise<{ data: ApplicationStatus }> {
    return apiClient.post('/api/instructor/apply', payload).then(res => res.data)
  },

  async adminIndex(params?: any): Promise<{ data: InstructorApplication[], meta: any }> {
    return apiClient.get('/api/admin/instructor-applications', { params }).then(res => res.data)
  },

  async adminFind(uuid: string): Promise<{ data: InstructorApplication }> {
    return apiClient.get(`/api/admin/instructor-applications/${uuid}`).then(res => res.data)
  },

  async adminReview(uuid: string): Promise<any> {
    return apiClient.post(`/api/admin/instructor-applications/${uuid}/review`).then(res => res.data)
  },

  async adminAccept(uuid: string): Promise<any> {
    return apiClient.post(`/api/admin/instructor-applications/${uuid}/accept`).then(res => res.data)
  },

  async adminReject(uuid: string, note?: string): Promise<any> {
    return apiClient.post(`/api/admin/instructor-applications/${uuid}/reject`, { rejection_note: note }).then(res => res.data)
  }
}

