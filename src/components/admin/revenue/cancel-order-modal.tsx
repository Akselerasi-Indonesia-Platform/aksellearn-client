import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminOrderService } from '@/services/admin/order.service'
import { toast } from 'sonner'
import { XCircle, AlertTriangle } from 'lucide-react'

export function CancelOrderModal({
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

  const mutation = useMutation({
    mutationFn: (data: string) => adminOrderService.cancel(uuid, { reason: data }),
    onSuccess: () => {
      toast.success('Order cancelled')
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      onOpenChange(false)
      setReason('')
    },
    onError: () => toast.error('Failed to cancel order'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return toast.error('Please provide a reason')
    mutation.mutate(reason)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <DialogTitle>Cancel Order</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Terminating order{' '}
            <span className="font-mono">{uuid.slice(0, 8)}</span>. This will
            revoke course access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-500/20 flex gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-tight font-medium">
              Warning: Cancellation is permanent. It does NOT automatically
              trigger a refund.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground mr-1">
              Intervention Reason
            </Label>
            <Textarea
              placeholder="Why is this being cancelled?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-sm h-24"
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
              Keep Active
            </Button>
            <Button
              type="submit"
              className="h-8 font-bold text-xs px-6 bg-red-600 hover:bg-red-700 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Interrupting...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
