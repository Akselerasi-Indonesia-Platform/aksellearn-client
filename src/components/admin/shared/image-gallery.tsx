'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Loader2, Plus, Star, Trash2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GalleryImage, ProcessedImage } from '@/types/common'
import { MediaImage } from '@/components/admin/shared/media-image'

interface ImageGalleryProps {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
  onUpload: (files: FileList | File[]) => Promise<ProcessedImage[]>
  maxImages?: number
}

export function ImageGallery({
  images,
  onChange,
  onUpload: uploadFn,
  maxImages,
}: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      if (maxImages && images.length + files.length > maxImages) {
        toast.error(`You can only upload up to ${maxImages} images`)
        return
      }

      setIsUploading(true)
      try {
        const processed = await uploadFn(files)
        const newImages: GalleryImage[] = processed.map((p, idx) => ({
          id: p.filename, // Use the UUID directly without extra suffixes
          url:
            p.images['175x175'] ||
            p.images['original'] ||
            Object.values(p.images)[0],
          order: images.length + idx,
        }))
        onChange([...images, ...newImages])
        toast.success(`Successfully uploaded ${files.length} images`)
      } catch (err) {
        toast.error('Failed to upload images')
        console.error(err)
      } finally {
        setIsUploading(false)
        e.target.value = '' // Reset input
      }
    },
    [images, onChange, uploadFn, maxImages],
  )

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    const reordered = updated.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedItem] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedItem)

    // Update order property
    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  const setAsMain = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const [mainImage] = newImages.splice(index, 1)
    newImages.unshift(mainImage)

    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
    toast.success('Set as main image')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        <AnimatePresence mode="popLayout">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedIndex === null || draggedIndex === index) return
                moveImage(draggedIndex, index)
                setDraggedIndex(index)
              }}
              className={`relative group aspect-square rounded-xl overflow-hidden border bg-muted shadow-sm hover:shadow-md transition-shadow cursor-move ${
                draggedIndex === index
                  ? 'opacity-50 ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
            >
              <MediaImage
                alt="Gallery"
                className="h-full w-full object-cover select-none pointer-events-none"
                src={image.url}
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  {index !== 0 && (
                    <Button
                      className="h-8 w-8 rounded-full bg-white/20 hover:bg-emerald-500 border-none group/btn"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setAsMain(index)}
                    >
                      <Star className="h-4 w-4 text-white group-hover/btn:fill-current" />
                    </Button>
                  )}
                  <Button
                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-destructive border-none"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => removeImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>

              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <Star className="h-3 w-3 fill-current" />
                    Main Image
                  </Badge>
                </div>
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/90 p-1 rounded-lg shadow-sm border">
                  <GripVertical className="h-4 w-4 text-slate-600" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                  #{index + 1}
                </div>
              </div>
            </motion.div>
          ))}

          {(!maxImages || images.length < maxImages) && (
            <motion.label
              layout
              key="upload-button"
              className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
            >
              <input
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                type="file"
                onChange={handleUpload}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Uploading...
                  </span>
                </div>
              ) : (
                <>
                  <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Add Images
                  </span>
                </>
              )}
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 p-3 rounded-xl border border-dashed">
        <Upload className="h-3.5 w-3.5" />
        <span>
          Drag the image to reorder. The first image is set as thumbnail.
        </span>
      </div>
    </div>
  )
}
