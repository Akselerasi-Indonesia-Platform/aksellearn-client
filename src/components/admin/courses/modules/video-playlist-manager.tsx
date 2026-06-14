import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useFieldArray, Control, UseFormSetValue, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { VideoUploadInput } from '@/components/admin/shared/video-upload-input'
import { adminCourseService } from '@/services/admin/course.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TERMINAL_STATUSES = ['completed', 'finished', 'available', 'failed']

type UploadStatus = {
  isUploading: boolean
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'finished'
    | 'transcoding'
    | 'uploading'
    | 'available'
    | null
  progress: number
  uuid: string | null
  stream_url?: string
}

interface VideoPlaylistManagerProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  name: any
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function VideoPlaylistManager<TFieldValues extends FieldValues = FieldValues>({
  control,
  setValue,
  name,
  label,
  description,
  className,
  disabled,
  required,
}: VideoPlaylistManagerProps<TFieldValues>) {
  const { fields, append, remove, move } = useFieldArray({ control, name })

  // Keep a stable ref to fields so interval callbacks always see the current list
  const fieldsRef = useRef(fields)
  useEffect(() => {
    fieldsRef.current = fields
  }, [fields])

  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({})

  // Interval store — keyed by field.id. Persists across renders, never cleared by state changes.
  const pollingIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  // Only clean up ALL intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval)
    }
  }, [])

  /**
   * Starts a stable polling loop for a specific slot identified by field.id.
   * Re-entrant safe: clears any existing interval for that id before starting.
   */
  const startPolling = useCallback(
    (id: string, uuid: string) => {
      // Guard: clear any pre-existing interval for this slot
      if (pollingIntervals.current[id]) {
        clearInterval(pollingIntervals.current[id])
        delete pollingIntervals.current[id]
      }

      pollingIntervals.current[id] = setInterval(async () => {
        try {
          const data = await adminCourseService.getVideoStatus(uuid)

          setUploadStatuses((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              status: data.status as UploadStatus['status'],
              progress: data.progress || 0,
              stream_url: data.stream_url || prev[id]?.stream_url,
            },
          }))

          if (TERMINAL_STATUSES.includes(data.status || '')) {
            clearInterval(pollingIntervals.current[id])
            delete pollingIntervals.current[id]

            if (data.status !== 'failed' && data.stream_url) {
              // Use fieldsRef so we always see the current field list (not stale closure)
              const index = fieldsRef.current.findIndex((f: any) => f.id === id)
              if (index !== -1) {
                setValue(`${name}.${index}.stream_url` as any, data.stream_url as any, {
                  shouldDirty: true,
                })
              }
            }
          }
        } catch (error) {
          console.error(`[VideoPlaylistManager] Polling error for uuid=${uuid}:`, error)
        }
      }, 3000)
    },
    [name, setValue],
  )

  const handleUpload = async (index: number, id: string, file: File) => {
    setUploadStatuses((prev) => ({
      ...prev,
      [id]: { isUploading: true, status: 'uploading', progress: 0, uuid: null },
    }))

    try {
      const data = await adminCourseService.uploadVideo(file)

      setUploadStatuses((prev) => ({
        ...prev,
        [id]: {
          isUploading: false,
          status: data.status as UploadStatus['status'],
          progress: data.progress || 0,
          uuid: data.uuid,
          stream_url: data.stream_url || '',
        },
      }))

      // Save media_uuid immediately; stream_url arrives via polling
      setValue(`${name}.${index}.media_uuid` as any, data.uuid as any, {
        shouldDirty: true,
        shouldValidate: true,
      })
      if (data.stream_url) {
        setValue(`${name}.${index}.stream_url` as any, data.stream_url as any, { shouldDirty: true })
      }

      // Only start polling if the video needs further processing
      if (!TERMINAL_STATUSES.includes(data.status || '')) {
        startPolling(id, data.uuid)
      }
    } catch (err) {
      console.error('Video upload error:', err)
      setUploadStatuses((prev) => ({
        ...prev,
        [id]: { isUploading: false, status: 'failed', progress: 0, uuid: null },
      }))
      toast.error('Video upload failed')
    }
  }

  const handleClear = (index: number, id: string) => {
    // Stop any running poll for this slot before clearing state
    if (pollingIntervals.current[id]) {
      clearInterval(pollingIntervals.current[id])
      delete pollingIntervals.current[id]
    }
    setUploadStatuses((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setValue(`${name}.${index}.media_uuid` as any, '' as any, { shouldDirty: true })
    setValue(`${name}.${index}.stream_url` as any, '' as any, { shouldDirty: true })
  }

  // Generate order array for Reorder.Group
  const items = fields.map((field) => field.id)

  const handleReorder = (newOrder: string[]) => {
    const oldIndex = fields.findIndex(
      (f) => f.id === newOrder.find((id, index) => items[index] !== id),
    )
    if (oldIndex !== -1) {
      const newIndex = newOrder.indexOf(fields[oldIndex].id)
      move(oldIndex, newIndex)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <FormLabel className="font-bold flex items-center">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
          <p className="font-semibold">No videos added yet</p>
          <p className="text-xs opacity-70 mb-4">Add your first video to this lesson</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ title: 'Video 1', media_uuid: '' } as any)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
            {fields.map((field: any, index) => {
              const status: UploadStatus = uploadStatuses[field.id] ?? {
                isUploading: false,
                status: field.stream_url
                  ? 'available'
                  : field.media_uuid
                    ? 'processing'
                    : null,
                progress: field.stream_url ? 100 : 0,
                uuid: field.media_uuid || null,
                stream_url: field.stream_url || '',
              }

              return (
                <Reorder.Item
                  key={field.id}
                  value={field.id}
                  className="flex gap-4 p-4 border rounded-xl bg-card shadow-sm group"
                >
                  <div className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <FormField
                      control={control}
                      name={`${name}.${index}.title` as any}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Video Title
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Part 1 - Introduction" {...inputField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="w-full">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                        Video File
                      </FormLabel>
                      <FormField
                        control={control}
                        name={`${name}.${index}.media_uuid` as any}
                        render={() => (
                          <FormItem>
                            <FormControl>
                              <VideoUploadInput
                                compact
                                disabled={disabled}
                                isUploading={status.isUploading}
                                onClear={() => handleClear(index, field.id)}
                                onUpload={(f) => handleUpload(index, field.id, f)}
                                videoStatus={status as any}
                                value={status.stream_url || control._formValues[name]?.[index]?.stream_url || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-start">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() =>
              append({ title: `Video ${fields.length + 1}`, media_uuid: '' } as any)
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Video
          </Button>
        </div>
      )}

      {description && <FormDescription>{description}</FormDescription>}
    </div>
  )
}
