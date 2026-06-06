import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizIconBadgeProps {
  icon: LucideIcon
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function QuizIconBadge({
  icon: Icon,
  className,
  size = 'md',
}: QuizIconBadgeProps) {
  const sizes = {
    sm: 'h-8 w-8 rounded-lg border border-primary/10',
    md: 'h-10 w-10 rounded-xl border border-primary/10',
    lg: 'h-12 w-12 rounded-2xl border border-primary/10',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-primary/10 text-primary shrink-0',
        sizes[size],
        className,
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  )
}
