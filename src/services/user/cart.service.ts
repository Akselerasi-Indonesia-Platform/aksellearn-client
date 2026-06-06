import apiClient from '@/lib/api-client'

export interface CartItem {
  id: string
  uuid: string
  name: string
  base_price: number
  discount_amount: number
  final_price: number
  quantity: number
  purchasable_type?: string
  metadata?: Record<string, any> & { is_extension?: boolean; is_enrolled?: boolean }
  image_url?: string
  thumbnail?: string
  is_enrolled?: boolean
  is_extension?: boolean
}

export interface DiscountBreakdownItem {
  title: string
  amount: number
  type: 'automatic' | 'coupon'
}

export interface Cart {
  items: CartItem[]
  total_base_amount: number
  total_discount_amount: number
  total_final_amount: number
  total_items: number
  coupon_discount?: number
  promotion_discount?: number
  final_subtotal?: number
  discount_breakdown?: DiscountBreakdownItem[]
}

export const userCartService = {
  /**
   * Fetch current cart content
   */
  async get(): Promise<Cart> {
    const response = await apiClient.get('/api/cart')
    return response.data.data || response.data
  },

  /**
   * Validate and apply coupon to cart
   */
  async validateCoupon(code: string): Promise<Cart> {
    const response = await apiClient.post('/api/cart/validate-coupon', { coupon_code: code })
    return response.data.data || response.data
  },

  /**
   * Add item to cart (Final Strategy - UUID)
   */
  async addItem(data: {
    id: string
    type: 'course' | 'bundle'
    quantity?: number
  }): Promise<Cart> {
    const response = await apiClient.post('/api/cart/item', {
      purchasable_type: data.type,
      purchasable_id: data.id,
      quantity: data.quantity || 1,
    })
    return response.data.data || response.data
  },

  /**
   * Update item quantity
   */
  async updateQuantity(data: { id: string; quantity: number }): Promise<Cart> {
    const response = await apiClient.put('/api/cart/item', data)
    return response.data.data
  },

  /**
   * Remove specific item
   */
  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete('/api/cart/item', {
      data: { id: itemId },
    })
    return response.data.data
  },

  /**
   * Empty the cart
   */
  async clear(): Promise<void> {
    await apiClient.delete('/api/cart/clear')
  },
}
