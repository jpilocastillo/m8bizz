/**
 * Logger utility
 * Logs in both development and production
 */

type LogLevel = "log" | "info" | "warn" | "error"

function getLogPrefix(level: LogLevel): string {
  const timestamp = new Date().toISOString()
  const env = process.env.NODE_ENV || "unknown"
  return `[${timestamp}] [${env.toUpperCase()}] [${level.toUpperCase()}]`
}

export const logger = {
  log: (...args: unknown[]) => {
    console.log(getLogPrefix("log"), ...args)
  },

  info: (...args: unknown[]) => {
    console.info(getLogPrefix("info"), ...args)
  },

  warn: (...args: unknown[]) => {
    console.warn(getLogPrefix("warn"), ...args)
  },

  error: (...args: unknown[]) => {
    console.error(getLogPrefix("error"), ...args)
  },

  debug: (...args: unknown[]) => {
    console.debug(getLogPrefix("log"), "[DEBUG]", ...args)
  },

  // No-op stubs for compatibility (e.g. auth-provider)
  setUser: (_user: { id: string; email?: string; username?: string } | null) => {},
  setContext: (_name: string, _context: Record<string, unknown>) => {},
  setTag: (_key: string, _value: string) => {},
}
