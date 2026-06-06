/**
 * Madacore Premium Logger
 * Centralized logging utility for development auditing and production stability.
 */

const isDev = import.meta.env.DEV

// 🛡️ Secret Toggle: Enables logs if in DEV or if manually enabled via localStorage
const isDebugEnabled = typeof window !== 'undefined' && 
  (localStorage.getItem('MADACORE_DEBUG') === 'true' || isDev)

type LogLevel = 'identity' | 'security' | 'router' | 'api' | 'info' | 'warn' | 'error'

interface LogOptions {
  data?: any
  force?: boolean
}

const COLORS = {
  identity: '#3b82f6', // Blue
  security: '#f59e0b', // Amber/Gold
  router: '#8b5cf6',   // Purple
  api: '#10b981',      // Emerald
  info: '#64748b',     // Slate
  warn: '#f43f5e',     // Rose
  error: '#b91c1c',    // Red
}

const EMOJIS = {
  identity: '👤',
  security: '🛡️',
  router: '🚦',
  api: '📡',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
}

class Logger {
  private log(level: LogLevel, message: string, options?: LogOptions) {
    const isServer = typeof window === 'undefined'
    
    // 🛡️ Production Shield: In production browser, only show errors/warnings/security
    // unless manually overridden via localStorage.
    if (!isDev && !isServer) {
      const isCritical = level === 'error' || level === 'warn' || level === 'security'
      const isManuallyEnabled = typeof localStorage !== 'undefined' && localStorage.getItem('MADACORE_DEBUG') === 'true'
      
      if (!isCritical && !isManuallyEnabled && !options?.force) return
    }

    const emoji = EMOJIS[level]
    const prefix = `[${level.toUpperCase()}]`

    if (isServer) {
      // 📝 Terminal Mode: Clean text for backend-style tracking
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
      const logMessage = `${timestamp} ${emoji} ${prefix} ${message}`
      
      if (options?.data) {
        console.log(logMessage, JSON.stringify(options.data, null, 2))
      } else {
        console.log(logMessage)
      }
      return
    }

    // 🎨 Browser Mode: Pretty colors for development
    const color = COLORS[level]
    const styles = [
      `color: white; background: ${color}; padding: 2px 5px; border-radius: 3px; font-weight: bold;`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;',
    ]

    if (options?.data) {
      console.groupCollapsed(`%c${emoji} %c${prefix}%c ${message}`, styles[0], styles[1], styles[2])
      console.log(options.data)
      console.groupEnd()
    } else {
      console.log(`%c${emoji} %c${prefix}%c ${message}`, styles[0], styles[1], styles[2])
    }
  }

  identity(message: string, data?: any) {
    this.log('identity', message, { data })
  }

  security(message: string, data?: any) {
    this.log('security', message, { data })
  }

  router(message: string, data?: any) {
    this.log('router', message, { data })
  }

  api(message: string, data?: any) {
    this.log('api', message, { data })
  }

  info(message: string, data?: any) {
    this.log('info', message, { data })
  }

  warn(message: string, data?: any) {
    console.warn(`${EMOJIS.warn} [WARN] ${message}`, data || '')
  }

  error(message: string, data?: any) {
    console.error(`${EMOJIS.error} [ERROR] ${message}`, data || '')
  }
}

export const logger = new Logger()
