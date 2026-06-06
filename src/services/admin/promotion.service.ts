import apiClient from '@/lib/api-client'

export interface Promotion {
  id: number
  uuid: string
  title: string
  type: 'automatic' | 'voucher'
  discount_type: 'percentage' | 'fixed'
  value: number
  apply_to: 'course' | 'course_category' | 'global_course' | 'product' | 'product_category' | 'global_product' | 'global_all'
  priority: number
  combinable: boolean
  auto_apply: boolean
  per_user_limit: number
  usage_limit: number
  used_count: number
  max_cap?: number
  min_subtotal: number
  max_budget?: number
  start_at?: string
  end_at?: string
  scope_ids?: number[]
  scope_uuids?: string[]
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: number
  promotion_id?: number
  code: string
  usage_limit: number
  per_user_limit: number
  used_count: number
  is_active: boolean
  start_at?: string
  expired_at?: string
  created_at: string
  updated_at: string
  promotion?: Promotion
}

export const adminPromotionService = {
  // Admin Endpoints
  async getAll(params?: any): Promise<{ data: Promotion[]; meta: any }> {
    const response = await apiClient.get('/api/admin/promotions', { params })
    return response.data
  },
  async create(data: any): Promise<Promotion> {
    const response = await apiClient.post('/api/admin/promotions', data)
    return response.data.data || response.data
  },
  async update(id: number | string, data: any): Promise<Promotion> {
    const response = await apiClient.put(`/api/admin/promotions/${id}`, data)
    return response.data.data || response.data
  },
  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/api/admin/promotions/${id}`)
  },
  async getOne(id: number | string): Promise<Promotion> {
    const response = await apiClient.get(`/api/admin/promotions/${id}`)
    return response.data.data || response.data
  },
  async getUsageHistory(id: number | string, params?: any): Promise<{ data: any[]; meta: any }> {
    const response = await apiClient.get(`/api/admin/promotions/${id}/uses`, { params })
    return response.data
  },
  async getAllCoupons(params?: any): Promise<{ data: Coupon[]; meta: any }> {
    const response = await apiClient.get('/api/admin/coupons', { params })
    return response.data
  },
  async createCoupon(data: any): Promise<Coupon> {
    const response = await apiClient.post('/api/admin/coupons', data)
    return response.data.data || response.data
  },
  async deleteCoupon(id: number | string): Promise<void> {
    await apiClient.delete(`/api/admin/coupons/${id}`)
  }
}
