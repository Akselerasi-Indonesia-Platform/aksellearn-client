import Cookies from 'js-cookie'
import { redirect } from '@tanstack/react-router'
import { logger } from './logger'

export const AUTH_TOKEN_KEY = 'access_token'
export const AUTH_USER_KEY = 'auth_user'

export const ADMIN_PERMISSIONS = [
  'access.admin_portal',
  'admin.access',
  'super.admin',
  'manage_all',
]

// SSR Context Storage (Server-only)
let ssrRequest: Request | null = null

export const setSSRRequest = (request: Request | null) => {
  ssrRequest = request
}

export const getSSRRequest = () => ssrRequest

const isProd =
  typeof window !== 'undefined'
    ? window.location.protocol === 'https:'
    : process.env.NODE_ENV === 'production' &&
      !process.env.VITE_API_URL?.includes('localhost')

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7,
  path: '/',
  sameSite: 'Lax',
  secure: isProd,
}

// 4KB is the standard browser limit, but we use a safer 3.8KB threshold for raw data
const MAX_COOKIE_SIZE = 3800

export interface User {
  id: string
  uuid: string
  name: string
  email: string
  phone?: string
  role?: string // 🛡️ Optional: UI fallback uses roles[0]
  roles: string[]
  permissions: string[]
  avatar?: string
  avatar_url?: string
  email_verified_at?: string | null
  profile?: {
    display_name?: string
    username?: string
    bio?: string
    avatar_url?: string
  }
  organizations?: {
    uuid: string
    name: string
    logo_url?: string
  }[]
}

/**
 * Get token with SSR support
 */
export const getToken = (request?: Request) => {
  const activeRequest = request || ssrRequest

  // 1. Server-side: Extract from Request Headers (Only if truly on server)
  if (activeRequest && typeof window === 'undefined') {
    const cookieHeader = activeRequest.headers.get('cookie') || ''
    
    // Robust parsing for multiple cookies
    const cookies = cookieHeader.split(';').reduce((acc, curr) => {
      const [key, ...value] = curr.split('=')
      acc[key.trim()] = value.join('=')
      return acc
    }, {} as Record<string, string>)

    const token = cookies[AUTH_TOKEN_KEY]
    
    if (token) {
      // console.log(`[SSR Auth] Found ${AUTH_TOKEN_KEY} in headers`)
      return decodeURIComponent(token)
    }

    // console.warn(`[SSR Auth] ${AUTH_TOKEN_KEY} NOT FOUND in cookie header`, { 
    //   available: Object.keys(cookies) 
    // })
    return null
  }

  // 2. Client-side: In a Cookie-First world, JS cannot read HttpOnly tokens.
  // Resilience: If we have it in localStorage, we can use it as a fallback/seed.
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(AUTH_TOKEN_KEY)
    
    // 🛡️ Self-Heal: If we have a local token but no cookie is visible to JS (and it's not HttpOnly)
    // we restore it to ensure SSR works on the NEXT reload.
    if (localToken && typeof document !== 'undefined' && !Cookies.get(AUTH_TOKEN_KEY)) {
       Cookies.set(AUTH_TOKEN_KEY, localToken, COOKIE_OPTIONS)
    }
    
    return localToken
  }

  return null
}

export const setToken = (token: string) => {
  if (typeof document !== 'undefined') {
    Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTIONS)
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export const getUser = (request?: Request): User | null => {
  const activeRequest = request || ssrRequest

  // 1. Server-side: Must use Cookie (Only if truly on server)
  if (activeRequest && typeof window === 'undefined') {
    const cookieHeader = activeRequest.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').reduce((acc, curr) => {
      const [key, ...value] = curr.split('=')
      acc[key.trim()] = value.join('=')
      return acc
    }, {} as Record<string, string>)

    const userCookie = cookies[AUTH_USER_KEY]
    if (userCookie) {
      try {
        return JSON.parse(decodeURIComponent(userCookie)) as User
      } catch (e) {
        return null
      }
    }
    return null
  }

  // 2. Client-side: LocalStorage is the UI cache for User info
  if (typeof window !== 'undefined') {
    const localUser = localStorage.getItem(AUTH_USER_KEY)
    if (localUser) {
      try {
        return JSON.parse(localUser) as User
      } catch (e) {
        return null
      }
    }
  }

  return null
}

export const setUser = (user: User) => {
  // 1. UI Cache for LocalStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }

  // 2. Cookie for SSR (Non-HttpOnly version for light hydration)
  // We only store minimal info here. The real HttpOnly cookie is managed by the BE.
  let activeRole = user.role
  if (!activeRole && user.roles && user.roles.length > 0) {
    const firstRole = user.roles[0]
    activeRole = typeof firstRole === 'string' ? firstRole : (firstRole as any)?.name
  }

  const optimizedUser = {
    id: user.id,
    uuid: user.uuid,
    name: user.name,
    email: user.email,
    email_verified_at: user.email_verified_at,
    role: activeRole,
    roles: user.roles,
    permissions: user.permissions,
  }

  if (typeof document !== 'undefined') {
    Cookies.set(AUTH_USER_KEY, JSON.stringify(optimizedUser), COOKIE_OPTIONS)
  }
}

export const removeToken = () => {
  if (typeof document !== 'undefined') {
    Cookies.remove(AUTH_TOKEN_KEY, COOKIE_OPTIONS)
    Cookies.remove(AUTH_USER_KEY, COOKIE_OPTIONS)
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem('aksellearn-auth-storage')
  }
}

