import apiClient from '@/lib/api-client'
import type {
  Notification,
  NotificationListResponse,
} from '@/types/notification'

export const notificationService = {
  /**
   * Fetch all notifications for the authenticated user
   */
  async getAll(params?: {
    page?: number
    limit?: number
  }): Promise<NotificationListResponse> {
    const response = await apiClient.get('/api/notification', { params })
    const { data: rawData, meta: rawMeta } = response.data

    const mapNotification = (raw: any): Notification => {
      let title = raw.title || ''
      let description = raw.description || raw.body || raw.message || ''

      // Handle nested data mapping (common in Laravel/Go notifications)
      if (raw.data) {
        if (!title) title = raw.data.title || ''
        if (!description)
          description = raw.data.body || raw.data.message || raw.data.description || ''
      }

      // Handle JSON localized titles
      if (typeof title === 'string' && title.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(title)
          // Default to 'en' or first available language
          title = parsed.en || parsed.id || Object.values(parsed)[0] || title
        } catch (e) {
          // Keep original
        }
      }

      let notificationType = raw.type || 'system'
      if (notificationType === 'course_announcement')
        notificationType = 'announcement'

      return {
        id: raw.id,
        uuid: raw.uuid,
        title: title || 'System Update',
        description: description || 'New activity in your account',
        type: notificationType as any,
        read_at: raw.read_at,
        created_at: raw.created_at,
        data: raw.data,
      }
    }

    return {
      data: (rawData || []).map(mapNotification),
      meta: {
        total: rawMeta?.total || 0,
        page: rawMeta?.current_page || rawMeta?.page || 1,
        limit: rawMeta?.per_page || rawMeta?.limit || 10,
        unread_count: response.data.unread_count || 0,
      },
    }
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(uuid: string): Promise<void> {
    await apiClient.post(`/api/notification/${uuid}/read`)
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/api/notification/read-all')
  },

  /**
   * Delete a notification
   */
  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/notification/${uuid}`)
  },

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    await apiClient.delete('/api/notification')
  },
}
