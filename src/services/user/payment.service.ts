import apiClient from '@/lib/api-client'

export interface PaymentMethod {
  id: number | string
  name: string
  code: string
  image_url?: string
  driver: string
  is_active: boolean
  priority: number
}

export interface CheckoutPayload {
  coupon_code?: string
  payment_method_id?: string | number
  customer_note?: string
}

export interface CheckoutResponse {
  order: {
    uuid: string
  }
  payment_init: {
    reference_id: string // Snap Token
    payment_url: string
  }
}

export const userPaymentService = {
  /**
   * Fetch available payment methods and dynamic config (Client Keys)
   */
  async getMethods(): Promise<{
    data: PaymentMethod[]
    meta: { midtrans_client_key: string; midtrans_is_production: boolean }
  }> {
    const response = await apiClient.get('/api/payment/methods')
    return response.data
  },

  /**
   * Initiate checkout process
   */
  async checkout(
    payload: CheckoutPayload,
    idempotencyKey?: string,
  ): Promise<CheckoutResponse> {
    const response = await apiClient.post('/api/checkout', payload, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    })
    return response.data.data || response.data
  },
}
