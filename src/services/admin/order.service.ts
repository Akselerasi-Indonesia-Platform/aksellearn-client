import apiClient from '@/lib/api-client'

export interface OrderItem {
  id: number
  uuid: string
  title_snapshot: string
  price_at_purchase: number
  quantity: number
  fulfillment_status: string
  discount_amount?: number
  final_price?: number
  earning?: {
    gateway_fee: number
    platform_fee: number
    net_amount: number
  } | null
}

export interface OrderActivity {
  id: number
  uuid: string
  action: string
  description: string
  created_at: string
}

export interface Order {
  id: number
  uuid: string
  payment_method: string
  total_amount: number
  subtotal_amount: number
  tax_amount: number
  fee_amount: number
  payment_status: string
  created_at: string
  items: OrderItem[]
  activities: OrderActivity[]
  user?: {
    name: string
    email: string
  }
}

export interface RefundPayload {
  item_ids: string[] // Array of selected OrderItem UUIDs
  adjustment_amount: number // Optional reduction in refund amount (fees)
  reason: string
}

export const adminOrderService = {
  /**
   * Get all orders with optional filtering
   */
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  }): Promise<{
    orders: Order[]
    meta: any
  }> {
    const response = await apiClient.get('/api/admin/order', { params })
    return response.data
  },

  /**
   * Get specific order details (including item list for refund selection)
   */
  async getOne(uuid: string): Promise<Order> {
    const response = await apiClient.get(`/api/admin/order/${uuid}`)
    return response.data.data || response.data
  },

  /**
   * Process itemized refund
   */
  async refund(uuid: string, payload: any): Promise<void> {
    await apiClient.post(`/api/admin/order/${uuid}/refund`, payload)
  },

  /**
   * Cancel an order
   */
  async cancel(uuid: string, payload: { reason: string }): Promise<void> {
    await apiClient.post(`/api/admin/order/${uuid}/cancel`, payload)
  },

  /**
   * Delete an order
   */
  async delete(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/order/${uuid}`)
  },

  /**
   * Refresh payment status from gateway
   */
  async refresh(uuid: string): Promise<void> {
    await apiClient.post(`/api/admin/order/${uuid}/refresh`)
  },
}
