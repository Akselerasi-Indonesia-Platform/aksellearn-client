// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

import {
  renderHook,
  waitFor,
  render,
  screen,
  fireEvent,
} from '@testing-library/react'
import { useMidtrans } from '@/hooks/use-midtrans'
import { userPaymentService } from '@/services/user/payment.service'
import { adminOrderService } from '@/services/admin/order.service'
import { OrderRefundModal } from '@/components/admin/orders/order-refund-modal'
import apiClient from '@/lib/api-client'

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('Midtrans Commerce Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = ''
    // Reset window.snap
    delete (window as any).snap
  })

  describe('userPaymentService', () => {
    it('should fetch payment methods with correct meta keys', async () => {
      const mockData = {
        methods: [{ id: '1', name: 'Credit Card', code: 'cc' }],
        meta: {
          midtrans_client_key: 'test-key',
          midtrans_is_production: false,
        },
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })

      const result = await userPaymentService.getMethods()
      expect(result.meta.midtrans_client_key).toBe('test-key')
      expect(apiClient.get).toHaveBeenCalledWith('/api/payment/methods')
    })

    it('should initiate checkout with itemized payload', async () => {
      const payload: any = { items: [{ id: 'course-1', type: 'course' }] }
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { order_uuid: 'order-123' },
      })

      await userPaymentService.checkout(payload)
      expect(apiClient.post).toHaveBeenCalledWith('/api/checkout', payload, {
        headers: {},
      })
    })
  })

  describe('useMidtrans Hook', () => {
    it('should inject sandbox script when midtrans_is_production is false', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          meta: {
            midtrans_client_key: 'sb-key-123',
            midtrans_is_production: false,
          },
        },
      })

      renderHook(() => useMidtrans())

      await waitFor(() => {
        const script = document.getElementById(
          'midtrans-snap-script',
        ) as HTMLScriptElement
        expect(script).toBeTruthy()
        expect(script.src).toContain('app.sandbox.midtrans.com')
        expect(script.getAttribute('data-client-key')).toBe('sb-key-123')
      })
    })

    it('should inject production script when midtrans_is_production is true', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          meta: {
            midtrans_client_key: 'prod-key-456',
            midtrans_is_production: true,
          },
        },
      })

      renderHook(() => useMidtrans())

      await waitFor(() => {
        const script = document.getElementById(
          'midtrans-snap-script',
        ) as HTMLScriptElement
        expect(script.src).toContain('app.midtrans.com')
      })
    })
  })

  describe('Admin Refund Panel (OrderRefundModal)', () => {
    const mockOrder: any = {
      uuid: 'order-ref-123',
      total_amount: 200,
      items: [
        {
          uuid: 'item-1',
          name: 'Go Mastery',
          final_price: 100,
          status: 'paid',
        },
        {
          uuid: 'item-2',
          name: 'React Advanced',
          final_price: 100,
          status: 'paid',
        },
      ],
    }

    it('should calculate net refund credit based on selection and adjustment', () => {
      render(
        <OrderRefundModal
          order={mockOrder}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      // Select first item
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Check display (100 - 0 = 100)
      expect(screen.getByText('$100')).toBeTruthy()

      // Add adjustment
      const adjustmentInput = screen.getByLabelText(/Adjustment Amount/i)
      fireEvent.change(adjustmentInput, { target: { value: '10' } })

      // Check display (100 - 10 = 90)
      expect(screen.getByText('$90')).toBeTruthy()
    })

    it('should prevent submission if no items selected', async () => {
      const mockRefund = vi
        .spyOn(adminOrderService, 'refund')
        .mockResolvedValueOnce()

      render(
        <OrderRefundModal
          order={mockOrder}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      )

      const submitBtn = screen.getByText(/Process Refund/i)
      fireEvent.click(submitBtn)

      expect(mockRefund).not.toHaveBeenCalled()
    })
  })
})
