import { Upload, X, Loader2, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MediaImage } from '@/components/admin/shared/media-image'
import { getMediaUrl } from '@/lib/media-utils'

interface ImageUploadInputProps {
  value?: string
  isUploading?: boolean
  onUpload: (file: File) => void
  onClear: () => void
  className?: string
  aspect?: 'video' | 'square'
  disabled?: boolean
  isPublic?: boolean
}

export function ImageUploadInput({
  value,
  isUploading,
  onUpload,
  onClear,
  className,
  aspect = 'video',
  disabled,
  isPublic,
}: ImageUploadInputProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-4">
        {!value ? (
          <div
            className={cn(
              'relative w-full rounded-3xl border-2 border-dashed border-primary/20 p-4 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 transition-all duration-500 group overflow-hidden',
              aspect === 'video' ? 'aspect-video' : 'aspect-square',
            )}
          >
            <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
            <div className="p-3 sm:p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Upload className="h-5 w-5 sm:h-8 sm:w-8" />
            </div>
            <div className="text-center space-y-0.5 block md:hidden xl:block">
              <p className="text-[10px] sm:text-xs font-bold text-foreground line-clamp-1">
                {t('common.dragAndDrop', 'Drag & drop image')}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/70">
                JPG, PNG, WEBP {t('common.upTo', 'up to')} 5MB
              </p>
            </div>
            <Button
              asChild
              className="mt-1 sm:mt-2 min-w-[110px] sm:min-w-[140px] h-8 sm:h-10 rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300 text-[10px] sm:text-xs font-bold"
              disabled={isUploading || disabled}
              type="button"
              variant="default"
            >
              <label className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : null}
                {isUploading
                  ? t('common.uploading', 'Uploading...')
                  : t('common.selectFile', 'Select File')}
                <input
                  accept="image/*"
                  className="hidden"
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && onUpload(e.target.files[0])
                  }
                />
              </label>
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'relative w-full rounded-3xl overflow-hidden border shadow-2xl bg-black group transition-all duration-500 hover:ring-4 ring-primary/20',
              aspect === 'video' ? 'aspect-video' : 'aspect-square',
            )}
          >
            <MediaImage
              alt="Preview"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              isPublic={isPublic}
              src={value}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
              <div className="flex gap-3 animate-in slide-in-from-bottom-4 duration-500">
                <Button
                  asChild
                  className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-white/90 backdrop-blur-xl border border-white/20 hover:border-white/30 shadow-xl transition-all"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {t('common.changeImage', 'Change Image')}
                    <input
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        e.target.files?.[0] && onUpload(e.target.files[0])
                      }
                    />
                  </label>
                </Button>
                <Button
                  className="h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-white/90 backdrop-blur-xl border border-white/20 hover:border-white/30 hover:cursor-pointer shadow-xl gap-2 px-4 transition-all"
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    window.open(getMediaUrl(value, 'image'), '_blank')
                  }
                >
                  <Eye className="h-4 w-4" />
                  {t('common.view', 'View')}
                </Button>
                <Button
                  className="h-9 w-9 rounded-xl bg-destructive/60 hover:bg-destructive text-white hover:text-white backdrop-blur-xl border border-white/10 shadow-xl transition-all"
                  disabled={disabled}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={onClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
