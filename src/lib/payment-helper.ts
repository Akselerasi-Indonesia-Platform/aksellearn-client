export interface ExtractedPaymentInfo {
  type: 'va' | 'bill' | 'cstore' | 'qris' | 'redirect' | 'other'
  bankName?: string
  accountNumber?: string
  billerCode?: string
  billKey?: string
  storeName?: string
  paymentCode?: string
  qrUrl?: string
  deeplinkUrl?: string
  paymentUrl?: string
  instructions?: string[]
}

export function extractPaymentDetails(rawInput: any): ExtractedPaymentInfo | null {
  if (!rawInput) return null

  let raw = rawInput
  if (typeof rawInput === 'string') {
    try {
      raw = JSON.parse(rawInput)
    } catch {
      return null
    }
  }

  // Support nested raw_response or response inside metadata
  if (raw.raw_response) {
    raw = raw.raw_response
  } else if (raw.metadata?.raw_response) {
    raw = raw.metadata.raw_response
  }

  const paymentType = raw.payment_type || raw.payment_method || ''

  // 1. Bank Transfer (VA Numbers)
  if (raw.va_numbers && raw.va_numbers.length > 0) {
    const vaInfo = raw.va_numbers[0]
    const bank = (vaInfo.bank || '').toUpperCase()
    return {
      type: 'va',
      bankName: bank,
      accountNumber: vaInfo.va_number,
      instructions: [
        `Select Transfer > Virtual Account on your ${bank} m-banking or ATM.`,
        `Enter the Virtual Account number: ${vaInfo.va_number}`,
        `Verify the payment amount and details, then authorize the transfer.`,
        `Your access will be activated immediately once payment is completed.`,
      ],
    }
  }

  // 2. Permata Bank Transfer (returns permata_va_number directly)
  if (raw.permata_va_number) {
    return {
      type: 'va',
      bankName: 'PERMATA',
      accountNumber: raw.permata_va_number,
      instructions: [
        'Select Transfer > Virtual Account on your Permata m-banking or ATM.',
        `Enter the Virtual Account number: ${raw.permata_va_number}`,
        'Verify the payment amount and details, then authorize the transfer.',
        'Your access will be activated immediately once payment is completed.',
      ],
    }
  }

  // 3. Mandiri Bill (Biller Code + Bill Key)
  if (raw.bill_key && raw.biller_code) {
    return {
      type: 'bill',
      bankName: 'MANDIRI',
      billerCode: raw.biller_code,
      billKey: raw.bill_key,
      instructions: [
        'Open Mandiri Livin app or go to Mandiri ATM.',
        'Select Payment > Multi Payment.',
        `Enter the Biller Code: ${raw.biller_code}`,
        `Enter the Bill Key (Nomor VA): ${raw.bill_key}`,
        'Confirm the merchant name and total price, then complete the transaction.',
      ],
    }
  }

  // 4. Convenience Store (Indomaret, Alfamart)
  if (raw.payment_code && (raw.store || paymentType.includes('cstore') || raw.payment_code)) {
    const store = (raw.store || 'convenience store').toUpperCase()
    return {
      type: 'cstore',
      storeName: store,
      paymentCode: raw.payment_code,
      instructions: [
        `Go to the nearest ${store} outlet.`,
        `Tell the cashier that you want to pay for a Midtrans/mc-clara transaction.`,
        `Provide the Payment Code: ${raw.payment_code}`,
        `Pay the cashier the exact amount specified.`,
        `Keep the receipt as proof of payment.`,
      ],
    }
  }

  // 5. QRIS / E-Wallets (GoPay, ShopeePay)
  if (raw.actions && raw.actions.length > 0) {
    const qrAction = raw.actions.find((a: any) => a.name === 'generate-qr-code')
    const deeplinkAction = raw.actions.find((a: any) => a.name === 'deeplink-redirect')
    
    if (qrAction || deeplinkAction) {
      return {
        type: 'qris',
        qrUrl: qrAction?.url,
        deeplinkUrl: deeplinkAction?.url,
        instructions: [
          'Scan the QR code using GoPay, ShopeePay, OVO, Dana, or any QRIS-compatible app.',
          'Alternatively, click the payment URL to open the payment application.',
          'Complete the payment within the app before the timeout.',
        ],
      }
    }
  }

  // 6. Generic redirect or payment URL
  if (raw.payment_url || raw.redirect_url) {
    return {
      type: 'redirect',
      paymentUrl: raw.payment_url || raw.redirect_url,
      instructions: [
        'Click the button below to be redirected to the secure payment page.',
        'Complete the payment via the gateway page to finalize your order.',
      ],
    }
  }

  return null
}
