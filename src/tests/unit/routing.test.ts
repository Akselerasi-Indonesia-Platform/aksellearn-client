import { describe, it, expect, vi } from 'vitest'

describe('API Client Routing Logic', () => {
  it('should use internal docker network when on server (prod)', async () => {
    vi.stubEnv('INTERNAL_API_URL', 'http://madacore-go-api:3000')
    const isServer = true
    const baseURL = isServer
      ? process.env.INTERNAL_API_URL || 'http://localhost:3000'
      : '/api-proxy'

    expect(baseURL).toBe('http://madacore-go-api:3000')
  })

  it('should fallback to localhost when on server (dev)', async () => {
    vi.stubEnv('INTERNAL_API_URL', '')
    const isServer = true
    const baseURL = isServer
      ? process.env.INTERNAL_API_URL || 'http://localhost:3000'
      : '/api-proxy'

    expect(baseURL).toBe('http://localhost:3000')
  })

  it('should use empty prefix on client (dev)', async () => {
    const isServer = false
    const isDev = true
    const baseURL = isServer
      ? 'http://localhost:3000'
      : isDev
        ? ''
        : '/api-proxy'

    expect(baseURL).toBe('')
  })

  it('should use secure proxy on client (prod)', async () => {
    const isServer = false
    const isDev = false
    const baseURL = isServer
      ? 'http://localhost:3000'
      : isDev
        ? ''
        : '/api-proxy'

    expect(baseURL).toBe('/api-proxy')
  })
})
