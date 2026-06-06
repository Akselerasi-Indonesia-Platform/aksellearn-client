import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SearchableSelect } from '../searchable-select'
import { FieldHint } from './field-hint'
import { cn } from '@/lib/utils'

interface FormSearchableSelectProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  placeholder?: string
  description?: string
  options: { label: string; value: string }[]
  className?: string
  selectClassName?: string
  disabled?: boolean
  required?: boolean
}

export function FormSearchableSelect<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  name,
  label,
  placeholder,
  description,
  options,
  className,
  selectClassName,
  disabled,
  required,
}: FormSearchableSelectProps<TFieldValues>) {
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
            <SearchableSelect
              className={cn('w-full', selectClassName)}
              disabled={disabled}
              options={options}
              placeholder={placeholder}
              value={field.value}
              onValueChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
