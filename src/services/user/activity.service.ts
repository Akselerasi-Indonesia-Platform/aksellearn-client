import apiClient from '@/lib/api-client'

export interface ActivityLog {
  uuid: string
  action: string
  description: string
  metadata?: Record<string, any>
  created_at: string
}

export const userActivityService = {
  /**
   * Get recent activities for the authenticated user
   */
  async getRecent(limit: number = 10): Promise<ActivityLog[]> {
    const response = await apiClient.get('/api/activity/recent', {
      params: { limit },
    })
    return response.data.data
  },

  /**
   * Log a new activity
   */
  async log(action: string, description: string, metadata?: Record<string, any>): Promise<void> {
    await apiClient.post('/api/activity/log', {
      action,
      description,
      metadata,
    })
  },
}
