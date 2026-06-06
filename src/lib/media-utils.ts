import { getToken } from './auth'

/**
 * Normalizes a media URL to point to the correct endpoint with the required security tokens.
 *
 * Strategy based on Backend "Media Streaming Strategy (Production)":
 * 1. Public images: /media/{uuid}
 * 2. Private images: /api/media/{uuid}/stream?token={JWT}
 * 3. Video (HLS): /api/stream/{uuid}/playlist?token={JWT}
 */
export function getMediaUrl(
  input: string,
  type: 'image' | 'video' | 'stream' = 'image',
  options: { isPublic?: boolean } = {},
): string {
  if (!input || typeof input !== 'string') return ''

  // 1. Resolve Base API URL
  const apiBase =
    (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
  const rootBase = apiBase.replace(/\/api$/, '').replace(/\/$/, '')
  const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase

  // 2. Get the JWT token
  const token = getToken()?.replace('Bearer ', '') || ''

  // 3. Extract UUID if it's already a full URL or path
  let uuid = input
  if (input.includes('/')) {
    const match = input.match(/\/(?:api\/)?(?:media|stream)\/([a-f\d-]+)/i)
    if (match && match[1]) {
      uuid = match[1]
    } else {
      // Last resort: take the last segment if it looks like a valid ID-ish string
      const segments = input.split('/').filter(Boolean)
      if (segments.length > 0) {
        uuid = segments[segments.length - 1].split('?')[0]
      }
    }
  }

  // 4. Implement Stratgegy
  // If it's a UUID or if it was converted to one, we use the strategy routes
  const isPossiblyUuid =
    /^[a-f\d-]{36}$/i.test(uuid) || (uuid.length > 20 && !uuid.includes('.'))

  if (isPossiblyUuid) {
    if (type === 'image') {
      if (options.isPublic) {
        return `${rootBase}/media/${uuid}`
      }
      return `${cleanBase}/api/media/${uuid}/stream${token ? `?token=${token}` : ''}`
    }
    if (type === 'video' || type === 'stream') {
      return `${cleanBase}/api/stream/${uuid}/playlist${token ? `?token=${token}` : ''}`
    }
  }

  // Final absolute URL if relative
  if (input.startsWith('/') && !input.startsWith('//')) {
    const separator = input.includes('?') ? '&' : '?'
    return `${cleanBase}${input}${token ? `${separator}token=${token}` : ''}`
  }

  return input
}

export function isInternalMedia(url: string | null | undefined): boolean {
  if (!url) return false
  const apiBase =
    (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
  return (
    url.startsWith('/') ||
    url.startsWith(apiBase) ||
    url.includes('/api/media/') ||
    url.includes('/api/stream/') ||
    url.includes('/media/')
  )
}
