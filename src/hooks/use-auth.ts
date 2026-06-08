import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  User,
  getUser,
  removeToken,
  setToken,
  setUser as setLocalUser,
  can as libCan,
  isAdmin as libIsAdmin,
} from '@/lib/auth'
import { queryClient } from '@/lib/query-client'
import { authService } from '@/services/auth.service'
import { logger } from '@/lib/logger'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  onboardingRequired: boolean

  // Actions
  setAuth: (user: User, token: string, onboardingRequired?: boolean) => void
  setUser: (user: User) => void
  logout: () => void
  refreshUser: () => void
  rehydrate: () => Promise<void>
  setOnboardingRequired: (required: boolean) => void

  // Helpers (Reactive)
  can: (permission: string) => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getUser(),
      token:
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null,
      isAuthenticated: !!getUser(),
      isLoading: false,
      isInitialized: false,
      onboardingRequired: false,

      setAuth: (user, token, onboardingRequired = false) => {
        setToken(token)
        setLocalUser(user)
        set({ user, token, isAuthenticated: true, onboardingRequired })
      },

      setUser: (user) => {
        setLocalUser(user)
        set({ user, isAuthenticated: !!user })
      },

      setOnboardingRequired: (required: boolean) => {
        set({ onboardingRequired: required })
      },

      logout: () => {
        removeToken()
        queryClient.clear()
        set({ user: null, token: null, isAuthenticated: false, onboardingRequired: false })
      },

      refreshUser: () => {
        const user = getUser()
        set({ user, isAuthenticated: !!user })
      },

      rehydrate: async () => {
        if (typeof window === 'undefined') return

        try {
          console.log('🔄 [Auth Store] Rehydration started...')
          // 1. Hybrid Handshake: Check URL for Social Auth token
          const urlParams = new URLSearchParams(window.location.search)
          const urlToken = urlParams.get('token')
          if (urlToken) {
            logger.identity('Seeding token from URL')
            localStorage.setItem('access_token', urlToken)
            window.history.replaceState({}, document.title, window.location.pathname)
          }

          const user = await authService.getProfile()
          
          if (user) {
            logger.identity('Session Restored', {
              email: user.email,
              primaryRole: user.role || (user.roles?.[0]),
              roles: user.roles,
              permissionCount: user.permissions?.length,
              timestamp: new Date().toISOString()
            })
            setLocalUser(user as any)
            set({ user: user as any, isAuthenticated: true, isInitialized: true })
          } else {
            logger.warn('Identity Audit: No user data returned. Reverting to Guest.')
            set({ isInitialized: true })
          }
        } catch (error: any) {
          logger.error('Rehydration FAILED', { 
            status: error.response?.status, 
            message: error.message 
          })
          set({ user: null, isAuthenticated: false, isInitialized: true })
        }
      },

      can: (permission) => {
        return libCan(permission)
      },

      isAdmin: () => {
        return libIsAdmin()
      },
    }),
    {
      name: 'aksellearn-auth-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // On version mismatch, discard stale state and force a fresh rehydrate
        if (version < 2) return {}
        return persistedState
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingRequired: state.onboardingRequired,
      }),
    },
  ),
)

// Export non-hook versions for use in non-component files if needed
export { libCan as can, libIsAdmin as isAdmin }