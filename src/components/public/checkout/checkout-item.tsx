import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CartItem } from '@/services/user/cart.service'

interface CheckoutItemProps {
  item: CartItem
  onRemove: (id: string) => void
}

export function CheckoutItem({ item, onRemove }: CheckoutItemProps) {
  const hasDiscount = item.base_price > item.final_price

  return (
    <div className="flex gap-4 py-4 border-b border-slate-100 last:border-0 group">
      <div className="size-20 sm:size-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
        {(item.image_url || item.thumbnail) ? (
          <img
            src={item.image_url || item.thumbnail}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={item.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            No Image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 leading-tight line-clamp-2 text-sm sm:text-base">
                {item.name}
              </h4>
              {(item.is_extension || item.is_enrolled || item.metadata?.is_extension || item.metadata?.is_enrolled) ? (
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 mt-1.5 uppercase tracking-widest">
                  Extension
                </span>
              ) : null}
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-slate-900">
                {formatCurrency(item.final_price)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-slate-400 line-through">
                  {formatCurrency(item.base_price)}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Digital Course Access</p>
        </div>
        <div className="flex items-center justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
