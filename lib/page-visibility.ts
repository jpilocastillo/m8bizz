"use client"

const FULL_ACCESS_EMAILS = [
  "jazminpilo@gmail.com",
  "mike@theterriogroup.com"
]

export const REGULAR_USER_VISIBLE_PAGES = [
  "/",
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

  if (hasFullAccess(userEmail)) {
    return true
  }

  return REGULAR_USER_VISIBLE_PAGES.some(page => 
    pathname === page || pathname.startsWith(page + "/")
  )
}









