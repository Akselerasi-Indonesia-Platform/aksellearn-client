import {
  defineEventHandler,
  proxyRequest,
  getHeader,
  getHeaders,
  getMethod,
  getQuery,
  readRawBody,
  createError,
} from 'h3'
import crypto from 'crypto-js'
import { logger } from '@/lib/logger'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // 1. Get the path without the proxy prefix
  const rawPath = event.path.replace(/^\/api-proxy/, '')
  const pathPart = rawPath.split('?')[0]

  // 2. Setup targets
  // Robust target resolution:
  // 1. If we are in DEV, we generally want VITE_API_URL (localhost) unless specified.
  // 2. We skip INTERNAL_API_URL in dev if it contains 'madacore-go-api' (Docker service name) and we're on Windows.
  const isDev = process.env.NODE_ENV !== 'production'
  const isWindows = process.platform === 'win32'

  let targetBase =
    process.env.INTERNAL_API_URL ||
    process.env.VITE_API_URL ||
    'http://localhost:3000'

  if (isDev && isWindows && targetBase.includes('madacore-go-api')) {
    targetBase = process.env.VITE_API_URL || 'http://localhost:3000'
    logger.info(
      `Dev Fallback: Using ${targetBase} instead of Docker service name`,
    )
  }

  const targetUrl = `${targetBase.replace(/\/$/, '')}${rawPath}`

  // 3. Log incoming request for debugging
  logger.api(`${method} ${event.path} -> ${targetUrl}`)

  // 4. Security Signature Logic
  const appId = process.env.VITE_API_APP_ID
  const appSecret =
    process.env.CLARA_APP_SECRET ||
    process.env.API_APP_SECRET ||
    process.env.VITE_API_APP_SECRET
  const isEnabled = process.env.VITE_ENABLE_SIGNATURE === 'true'

  const contentType = getHeader(event, 'content-type') || ''
  const isMultipart = contentType.includes('multipart/form-data')

  let body: any = undefined
  let bodyText = ''

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    if (isMultipart) {
      // Do NOT manually set body for multipart/file uploads.
      // proxyRequest() internally reads event.req.body (H3's own runtime-agnostic
      // Web ReadableStream) and streams it to the target. Manually assigning body
      // here via event.node.req or event.request.body only OVERRIDES and breaks it.
      // body stays undefined → fetchOptions spread is {} → H3's requestBody wins.
      bodyText = ''
    } else {
      const rawBody = await readRawBody(event)
      body = rawBody

      if (rawBody) {
        bodyText = Buffer.isBuffer(rawBody)
          ? rawBody.toString('utf8')
          : String(rawBody)
      }
    }
  }

  const headers: Record<string, string> = {}

  // Forward incoming headers except restricted ones
  const incomingHeaders = getHeaders(event)
  const restrictedHeaders = [
    'host',
    'content-length',
    'transfer-encoding',
    'connection',
  ]

  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (
      !restrictedHeaders.includes(key.toLowerCase()) &&
      typeof value === 'string'
    ) {
      headers[key] = value
    }
  }

  // Ensure authorization header is present
  if (!headers['authorization'])
    headers['authorization'] = getHeader(event, 'authorization') || ''

  // Final check for content-type
  if (!headers['content-type']) {
    headers['content-type'] =
      getHeader(event, 'content-type') || 'application/json'
  }

  // SOCIAL LOGIN BYPASS: Do not sign social login redirects as they are public/browser-initiated
  const isSocialLogin = pathPart.includes('/auth/social/')
  const shouldSign = isEnabled && appId && appSecret && !isSocialLogin

  if (shouldSign) {
    const timestamp = Math.floor(Date.now() / 1000).toString()

    let finalPath = pathPart
    const queryKeys = Object.keys(query).sort()
    if (queryKeys.length > 0) {
      const params = new URLSearchParams()
      queryKeys.forEach((key) => {
        const val = query[key]
        if (Array.isArray(val)) {
          const values = [...val].sort()
          values.forEach((v) => params.append(key, String(v)))
        } else if (val !== undefined) {
          params.append(key, String(val))
        }
      })
      finalPath = `${pathPart}?${params.toString()}`
    }

    let contentHash = ''
    if (isMultipart) {
      contentHash = 'STREAM'
    } else {
      contentHash = crypto.SHA256(bodyText).toString(crypto.enc.Hex)
    }

    const pathAndQuery = finalPath.startsWith('/') ? finalPath : `/${finalPath}`
    const payload =
      method.toUpperCase() + pathAndQuery + timestamp + contentHash
    const signature = crypto
      .HmacSHA256(payload, appSecret)
      .toString(crypto.enc.Hex)

    headers['X-App-ID'] = appId
    headers['X-Timestamp'] = timestamp
    headers['X-Signature'] = signature
    headers['X-Content-SHA256'] = contentHash
  }

  // CRITICAL: On Windows, some Node versions fail if 'host' header remains from the browser request
  delete headers['host']
  delete (headers as any)['Host']

  try {
    const response = await proxyRequest(event, targetUrl, {
      headers,
      fetchOptions: {
        method,
        redirect: isSocialLogin ? 'manual' : 'follow',
        ...(body !== undefined ? { body, duplex: 'half' } : {}),
      },
    })

    return response
  } catch (e: any) {
    logger.error(
      `Proxy Connection Failure: Target: ${targetUrl} | Error: ${e.message}`,
    )

    throw createError({
      statusCode: e.statusCode || 502,
      statusMessage: `Backend Unreachable at ${targetUrl}. Ensure Go server is running on 127.0.0.1:3000. Detail: ${e.message}`,
      data: {
        target: targetUrl,
        method,
        error: e.message,
      },
    })
  }
})
