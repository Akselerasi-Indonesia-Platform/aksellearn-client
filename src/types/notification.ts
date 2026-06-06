export type NotificationType =
  | 'order'
  | 'system'
  | 'user'
  | 'security'
  | 'announcement'

export interface Notification {
  id: string | number
  uuid: string
  title: string
  description: string
  type: NotificationType
  read_at: string | null
  created_at: string
  updated_at?: string
  data?: Record<string, any>
}

export interface NotificationListResponse {
  data: Notification[]
  meta: {
    total: number
    page: number
    limit: number
    unread_count: number
  }
}
