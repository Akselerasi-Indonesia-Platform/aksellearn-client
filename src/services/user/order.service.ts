import apiClient from '@/lib/api-client'

export interface OrderItem {
  id: number
  purchasable_type: string
  purchasable_id: number
  title_snapshot: string
  quantity: number
  price_at_purchase: number
  fulfillment_status: string
}

export interface Order {
  id: number
  uuid: string
  total_amount: number
  status:
    | 'pending'
    | 'paid'
    | 'expired'
    | 'failed'
    | 'refunded'
    | 'partially_refunded'
  created_at: string
  items: OrderItem[]
  payment_method?: string
  snap_token?: string
  payment_url?: string
  metadata?: Record<string, any>
}

export interface OrderListResponse {
  data: Order[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export const userOrderService = {
  /**
   * Get purchase history for the authenticated student
   */
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<OrderListResponse> {
    const response = await apiClient.get('/api/orders', { params })
    return response.data
  },

  /**
   * Get specific order details
   */
  async getOne(uuid: string): Promise<Order> {
    const response = await apiClient.get(`/api/orders/${uuid}`)
    return response.data.data || response.data
  },

  /**
   * Get the most recent pending + unpaid order for the user
   */
  async getPending(): Promise<Order | null> {
    try {
      const response = await apiClient.get('/api/orders/pending')
      if (response.data?.data === null) return null
      return response.data?.data || null
    } catch (error) {
      return null
    }
  },

  /**
   * Cancel the order and move items back to the cart
   */
  async restore(uuid: string): Promise<void> {
    await apiClient.post('/api/orders/restore', { uuid })
  },
}
