import apiClient from '@/lib/api-client'

export interface B2BInvitation {
  uuid: string
  organization_name: string
  course_title: string
  course_thumbnail?: string
  invited_email: string
  status: 'pending' | 'claimed' | 'expired'
}

export const userB2BService = {
  /**
   * Get invitation details
   */
  async getInvitation(uuid: string): Promise<B2BInvitation> {
    const response = await apiClient.get(`/api/b2b/activate/${uuid}`)
    return response.data.data || response.data
  },

  /**
   * Claim/Activate the invitation
   */
  async activate(uuid: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/api/b2b/activate/${uuid}`)
    return response.data.data || response.data
  },
}
