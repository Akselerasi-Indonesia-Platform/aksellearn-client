import apiClient from '@/lib/api-client'
import type { Role } from '@/types/role'

interface RawApiRole {
  id: number
  uuid: string
  name: string
  permissions?: { name: string }[] | string[]
  created_at?: string
}

function mapApiToRole(data: RawApiRole): Role {
  return {
    id: data.uuid,
    name: data.name,
    permissions: Array.isArray(data.permissions)
      ? data.permissions.map((p: any) => (typeof p === 'string' ? p : p.name))
      : [],
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminRoleService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    roles: Role[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/role', { params })
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
      roles: rawData.map(mapApiToRole),
      meta,
    }
  },

  async getOne(uuid: string): Promise<Role> {
    const response = await apiClient.get(`/api/admin/role/${uuid}`)
    const data = response.data.data || response.data
    return mapApiToRole(data)
  },

  async create(role: { name: string }): Promise<Role> {
    const response = await apiClient.post('/api/admin/role', role)
    const data = response.data.data || response.data
    return mapApiToRole(data)
  },

  async update(uuid: string, role: { name: string }): Promise<Role> {
    const response = await apiClient.put(`/api/admin/role/${uuid}`, role)
    const data = response.data.data || response.data
    return mapApiToRole(data)
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/role/${uuid}`)
  },

  async assignPermissions(uuid: string, permissions: string[]): Promise<Role> {
    const response = await apiClient.post(
      `/api/admin/role/${uuid}/assign-permissions`,
      { permissions },
    )
    const data = response.data.data || response.data
    return mapApiToRole(data)
  },

  async getOptions(): Promise<{ label: string; value: string }[]> {
    const response = await apiClient.get('/api/admin/role/option')
    const items = response.data.data || response.data
    if (!Array.isArray(items)) return []
    return items.map((item: any) => ({
      label: item.label || item.name || '',
      value: item.value || item.uuid || item.id?.toString() || '',
    }))
  },
}
