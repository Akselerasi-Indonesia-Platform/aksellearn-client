import * as React from 'react'
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { setSSRRequest } from '@/lib/auth'
import { useAuthStore } from '@/hooks/use-auth'
import { usePlatformStore } from '@/hooks/use-platform'

import appCss from '../styles.css?url'

const TanStackDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-devtools').then((res) => ({
        default: res.TanStackDevtools,
      })),
    )

const TanStackRouterDevtoolsPanel = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtoolsPanel,
      })),
    )

interface MyRouterContext {
  request?: Request
  queryClient?: any
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context, location }) => {
    // 1. Inject the request context for SSR
    if (typeof window === 'undefined' && context.request) {
      setSSRRequest(context.request)
    }

    // 2. Rehydration Boot Phase - always fetch fresh profile to sync verification state
    if (typeof window !== 'undefined') {
      const auth = useAuthStore.getState()
      // Always rehydrate if authenticated to ensure email_verified_at stays fresh
      // even if already initialized from persisted storage
      const hasStoredAuth = !!localStorage.getItem('access_token') || !!auth.isAuthenticated
      if (!auth.isInitialized || hasStoredAuth) {
        await auth.rehydrate()
      }

      // Initialize Platform Theme
      const platform = usePlatformStore.getState()
      if (!platform.profile && !platform.isLoading) {
        platform.fetchProfile().then(() => {
          const profile = usePlatformStore.getState().profile
          if (profile?.platform_primary_color) {
            // Because styles.css defines primary using OKLCH and Filament Amber,
            // standard override of --primary using HEX is supported by browser,
            // but we use a specialized approach if we want to retain full OKLCH support.
            // For now we set --primary directly as hex which works in most modern browsers.
            document.documentElement.style.setProperty('--primary', profile.platform_primary_color)
          }
        })
      }

      // 3. Global Portal Middleware (Safety Net)
      const { getUser, getToken, ensureValidPortal } = await import('@/lib/auth')
      await ensureValidPortal(getUser(), location.pathname, !!getToken(), true)
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Clara | Core Learning App',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/assets/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/assets/apple-touch-icon.png',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: '',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
      <div className="space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-primary/10 tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-bold tracking-tight">Oops!</h2>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h3>
          <p className="text-muted-foreground text-balanced">
            It seems like the page you are looking for doesn't exist or has been
            moved to a new location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            to="/"
          >
            Go back home
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => window.history.back()}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}

import { GlobalAuthSync } from '@/components/auth/global-auth-sync'

function RootDocument({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const { profile } = usePlatformStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | ${profile.tagline || 'Core Learning App'}`
    } else {
      document.title = 'Clara | Core Learning App'
    }

    if (profile?.favicon?.url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = profile.favicon.url
      }
      const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement
      if (appleLink) {
        appleLink.href = profile.favicon.url
      }
    }
  }, [profile])

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = ${JSON.stringify({
              VITE_API_URL: import.meta.env.VITE_API_URL,
              VITE_API_APP_ID: import.meta.env.VITE_API_APP_ID,
              VITE_ENABLE_SIGNATURE: import.meta.env.VITE_ENABLE_SIGNATURE,
              LANGUAGE: 'id',
            })}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          {mounted && <GlobalAuthSync />}
          {children}
          {mounted && !import.meta.env.PROD && (
            <React.Suspense>
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
              <ReactQueryDevtools initialIsOpen={false} />
            </React.Suspense>
          )}
          {mounted && <Toaster position="bottom-right" />}
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}
