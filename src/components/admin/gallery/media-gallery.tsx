'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FileVideo,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Video,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminMediaService, MediaData } from '@/services/admin/media.service'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaImage } from '@/components/admin/shared/media-image'
import { useAuthStore } from '@/hooks/use-auth'

interface MediaGalleryProps {
  onSelect?: (media: MediaData) => void
  mode?: 'view' | 'select'
}

export function MediaGallery({ onSelect, mode = 'view' }: MediaGalleryProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [items, setItems] = useState<MediaData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [mimeType, setMimeType] = useState<'image' | 'video'>('image')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 })

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminMediaService.getAll({
        page,
        limit: 20,
        mime_type: mimeType,
        search: search || undefined,
      })
      setItems(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error('Failed to fetch media:', error)
      toast.error(t('gallery.noMedia'))
    } finally {
      setLoading(false)
    }
  }, [page, mimeType, search, t])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchMedia])

  // Clear data when tab changes to avoid flickering old content
  const handleTabChange = (value: string) => {
    setMimeType(value as 'image' | 'video')
    setPage(1)
    setItems([])
    setLoading(true)
  }

  // Polling for active encoding jobs
  useEffect(() => {
    const poll = async () => {
      let currentActive: MediaData[] = []
      setItems((prev) => {
        currentActive = prev.filter(
          (item) => item.status === 'pending' || item.status === 'processing' || item.status === 'available'
        )
        return prev
      })
      
      if (currentActive.length === 0) return
      
      try {
        const promises = currentActive.map((item) => adminMediaService.getStatusOnly(item.uuid))
        const updates = await Promise.all(promises)
        
        setItems((prevItems) => {
          const newItems = [...prevItems]
          updates.forEach((update) => {
            const index = newItems.findIndex((i) => i.uuid === update.uuid)
            if (index !== -1) {
              newItems[index] = { ...newItems[index], ...update }
            }
          })
          return newItems
        })
      } catch (error) {
        console.error('Failed to poll media status:', error)
      }
    }

    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [])

  const renderStatusBadge = (item: MediaData) => {
    if (!item.status) return null
    if (['completed', 'finished', 'available'].includes(item.status)) {
      return (
        <Badge className="bg-emerald-500/90 hover:bg-emerald-500/90 text-white border-none shadow-sm">
          🟢 {item.status === 'available' ? 'Available (HD pending)' : 'HD Ready'}
        </Badge>
      )
    }
    if (item.status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-slate-100/90 text-slate-700">
          ⏳ Queued
        </Badge>
      )
    }
    if (item.status === 'processing') {
      return (
        <Badge variant="secondary" className="bg-amber-100/90 text-amber-700 animate-pulse">
          🟡 Encoding 480p…
        </Badge>
      )
    }
    if (item.status === 'available') {
      return (
        <Badge variant="secondary" className="bg-emerald-100/90 text-emerald-700">
          🟢 Watchable (HD Pending)
        </Badge>
      )
    }
    if (item.status === 'failed') {
      return (
        <Badge variant="destructive" className="bg-rose-500/90">
          🔴 Failed
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="animate-pulse">
        {item.status}
      </Badge>
    )
  }

  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    try {
      await adminMediaService.upload(file, 'article', (progress) => {
        setUploadProgress(progress)
      }) // Default module
      toast.success(t('gallery.uploadSuccess'))
      fetchMedia()
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error(t('gallery.uploadError'))
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (e.target) e.target.value = ''
    }
  }

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(t('common.areYouSure'))) return

    try {
      await adminMediaService.delete(uuid)
      toast.success(t('gallery.deleteSuccess'))
      fetchMedia()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error(t('gallery.deleteError'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={mimeType}
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-[300px]">
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              {t('gallery.images')}
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              {t('gallery.videos')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('gallery.searchPlaceholder')}
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept={mimeType === 'image' ? 'image/*' : 'video/*'}
              disabled={uploading}
            />
            <Button disabled={uploading} className="gap-2">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {uploading && uploadProgress !== null
                  ? `${t('gallery.uploading', 'Uploading')} ${uploadProgress}%`
                  : t('gallery.uploadMedia')}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 text-muted-foreground">
          <p>{t('gallery.noMedia', "You haven't uploaded any files yet")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {Array.isArray(items) &&
              items.map((item) => (
                <motion.div
                  key={item.uuid}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => onSelect?.(item)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-muted shadow-sm transition-all hover:shadow-md ${
                    mode === 'select' ? 'hover:ring-2 hover:ring-primary' : ''
                  }`}
                >
                  {mimeType === 'image' ? (
                    <MediaImage
                      src={
                        item.thumbnail?.['175x175'] ||
                        item.images?.['175x175'] ||
                        item.url ||
                        item.thumbnail?.original ||
                        item.images?.original ||
                        ''
                      }
                      alt={item.original_name || 'Media'}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-white">
                      {item.thumbnail_url ? (
                        <MediaImage
                          src={item.thumbnail_url}
                          alt={item.original_name}
                          className="h-full w-full object-cover opacity-50 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <FileVideo className="h-10 w-10 opacity-50" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2">
                        <p className="truncate text-[10px] font-medium">
                          {item.original_name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                    {(!item.created_by_id || String(item.created_by_id) === String(user?.id) || user?.roles?.some(r => r === 'Super Admin' || r === 'Admin' || (r as any).name === 'Super Admin' || (r as any).name === 'Admin')) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => handleDelete(item.uuid, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {item.status && (
                    <div className="absolute top-2 right-2">
                      {renderStatusBadge(item)}
                    </div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}

      {meta.total > meta.limit && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {page} of {Math.ceil(meta.total / meta.limit)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(meta.total / meta.limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
