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

const TERMINAL_STATUSES = ['completed', 'finished', 'failed']

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

          // 'available' = 480p ready — update form so player shows, but KEEP POLLING for HD
          if (data.status === 'available' && data.stream_url) {
            const index = fieldsRef.current.findIndex((f: any) => f.id === id)
            if (index !== -1) {
              setValue(`${name}.${index}.stream_url` as any, data.stream_url as any, {
                shouldDirty: true,
              })
            }

            // Smart HD detection: check if HD qualities already arrived
            const hasHD = data.qualities?.some((q) => ['720p', '1080p', '480p+'].includes(q))
            const hdFailed = data.hd_status === 'failed'

            if (hasHD) {
              clearInterval(pollingIntervals.current[id])
              delete pollingIntervals.current[id]
              setUploadStatuses((prev) => ({
                ...prev,
                [id]: { ...prev[id], status: 'completed' },
              }))
              toast.success('HD video is now available')
            } else if (hdFailed) {
              clearInterval(pollingIntervals.current[id])
              delete pollingIntervals.current[id]
              setUploadStatuses((prev) => ({
                ...prev,
                [id]: { ...prev[id], status: 'completed' },
              }))
              toast.info('Video available in 480p (HD encoding unavailable for this video)')
            }
            // else: keep polling until HD arrives or fails
          }

          // Terminal: stop polling and finalize
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
        } catch (error: any) {
          // 404 = media is fully processed (status endpoint only exists during processing)
          // Stop polling gracefully and treat as completed
          if (error?.response?.status === 404) {
            clearInterval(pollingIntervals.current[id])
            delete pollingIntervals.current[id]
            console.info(`[VideoPlaylistManager] Media ${uuid} returned 404 — treating as completed`)
          } else {
            console.error(`[VideoPlaylistManager] Polling error for uuid=${uuid}:`, error)
          }
        }
      }, 3000)
    },
    [name, setValue],
  )

  // Initialize polling on mount ONLY for videos still in processing (no stream_url yet)
  // Videos with a stream_url are already at least 'available' — do NOT re-poll them on load
  // because the media status endpoint returns 404 for fully processed media
  useEffect(() => {
    fieldsRef.current.forEach((field: any) => {
      const alreadyHasStream = !!(field.stream_url || uploadStatuses[field.id]?.stream_url)
      const alreadyPolling = !!pollingIntervals.current[field.id]

      // Only start polling if: has a UUID, no stream yet, not already polling
      if (field.media_uuid && !alreadyHasStream && !alreadyPolling) {
        startPolling(field.id, field.media_uuid)
      }
    })
  }, [fields, startPolling, uploadStatuses])

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
      return {
        ...prev,
        [id]: {
          isUploading: false,
          status: null,
          progress: 0,
          uuid: null,
          stream_url: ''
        }
      }
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
              const hasHD = field.qualities?.some((q: string) => ['720p', '1080p', '480p+'].includes(q))
              const defaultStatus = field.status
                ? (field.status === 'available' && hasHD ? 'completed' : field.status)
                : field.stream_url
                  ? (hasHD ? 'completed' : 'available')
                  : field.media_uuid
                    ? 'processing'
                    : null

              const status: UploadStatus = uploadStatuses[field.id] ?? {
                isUploading: false,
                status: defaultStatus as any,
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
                        name={`${name}.${index}.stream_url` as any}
                        render={({ field: streamField }) => (
                          <FormItem>
                            <FormControl>
                              <VideoUploadInput
                                compact
                                disabled={disabled}
                                isUploading={status.isUploading}
                                onClear={() => handleClear(index, field.id)}
                                onUpload={(f) => handleUpload(index, field.id, f)}
                                videoStatus={status as any}
                                value={status.stream_url || streamField.value || ''}
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
