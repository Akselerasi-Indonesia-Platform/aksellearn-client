import apiClient from '@/lib/api-client'

export interface AuditLog {
  id: number
  entity_type: string
  entity_id: number
  action: string
  actor_id: number | null
  actor_role: string | null
  payload: any
  created_at: string
}

export interface AuditLogResponse {
  data: AuditLog[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export const adminAuditLogService = {
  async getLogs(params?: {
    entity_type?: string
    entity_id?: number
    page?: number
    limit?: number
    date_from?: string
    date_to?: string
  }): Promise<AuditLogResponse> {
    const response = await apiClient.get('/api/admin/audit-logs', { params })
    const body = response.data
    return {
      data: body.data || [],
      meta: {
        total: body.meta?.total || 0,
        page: body.meta?.current_page || params?.page || 1,
        limit: body.meta?.per_page || params?.limit || 20,
      }
    }
  },

  async getActivityLogs(params?: {
    entity_type?: string
    entity_id?: number
    actor_id?: number
    actor_role?: string
    action?: string
    page?: number
    limit?: number
    date_from?: string
    date_to?: string
  }): Promise<AuditLogResponse> {
    const response = await apiClient.get('/api/admin/activity-logs', { params })
    const body = response.data
    return {
      data: body.data || [],
      meta: {
        total: body.meta?.total || 0,
        page: body.meta?.current_page || params?.page || 1,
        limit: body.meta?.per_page || params?.limit || 20,
      }
    }
  }
}
