import { lazy, Suspense } from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FieldHint } from './field-hint'
import { cn } from '@/lib/utils'

const RichEditor = lazy(() =>
  import('@/components/ui/rich-editor').then((m) => ({ default: m.RichEditor }))
)

interface FormEditorProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  description?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function FormEditor<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  required,
}: FormEditorProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          {label && (
            <FormLabel className="font-bold">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
              {description && <FieldHint>{description}</FieldHint>}
            </FormLabel>
          )}
          <FormControl>
            <Suspense fallback={<div className="h-[400px] w-full rounded-xl border border-border bg-muted/10 animate-pulse flex items-center justify-center text-xs text-muted-foreground">Loading editor...</div>}>
              <RichEditor
                disabled={disabled}
                value={field.value || ''}
                onChange={field.onChange}
              />
            </Suspense>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
