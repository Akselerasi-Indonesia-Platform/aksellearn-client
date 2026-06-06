import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable, Column } from '@/components/admin/shared/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Coupon } from '@/services/admin/promotion.service'

interface CouponTableProps {
  coupons: Coupon[]
  isLoading: boolean
  onDelete: (id: number) => void
}

export function CouponTable({
  coupons,
  isLoading,
  onDelete,
}: CouponTableProps) {
  const { t } = useTranslation()
  const coupColumns: Column<Coupon>[] = [
    {
      header: t('promotions.table.code'),
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-wider font-mono bg-slate-100 border px-2 py-0.5 rounded-lg w-fit text-slate-800">
            {item.code}
          </span>
          <span className="text-[9px] text-muted-foreground mt-1 truncate max-w-[150px]">
            Promo: {item.promotion?.title || 'Standalone'}
          </span>
        </div>
      ),
    },
    {
      header: 'Value',
      cell: (item) => (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-extrabold text-[11px]">
          {item.promotion?.discount_type === 'percentage' ? `${item.promotion.value}%` : formatCurrency(item.promotion?.value || 0)}
        </Badge>
      ),
    },
    {
      header: 'Usage',
      cell: (item) => {
        const pct = item.usage_limit > 0 ? Math.min((item.used_count / item.usage_limit) * 100, 100) : 0
        return (
          <div className="flex flex-col w-[120px] gap-1.5">
            <span className="text-xs font-bold text-slate-600">
              {item.used_count} / {item.usage_limit > 0 ? item.usage_limit : 'Unlimited'}
            </span>
            {item.usage_limit > 0 && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${pct >= 90 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }} 
                />
              </div>
            )}
          </div>
        )
      },
    },
    {
      header: 'Schedule',
      cell: (item) => (
        <div className="flex flex-col text-xs text-muted-foreground font-medium">
          {item.start_at && <span>From: {formatDate(item.start_at)}</span>}
          {item.expired_at && <span className="text-rose-600">Expires: {formatDate(item.expired_at)}</span>}
        </div>
      ),
    },
    {
      header: t('promotions.table.status'),
      cell: (item) => (
        <Badge variant="outline" className={item.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-400 font-bold'}>
          {item.is_active ? t('promotions.table.active') : t('promotions.table.inactive')}
        </Badge>
      ),
    },
    {
      header: t('promotions.table.actions'),
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (item) => (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('promotions.table.deleteCoupon')}</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={coupons}
      columns={coupColumns}
      isLoading={isLoading}
      pageSize={10}
      emptyMessage={t('promotions.table.noCoupons')}
      rowKey="id"
    />
  )
}
