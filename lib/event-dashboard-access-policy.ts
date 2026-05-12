/**
 * Single Event Dashboard (/single-event) and Multi Event Dashboard (/analytics)
 * access policy. Used by middleware and client nav — keep this module free of "use client".
 */

export const EVENT_DASHBOARD_BLOCKED_EMAILS = ["jazminpilo@gmail.com"] as const

export function isEventDashboardBlockedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return (EVENT_DASHBOARD_BLOCKED_EMAILS as readonly string[]).includes(email.toLowerCase())
}

export function isEventDashboardPathname(pathname: string): boolean {
  if (pathname === "/single-event" || pathname.startsWith("/single-event/")) return true
  if (pathname === "/analytics" || pathname.startsWith("/analytics/")) return true
  return false
}

/** After creating/updating an event, prefer single-event dashboard unless blocked. */
export function postEventSaveRedirectPath(email: string | null | undefined): string {
  if (isEventDashboardBlockedEmail(email)) return "/events"
  return "/single-event"
}
