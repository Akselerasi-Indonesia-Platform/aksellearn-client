import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FieldHint, FormSectionHint } from '@/components/admin/shared/form'
import { Promotion } from '@/services/admin/promotion.service'

// Searchable Multi-Select Component for Scopes
function SearchableMultiSelect({
  options,
  selectedValues,
  onSelectedValuesChange,
  placeholder,
}: {
  options: { label: string; value: string }[]
  selectedValues: string[]
  onSelectedValuesChange: (vals: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onSelectedValuesChange(selectedValues.filter(v => v !== val))
    } else {
      onSelectedValuesChange([...selectedValues, val])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between min-h-11 h-auto py-2 rounded-xl text-left font-normal border-border bg-white"
        >
          <div className="flex flex-wrap gap-1 max-w-[90%]">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground">{placeholder || 'Select items...'}</span>
            ) : (
              selectedValues.map(val => {
                const label = options.find(o => o.value === val)?.label || String(val)
                return (
                  <Badge key={val} variant="secondary" className="mr-1 text-[10px] font-bold">
                    {label}
                  </Badge>
                )
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs rounded-lg"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1 space-y-0.5">
          {filteredOptions.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">No items found.</div>
          ) : (
            filteredOptions.map(option => {
              const isChecked = selectedValues.includes(option.value)
              return (
                <div
                  key={option.value}
                  onClick={() => toggleValue(option.value)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-semibold text-slate-700"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleValue(option.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{option.label}</span>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface PromotionFormProps {
  promotion?: Promotion | null
  onSubmit: (payload: any) => void
  onCancel: () => void
  isPending: boolean
  coursesOptions: { label: string; value: string; db_id?: number }[]
  categoriesOptions: { label: string; value: string; db_id?: number }[]
  promotionType: 'automatic' | 'voucher'
  errors?: Record<string, string> | null
  isInstructorOnly?: boolean
}

export function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isPending,
  coursesOptions,
  categoriesOptions,
  promotionType,
  errors,
  isInstructorOnly,
}: PromotionFormProps) {
  const { t } = useTranslation()
  const [promTitle, setPromTitle] = React.useState('')
  const [promCouponCode, setPromCouponCode] = React.useState('')
  const [promDiscType, setPromDiscType] = React.useState<'percentage' | 'fixed'>('percentage')
  const [promDiscVal, setPromDiscVal] = React.useState(0)
  const [promApplyTo, setPromApplyTo] = React.useState<string>(isInstructorOnly ? 'course' : 'global_course')
  const [promPriority, setPromPriority] = React.useState(1)
  const [promCombinable, setPromCombinable] = React.useState(false)
  const [promMaxCap, setPromMaxCap] = React.useState<number | ''>('')
  const [promMinSubtotal, setPromMinSubtotal] = React.useState(0)
  const [promMaxBudget, setPromMaxBudget] = React.useState<number | ''>('')
  const [promUsageLimit, setPromUsageLimit] = React.useState<number | ''>('')
  const [promPerUserLimit, setPromPerUserLimit] = React.useState(1)
  const [promStartAt, setPromStartAt] = React.useState('')
  const [promEndAt, setPromEndAt] = React.useState('')
  const [promScopeUuids, setPromScopeUuids] = React.useState<string[]>([])
  const [promIsActive, setPromIsActive] = React.useState(true)

  // Track initialization to prevent form reset when parent component re-renders (e.g. sidebar toggle)
  const [initializedId, setInitializedId] = React.useState<string | null>(null)

  // Format Helper Local Date
  const toLocalInputFormat = (isoString?: string) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  React.useEffect(() => {
    if (promotion && initializedId !== promotion.uuid) {
      setPromTitle(promotion.title)
      setPromCouponCode((promotion as any).coupon_code || '')
      setPromDiscType(
        (promotion.discount_type === 'percentage' || promotion.discount_type === 'fixed')
          ? promotion.discount_type
          : 'percentage'
      )
      setPromDiscVal(promotion.value)
      setPromApplyTo(promotion.apply_to)
      setPromPriority(promotion.priority)
      setPromCombinable(promotion.combinable)
      setPromMaxCap(promotion.max_cap || '')
      setPromMinSubtotal(promotion.min_subtotal)
      setPromMaxBudget(promotion.max_budget || '')
      setPromUsageLimit(promotion.usage_limit || '')
      setPromPerUserLimit(promotion.per_user_limit || 1)
      setPromStartAt(toLocalInputFormat(promotion.start_at))
      setPromEndAt(toLocalInputFormat(promotion.end_at))
      setPromScopeUuids(promotion.scope_uuids || [])
      setPromIsActive(promotion.auto_apply)
      setInitializedId(promotion.uuid)
    } else if (!promotion && initializedId !== null) {
      setPromTitle('')
      setPromCouponCode('')
      setPromDiscType('percentage')
      setPromDiscVal(0)
      setPromApplyTo(isInstructorOnly ? 'course' : 'global_course')
      setPromPriority(1)
      setPromCombinable(false)
      setPromMaxCap('')
      setPromMinSubtotal(0)
      setPromMaxBudget('')
      setPromUsageLimit('')
      setPromPerUserLimit(1)
      setPromStartAt('')
      setPromEndAt('')
      setPromScopeUuids([])
      setPromIsActive(true)
      setInitializedId(null)
    }
  }, [promotion, initializedId, coursesOptions, categoriesOptions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promTitle.trim()) return

    // Resolve scope_uuids back to scope_ids for backend compatibility
    let resolvedScopeIds: number[] = []
    if (promApplyTo === 'course') {
      resolvedScopeIds = promScopeUuids
        .map((uuid) => coursesOptions.find((o) => o.value === uuid)?.db_id)
        .filter((id): id is number => typeof id === 'number')
    } else if (promApplyTo === 'course_category') {
      resolvedScopeIds = promScopeUuids
        .map((uuid) => categoriesOptions.find((o) => o.value === uuid)?.db_id)
        .filter((id): id is number => typeof id === 'number')
    }

    const payload = {
      title: promTitle,
      type: promotionType,
      coupon_code: promotionType === 'voucher' ? promCouponCode.trim().toUpperCase() : '',
      discount_type: promDiscType,
      discount_value: Number(promDiscVal),
      apply_to: promApplyTo,
      priority: 0,
      combinable: false,
      auto_apply: promIsActive,
      is_active: promIsActive,
      min_subtotal: Number(promMinSubtotal),
      max_cap: promMaxCap === '' ? null : Number(promMaxCap),
      max_budget: promMaxBudget === '' ? 0 : Number(promMaxBudget),
      usage_limit: promUsageLimit === '' ? 0 : Number(promUsageLimit),
      per_user_limit: Number(promPerUserLimit),
      start_at: promStartAt ? new Date(promStartAt).toISOString() : '',
      end_at: promEndAt ? new Date(promEndAt).toISOString() : '',
      scope_uuids: (promApplyTo === 'course' || promApplyTo === 'course_category') ? promScopeUuids : [],
      scope_ids: resolvedScopeIds,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.promotionTitle')}</Label>
        <Input
          placeholder="e.g. Back to School Discount"
          value={promTitle}
          onChange={(e) => setPromTitle(e.target.value)}
          className="rounded-xl h-11"
          required
        />
        {errors?.title && (
          <p className="text-xs font-bold text-rose-500 mt-1">{errors.title}</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
          {t('promotions.form.promotionTitleHint')}
        </p>
      </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
            Apply To Scope
            <FieldHint>
              {isInstructorOnly 
                ? "Defines which of your courses trigger this discount. 'All My Courses' applies to every course you own."
                : "Defines which products trigger this discount. 'All Courses' applies to every course in the catalog."}
            </FieldHint>
          </Label>
          <Select value={promApplyTo} onValueChange={(val) => {
            if (!val) return
            setPromApplyTo(val)
            setPromScopeUuids([])
          }}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global_course">
                {isInstructorOnly ? "All My Courses" : t('promotions.form.allCourses')}
              </SelectItem>
              {!isInstructorOnly && (
                <SelectItem value="course_category">{t('promotions.form.specificCategories')}</SelectItem>
              )}
              <SelectItem value="course">{t('promotions.form.specificCourses')}</SelectItem>
            </SelectContent>
          </Select>
          {errors?.apply_to && (
            <p className="text-xs font-bold text-rose-500 mt-1">{errors.apply_to}</p>
          )}
        </div>

      {promotionType === 'voucher' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.couponCode')} <span className="text-red-500">*</span></Label>
          <Input
            placeholder="e.g. SUMMER30"
            value={promCouponCode}
            onChange={(e) => setPromCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            className="rounded-xl h-11 font-mono font-bold tracking-wider"
            required={promotionType === 'voucher'}
          />
          {errors?.coupon_code && (
            <p className="text-xs font-bold text-rose-500 mt-1">{errors.coupon_code}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            {t('promotions.form.couponCodeHint')}
          </p>
        </div>
      )}

      {promApplyTo === 'course' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.selectCourseScope')}</Label>
          <SearchableMultiSelect
            options={coursesOptions}
            selectedValues={promScopeUuids}
            onSelectedValuesChange={setPromScopeUuids}
            placeholder={t('promotions.form.selectCourseScope')}
          />
        </div>
      )}

      {promApplyTo === 'course_category' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.selectCategoryScope')}</Label>
          <SearchableMultiSelect
            options={categoriesOptions}
            selectedValues={promScopeUuids}
            onSelectedValuesChange={setPromScopeUuids}
            placeholder={t('promotions.form.selectCategoryScope')}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.discountMethod')}</Label>
          <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">{t('promotions.form.discountMethodHint')}</p>
          <Select value={promDiscType} onValueChange={(val: any) => setPromDiscType(val)}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">{t('promotions.form.percentage')}</SelectItem>
              <SelectItem value="fixed">{t('promotions.form.fixedAmount')}</SelectItem>
            </SelectContent>
          </Select>
          {errors?.discount_type && (
            <p className="text-xs font-bold text-rose-500 mt-1">{errors.discount_type}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('promotions.form.value')}</Label>
          <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">{t('promotions.form.valueHint')}</p>
          <Input
            type="number"
            placeholder={promDiscType === 'percentage' ? '15' : '50000'}
            value={promDiscVal || ''}
            onChange={(e) => setPromDiscVal(Number(e.target.value))}
            className="rounded-xl h-11"
            required
          />
          {errors?.discount_value && (
            <p className="text-xs font-bold text-rose-500 mt-1">{errors.discount_value}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
          {t('promotions.form.maxCap')}
          <FieldHint>{t('promotions.form.maxCapHint')}</FieldHint>
        </Label>
        <Input
          type="number"
          placeholder={t('promotions.form.unlimited')}
          value={promMaxCap}
          onChange={(e) => setPromMaxCap(e.target.value === '' ? '' : Number(e.target.value))}
          className="rounded-xl h-11"
          disabled={promDiscType !== 'percentage'}
        />
        {promDiscType !== 'percentage' && <p className="text-[10px] text-muted-foreground mt-1">{t('promotions.form.maxCapHintText')}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-slate-400" /> {t('promotions.form.startDate')}
          </Label>
          <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">{t('promotions.form.startDateHint')}</p>
          <Input
            type="datetime-local"
            value={promStartAt}
            onChange={(e) => setPromStartAt(e.target.value)}
            className="rounded-xl h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon className="size-3.5 text-slate-400" /> {t('promotions.form.endDate')}
          </Label>
          <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">{t('promotions.form.endDateHint')}</p>
          <Input
            type="datetime-local"
            value={promEndAt}
            onChange={(e) => setPromEndAt(e.target.value)}
            className="rounded-xl h-11"
          />
        </div>
      </div>



      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="space-y-0.5">
          <Label className="text-xs font-bold text-slate-800">{t('promotions.form.activeStatus')}</Label>
          <p className="text-[10px] text-muted-foreground">{t('promotions.form.activeStatusHint')}</p>
        </div>
        <Switch checked={promIsActive} onCheckedChange={setPromIsActive} />
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
          {promotion ? t('promotions.form.updatePromotion') : t('promotions.form.createPromotion')}
        </Button>
      </div>
    </form>
  )
}
