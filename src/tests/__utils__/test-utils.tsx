import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { vi } from 'vitest'

// Create a clean QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })

// Types for providers
interface TestProvidersProps {
  children: React.ReactNode
}

export function TestProviders({ children }: TestProvidersProps) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  )
}

// Mock all router hooks safely
vi.mock('@tanstack/react-router', () => {
  return {
    useNavigate: vi.fn(() => vi.fn()),
    useSearch: vi.fn(() => ({})),
    useParams: vi.fn(() => ({})),
    useLocation: vi.fn(() => ({ pathname: '/' })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
    Link: vi.fn(({ children, to, className }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    )),
    createFileRoute: vi.fn(() => (config: any) => {
      const route = {
        ...config,
        useSearch: vi.fn(() => ({})),
        useParams: vi.fn(() => ({})),
        useNavigate: vi.fn(() => vi.fn()),
        useMatch: vi.fn(() => ({})),
        useLoaderData: vi.fn(() => ({})),
        update: vi.fn(function (this: any, newConfig: any) {
          Object.assign(this, newConfig)
          return this
        }),
      }
      return route
    }),
    createRootRoute: vi.fn((config: any) => {
      const route = {
        ...config,
        useSearch: vi.fn(() => ({})),
        useParams: vi.fn(() => ({})),
        useNavigate: vi.fn(() => vi.fn()),
        useMatch: vi.fn(() => ({})),
        useLoaderData: vi.fn(() => ({})),
        update: vi.fn(function (this: any, newConfig: any) {
          Object.assign(this, newConfig)
          return this
        }),
      }
      return route
    }),
    createRootRouteWithContext: vi.fn(() => (config: any) => {
      const route = {
        ...config,
        useSearch: vi.fn(() => ({})),
        useParams: vi.fn(() => ({})),
        useNavigate: vi.fn(() => vi.fn()),
        useMatch: vi.fn(() => ({})),
        useLoaderData: vi.fn(() => ({})),
        update: vi.fn(function (this: any, newConfig: any) {
          Object.assign(this, newConfig)
          return this
        }),
      }
      return route
    }),
  }
})

// Catch unhandled errors in tests
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('UNHANDLED ERROR IN JSDOM:', event.error)
  })
}

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProviders })
}
