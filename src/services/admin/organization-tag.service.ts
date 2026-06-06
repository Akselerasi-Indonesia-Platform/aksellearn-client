import apiClient from '@/lib/api-client'
import type { OrganizationTag } from '@/types/organization'

export const adminOrganizationTagService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{
    tags: OrganizationTag[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/organization/tag', { params })
    return {
      tags: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10 },
    }
  },

  async getOptions(): Promise<{ label: string; value: string }[]> {
    const response = await apiClient.get('/api/admin/organization/tag/option')
    const data = response.data.data || response.data || []
    return data.map((item: { uuid: string; name: string }) => ({
      label: item.name,
      value: item.uuid,
    }))
  },

  async create(data: { name: string; description?: string }): Promise<OrganizationTag> {
    const response = await apiClient.post('/api/admin/organization/tag', data)
    return response.data.data
  },

  async update(
    uuid: string,
    data: { name: string; description?: string },
  ): Promise<OrganizationTag> {
    const response = await apiClient.put(`/api/admin/organization/tag/${uuid}`, data)
    return response.data.data
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/organization/tag/${uuid}`)
  },
}
