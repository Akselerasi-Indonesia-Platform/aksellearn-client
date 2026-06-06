import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { FieldHint } from './field-hint'

interface FormSelectStatusProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  placeholder?: string
  description?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
  required?: boolean
  trueLabel?: string
  falseLabel?: string
}

export function FormSelectStatus<
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  triggerClassName,
  disabled,
  required,
  trueLabel,
  falseLabel,
}: FormSelectStatusProps<TFieldValues>) {
  const { t } = useTranslation()

  const activeLabel = trueLabel || t('common.active', 'Active')
  const inactiveLabel = falseLabel || t('common.inactive', 'Inactive')

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
          <Select
            disabled={disabled}
            onValueChange={(val) => field.onChange(val === 'true')}
            value={field.value !== undefined ? String(field.value) : undefined}
          >
            <FormControl>
              <SelectTrigger
                className={cn('h-11 rounded-xl', triggerClassName)}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="true">{activeLabel}</SelectItem>
              <SelectItem value="false">{inactiveLabel}</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
