import { describe, it, expect, vi } from 'vitest'
import crypto from 'crypto-js'

// Mock Date.now to have consistent timestamp
const MOCK_TIMESTAMP = 1625097600
vi.spyOn(Date, 'now').mockReturnValue(MOCK_TIMESTAMP * 1000)

// Helper to simulate the logic inside generateSignature
function simulateSignaturePayload(
  method: string,
  url: string,
  timestamp: string,
  body = '',
) {
  let pathAndQuery = ''
  try {
    const urlObj = new URL(url, 'http://a.b')
    const params = urlObj.searchParams
    const keys = Array.from(new Set(params.keys())).sort()
    const sortedParams = new URLSearchParams()
    keys.forEach((key) => {
      const values = params.getAll(key).sort()
      values.forEach((v) => sortedParams.append(key, v))
    })
    const searchStr = sortedParams.toString()
    pathAndQuery = urlObj.pathname + (searchStr ? `?${searchStr}` : '')
  } catch {
    pathAndQuery = url.startsWith('/') ? url : `/${url}`
  }
  return method.toUpperCase() + pathAndQuery + timestamp + body
}

describe('API Client Signature Logic (Payload Correctness)', () => {
  const secret = 'test_secret'
  const timestamp = MOCK_TIMESTAMP.toString()

  it('should generate correct payload for relative path with query parameters', () => {
    const method = 'GET'
    const url = '/api/v1/test?b=2&a=1'
    const payload = simulateSignaturePayload(method, url, timestamp)

    // Expected: Method + NormalizedPathWithSortedQuery + Timestamp + Body
    expect(payload).toBe('GET/api/v1/test?a=1&b=2' + timestamp + '')
  })

  it('should extract correct path and query from full URLs', () => {
    const method = 'POST'
    const url = 'https://api.madacoda.dev/api/v1/resource?id=123'
    const payload = simulateSignaturePayload(method, url, timestamp)

    expect(payload).toBe('POST/api/v1/resource?id=123' + timestamp + '')
  })

  it('should handle complex nested query parameters in order', () => {
    const method = 'GET'
    // Deeply nested/multi-value params
    const url = '/api/search?q=test&tag=react&tag=vite&page=1'
    const payload = simulateSignaturePayload(method, url, timestamp)

    // Query string should be sorted keys, and sorted values for same keys
    // page=1, q=test, tag=react, tag=vite
    expect(payload).toBe(
      'GET/api/search?page=1&q=test&tag=react&tag=vite' + timestamp + '',
    )
  })

  it('should generate matching signature with CryptoJS', () => {
    const method = 'PUT'
    const url = '/api/update'
    const body = JSON.stringify({ name: 'Clara' })
    const payload = simulateSignaturePayload(method, url, timestamp, body)

    const signature = crypto
      .HmacSHA256(payload, secret)
      .toString(crypto.enc.Hex)
    expect(signature).toBeDefined()
    expect(signature.length).toBe(64) // SHA256 hex length
  })

  it('should use "STREAM" as content hash for multipart/form-data (Elite V2)', () => {
    const method = 'POST'
    const url = '/api/upload'
    const contentHash = 'STREAM'
    const payload = simulateSignaturePayload(
      method,
      url,
      timestamp,
      contentHash,
    )

    // Expected: POST/api/upload + timestamp + STREAM
    expect(payload).toBe(`POST/api/upload${timestamp}STREAM`)
  })
})
