import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Cart } from '@/services/user/cart.service'

interface CheckoutSummaryProps {
  cart: Cart
  isPending: boolean
  isSnapReady: boolean
  canCheckout: boolean
  onCheckout: () => void
  selectedMethodName?: string
}

export function CheckoutSummary({
  cart,
  isPending,
  isSnapReady,
  canCheckout,
  onCheckout,
  selectedMethodName,
}: CheckoutSummaryProps) {
  const hasDiscount = cart.total_discount_amount > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Original Price</span>
          <span className="text-slate-900 font-medium">
            {formatCurrency(cart.total_base_amount)}
          </span>
        </div>

        {cart.discount_breakdown && cart.discount_breakdown.length > 0 ? (
          cart.discount_breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-emerald-600">
              <span className="flex items-center gap-1.5 font-medium">
                {item.title}
                {item.type === 'coupon' && (
                  <span className="text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 uppercase tracking-wider">
                    Coupon
                  </span>
                )}
              </span>
              <span className="font-bold">
                -{formatCurrency(item.amount)}
              </span>
            </div>
          ))
        ) : hasDiscount ? (
          <div className="flex justify-between text-sm text-emerald-600">
            <span className="flex items-center gap-2 font-medium">
              Discounts
            </span>
            <span className="font-bold">
              -{formatCurrency(cart.total_discount_amount)}
            </span>
          </div>
        ) : null}

        <Separator className="bg-slate-100" />

        <div className="flex justify-between items-baseline pt-2">
          <span className="text-base font-bold text-slate-900">Total</span>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(cart.total_final_amount)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-emerald-600 font-bold mt-1">
                You save {formatCurrency(cart.total_discount_amount)}!
              </p>
            )}
          </div>
        </div>

        {selectedMethodName && (
          <>
            <Separator className="bg-slate-100" />
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="text-[#0D3A6E] font-black uppercase text-xs tracking-wider">
                {selectedMethodName}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <Button
          disabled={!canCheckout || isPending || !isSnapReady}
          onClick={onCheckout}
          variant="card-enroll"
          size="xl"
          className="w-full rounded-xl font-bold shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all gap-2 uppercase tracking-wider"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <CreditCard className="size-5" />
              Complete Checkout
            </>
          )}
        </Button>
        
        <p className="text-[11px] text-center text-slate-400 leading-relaxed">
          By completing your purchase, you agree to our{' '}
          <a href="#" className="text-primary hover:underline font-semibold">
            Terms of Service
          </a>{' '}
          and acknowledge our{' '}
          <a href="#" className="text-primary hover:underline font-semibold">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  )
}
