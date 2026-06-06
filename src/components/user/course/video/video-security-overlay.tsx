import { cn } from '@/lib/utils'

interface VideoSecurityOverlayProps {
  className?: string
  text?: string
}

export function VideoSecurityOverlay({
  className,
  text = 'Protected Content - Clara Learning',
}: VideoSecurityOverlayProps) {
  return (
    <div
      className={cn(
        'absolute top-4 left-4 pointer-events-none opacity-[0.05] z-40 text-white font-black text-[10px] tracking-widest uppercase',
        className,
      )}
    >
      {text}
    </div>
  )
}
