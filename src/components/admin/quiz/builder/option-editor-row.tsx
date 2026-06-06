import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OptionEditorRowProps {
  index: number
  isCorrect: boolean
  isReadOnly?: boolean
  canDelete?: boolean
  hideCheck?: boolean
  hideDelete?: boolean
  onToggleCorrect: () => void
  onDelete: () => void
  register: any
}

export function OptionEditorRow({
  index,
  isCorrect,
  isReadOnly = false,
  canDelete = true,
  hideCheck = false,
  hideDelete = false,
  onToggleCorrect,
  onDelete,
  register,
}: OptionEditorRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300',
        isCorrect && !hideCheck
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-border',
      )}
    >
      {!hideCheck && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'size-10 rounded-xl shrink-0 transition-all duration-500',
            isCorrect
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-card border border-border text-muted-foreground/50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm',
          )}
          onClick={onToggleCorrect}
        >
          <Check
            className={cn(
              'size-5 transition-transform duration-500',
              isCorrect && 'scale-110',
            )}
          />
        </Button>
      )}
      <div className="flex-1">
        <input
          {...register}
          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 placeholder:font-normal"
          placeholder={`Define response option ${index + 1}...`}
          disabled={isReadOnly}
        />
      </div>
      {!isReadOnly && canDelete && !hideDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}
