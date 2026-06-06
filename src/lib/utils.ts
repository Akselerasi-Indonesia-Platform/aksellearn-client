import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseDate(dateInput: string | Date | undefined | null): Date {
  if (!dateInput) return new Date()
  if (dateInput instanceof Date) return dateInput
  
  if (typeof dateInput === 'string') {
    let normalized = dateInput.trim()
    if (normalized.includes(' ') && !normalized.includes('T')) {
      normalized = normalized.replace(' ', 'T')
    }
    const d = new Date(normalized)
    if (!isNaN(d.getTime())) return d
  }
  
  const d = new Date(dateInput)
  return isNaN(d.getTime()) ? new Date() : d
}

export function formatDate(date: string | Date) {
  const d = safeParseDate(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date) {
  const d = safeParseDate(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Recursively converts empty strings to null in an object.
 * Useful for Go-based backends that fail to parse "" as time.Time.
 */
export function sanitizePayload<T>(data: T): T {
  if (data === null || data === undefined) return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item)) as unknown as T
  }

  if (typeof data === 'object') {
    const sanitized = { ...data } as any
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key]
      if (value === '') {
        sanitized[key] = null
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizePayload(value)
      }
    })
    return sanitized as T
  }

  return data
}

/**
 * Formats a permission string (e.g., 'course.delete' -> 'Course Delete')
 */
export function formatPermission(permission: string) {
  if (!permission) return ''
  return permission
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Formats a price as Indonesian Rupiah (Rp) or other currencies.
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency = 'IDR',
) {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)

  if (numericAmount === 0) return 'Free'
  if (isNaN(numericAmount as number)) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericAmount as number)
}
