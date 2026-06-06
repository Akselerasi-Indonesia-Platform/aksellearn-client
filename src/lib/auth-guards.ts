import { getUser } from '@/lib/auth'

function getActiveUser() {
  // Prefer Zustand store (always fresh after rehydration) over stale localStorage snapshot
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('clara-auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.user) return parsed.state.user
      }
    } catch (_) {}
  }
  return getUser()
}

export function isEmailVerified(): boolean {
  const user = getActiveUser()
  return !!user?.email_verified_at
}

export function requiresEmailVerification(): boolean {
  const user = getActiveUser()
  return !!user && !user.email_verified_at
}
