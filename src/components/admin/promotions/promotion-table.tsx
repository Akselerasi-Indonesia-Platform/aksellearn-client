import { useTranslation } from 'react-i18next'
import { Edit3, Trash2, History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable, Column } from '@/components/admin/shared/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Promotion } from '@/services/admin/promotion.service'

interface PromotionTableProps {
  promotions: Promotion[]
  isLoading: boolean
  onEdit: (promotion: Promotion) => void
  onDelete: (uuid: string) => void
  onViewUsage?: (promotion: Promotion) => void
}

export function PromotionTable({
  promotions,
  isLoading,
  onEdit,
  onDelete,
  onViewUsage,
}: PromotionTableProps) {
  const { t } = useTranslation()
  const promColumns: Column<Promotion>[] = [
    {
      header: t('promotions.table.title'),
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">{item.title}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{item.type}</span>
        </div>
      ),
    },
    {
      header: t('promotions.table.discount'),
      cell: (item) => (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] gap-1">
          {item.discount_type === 'percentage' ? `${item.value}%` : formatCurrency(item.value)}
        </Badge>
      ),
    },
    {
      header: t('promotions.table.scope'),
      cell: (item) => (
        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[9px]">
          {item.apply_to.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: t('promotions.table.schedule'),
      cell: (item) => (
        <div className="flex flex-col text-xs text-muted-foreground font-medium">
          {item.start_at ? (
            <span>{t('promotions.table.start')} {formatDate(item.start_at)}</span>
          ) : (
            <span>{t('promotions.table.immediate')}</span>
          )}
          {item.end_at && <span>{t('promotions.table.end')} {formatDate(item.end_at)}</span>}
        </div>
      ),
    },
    {
      header: t('promotions.table.usage'),
      cell: (item) => (
        <span className="text-xs font-bold text-slate-600">{item.used_count || 0} {t('promotions.table.times')}</span>
      ),
    },
    {
      header: t('promotions.table.status'),
      cell: (item) => {
        const isInactive = !item.auto_apply
        const isExpired = item.end_at ? new Date(item.end_at) < new Date() : false
        
        let label = t('promotions.table.active')
        let className = 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
        
        if (isInactive) {
          label = t('promotions.table.inactive')
          className = 'border-slate-200 bg-slate-50 text-slate-400 font-bold'
        } else if (isExpired) {
          label = t('promotions.table.expired')
          className = 'border-rose-200 bg-rose-50 text-rose-700 font-bold'
        }
        
        return (
          <Badge variant="outline" className={className}>
            {label}
          </Badge>
        )
      }
    },
    {
      header: t('promotions.table.actions'),
      headerClassName: 'text-center',
      className: 'text-center',
      cell: (item) => (
        <div className="flex justify-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <Edit3 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('promotions.table.editPromotion')}</TooltipContent>
          </Tooltip>
          {onViewUsage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewUsage(item)}
                  className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                >
                  <History className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('promotions.table.usageHistory')}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.uuid)}
                className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('promotions.table.deletePromotion')}</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={promotions}
      columns={promColumns}
      isLoading={isLoading}
      pageSize={10}
      emptyMessage={t('promotions.table.noPromotions')}
      rowKey="uuid"
    />
  )
}
