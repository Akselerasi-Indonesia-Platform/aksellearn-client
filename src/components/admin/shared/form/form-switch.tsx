import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { FieldHint } from './field-hint'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface FormSwitchProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  description?: string
  className?: string
  disabled?: boolean
}

export function FormSwitch<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
}: FormSwitchProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm',
            className,
          )}
        >
          <div className="space-y-0.5">
            {label && (
              <FormLabel className="font-bold">
                {label}
                {description && <FieldHint>{description}</FieldHint>}
              </FormLabel>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
