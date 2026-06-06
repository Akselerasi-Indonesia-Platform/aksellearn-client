import apiClient from '@/lib/api-client'

export interface PaymentMethod {
  id: number
  code: string
  name: string
  is_active: boolean
  priority: number
  description?: string
  image_url: string
  driver: string
  fee_flat: number
  fee_pct: number
}

export const adminPaymentMethodService = {
  async getAll() {
    const response = await apiClient.get('/api/admin/payment-method')
    return response.data // Should return { data: PaymentMethod[] }
  },

  async update(id: number, data: { is_active?: boolean; priority?: number }) {
    const response = await apiClient.put(
      `/api/admin/payment-method/${id}`,
      data,
    )
    return response.data
  },
}
