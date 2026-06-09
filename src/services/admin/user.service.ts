import apiClient from '@/lib/api-client'
import type { User } from '@/types/user'

interface RawApiUser {
  id: number
  uuid: string
  name: string
  email: string
  role_id: number
  role?: string | { name: string }
  roles?: (string | { name: string; uuid: string })[]
  permissions?: (string | { name: string })[]
  status?: string
  deleted_at?: string | null
  created_at?: string
  bio?: string
}

function mapApiUserToUser(data: RawApiUser): User {
  const roleMap: Record<number, User['role']> = {
    0: 'admin',
    1: 'editor',
    2: 'user',
  }

  const mappedRoles = (data.roles || []).map((r) =>
    typeof r === 'string' ? r : r.name,
  )

  const mappedPermissions = (data.permissions || []).map((p) =>
    typeof p === 'string' ? p : p.name,
  )

  const mainRole =
    typeof data.role === 'string'
      ? data.role
      : data.role?.name || roleMap[data.role_id] || 'user'

  return {
    id: data.uuid,
    db_id: data.id,
    name: data.name,
    email: data.email,
    role: mainRole as User['role'],
    roles: mappedRoles,
    permissions: mappedPermissions,
    bio: data.bio || '',
    status: (data.deleted_at ? 'inactive' : data.status || 'active') as
      | 'active'
      | 'inactive',
    createdAt: data.created_at || new Date().toISOString(),
  }
}

export const adminUserService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    role_uuid?: string
    status?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }): Promise<{
    users: User[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/user', { params })
    const body = response.data

    // The API structure is a standard Laravel resource response: { data: [], meta: { current_page, last_page, per_page, total, ... } }
    const rawUsers = Array.isArray(body.data) ? body.data : []
    const metaData = body.meta

    const meta = {
      total: Number(
        metaData?.total ??
          metaData?.pagination?.total ??
          body.total ??
          body.total_count ??
          body.total_items ??
          body.count ??
          body.pagination?.total ??
          rawUsers.length,
      ),
      page: Number(
        metaData?.current_page ??
          metaData?.pagination?.current_page ??
          body.current_page ??
          body.page ??
          body.pagination?.current_page ??
          params?.page ??
          1,
      ),
      limit: Number(
        metaData?.per_page ??
          metaData?.pagination?.per_page ??
          body.per_page ??
          body.limit ??
          body.pagination?.per_page ??
          params?.limit ??
          10,
      ),
    }

    const lastPage = Number(
      metaData?.last_page ??
        body.last_page ??
        metaData?.pagination?.last_page ??
        body.pagination?.last_page ??
        1,
    )

    // Ensure total is consistent with lastPage to force pagination UI visibility
    if (lastPage > 1 && meta.total <= meta.limit) {
      meta.total = lastPage * meta.limit
    }

    return {
      users: rawUsers.map(mapApiUserToUser),
      meta,
    }
  },

  async getOne(uuid: string): Promise<User> {
    const response = await apiClient.get(`/api/admin/user/${uuid}`)
    const data = response.data.data || response.data
    return mapApiUserToUser(data)
  },

  async create(user: Partial<User>): Promise<User> {
    const response = await apiClient.post('/api/admin/user', user)
    const data = response.data.data || response.data
    return mapApiUserToUser(data)
  },

  async update(uuid: string, user: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/api/admin/user/${uuid}`, user)
    const data = response.data.data || response.data
    return mapApiUserToUser(data)
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/user/${uuid}`)
  },

  async assignRoles(uuid: string, roles: string[]): Promise<User> {
    const response = await apiClient.post(
      `/api/admin/user/${uuid}/assign-roles`,
      { roles },
    )
    const data = response.data.data || response.data
    return mapApiUserToUser(data)
  },

  async assignPermissions(uuid: string, permissions: string[]): Promise<User> {
    const response = await apiClient.post(
      `/api/admin/user/${uuid}/assign-permissions`,
      { permissions },
    )
    const data = response.data.data || response.data
    return mapApiUserToUser(data)
  },
}
