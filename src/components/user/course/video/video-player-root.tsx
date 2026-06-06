import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface VideoPlayerRootProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  poster?: string
}

export const VideoPlayerRoot = forwardRef<
  HTMLVideoElement,
  VideoPlayerRootProps
>(({ className, poster, ...props }, ref) => {
  return (
    <video
      ref={ref}
      playsInline
      controls
      poster={poster}
      className={cn('w-full h-full object-contain', className)}
      {...props}
    />
  )
})

VideoPlayerRoot.displayName = 'VideoPlayerRoot'
