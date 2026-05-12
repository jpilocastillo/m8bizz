"use client"

import {
  isEventDashboardBlockedEmail,
  isEventDashboardPathname,
} from "@/lib/event-dashboard-access-policy"

const FULL_ACCESS_EMAILS = [
  "jazminpilo@gmail.com",
  "mike@theterriogroup.com"
]

export const REGULAR_USER_VISIBLE_PAGES = [
  "/",
  "/getting-started",
  "/business-dashboard",
  "/analytics",
  "/events",
  "/single-event",
  "/events/new",
  "/tools/behavior-scorecard",
  "/settings",
  "/profile",
] as const

export function hasFullAccess(email: string | null | undefined): boolean {
  if (!email) return false
  return FULL_ACCESS_EMAILS.includes(email.toLowerCase())
}

export function isPageVisible(pathname: string, userEmail: string | null | undefined): boolean {
  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
    return true
  }

  if (isEventDashboardPathname(pathname) && isEventDashboardBlockedEmail(userEmail)) {
    return false
  }

  if (hasFullAccess(userEmail)) {
    return true
  }

  return REGULAR_USER_VISIBLE_PAGES.some(page => 
    pathname === page || pathname.startsWith(page + "/")
  )
}

const MARKETING_NAV_ORDER = ["/events", "/events/new", "/single-event", "/analytics"] as const

/** First marketing sidebar path this user may open (for collapsed Marketing icon). */
export function getFirstVisibleMarketingPath(userEmail: string | null | undefined): string | null {
  for (const p of MARKETING_NAV_ORDER) {
    if (isPageVisible(p, userEmail)) return p
  }
  return null
}























