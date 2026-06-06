import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusType =
  | 'active'
  | 'inactive'
  | 'published'
  | 'draft'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'boolean'

interface StatusBadgeProps {
  status: string | number | boolean
  className?: string
  labels?: {
    true?: string
    false?: string
  }
}

/**
 * StatusBadge Atom
 * A unified badge for displaying statuses across the admin dashboard.
 * Maps status strings/numbers to consistent visual styles.
 */
export function StatusBadge({
  status,
  className,
  labels = { true: 'Active', false: 'Inactive' },
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    // Convert to string safely
    const s =
      status !== null && status !== undefined
        ? String(status).toLowerCase()
        : ''

    // Truthy set: true, 1, "1", "active", "published", "completed"
    const isTruthy =
      status === true ||
      status === 1 ||
      s === '1' ||
      s === 'active' ||
      s === 'published' ||
      s === 'completed'

    // Falsy set: false, 0, "0", "inactive", "draft", "failed"
    const isFalsy =
      status === false ||
      status === 0 ||
      s === '0' ||
      s === 'inactive' ||
      s === 'draft' ||
      s === 'failed'

    if (isTruthy) {
      return {
        label: status === true || status === 1 || s === '1' ? labels.true : s,
        variant: 'outline' as const,
        className:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      }
    }

    if (isFalsy) {
      return {
        label: status === false || status === 0 || s === '0' ? labels.false : s,
        variant: 'outline' as const,
        className:
          'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800',
      }
    }

    if (s === 'pending') {
      return {
        label: s,
        variant: 'outline' as const,
        className:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      }
    }

    return {
      label: s,
      variant: 'outline' as const,
      className: '',
    }
  }

  const { label, variant, className: variantClassName } = getStatusConfig()

  return (
    <Badge
      variant={variant}
      className={cn(
        'capitalize px-2.5 py-0.5 font-bold shadow-sm',
        variantClassName,
        className,
      )}
    >
      {label}
    </Badge>
  )
}
