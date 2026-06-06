'use client'

import { useState } from 'react'
import { Check, Info, Receipt, Undo2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { adminOrderService, type Order } from '@/services/admin/order.service'

interface OrderRefundModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function OrderRefundModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: OrderRefundModalProps) {
  const [selectedItemUuids, setSelectedItemUuids] = useState<string[]>([])
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleItem = (uuid: string) => {
    setSelectedItemUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    )
  }

  const handleRefund = async () => {
    if (selectedItemUuids.length === 0) {
      toast.error('Please select at least one item to refund.')
      return
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund.')
      return
    }

    try {
      setIsSubmitting(true)
      await adminOrderService.refund(order.uuid, {
        item_ids: selectedItemUuids,
        adjustment_amount: adjustmentAmount,
        reason,
      })
      toast.success('Refund processed successfully.')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process refund.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const refundTotal = order.items
    .filter((item) => selectedItemUuids.includes(item.uuid))
    .reduce((sum, item) => sum + (item.final_price || 0), 0)

  const netRefund = Math.max(0, refundTotal - adjustmentAmount)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-orange-500" />
            Precise Partial Refund
          </DialogTitle>
          <DialogDescription>
            Select specific items to refund from Order #{order.uuid.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item List */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider opacity-60">
              Select Enrolled Items
            </label>
            <div className="border rounded-xl divide-y bg-muted/30 max-h-[200px] overflow-y-auto">
              {order.items.map((item) => (
                <div
                   key={item.uuid}
                   className="flex items-center gap-3 p-3 hover:bg-background/50 transition-colors"
                >
                  <Checkbox
                    id={item.uuid}
                    checked={selectedItemUuids.includes(item.uuid)}
                    onCheckedChange={() => toggleItem(item.uuid)}
                  />
                  <div className="flex-1 min-w-0 text-sm">
                    <label
                      htmlFor={item.uuid}
                      className="font-medium truncate block cursor-pointer"
                    >
                      {item.title_snapshot}
                    </label>
                    <span className="text-[10px] opacity-50 block">
                      Price: ${(item.final_price || 0).toLocaleString()}
                    </span>
                  </div>
                  {item.fulfillment_status === 'refunded' && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                      Already Refunded
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="adjustment-amount"
                className="text-xs font-medium"
              >
                Adjustment Amount
              </label>
              <div className="relative">
                <Input
                  id="adjustment-amount"
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="pl-7"
                />
                <span className="absolute left-2.5 top-2.5 text-xs opacity-40">
                  $
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Fees to subtract from refund
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-orange-600/60">
                Net Refund Credit
              </span>
              <span className="text-xl font-black text-orange-700">
                ${netRefund.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="refund-reason" className="text-xs font-medium">
              Internal Audit Reason
            </label>
            <Textarea
              id="refund-reason"
              placeholder="e.g. Duplicate purchase or student request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={isSubmitting || selectedItemUuids.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 shadow-lg shadow-orange-100"
          >
            {isSubmitting && (
              <span className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
            )}
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
