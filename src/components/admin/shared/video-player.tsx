import { useEffect, useRef, useMemo, useState } from 'react'
import type Hls from 'hls.js'
import { Video, Loader2 } from 'lucide-react'
import 'plyr/dist/plyr.css'
import { getToken } from '@/lib/auth'
import { getMediaUrl } from '@/lib/media-utils'

interface VideoPlayerProps {
  url: string
  width?: string | number
  height?: string | number
  poster?: string
  autoPlay?: boolean
  isRawVideo?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
}

export function VideoPlayer({
  url,
  width = '100%',
  height = '100%',
  poster,
  autoPlay = false,
  isRawVideo = false,
  onPlayingChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  const token = getToken()
  const rawToken = token?.replace('Bearer ', '') || ''

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const resolvedUrl = useMemo(() => {
    return getMediaUrl(url, isRawVideo ? 'image' : 'stream')
  }, [url, isRawVideo])

  const needsBlobFetch = useMemo(() => {
    return isRawVideo && resolvedUrl.includes('/api/media/')
  }, [isRawVideo, resolvedUrl])

  useEffect(() => {
    if (!needsBlobFetch || !resolvedUrl || !isClient) return
    
    let active = true
    let objectUrl: string | null = null
    // Fetch the video into a local blob so the browser can seek natively 
    // without depending on the server's HTTP Range header support.
    // This is safe because preview videos are capped at 15MB.
    fetch(resolvedUrl)
      .then(res => res.blob())
      .then(blob => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(err => console.error('Failed to fetch raw video blob:', err))

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [needsBlobFetch, resolvedUrl, isClient])

  const resolvedPoster = useMemo(() => {
    return getMediaUrl(poster || '', 'image', { isPublic: true })
  }, [poster])

  useEffect(() => {
    if (isRawVideo || !resolvedUrl || !isClient || !videoRef.current) return;

    const video = videoRef.current
    let plyrInstance: any | null = null

    const initPlayer = async () => {
      const [PlyrModule, HlsModule] = await Promise.all([
        import('plyr'),
        import('hls.js'),
      ])
      const PlyrClass = (PlyrModule as any).default || PlyrModule
      const HlsClass = (HlsModule as any).default || HlsModule

      const isHls = resolvedUrl.includes('.m3u8') || resolvedUrl.includes('/playlist')

      if (isHls && HlsClass.isSupported()) {
        const hls = new HlsClass({
          // The backend now rewrites the playlist to include session tokens in segments.
          // We only need to ensure the initial playlist request has the token,
          // which is handled by resolvedUrl.
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 0,
        })

        hls.loadSource(resolvedUrl)
        hls.attachMedia(video)
        hlsRef.current = hls

        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          const availableQualities = Array.from(
            new Set<number>(hls.levels.map((l: any) => l.height)),
          )
            .filter((h: number) => h && h > 0)
            .sort((a: number, b: number) => b - a)

          plyrInstance = new PlyrClass(video, {
            autoplay: autoPlay,
            quality: {
              default: availableQualities[0] || 720,
              options: availableQualities,
              forced: true,
              onChange: (newHeight: number) => {
                const currentHls = hlsRef.current
                if (currentHls) {
                  const levelIndex = currentHls.levels.findIndex(
                    (l: any) => l.height === newHeight,
                  )
                  if (levelIndex !== -1) {
                    const wasPlaying = !video.paused

                    if (wasPlaying) {
                      setIsSwitching(true)
                      video.pause()
                    }

                    currentHls.currentLevel = levelIndex
                    currentHls.nextLevel = levelIndex
                    currentHls.loadLevel = levelIndex

                    const syncResume = () => {
                      if (video.readyState >= 3) {
                        setIsSwitching(false)
                        if (wasPlaying) {
                          video.play().catch((err) => {
                            console.debug('Autoplay or resume prevented:', err)
                          })
                        }
                        currentHls.off(HlsClass.Events.FRAG_BUFFERED, syncResume)
                      }
                    }
                    currentHls.on(HlsClass.Events.FRAG_BUFFERED, syncResume)
                  }
                }
              },
            },
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'mute',
              'volume',
              'settings',
              'pip',
              'fullscreen',
            ],
            settings: ['quality', 'speed'],
            i18n: { quality: 'Resolution', speed: 'Speed' },
          })
          playerRef.current = plyrInstance

          plyrInstance?.on('playing', () => onPlayingChange?.(true))
          plyrInstance?.on('pause', () => onPlayingChange?.(false))
          plyrInstance?.on('ended', () => onPlayingChange?.(false))
          plyrInstance?.on('ready', () => setIsPlayerReady(true))
          
          // Fallback if ready event is missed
          setTimeout(() => setIsPlayerReady(true), 500)
        })

        hls.on(HlsClass.Events.ERROR, (_event: any, data: any) => {
          console.error('[HLS Error]', data)
          if (data.fatal) {
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                console.warn('HLS Network Error, attempting to reload with backoff...')
                // Prevent 0-ms death loops if hitting 429 or immediate connection drops
                setTimeout(() => {
                  hls.startLoad()
                }, 2000)
                break
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                console.warn('HLS Media Error, attempting to recover...')
                hls.recoverMediaError()
                break
              default:
                console.error('Unrecoverable HLS error, destroying player')
                hls.destroy()
                break
            }
          }
        })
      } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = resolvedUrl
        plyrInstance = new PlyrClass(video, {
          autoplay: autoPlay,
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        }) as any
        playerRef.current = plyrInstance

        plyrInstance?.on('playing', () => onPlayingChange?.(true))
        plyrInstance?.on('pause', () => onPlayingChange?.(false))
        plyrInstance?.on('ended', () => onPlayingChange?.(false))
        plyrInstance?.on('ready', () => setIsPlayerReady(true))
        
        setTimeout(() => setIsPlayerReady(true), 500)
      } else if (!isHls) {
        // Native playback for MP4 or other supported formats
        video.src = resolvedUrl
        plyrInstance = new PlyrClass(video, {
          autoplay: autoPlay,
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'pip',
            'fullscreen',
          ],
        }) as any
        playerRef.current = plyrInstance

        plyrInstance?.on('playing', () => onPlayingChange?.(true))
        plyrInstance?.on('pause', () => onPlayingChange?.(false))
        plyrInstance?.on('ended', () => onPlayingChange?.(false))
        plyrInstance?.on('ready', () => setIsPlayerReady(true))
        
        setTimeout(() => setIsPlayerReady(true), 500)
      }
    }

    const timeoutId = setTimeout(() => {
      initPlayer()
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.warn('Plyr destroy failed', e)
        }
        playerRef.current = null
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [isClient, resolvedUrl, autoPlay, rawToken])

  if (!isClient || !resolvedUrl) {
    return (
      <div
        style={{ width, height }}
        className="bg-slate-900/50 flex flex-col items-center justify-center gap-3 w-full h-full"
      >
        {!url ? (
          <>
            <div className="p-3 rounded-full bg-white/5 text-white/20">
              <Video className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
              Awaiting Module Stream
            </p>
          </>
        ) : (
          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
        )}
      </div>
    )
  }

  if (isRawVideo) {
    const videoSrc = needsBlobFetch ? (blobUrl || undefined) : resolvedUrl
    return (
      <div style={{ width, height }} className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center">
        {needsBlobFetch && !blobUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
            <div className="size-8 border-2 border-white/20 border-t-white/90 rounded-full animate-spin mb-3"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 animate-pulse">Loading Preview</p>
          </div>
        ) : null}
        <video
          className={`w-full h-full object-contain transition-opacity duration-500 ${needsBlobFetch && !blobUrl ? 'opacity-0' : 'opacity-100'}`}
          src={videoSrc}
          poster={resolvedPoster || undefined}
          autoPlay={autoPlay}
          controls
          controlsList="nodownload"
          onPlay={() => onPlayingChange?.(true)}
          onPause={() => onPlayingChange?.(false)}
          onEnded={() => onPlayingChange?.(false)}
        />
      </div>
    )
  }

  return (
    <div
      style={{ width, height }}
      className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl relative group/player select-none"
    >
      {/* 
          INITIALIZATION OVERLAY 
          Hides the naked browser <video> element while the 500ms debounce
          and HLS manifest parsing is taking place.
      */}
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-none ${!isPlayerReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>

      {/* 
          STABLE DOM OVERLAY 
          Reverted to the permanent node structure (no conditional rendering) 
          to fix 'removeChild' crash while keeping the premium pulse UI.
      */}
      <div
        className={`absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl transition-all duration-700 pointer-events-none ${isSwitching ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-[3px] border-white/5 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-white text-lg font-bold tracking-tight">
            Enhancing Stream
          </h3>
        </div>
      </div>

      <div
        className={`w-full h-full transition-all duration-700 ${isSwitching ? 'scale-[1.05] blur-md' : 'scale-100 blur-0'}`}
      >
        <video
          ref={videoRef}
          className="plyr-react"
          data-poster={resolvedPoster}
          playsInline
          controls
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .plyr {
          --plyr-color-main: #3b82f6;
          --plyr-border-radius: 12px;
          height: 100% !important;
          width: 100% !important;
        }
        
        /* Fixed Plyr Native Settings Menu */
        .plyr__menu__container {
          z-index: 1000 !important;
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          border-radius: 12px !important;
        }
        
        .plyr__control { color: white !important; }
        
        .plyr--full-ui.plyr--video .plyr__control--overlaid {
          background: rgba(59, 130, 246, 0.9);
          padding: 24px;
        }

        .plyr--video .plyr__controls {
          background: linear-gradient(transparent, rgba(0,0,0,0.85)) !important;
          padding-top: 40px !important;
        }
      `,
        }}
      />
    </div>
  )
}
