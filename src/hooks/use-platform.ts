import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { platformService, type PlatformProfile } from '@/services/platform.service'

interface PlatformState {
  profile: PlatformProfile | null
  isLoading: boolean
  error: Error | null
  fetchProfile: () => Promise<void>
  setProfile: (profile: PlatformProfile) => void
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,
      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null })
          const profile = await platformService.getProfile()
          set({ profile, isLoading: false })
          
          // Apply theming
          if (profile.platform_primary_color) {
            // Very simple approach for Tailwind HSL colors, assuming hex from backend
            // In a real app, you might need a hex-to-hsl converter
            // We just let the backend send the hex and we can apply it.
            // document.documentElement.style.setProperty('--color-primary', profile.platform_primary_color);
          }
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },
      setProfile: (profile: PlatformProfile) => set({ profile }),
    }),
    {
      name: 'platform-storage',
    }
  )
)
