import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddActionButtonProps extends React.ComponentProps<typeof Button> {
  label: string
}

/**
 * AddActionButton Atom
 * A consistent primary button for "Add" actions across the admin portal.
 * Matches the original visual dimensions of the dashboard.
 */
export function AddActionButton({
  label,
  className,
  children,
  ...props
}: AddActionButtonProps) {
  return (
    <Button
      className={cn(
        'shadow-lg shadow-primary/20 font-bold px-6 transition-all active:scale-95',
        className,
      )}
      {...props}
    >
      <Plus className="mr-2 h-4 w-4" />
      {label || children}
    </Button>
  )
}
