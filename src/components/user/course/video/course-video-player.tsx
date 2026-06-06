import { useEffect, useRef, useState } from 'react'
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
}

export function CourseVideoPlayer({
  moduleUuid,
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

  useEffect(() => {
    setLiveVideoData(videoData)
  }, [videoData])

  useEffect(() => {
    if (!liveVideoData?.uuid) return
    const status = liveVideoData.status
    if (status === 'processing' || status === 'available') {
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
            }, 30000)
          })

          player.on('pause', () => {
            saveProgress(player.currentTime, player.duration)
          })

          player.on('playing', () => setIsLoading(false))
          player.on('waiting', () => setIsLoading(true))
          player.on('canplay', () => setIsLoading(false))

          player.on('ended', () => {
            if (moduleUuid !== 'intro') {
              userCourseService.completeModule(moduleUuid, {
                position: Math.floor(player.duration),
                event: 'completed',
              })
            }
            setIsCompleted(true)
            if (onCompleteRef.current) onCompleteRef.current()
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
          userCourseService.completeModule(moduleUuid, {
            position: Math.floor(currentTime),
            duration: Math.floor(duration),
            event: 'heartbeat',
          })
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

    return () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current)
      }
      if (player) {
        player.destroy()
      }
      if (hls) {
        hls.destroy()
      }
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
      />

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
