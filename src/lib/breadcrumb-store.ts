import { create } from 'zustand'

interface BreadcrumbStore {
  labels: Record<string, string>
  setLabel: (key: string, label: string) => void
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  labels: {},
  setLabel: (key, label) =>
    set((state) => ({
      labels: { ...state.labels, [key]: label },
    })),
}))
