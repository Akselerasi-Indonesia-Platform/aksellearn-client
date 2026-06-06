'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void
    }
  }
}

export function useMidtrans() {
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Step 1: Fetch client key from dynamic config
        const response = await apiClient.get('/api/payment/methods')
        const clientKey = response.data.meta?.midtrans_client_key
        const isProduction = response.data.meta?.midtrans_is_production

        if (!clientKey) {
          console.warn(
            '[Midtrans] Client key not found in payment methods meta. Snapshotting as ready for potential direct URL redirection.',
          )
          // Set ready anyway to allow the "Complete Checkout" button to work.
          // The checkout service can still return a direct payment URL even without Snap.
          setIsReady(true)
          return
        }

        // Step 2: Inject Snap Script
        const snapScriptUrl = isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'

        if (!document.getElementById('midtrans-snap-script')) {
          const script = document.createElement('script')
          script.id = 'midtrans-snap-script'
          script.src = snapScriptUrl
          script.setAttribute('data-client-key', clientKey)
          script.onload = () => setIsReady(true)
          document.head.appendChild(script)
        } else {
          setIsReady(true)
        }
      } catch (error) {
        console.error('[Midtrans] Bootstrapping failed:', error)
      }
    }

    bootstrap()
  }, [])

  const snapPay = (snapToken: string) => {
    if (!window.snap) {
      toast.error('Payment system is not ready. Please refresh the page.')
      return
    }

    window.snap.pay(snapToken, {
      onSuccess: (result: any) => {
        toast.success('Payment successful!')
        navigate({
          to: '/student/order',
          search: { success: 'true', order_id: result.order_id },
        } as any)
      },
      onPending: (result: any) => {
        toast.info('Payment is pending. Please complete it soon.')
        navigate({
          to: '/student/order',
          search: { status: 'pending', order_id: result.order_id },
        } as any)
      },
      onError: (result: any) => {
        toast.error('Payment failed. Please try again.')
        console.error('[Midtrans] Payment error:', result)
      },
      onClose: () => {
        toast.warning('Payment was cancelled.')
      },
    })
  }

  return { isReady, snapPay }
}
