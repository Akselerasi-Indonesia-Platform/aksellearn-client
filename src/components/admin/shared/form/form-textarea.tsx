import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { FieldHint } from './field-hint'
import { cn } from '@/lib/utils'

interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  placeholder?: string
  description?: string
  className?: string
  textareaClassName?: string
  disabled?: boolean
  required?: boolean
  rows?: number
}

export function FormTextarea<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  textareaClassName,
  disabled,
  required,
  rows = 4,
}: FormTextareaProps<TFieldValues>) {
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
            <Textarea
              {...field}
              className={cn('resize-none rounded-xl', textareaClassName)}
              disabled={disabled}
              placeholder={placeholder}
              rows={rows}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
