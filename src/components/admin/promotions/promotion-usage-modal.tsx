import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, Column } from '@/components/admin/shared/data'
import { adminPromotionService } from '@/services/admin/promotion.service'

interface PromotionUsageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotionId: string | null
  promotionTitle: string
  role: 'admin' | 'instructor'
}

export function PromotionUsageModal({
  open,
  onOpenChange,
  promotionId,
  promotionTitle,
  role,
}: PromotionUsageModalProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [role, 'promotion-uses', promotionId],
    queryFn: () => {
      if (!promotionId) return Promise.resolve({ data: [], meta: {} as any })
      return adminPromotionService.getUsageHistory(promotionId)
    },
    enabled: !!promotionId && open,
  })

  const uses = data?.data || []

  const columns: Column<any>[] = [
    {
      header: 'Date Applied',
      cell: (item) => (
        <span className="text-xs text-slate-600">{formatDate(item.created_at || item.applied_at)}</span>
      ),
    },
    {
      header: 'User Email',
      cell: (item) => (
        <span className="text-xs font-medium text-slate-800">{item.user?.email || item.email || 'N/A'}</span>
      ),
    },
    {
      header: 'Order ID',
      cell: (item) => (
        <span className="text-xs font-mono text-indigo-600">{item.order_uuid || item.order_id || 'N/A'}</span>
      ),
    },
    {
      header: 'Discount Amount',
      headerClassName: 'text-right',
      cell: (item) => (
        <div className="text-right text-xs font-bold text-emerald-600">
          {formatCurrency(item.discount_amount || 0)}
        </div>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto rounded-3xl p-6 admin-theme">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Usage History</DialogTitle>
          <DialogDescription>
            Audit log of all orders that applied <strong className="text-slate-800">{promotionTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <DataTable
            data={uses}
            columns={columns}
            isLoading={isLoading}
            pageSize={10}
            emptyMessage="No usage history found for this promotion."
            rowKey="id"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
