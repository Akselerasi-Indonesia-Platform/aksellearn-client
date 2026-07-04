import axios from 'axios'
import crypto from 'crypto-js'

import { getToken, removeToken } from './auth'

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string
      VITE_API_APP_ID?: string
      VITE_ENABLE_SIGNATURE?: string
    }
  }
}

// Global state for App ID (supports Tiara identity)
let currentAppId: string | null = null

export const setAppId = (id: string | null) => {
  currentAppId = id
}

// 1. Detect environment
export const isServer = typeof window === 'undefined'

// Initialize boot timestamp for grace period logic
if (!isServer) {
  if (!(window as any).__APP_BOOT_TIME__) {
    ;(window as any).__APP_BOOT_TIME__ = Date.now()
  }

  // NUCLEAR DEBUG: Monitor localStorage for silent deletions
  let lastToken = localStorage.getItem('auth_token')
  setInterval(() => {
    const currentToken = localStorage.getItem('auth_token')
    if (lastToken && !currentToken) {
      console.error('🚨 [Storage Watcher] AUTH_TOKEN VANISHED!', {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
      })
    }
    lastToken = currentToken
  }, 100)
}

// 2. Select appropriate Base URL
// - If Server (SSR): Use Internal Docker Network in prod, or local IP in dev
// - If Client Prod: Use the Nitro Proxy (Secure, Hidden Secrets)
// - If Client Dev: Use empty prefix (Let Vite Proxy handle /api)
const baseURL = isServer
  ? process.env.INTERNAL_API_URL ||
    process.env.VITE_API_URL ||
    'http://127.0.0.1:3000'
  : '/api-proxy'

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // 🚨 ESSENTIAL: Sends HttpOnly cookies with requests
})

