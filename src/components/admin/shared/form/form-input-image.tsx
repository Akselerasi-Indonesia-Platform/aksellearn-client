import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ImageUploadInput } from '@/components/admin/shared/image-upload-input'
import { cn } from '@/lib/utils'

interface FormInputImageProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  required?: boolean
  isUploading?: boolean
  onUpload: (file: File) => void
  onClear: () => void
  aspect?: 'video' | 'square'
  isPublic?: boolean
}

export function FormInputImage<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  required,
  isUploading,
  onUpload,
  onClear,
  aspect = 'video',
  isPublic = true,
}: FormInputImageProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-4', className)}>
          {label && (
            <FormLabel className="font-bold flex items-center">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <ImageUploadInput
              aspect={aspect}
              disabled={disabled}
              isPublic={isPublic}
              isUploading={isUploading}
              onClear={onClear}
              onUpload={onUpload}
              value={field.value}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