export const isAuthenticated = (request?: Request) => !!getToken(request)

/**
 * Check if the user has a specific permission.
 */
export const can = (permission: string, requestOrUser?: Request | User) => {
  let user: User | null = null

  if (requestOrUser && 'role' in (requestOrUser as any)) {
    user = requestOrUser as User
  } else {
    user = getUser(requestOrUser as Request)
  }

  if (!user) return false

  const permissions = user.permissions || []
  const target = permission.toLowerCase().trim()

  return permissions.some((p: any) => {
    const pName = (typeof p === 'string' ? p : p.name || '').toLowerCase().trim()
    return (
      pName === target ||
      pName.replace(/[._ ]/g, ' ') === target.replace(/[._ ]/g, ' ')
    )
  })
}

/**
 * Specifically check if the user has access to the admin portal.
 * ALIGNED WITH BE: Strictly uses permissions, not role names.
 */
export const isAdmin = (requestOrUser?: Request | User) => {
  let user: User | null = null

  if (requestOrUser && 'role' in (requestOrUser as any)) {
    user = requestOrUser as User
  } else {
    // If not passing a User object, verify we are actually authenticated
    if (!isAuthenticated(requestOrUser as Request)) return false
    user = getUser(requestOrUser as Request)
  }

  if (!user) return false

  // 1. Permission-based check (The "Elite Pro" Truth)
  // We check for the specific 'gatekeeper' permissions defined by the BE.
  const hasAdminPermission = ADMIN_PERMISSIONS.some(p => can(p, user))

  return hasAdminPermission
}

/**
 * Portal Enforcement Strategy:
 * Determine the correct path for a user based on their role and current location.
 * Returns null if the user is in the correct portal.
 */
export const getCorrectPortalPath = (
  user: User | null,
  currentPath: string,
  isAuthenticated: boolean,
): string | null => {
  // If no user object, but we are authenticated, do NOT redirect to login yet.
  // We might be hydrating or waiting for profile fetch.
  if (!user) {
    return isAuthenticated ? null : '/login'
  }

  const userIsAdmin = isAdmin(user)
  // 🗺️ Portal Boundary Definitions
  const ADMIN_PREFIX = '/admin'
  const STUDENT_PATHS = ['/student', '/student/dashboard', '/student/learn', '/student/profile', '/student/order', '/student/notification']
  
  const isAdminPath = currentPath === ADMIN_PREFIX || currentPath.startsWith(`${ADMIN_PREFIX}/`)
  const isStudentPath = currentPath === '/' || currentPath.startsWith('/student') || STUDENT_PATHS.some(p => currentPath === p || currentPath.startsWith(`${p}/`))

  logger.router(`Portal Enforcement [${currentPath}]`, {
    userIsAdmin,
    isStudentPath,
    isAdminPath,
  })

  // 🛡️ RULE 1: Admin in Student Portal (Stealth Isolation)
  // Admins are prohibited from using internal student dashboard routes.
  // We allow access to the public home page (/) for everyone.
  if (userIsAdmin && isStudentPath && currentPath !== '/') {
    logger.security(`Unauthorized access by Admin to student path [${currentPath}]. Diverting to 404.`)
    return '/not-found'
  }

  // 🛡️ RULE 2: Student in Admin Portal (Stealth Isolation)
  if (isAdminPath) {
    if (user && !userIsAdmin) {
      logger.security(`Unauthorized access by Student to admin path [${currentPath}]. Diverting to 404.`)
      return '/not-found'
    }
    // If authenticated but no user info, stay on Admin path (Safe for SSR)
    return null
  }

  // 🛡️ RULE 3: Authenticated user on Login page
  if (currentPath.startsWith('/login')) {
    return userIsAdmin ? '/admin/dashboard' : '/student/dashboard'
  }

  return null
}

/**
 * Validates portal access and performs necessary redirections.
 * Optimized for TanStack Router's beforeLoad.
 */
export const ensureValidPortal = async (
  user: User | null,
  pathname: string,
  isAuthenticated: boolean,
  isClient: boolean,
) => {
  if (!isAuthenticated) return null // Let the auth guard handle this

  let activeUser = user
  let targetPath = getCorrectPortalPath(activeUser, pathname, isAuthenticated)

  // If redirection is suggested but we lack full user data on the client, try a one-time sync
  if (targetPath && !activeUser && isClient) {
    try {
      const { authService } = await import('@/services/auth.service')
      activeUser = (await authService.getProfile()) as any
      setUser(activeUser as any)
      targetPath = getCorrectPortalPath(activeUser, pathname, isAuthenticated)
    } catch (e) {
      console.error('[AUTH] Failed to sync profile during portal validation', e)
    }
  }

  // Special Case: Admin Portal check requires absolute certainty
  const isAdminPath = pathname.startsWith('/admin')
  if (isAdminPath && activeUser && !isAdmin(activeUser) && isClient) {
    try {
      const { authService } = await import('@/services/auth.service')
      activeUser = (await authService.getProfile()) as any
      setUser(activeUser as any)
      targetPath = getCorrectPortalPath(activeUser, pathname, isAuthenticated)
    } catch (e) {
      // Fallback to current targetPath
    }
  }

  if (targetPath && targetPath !== pathname) {
    throw redirect({ to: targetPath, replace: true })
  }

  return activeUser
}