export const getProxyUrl = (url: string) => {
  if (isServer || !url || typeof url !== 'string') return url

  // If the URL is already absolute (starts with http), just return it as requested.
  // This allows the backend to control the full URL (local IP, domain, or CDN).
  if (url.startsWith('http')) {
    return url
  }

  // Handle relative paths for consistency (especially for API calls or storage paths)
  const isProd =
    import.meta.env.PROD || window?.__ENV__?.VITE_ENABLE_SIGNATURE === 'true'
  const prefix = isProd ? '/api-proxy' : ''

  const backendPrefixes = ['/api', '/media', '/storage', '/auth']
  const isBackendPath = backendPrefixes.some((p) => url.startsWith(p))

  if (isBackendPath && !url.startsWith('/api-proxy')) {
    return `${prefix}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return url
}

export function generateSignature(method: string, url: string, data?: any) {
  // Only the server has access to VITE_API_APP_SECRET
  // The client will have undefined for appSecret and automatically skip signing
  const appId =
    currentAppId ||
    (isServer
      ? process.env.VITE_API_APP_ID
      : window?.__ENV__?.VITE_API_APP_ID ||
        (typeof import.meta !== 'undefined' &&
          import.meta.env?.VITE_API_APP_ID))

  // SSR: Check for multiple secret names for backward/backend compatibility
  const appSecret = isServer
    ? process.env.CLARA_APP_SECRET ||
      process.env.API_APP_SECRET ||
      process.env.VITE_API_APP_SECRET
    : undefined

  if (!appId || !appSecret) return null

  const timestamp = Math.floor(Date.now() / 1000).toString()

  // 1. Determine ContentHash (Elite V2 Strategy)
  // For multipart/form-data (file uploads), we use "STREAM" instead of hashing the content
  const isMultipart = data instanceof FormData
  let contentHash = ''

  if (isMultipart) {
    contentHash = 'STREAM'
  } else {
    // For normal JSON bodies, we hash the stringified body
    const body = data
      ? typeof data === 'string'
        ? data
        : JSON.stringify(data)
      : ''
    contentHash = crypto.SHA256(body).toString(crypto.enc.Hex)
  }

  // 2. Normalize URL to extract path and query (Backend expects Method + PathAndQuery + Timestamp + ContentHash)
  let pathAndQuery = ''
  try {
    const urlObj = new URL(url, 'http://a.b')
    const params = urlObj.searchParams
    const keys = Array.from(new Set(params.keys())).sort()
    const sortedParams = new URLSearchParams()
    keys.forEach((key) => {
      const values = params.getAll(key).sort()
      values.forEach((v) => sortedParams.append(key, v))
    })

    const searchStr = sortedParams.toString()
    pathAndQuery = urlObj.pathname + (searchStr ? `?${searchStr}` : '')

    // CRITICAL: Strip the internal proxy prefix if it exists.
    // The backend doesn't see '/api-proxy', so it shouldn't be in the signature.
    pathAndQuery = pathAndQuery.replace(/^\/api-proxy/, '')
  } catch (e) {
    pathAndQuery = url.startsWith('/') ? url : `/${url}`
    pathAndQuery = pathAndQuery.replace(/^\/api-proxy/, '')
  }

  // 3. Construct Payload and Generate Signature
  const payload = method.toUpperCase() + pathAndQuery + timestamp + contentHash
  const signature = crypto
    .HmacSHA256(payload, appSecret)
    .toString(crypto.enc.Hex)

  return {
    'X-App-ID': appId,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
    'X-Content-SHA256': contentHash,
  }
}

apiClient.interceptors.request.use(
  async (config) => {
    // 0. SSR Cookie Forwarding (Cookie-First Alignment)
    if (isServer) {
      const { getSSRRequest } = await import('./auth')
      const req = getSSRRequest()
      if (req) {
        const cookie = req.headers.get('cookie')
        if (cookie) config.headers.cookie = cookie
      }
    }

    // 1. Force proxy for internal URLs (absolute or specific relative paths)
    if (config.url) {
      const proxied = getProxyUrl(config.url)
      if (proxied.startsWith('/api-proxy') && proxied !== config.url) {
        config.url = proxied
        config.baseURL = '' // Clear baseURL to avoid double-prefixing since getProxyUrl already added it
      } else {
        config.url = proxied
      }
    }

    // Note: Manual Authorization header is no longer required for primary API calls
    // as the backend now uses HttpOnly cookies. We keep this only as a fallback
    // for legacy endpoints or specific media requests if needed.
    const token = getToken()
    if (token && !isServer) {
      // config.headers.Authorization = `Bearer ${token}`
    }

    // Always include X-Session-Token to link cart session across authenticated/unauthenticated states
    if (!isServer) {
      let sessionToken = localStorage.getItem('x_session_token')
      if (!sessionToken) {
        // Robust UUID v4 generator fallback
        if (window.crypto?.randomUUID) {
          sessionToken = window.crypto.randomUUID()
        } else {
          sessionToken = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            (c) => {
              const r = (Math.random() * 16) | 0
              const v = c === 'x' ? r : (r & 0x3) | 0x8
              return v.toString(16)
            },
          )
        }
        localStorage.setItem('x_session_token', sessionToken)
      }
      config.headers['X-Session-Token'] = sessionToken
    }

    // Only sign if enabled or in production mode
    const isSignatureEnabled = isServer
      ? process.env.VITE_ENABLE_SIGNATURE === 'true'
      : window?.__ENV__?.VITE_ENABLE_SIGNATURE === 'true' ||
        (typeof import.meta !== 'undefined' &&
          import.meta.env?.VITE_ENABLE_SIGNATURE === 'true')

    if (
      isSignatureEnabled ||
      (typeof import.meta !== 'undefined' && import.meta.env?.PROD)
    ) {
      let fullUrl = ''
      const configUrl = config.url || ''

      if (configUrl.startsWith('http')) {
        fullUrl = configUrl
      } else {
        const currentBase = config.baseURL?.replace(/\/$/, '') || ''
        const path = configUrl.startsWith('/') ? configUrl : `/${configUrl}`
        fullUrl = currentBase + path
      }

      if (config.params || config.url?.includes('?')) {
        const params = new URLSearchParams()
        if (config.url?.includes('?')) {
          const [urlPath, urlQuery] = config.url.split('?')
          new URLSearchParams(urlQuery).forEach((value, key) => {
            params.append(key, value)
          })
          config.url = urlPath
        }

        if (config.params) {
          Object.entries(config.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value))
            }
          })
        }

        const sortedParams = new URLSearchParams()
        const keys = Array.from(params.keys()).sort()
        keys.forEach((key) => {
          const values = params.getAll(key).sort()
          values.forEach((v) => sortedParams.append(key, v))
        })

        const queryString = sortedParams.toString()
        if (queryString) {
          fullUrl = fullUrl.split('?')[0] + '?' + queryString
          if (config.url) {
            config.url = config.url.split('?')[0] + '?' + queryString
            config.params = undefined
          }
        }
      }

      const sigHeaders = generateSignature(
        config.method || 'GET',
        config.url || '',
        config.data,
      )
      if (sigHeaders) {
        Object.entries(sigHeaders).forEach(([key, value]) => {
          config.headers.set(key, value)
        })
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => {
    // 🛡️ Implicit Verification for Commerce Endpoints
    if (typeof window !== 'undefined') {
      const url = response.config.url || ''
      if (url.includes('/api/v1/cart') || url.includes('/api/v1/enroll')) {
        import('@/hooks/use-auth').then(({ useAuthStore }) => {
          const authStore = useAuthStore.getState()
          if (authStore.user && !authStore.user.email_verified_at) {
            authStore.setUser({
              ...authStore.user,
              email_verified_at: new Date().toISOString()
            } as any)
          }
        })
      }
    }
    return response
  },
  async (error) => {
    const isBrowser = typeof window !== 'undefined'
    const originalRequest = error.config

    if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
      if (isBrowser) {
        import('@/hooks/use-auth').then(({ useAuthStore }) => {
          const authStore = useAuthStore.getState()
          if (authStore.user && authStore.user.email_verified_at) {
            authStore.setUser({
              ...authStore.user,
              email_verified_at: null
            } as any)
          }
        })
        import('sonner').then(({ toast }) => {
          toast.error('Verification Required', {
            description: error.response?.data?.message || 'Please verify your email address to continue.'
          })
        })
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 429) {
      // INDUSTRY STANDARD UX: Suppress toast for background polling tasks
      const isSilent = originalRequest?.headers?.['X-Silent'] === 'true'
      
      if (isBrowser && !isSilent) {
        import('sonner').then(({ toast }) => {
          toast.error('Whoops, you are going too fast! 🐢', {
            description: 'Please slow down and wait a moment before trying again.',
          })
        })
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      const appBootTime = (window as any).__APP_BOOT_TIME__ || Date.now()
      const timeSinceBoot = Date.now() - appBootTime

      // 🛑 SSR Safety: Never trigger a hard logout or redirect on the server
      if (!isBrowser) {
        return Promise.reject(error)
      }

      // 🛡️ Hydration Shield: Ignore 401s during the first 5 seconds
      if (timeSinceBoot < 5000) {
        return Promise.reject(error)
      }

      // 🔄 4. Refresh Token Logic (BE Guide Alignment)
      // If we haven't tried to retry yet, attempt to refresh the session
      if (!originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
        originalRequest._retry = true
        console.log('🔄 [API Client] Token expired. Attempting silent refresh...')

        try {
          // This endpoint will update the access_token cookie
          await apiClient.post('/api/auth/refresh')
          console.log('✅ [API Client] Refresh successful. Retrying original request.')
          return apiClient(originalRequest)
        } catch (refreshError) {
          console.error('❌ [API Client] Refresh failed. Session truly expired.')
          // Fall through to logout
        }
      }

      console.error(
        '🛑 [API Client] Session expired! Kicking to login.',
        {
          url: error.config?.url,
          timestamp: new Date().toISOString(),
        },
      )

      removeToken()
      const loginPaths = ['/login', '/admin/login', '/login-new']
      const isLoginPage =
        isBrowser &&
        loginPaths.some((path) => window.location.pathname.startsWith(path))

      if (isBrowser && !isLoginPage) {
        window.location.href =
          '/login?reason=session_expired&from=' +
          encodeURIComponent(window.location.pathname)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
