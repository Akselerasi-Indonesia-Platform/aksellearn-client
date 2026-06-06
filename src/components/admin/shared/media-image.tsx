import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getMediaUrl, isInternalMedia } from '@/lib/media-utils'

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  fallback?: React.ReactNode
  isPublic?: boolean
}

export function MediaImage({
  src,
  fallback,
  className,
  alt,
  isPublic,
  ...props
}: MediaImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (!src || src === '') {
    return (
      fallback || (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center bg-muted text-muted-foreground',
            className,
          )}
        >
          <span className="text-xs">No source</span>
        </div>
      )
    )
  }

  const isInternal = isInternalMedia(src)
  const resolvedSrc = isInternal ? getMediaUrl(src, 'image', { isPublic }) : src

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {loading && <Skeleton className="absolute inset-0 h-full w-full" />}

      {error ? (
        fallback || (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-muted text-muted-foreground',
              className,
            )}
          >
            <span className="text-xs">Failed to load</span>
          </div>
        )
      ) : (
        <img
          src={resolvedSrc || undefined}
          alt={alt}
          className={cn(
            className,
            loading ? 'opacity-0' : 'opacity-100 transition-opacity',
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
          {...props}
        />
      )}
    </div>
  )
}
