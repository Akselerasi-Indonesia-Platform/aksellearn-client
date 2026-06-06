import { getHeader } from 'h3'

/**
 * Structured Operational Logger
 * Captures SSR errors and lifecycle events in a machine-readable format
 */
export default function (nitroApp: any) {
  // Capture request errors
  nitroApp.hooks.hook('error', async (error: any, { event }: any) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message,
      stack: error.stack,
      path: event?.path,
      method: event?.method,
      userAgent: event ? getHeader(event, 'user-agent') : undefined,
    }

    // Log to stderr for Docker log drivers to capture
    console.error(JSON.stringify(errorLog))
  })

  // Log Startup
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Clara Nitro Server Started',
      environment: process.env.NODE_ENV,
      node_version: process.version,
    }),
  )
}
