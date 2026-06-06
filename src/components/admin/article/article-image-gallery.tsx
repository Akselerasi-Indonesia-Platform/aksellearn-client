'use client'

import { Reorder } from 'framer-motion'
import { GripVertical, Loader2, Plus, Star, Trash2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminArticleService } from '@/services/admin/article.service'
import { ArticleImage } from '@/types/article'
import { MediaImage } from '@/components/admin/shared/media-image'

interface ArticleImageGalleryProps {
  images: ArticleImage[]
  onChange: (images: ArticleImage[]) => void
}

export function ArticleImageGallery({
  images,
  onChange,
}: ArticleImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setIsUploading(true)
      try {
        const processed = await adminArticleService.uploadImages(files)
        const newImages: ArticleImage[] = processed.map((p, idx) => ({
          id: p.filename, // Using filename as ID for now or it could be uuid from backend
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
    [images, onChange],
  )

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    const reordered = updated.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  const onReorder = (newOrder: ArticleImage[]) => {
    const reordered = newOrder.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Reorder.Group
          axis="x"
          className="flex flex-wrap gap-4"
          values={images}
          onReorder={onReorder}
        >
          {images.map((image, index) => (
            <Reorder.Item
              key={image.id}
              className="relative group w-40 h-40 rounded-2xl overflow-hidden border bg-muted shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
              value={image}
            >
              <MediaImage
                alt="Article"
                className="h-full w-full object-cover select-none"
                src={image.url}
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={() => removeImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <Star className="h-3 w-3 fill-current" />
                    Main Image
                  </Badge>
                </div>
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 p-1 rounded-lg shadow-sm border">
                  <GripVertical className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <label className="w-40 h-40 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group relative overflow-hidden">
          <input
            multiple
            type="file"
            className="hidden"
            accept="image/*"
            disabled={isUploading}
            onChange={onUpload}
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
        </label>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 p-3 rounded-xl border border-dashed">
        <Upload className="h-3.5 w-3.5" />
        <span>
          Click "+" to upload or drag images to reorder. The first image is the
          covers.
        </span>
      </div>
    </div>
  )
}
