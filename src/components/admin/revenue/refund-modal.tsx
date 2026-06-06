import * as React from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminOrderService } from '@/services/admin/order.service'
import { toast } from 'sonner'
import { formatIDR } from '@/lib/currency'
import { Undo2, AlertCircle } from 'lucide-react'

export function RefundModal({
  uuid,
  open,
  onOpenChange,
}: {
  uuid: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [reason, setReason] = React.useState('')
  const [amount, setAmount] = React.useState<number>(0)

  const { data: order } = useQuery({
    queryKey: ['admin', 'order', uuid],
    queryFn: () => adminOrderService.getOne(uuid),
    enabled: open,
  })

  React.useEffect(() => {
    if (order?.total_amount) {
      setAmount(order.total_amount)
    }
  }, [order])

  const mutation = useMutation({
    mutationFn: (data: { amount: number; reason: string }) =>
      adminOrderService.refund(uuid, { amount: data.amount, reason: data.reason }),
    onSuccess: () => {
      toast.success('Refund processed')
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      onOpenChange(false)
      setReason('')
    },
    onError: () => toast.error('Failed to process refund'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return toast.error('Please provide a reason')
    mutation.mutate({ amount, reason })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Undo2 className="w-4 h-4 text-purple-600" />
            <DialogTitle>Refund Payment</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Refund order{' '}
            <span className="font-mono">{order?.uuid}</span>. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Refund Amount
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={order?.total_amount}
              className="font-mono text-sm h-9"
            />
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" /> Max refund:{' '}
              {formatIDR(order?.total_amount || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Reason
            </Label>
            <Textarea
              placeholder="Reason for refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-sm h-20"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 font-bold text-xs px-6 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
