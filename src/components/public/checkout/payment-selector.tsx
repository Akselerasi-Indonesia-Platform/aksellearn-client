import { Check, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentMethod {
  id: string | number
  name: string
  image_url?: string
}

interface PaymentSelectorProps {
  methods: PaymentMethod[]
  selectedId: string | number | null
  onSelect: (id: string | number) => void
}

export function PaymentSelector({
  methods,
  selectedId,
  onSelect,
}: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {methods.map((method) => {
        const isSelected = selectedId === method.id
        return (
          <div
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              'relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-slate-300',
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-slate-100 bg-white'
            )}
          >
            <div
              className={cn(
                'size-10 rounded-lg flex items-center justify-center shrink-0',
                isSelected ? 'bg-primary/10' : 'bg-slate-50'
              )}
            >
              {method.image_url ? (
                <img
                  src={method.image_url}
                  className="size-6 object-contain transition-all"
                  alt={method.name}
                />
              ) : (
                <CreditCard className={cn('size-5', isSelected ? 'text-primary' : 'text-slate-400')} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-bold leading-tight truncate',
                isSelected ? 'text-primary' : 'text-slate-700'
              )}>
                {method.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Instant Activation
              </p>
            </div>

            {isSelected && (
              <div className="absolute top-3 right-3">
                <div className="size-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-200">
                  <Check className="size-3 text-white stroke-[3]" />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
