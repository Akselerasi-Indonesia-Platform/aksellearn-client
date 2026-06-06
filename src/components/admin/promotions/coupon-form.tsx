import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Calendar as CalendarIcon, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldHint } from '@/components/admin/shared/form'
import { Promotion } from '@/services/admin/promotion.service'

interface CouponFormProps {
  promotions: Promotion[]
  onSubmit: (payload: any) => void
  onCancel: () => void
  isPending: boolean
}

export function CouponForm({
  promotions,
  onSubmit,
  onCancel,
  isPending,
}: CouponFormProps) {
  const { t } = useTranslation()
  const [coupPromId, setCoupPromId] = React.useState<string>('')
  const [coupCode, setCoupCode] = React.useState('')
  const [coupUsageLimit, setCoupUsageLimit] = React.useState(0)
  const [coupUserLimit, setCoupUserLimit] = React.useState(1)
  const [coupStartAt, setCoupStartAt] = React.useState('')
  const [coupEndAt, setCoupEndAt] = React.useState('')
  const [coupIsActive, setCoupIsActive] = React.useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupPromId) return
    if (!coupCode.trim()) return
    const codeVal = coupCode.trim().toUpperCase()
    if (!/^[A-Z0-9]+$/.test(codeVal)) {
      toast.error('Coupon code can only contain alphanumeric characters (no spaces or symbols)')
      return
    }

    const payload = {
      promotion_id: Number(coupPromId),
      code: codeVal,
      usage_limit: Number(coupUsageLimit),
      per_user_limit: Number(coupUserLimit),
      is_active: coupIsActive,
      start_at: coupStartAt ? new Date(coupStartAt).toISOString() : '',
      expired_at: coupEndAt ? new Date(coupEndAt).toISOString() : '',
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
          Associated Promotion Rule
          <FieldHint>
            A coupon is only a code that unlocks a Promotion. All discount rules live on the linked Promotion — not the coupon itself.
          </FieldHint>
        </Label>
        <Select value={coupPromId} onValueChange={setCoupPromId}>
          <SelectTrigger className="rounded-xl h-11">
            <SelectValue placeholder="Choose a promotion..." />
          </SelectTrigger>
          <SelectContent>
            {promotions.map(p => (
              <SelectItem key={p.id} value={String(p.id)}>{p.title} ({p.apply_to.replace('_', ' ')})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coupon Code</Label>
        <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">Uppercase alphanumeric only. e.g. LAUNCH30</p>
        <Input
          placeholder="e.g. FLASH20"
          value={coupCode}
          onChange={(e) => setCoupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          className="rounded-xl h-11 font-mono font-bold tracking-wider"
          required
        />
      </div>



      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-slate-400" /> Start Date
          </Label>
          <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">Code is only redeemable within this date range.</p>
          <Input
            type="datetime-local"
            value={coupStartAt}
            onChange={(e) => setCoupStartAt(e.target.value)}
            className="rounded-xl h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-slate-400" /> Expiry Date
          </Label>
          <Input
            type="datetime-local"
            value={coupEndAt}
            onChange={(e) => setCoupEndAt(e.target.value)}
            className="rounded-xl h-11"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="space-y-0.5">
          <Label className="text-xs font-bold text-slate-800">Active status</Label>
          <p className="text-[10px] text-muted-foreground">Toggle coupon active state.</p>
        </div>
        <Switch checked={coupIsActive} onCheckedChange={setCoupIsActive} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 font-bold">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary/10"
        >
          {isPending && (
            <Loader2 className="size-4 animate-spin mr-2" />
          )}
          Create Coupon
        </Button>
      </div>
    </form>
  )
}
