import apiClient from '@/lib/api-client'
import type { Banner, BannerPayload } from '@/types/banner'

export const adminBannerService = {
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    is_active?: string
  }): Promise<{
    banners: Banner[]
    meta: {
      total: number
      page: number
      limit: number
    }
  }> {
    const response = await apiClient.get('/api/admin/banners', { params })
    return {
      banners: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10 },
    }
  },

  async getOne(uuid: string): Promise<Banner> {
    const response = await apiClient.get(`/api/admin/banners/${uuid}`)
    return response.data.data || response.data
  },

  async create(data: BannerPayload): Promise<Banner> {
    const response = await apiClient.post('/api/admin/banners', data)
    return response.data.data
  },

  async update(uuid: string, data: Partial<BannerPayload>): Promise<Banner> {
    const response = await apiClient.patch(`/api/admin/banners/${uuid}`, data)
    return response.data.data
  },

  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/banners/${uuid}`)
  },

  async reorder(items: { uuid: string; sort_order: number }[]): Promise<void> {
    await apiClient.post('/api/admin/banners/reorder', { items })
  },
}
