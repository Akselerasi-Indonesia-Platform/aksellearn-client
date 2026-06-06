import apiClient from '@/lib/api-client'
import type { Permission } from '@/types/permission'

interface RawApiPermission {
  id: number
  uuid: string
  name: string
  group_name?: string
  created_at?: string
}

function mapApiToPermission(data: RawApiPermission): Permission {
  return {
    id: data.uuid,
    name: data.name,
    groupName: data.group_name,
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminPermissionService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    permissions: Permission[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/permission', { params })
    const body = response.data

    const rawData = Array.isArray(body.data)
      ? body.data
      : Array.isArray(body)
        ? body
        : []
    const metaData = body.meta || {}

    const meta = {
      total:
        typeof metaData.total === 'number' ? metaData.total : rawData.length,
      page:
        typeof metaData.current_page === 'number'
          ? metaData.current_page
          : params?.page || 1,
      limit:
        typeof metaData.per_page === 'number'
          ? metaData.per_page
          : params?.limit || 10,
    }

    return {
      permissions: rawData.map(mapApiToPermission),
      meta,
    }
  },

  async getOne(uuid: string): Promise<Permission> {
    const response = await apiClient.get(`/api/admin/permission/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToPermission(data)
  },
}
