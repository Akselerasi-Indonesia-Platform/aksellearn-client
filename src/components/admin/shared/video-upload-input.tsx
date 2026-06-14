import { motion } from 'framer-motion'
import { Video, Upload, Loader2, X, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { VideoPlayer } from '@/components/admin/shared/video-player'
import { useState } from 'react'

interface VideoUploadInputProps {
  value?: string
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
  isUploading?: boolean
  onUpload: (file: File) => void
  onClear: () => void
  compact?: boolean
  className?: string
  label?: React.ReactNode
  disabled?: boolean
}

export function VideoUploadInput({
  value,
  videoStatus,
  isUploading,
  onUpload,
  onClear,
  compact = false,
  className,
  disabled,
}: VideoUploadInputProps) {
  const { t } = useTranslation()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const isProcessing =
    videoStatus?.status &&
    !['completed', 'finished', 'failed', 'available'].includes(videoStatus.status)

  if (compact) {
    return (
      <div
        className={cn(
          'w-full max-w-sm sm:max-w-md flex flex-col items-center',
          className,
        )}
      >
        {!value && !isProcessing && videoStatus?.status !== 'failed' && (
          <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-primary/20 p-6 flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">
                {t('common.selectVideo', 'Select module video')}
              </p>
              <p className="text-[9px] text-muted-foreground/70 mt-1 uppercase tracking-tighter font-black">
                MP4, WEBM, OGG UP TO 2GB
              </p>
            </div>
            <Button
              asChild
              className="rounded-full h-8 px-6 text-[10px] font-black shadow-lg hover:shadow-primary/20 transition-all"
              disabled={isUploading || disabled}
              size="sm"
            >
              <label className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : null}
                {isUploading
                  ? t('common.uploading', 'UPLOADING...')
                  : t('common.uploadFile', 'UPLOAD FILE')}
                <input
                  accept="video/*"
                  className="hidden"
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && onUpload(e.target.files[0])
                  }
                />
              </label>
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="relative aspect-video w-full p-6 border rounded-2xl bg-muted/30 flex flex-col justify-center space-y-6 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 -z-10" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Video className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <span className="text-xs font-bold tracking-tight">
                  {videoStatus?.status === 'uploading'
                    ? 'Uploading Assets'
                    : 'Processing Streams'}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[9px] uppercase font-black bg-primary/10 text-primary border-none"
              >
                <Loader2 className="h-2.5 w-2.5 animate-spin mr-1.5" />
                {videoStatus?.status}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden border shadow-inner">
                <motion.div
                  className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  animate={{ width: `${videoStatus?.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                <span>
                  {videoStatus?.status === 'uploading'
                    ? 'Syncing to cloud'
                    : 'Transcoding streams'}
                </span>
                <span>{videoStatus?.progress}%</span>
              </div>
            </div>
          </div>
        )}

        {videoStatus?.status === 'failed' && (
          <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-2 border rounded-2xl bg-destructive/5 border-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-xs font-medium">
              Failed to process video.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 rounded-full text-[10px] font-black"
              disabled={disabled}
              onClick={onClear}
            >
              TRY AGAIN
            </Button>
          </div>
        )}

        {value && !isProcessing && videoStatus?.status !== 'failed' && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl bg-black group transition-all duration-500 hover:ring-4 ring-primary/20">
            <VideoPlayer url={value} onPlayingChange={setIsVideoPlaying} />
            <Button
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/70 hover:bg-destructive text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={disabled}
              size="icon"
              type="button"
              variant="ghost"
              onClick={onClear}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Normal mode (Course Form Style)
  return (
    <div className={cn('space-y-4', className)}>
      {!value && !isProcessing && videoStatus?.status !== 'failed' && (
        <div className="relative aspect-video w-full rounded-3xl border-2 border-dashed border-primary/20 p-4 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 transition-all duration-500 group overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
          <div className="p-3 sm:p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Video className="h-5 w-5 sm:h-8 sm:w-8" />
          </div>
          <div className="text-center space-y-0.5 px-2 block md:hidden xl:block">
            <p className="text-[10px] sm:text-xs font-bold text-foreground line-clamp-1">
              {t(
                'common.dragAndDropVideo',
                'Drag & drop or click to upload video',
              )}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/70">
              MP4, WebM, or OGG {t('common.upTo', 'up to')} 2GB
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
                accept="video/*"
                className="hidden"
                type="file"
                onChange={(e) =>
                  e.target.files?.[0] && onUpload(e.target.files[0])
                }
              />
            </label>
          </Button>
        </div>
      )}

      {isProcessing && videoStatus && (
        <div className="relative aspect-video w-full p-6 border rounded-2xl bg-muted/30 flex flex-col justify-center space-y-6 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 -z-10" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Video className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Video Processing
              </span>
            </div>
            <Badge
              variant="secondary"
              className="capitalize bg-primary/10 text-primary border-none px-3"
            >
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              {videoStatus.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-full bg-primary/5 rounded-full overflow-hidden border shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary/80 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${videoStatus.progress || 10}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              <span className="flex items-center gap-1.5">
                {videoStatus.status === 'uploading'
                  ? 'Syncing to cloud'
                  : videoStatus.status === 'pending'
                    ? 'Preparing assets'
                    : 'Transcoding streams'}
              </span>
              <span>{videoStatus.progress}%</span>
            </div>
          </div>
        </div>
      )}

      {videoStatus?.status === 'failed' && (
        <div className="relative aspect-video w-full flex flex-col items-center justify-center gap-2 border rounded-2xl bg-destructive/5 border-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span className="text-sm font-medium">Failed to process video.</span>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 rounded-full px-6 font-bold"
            disabled={disabled}
            onClick={onClear}
          >
            Try Again
          </Button>
        </div>
      )}

      {value && !isProcessing && videoStatus?.status !== 'failed' && (
        <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl bg-black group transition-all duration-500 hover:ring-4 ring-primary/20">
          <VideoPlayer url={value} onPlayingChange={setIsVideoPlaying} />
          {videoStatus?.duration && !isVideoPlaying && (
            <div className="absolute bottom-4 left-4 z-[50] px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl transition-opacity duration-300">
              {Math.floor(videoStatus.duration / 60)}:
              {(videoStatus.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
          <Button
            className="absolute top-4 right-4 z-[50] h-10 w-10 rounded-full bg-black/70 hover:bg-destructive text-white hover:text-white transition-all shadow-2xl border-2 border-white/40 backdrop-blur-md opacity-0 group-hover:opacity-100"
            disabled={disabled}
            size="icon"
            type="button"
            variant="ghost"
            onClick={onClear}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
