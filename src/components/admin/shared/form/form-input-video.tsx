import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { VideoUploadInput } from '@/components/admin/shared/video-upload-input'
import { cn } from '@/lib/utils'

interface FormInputVideoProps<TFieldValues extends FieldValues = FieldValues> {
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
  compact?: boolean
  videoStatus?: {
    status:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | 'finished'
      | 'transcoding'
      | 'uploading'
      | null
    progress: number
    duration?: number
  }
}

export function FormInputVideo<TFieldValues extends FieldValues = FieldValues>({
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
  compact = false,
  videoStatus,
}: FormInputVideoProps<TFieldValues>) {
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
            <VideoUploadInput
              compact={compact}
              disabled={disabled}
              isUploading={isUploading}
              onClear={onClear}
              onUpload={onUpload}
              videoStatus={videoStatus}
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
