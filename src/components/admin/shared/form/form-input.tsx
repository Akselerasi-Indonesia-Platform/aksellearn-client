import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FieldHint } from './field-hint'
import { cn } from '@/lib/utils'

interface FormInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  placeholder?: string
  description?: React.ReactNode
  type?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  required?: boolean
  leftAddon?: React.ReactNode
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  className,
  inputClassName,
  disabled,
  required,
  leftAddon,
}: FormInputProps<TFieldValues>) {
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
            <div className="relative group">
              {leftAddon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within:text-primary transition-colors">
                  {leftAddon}
                </div>
              )}
              <Input
                {...field}
                className={cn(
                  'h-11 rounded-xl',
                  leftAddon && 'pl-10',
                  inputClassName,
                )}
                disabled={disabled}
                placeholder={placeholder}
                type={type}
                value={
                  field.value === 0 && type === 'number'
                    ? ''
                    : (field.value ?? '')
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (type === 'number') {
                    // If empty, set to 0 or null to avoid string/number mismatch
                    const numericValue = val === '' ? 0 : Number(val)
                    field.onChange(numericValue)
                  } else {
                    field.onChange(val)
                  }
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
