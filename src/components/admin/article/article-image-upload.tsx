import { Reorder, useDragControls } from 'framer-motion'
import {
  GripVertical,
  Image as ImageIcon,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleImage } from '@/types/article'
import { MediaImage } from '@/components/admin/shared/media-image'

interface ArticleImageUploadProps {
  images: ArticleImage[]
  onChange: (images: ArticleImage[]) => void
}

export function ArticleImageUpload({
  images,
  onChange,
}: ArticleImageUploadProps) {
  const [isUploading] = useState(false)

  const handleAddImage = () => {
    // In a real app, this would be a file picker and upload to server
    // For now, we'll prompt for a URL to simulate
    const url = window.prompt('Enter image URL (simulation):')
    if (url) {
      const newImage: ArticleImage = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        order: images.length,
      }
      onChange([...images, newImage])
      toast.success('Image added')
    }
  }

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    // Update order
    const reordered = updated.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  const onReorder = (newOrder: ArticleImage[]) => {
    const reordered = newOrder.map((img, idx) => ({ ...img, order: idx }))
    onChange(reordered)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Gallery & Images</h4>
          <p className="text-xs text-muted-foreground">
            Upload multiple images. The first image will be used as the
            thumbnail.
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={isUploading}
          size="sm"
          type="button"
          variant="outline"
          onClick={handleAddImage}
        >
          <Upload className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30 text-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            No images uploaded yet
          </p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          className="space-y-2"
          values={images}
          onReorder={onReorder}
        >
          {images.map((image, index) => (
            <ArticleImageItem
              key={image.id}
              image={image}
              isThumbnail={index === 0}
              onRemove={() => removeImage(image.id)}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}

function ArticleImageItem({
  image,
  isThumbnail,
  onRemove,
}: {
  image: ArticleImage
  isThumbnail: boolean
  onRemove: () => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      className="relative flex items-center gap-4 p-3 border rounded-xl bg-background group hover:border-primary/50 transition-colors shadow-sm"
      dragControls={controls}
      dragListener={false}
      value={image}
    >
      <div
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-colors"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="h-16 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
        <MediaImage
          alt="Article detail"
          className="h-full w-full object-cover"
          src={image.url}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate max-w-[200px]">
            {image.url}
          </p>
          {isThumbnail && (
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 gap-1 px-2">
              <Star className="h-3 w-3 fill-current" />
              Thumbnail
            </Badge>
          )}
        </div>
      </div>

      <Button
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        size="icon"
        type="button"
        variant="ghost"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Reorder.Item>
  )
}
