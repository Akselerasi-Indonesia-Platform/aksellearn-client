import { create } from 'zustand'

interface UIState {
  isMiniCartOpen: boolean
  openMiniCart: () => void
  closeMiniCart: () => void
  toggleMiniCart: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isMiniCartOpen: false,
  openMiniCart: () => set({ isMiniCartOpen: true }),
  closeMiniCart: () => set({ isMiniCartOpen: false }),
  toggleMiniCart: () =>
    set((state) => ({ isMiniCartOpen: !state.isMiniCartOpen })),
}))
