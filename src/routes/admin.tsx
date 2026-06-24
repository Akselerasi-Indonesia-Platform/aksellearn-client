import * as React from 'react'
import { createFileRoute, Link, Navigate, Outlet, redirect } from '@tanstack/react-router'

import { AdminSidebar } from '@/components/admin/layout/sidebar'
import { AdminHeader } from '@/components/admin/layout/header'
import { AdminFooter } from '@/components/admin/layout/footer'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  isAdmin,
  getUser,
  setUser,
  getToken,
  getCorrectPortalPath,
  ensureValidPortal,
} from '@/lib/auth'
import { authService } from '@/services/auth.service'
import { APP_CONFIG } from '@/config/app'
import { logger } from '@/lib/logger'
import { EmailVerificationBanner } from '@/components/auth/email-verification-banner'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location, context }) => {
    if (typeof window === 'undefined') return
    const isClient = typeof window !== 'undefined'

    let authenticated = false
    let user = null

    if (!isClient) {
      // 1. Server-side: We trust the session by default to allow client-side rehydration.
      // The browser will follow up with a fresh check once the JS boots.
      authenticated = true 
      user = getUser(context.request)
    } else {
      // 2. Client-side: Use store (Wait for rehydration if needed)
      const { useAuthStore } = await import('@/hooks/use-auth')
      let auth = useAuthStore.getState()

      if (!auth.isInitialized) {
        console.log('⏳ [Admin Guard] Waiting for rehydration...')
        await auth.rehydrate()
        auth = useAuthStore.getState()
      }

      authenticated = auth.isAuthenticated
      user = auth.user
    }

    // 3. Authentication Check
    if (!authenticated) {
      // 🛡️ Double-Verification: Check Ground Truth one last time.
      const groundTruthAuth = !!getToken(context.request)
      if (groundTruthAuth) {
        logger.security('Guard: Store was stale, but Ground Truth is valid. Bypassing redirect.')
        authenticated = true
      }
    }

    if (!authenticated) {
      logger.warn('Guard: Not authenticated. Redirecting to login.')
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    // 2. Portal & Admin Enforcement (Stealth Bouncer)
    // If we have a user and they are NOT an admin, divert to 404 immediately.
    if (user && !isAdmin(user)) {
      logger.security(`Stealth Bouncer: Unauthorized access. Diverting to 404.`)
      throw redirect({ to: '/not-found' as any })
    }

    await ensureValidPortal(user, location.pathname, authenticated, isClient)

    // 4. Feature Gating Check
    const FEATURE_MAP: Record<string, string> = {
      '/admin/article': 'articles',
      '/admin/quiz': 'quizzes',
      '/admin/analytics': 'analytics',
      '/admin/exports': 'exports',
    }

    const activeFeaturePath = Object.keys(FEATURE_MAP).find((path) =>
      location.pathname.startsWith(path),
    )

    if (activeFeaturePath) {
      const featureKey = FEATURE_MAP[
        activeFeaturePath
      ] as keyof typeof APP_CONFIG.features
      if (!APP_CONFIG.features[featureKey]) {
        console.warn(
          `Feature [${featureKey}] is disabled. Redirecting from ${location.pathname}`,
        )
        throw redirect({
          to: '/admin/dashboard',
        })
      }
    }
  },
  component: AdminLayout,
  notFoundComponent: AdminNotFound,
})

function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
      <h2 className="text-4xl font-bold tracking-tight text-primary/20 mb-2">
        404
      </h2>
      <h3 className="text-xl font-semibold mb-4">Admin Page Not Found</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The administrative page you're trying to reach doesn't exist or you
        don't have permission to view it.
      </p>
      <Link
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        to="/admin/dashboard"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

function AdminLayout() {
  const [isHydrated, setIsHydrated] = React.useState(false)
  
  React.useEffect(() => {
    setIsHydrated(true)
    document.body.classList.add('admin-theme')
    return () => {
      document.body.classList.remove('admin-theme')
    }
  }, [])

  // 🛡️ Prevent Hydration Mismatch:
  // Server cannot reliably read localStorage, so it will render `null` if the cookie is missing.
  // We must match that on the client's first render to prevent React hydration errors.
  if (!isHydrated) {
    return null
  }

  // 🛡️ Absolute Shield: Deny by Default.
  const user = getUser()
  const userIsAdmin = isAdmin(user || undefined)

  if (!userIsAdmin) {
    if (user) {
      return <Navigate to={"/not-found" as any} replace />
    }
    return null
  }


  // To be absolutely safe against hydration mismatches, we can also defer 
  // the sidebar render until the client is hydrated if needed, but 
  // with the cookie fix, isAdmin() should now be consistent.
  
  return (
    <SidebarProvider className="admin-theme">
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen relative">
        <EmailVerificationBanner />
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
