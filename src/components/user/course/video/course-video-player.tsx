import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import 'plyr/dist/plyr.css'
import { cn } from '@/lib/utils'
import { userCourseService } from '@/services/user/course.service'
import { VideoPlayerRoot } from './video-player-root'
import { VideoSecurityOverlay } from './video-security-overlay'
import { VideoStatusOverlay } from './video-status-overlay'
import type { VideoResource } from '@/types/course'

export interface CourseVideoPlayerController {
  getCurrentTime: () => number
  seek: (time: number) => void
  pause: () => void
  play: () => void
}

interface CourseVideoPlayerProps {
  moduleUuid: string
  videoUuid?: string
  url: string
  poster?: string
  title?: string
  className?: string
  initialPosition?: number
  onComplete?: () => void
  onNext?: () => void
  isLast?: boolean
  onFinish?: () => void
  onControllerReady?: (controller: CourseVideoPlayerController) => void
  videoData?: VideoResource
  nextVideoTitle?: string
  markVideoCompleted?: (uuid: string) => void
}

export function CourseVideoPlayer({
  moduleUuid,
  videoUuid,
  url,
  poster,
  title,
  className,
  initialPosition = 0,
  onComplete,
  onNext,
  isLast,
  onFinish,
  onControllerReady,
  videoData,
  nextVideoTitle,
  markVideoCompleted,
}: CourseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const isInitializing = useRef(false)
  const lastUrlRef = useRef<string | null>(null)

  const [liveVideoData, setLiveVideoData] = useState<VideoResource | undefined>(videoData)
  
  // YouTube-style Resume Chip
  const [showResumeChip, setShowResumeChip] = useState(initialPosition > 10)

  useEffect(() => {
    if (showResumeChip) {
      const timer = setTimeout(() => setShowResumeChip(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [showResumeChip])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    setLiveVideoData(videoData)
  }, [videoData])

  useEffect(() => {
    if (!liveVideoData?.uuid) return
    const status = liveVideoData.status
    // Only poll when actively encoding — 'available' means watchable, no need to poll
    if (status === 'pending' || status === 'processing') {
      let isMounted = true
      const poll = async () => {
        try {
          const res = await userCourseService.getMediaStatus(liveVideoData.uuid)
          if (isMounted) setLiveVideoData(prev => ({ ...prev, ...res }))
        } catch (e) {
          console.error('Failed to poll media status', e)
        }
      }
      const interval = setInterval(poll, 10000)
      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }
  }, [liveVideoData?.status, liveVideoData?.uuid])

  // Use refs for callbacks to keep the effect stable
  const onCompleteRef = useRef(onComplete)
  const onControllerReadyRef = useRef(onControllerReady)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    onControllerReadyRef.current = onControllerReady
  }, [onControllerReady])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !videoRef.current || !url) {
      if (!url) setIsLoading(true)
      return
    }

    // BREAK THE LOOP: Skip if already initialized for this exact URL
    if (lastUrlRef.current === url && playerRef.current) return
    lastUrlRef.current = url
    setIsCompleted(false)
    setIsLoading(true)
    setError(null)

    let player: any
    let hls: any

    const initPlyr = async () => {
      if (!videoRef.current || isInitializing.current) return
      isInitializing.current = true

      try {
        const Plyr = (await import('plyr')).default
        const Hls = (await import('hls.js')).default

        if (!videoRef.current) {
          isInitializing.current = false
          return
        }

        const isHls = url.includes('.m3u8') || url.includes('/playlist')
        const token = localStorage.getItem('auth_token')

        // Industry Standard: Ensure token is present in the URL for manifest propagation
        const separator = url.includes('?') ? '&' : '?'
        const authenticatedUrl =
          url.includes('token=') || !token
            ? url
            : `${url}${separator}token=${token}`

        const createPlyr = (availableQualities: number[] = [0]) => {
          if (playerRef.current || !videoRef.current) return

          player = new Plyr(videoRef.current, {
            title: title || 'Course Video',
            ratio: '16:9',
            quality: {
              default: 0,
              options: availableQualities,
              forced: true,
              onChange: (newQuality: number) => {
                if (hls && newQuality === 0) {
                  hls.currentLevel = -1 // Auto
                } else if (hls) {
                  hls.levels.forEach((level: any, levelIndex: any) => {
                    if (level.height === newQuality) {
                      hls.currentLevel = levelIndex
                    }
                  })
                }
              },
            },
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
            i18n: {
              quality: 'Quality',
              speed: 'Speed',
              qualityLabel: {
                0: 'Auto',
              },
              qualityBadge: {
                2160: '4K',
                1440: 'HD',
                1080: 'HD',
                720: 'HD',
                576: 'SD',
                480: 'SD',
                0: 'Auto',
              },
            },
          } as any)

          playerRef.current = player

          if (onControllerReadyRef.current) {
            onControllerReadyRef.current({
              getCurrentTime: () => player.currentTime || 0,
              seek: (time: number) => {
                player.currentTime = time
                player.play()
              },
              pause: () => player.pause(),
              play: () => player.play(),
            })
          }

          player.on('ready', () => {
            setIsLoading(false)
            if (initialPosition > 0) {
              setTimeout(() => {
                player.currentTime = initialPosition
              }, 200)
            }

            heartbeatTimer.current = setInterval(() => {
              if (player.playing) {
                saveProgress(player.currentTime, player.duration)
              }
            }, 15000)
          })

          player.on('pause', () => {
            saveProgress(player.currentTime, player.duration)
          })

          player.on('playing', () => setIsLoading(false))
          player.on('waiting', () => setIsLoading(true))
          player.on('canplay', () => setIsLoading(false))

          player.on('ended', () => {
            if (moduleUuid !== 'intro') {
              if (videoUuid) {
                // Multi-video lesson: send 'video_complete' event.
                // BE atomically marks this video as is_watched = true and auto-completes
                // the module if ALL videos in the lesson are now watched.
                // This event never returns a 422 — it's a per-video operation.
                userCourseService.completeModule(moduleUuid, {
                  event: 'video_complete',
                  lesson_video_uuid: videoUuid,
                  position: Math.floor(player.duration),
                  duration: Math.floor(player.duration),
                })
                if (markVideoCompleted) {
                  markVideoCompleted(videoUuid)
                }
              } else {
                // Legacy single-video module — complete the module directly
                userCourseService.completeModule(moduleUuid, {
                  event: 'completed',
                  position: Math.floor(player.duration),
                  duration: Math.floor(player.duration),
                })
              }
            }
            setIsCompleted(true)
          })

          player.on('qualitychange', (event: any) => {
            const newQuality = event.detail.quality
            if (hls) {
              if (newQuality === 0) {
                hls.currentLevel = -1 // Auto
              } else {
                hls.levels.forEach((level: any, levelIndex: any) => {
                  if (level.height === newQuality) {
                    hls.currentLevel = levelIndex
                  }
                })
              }
            }
          })

          player.on('error', (event: any) => {
            console.error('Plyr error:', event)
            setError('Failure to load video stream')
            setIsLoading(false)
          })
        }

        const saveProgress = (currentTime: number, duration: number) => {
          if (!duration || moduleUuid === 'intro') return
          
          const isWatched = (currentTime / duration) >= 0.9
          
          userCourseService.completeModule(moduleUuid, {
            position: Math.floor(currentTime),
            duration: Math.floor(duration),
            event: 'heartbeat',
            lesson_video_uuid: videoUuid,
          })
          
          if (isWatched && videoUuid && markVideoCompleted) {
            markVideoCompleted(videoUuid)
          }
        }

        if (isHls && Hls.isSupported()) {
          hls = new Hls({
            xhrSetup: (xhr) => {
              if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
              }
            },
          })

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (
                    data.response?.code === 401 ||
                    data.response?.code === 403
                  ) {
                    console.error('HLS Auth Error:', data.response)
                    setError(
                      'Unauthorized: Access to this course module is restricted.',
                    )
                    hls.destroy()
                  } else {
                    hls.startLoad()
                  }
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError()
                  break
                default:
                  hls.destroy()
                  setError('Fatal playback error')
                  break
              }
            }
          })

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const availableQualities = hls.levels.map((l: any) => l.height)
            availableQualities.unshift(0) // Add Auto option
            createPlyr(availableQualities)
          })

          hls.loadSource(authenticatedUrl)
          hls.attachMedia(videoRef.current)

          // Fallback: If manifest takes too long, init with Auto only
          setTimeout(() => {
            if (!playerRef.current) createPlyr([0])
          }, 2000)
        } else {
          videoRef.current.src = authenticatedUrl
          createPlyr([0])
        }

        isInitializing.current = false

        // End of initPlyr try block
      } catch (err) {
        console.error('Failed to initialize video player:', err)
        setError('Video player initialization failed')
        setIsLoading(false)
        isInitializing.current = false
      }
    }

    initPlyr()

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea (e.g. comments/notes)
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return
      }

      if (!playerRef.current) return
      const p = playerRef.current

      switch (e.key.toLowerCase()) {
        case 'k':
        case ' ':
          e.preventDefault()
          p.playing ? p.pause() : p.play()
          break
        case 'j':
        case 'arrowleft':
          e.preventDefault()
          p.currentTime = Math.max(0, p.currentTime - 10)
          break
        case 'l':
        case 'arrowright':
          e.preventDefault()
          p.currentTime = Math.min(p.duration, p.currentTime + 10)
          break
        case 'f':
          e.preventDefault()
          p.fullscreen.toggle()
          break
        case 'm':
          e.preventDefault()
          p.muted = !p.muted
          break
        case 'n':
          if (onNext) {
            e.preventDefault()
            onNext()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // Reset flags FIRST so the next init can proceed cleanly
      isInitializing.current = false

      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current)
        heartbeatTimer.current = null
      }

      // Destroy HLS before Plyr to avoid stale blob:// MediaSource URLs
      if (hls) {
        hls.destroy()
        hls = null
      }

      if (player) {
        player.destroy()
        player = null
      }

      // Clear the ref so createPlyr guard doesn't block the next video
      playerRef.current = null
      lastUrlRef.current = null

      // Reset loading state so next video shows the spinner
      setIsLoading(true)
      setError(null)
    }
  }, [isClient, url, moduleUuid])

  const overlayStatus = (() => {
    if (error) return 'error'
    if (isCompleted) return 'completed'
    if (liveVideoData) {
      if (liveVideoData.status === 'pending') return 'pending'
      if (liveVideoData.status === 'processing') return 'processing'
      if (liveVideoData.status === 'failed') return 'failed'
    }
    if (isLoading) return 'loading'
    return 'idle'
  })()

  return (
    <div
      className={cn(
        'relative bg-black overflow-hidden aspect-video group',
        '[&_.plyr]:!h-full [&_.plyr]:!w-full [&_.plyr--video]:!bg-transparent',
        '[&_.plyr__controls]:!bg-transparent [&_.plyr__controls]:before:!bg-gradient-to-t [&_.plyr__controls]:before:!from-black/80 [&_.plyr__controls]:before:!via-transparent [&_.plyr__controls]:before:!to-black/20',
        '[&_.plyr__controls]:!opacity-0 group-hover:[&_.plyr__controls]:!opacity-100 [&_.plyr__controls]:!transition-opacity [&_.plyr__controls]:!duration-300',
        '[&_.plyr]:[--plyr-range-track-height:4px] hover:[&_.plyr]:[--plyr-range-track-height:6px] [&_.plyr__progress_input]:transition-all [&_.plyr__progress_input]:duration-150',
        className,
      )}
    >
      <VideoStatusOverlay
        status={overlayStatus}
        progress={liveVideoData?.progress}
        hdStatus={liveVideoData?.hd_status}
        hdProgress={liveVideoData?.hd_progress}
        errorText={error || (liveVideoData?.status === 'failed' ? 'Failed to process video' : undefined)}
        onNext={onNext}
        isLast={isLast}
        onFinish={onFinish}
        nextVideoTitle={nextVideoTitle}
      />

      <AnimatePresence>
        {showResumeChip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-[70px] left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs px-3 py-2 rounded-full shadow-xl border border-slate-700/50"
          >
            <span>Resumed from {formatDuration(initialPosition)}</span>
            <div className="w-[1px] h-3 bg-slate-600 mx-0.5" />
            <button 
              onClick={() => {
                if (playerRef.current) {
                  playerRef.current.currentTime = 0
                  playerRef.current.play()
                }
                setShowResumeChip(false)
              }}
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Start from beginning
            </button>
            <button 
              onClick={() => setShowResumeChip(false)}
              className="ml-1 text-slate-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-slate-800"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoSecurityOverlay />

      <VideoPlayerRoot
        ref={videoRef}
        poster={poster}
        className={cn(
          isLoading ? 'opacity-0' : 'opacity-100',
          ['error', 'failed', 'pending', 'processing'].includes(overlayStatus)
            ? 'hidden'
            : 'block',
          'transition-opacity duration-300',
        )}
      />
    </div>
  )
}
