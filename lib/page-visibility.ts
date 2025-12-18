"use client"

// Emails that should see all pages
const FULL_ACCESS_EMAILS = [
  "jazminpilo@gmail.com",
  "mike@theterriogroup.com"
]

// Pages visible to regular users (non-full-access users)
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

// Check if user email has full access
export function hasFullAccess(email: string | null | undefined): boolean {
  if (!email) return false
  return FULL_ACCESS_EMAILS.includes(email.toLowerCase())
}

// Check if a specific page should be visible to a user
export function isPageVisible(pathname: string, userEmail: string | null | undefined): boolean {
  // Always show auth pages
  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
    return true
  }

  // Full access users see everything
  if (hasFullAccess(userEmail)) {
    return true
  }

  // For regular users, check if page is in allowed list
  return REGULAR_USER_VISIBLE_PAGES.some(page => 
    pathname === page || pathname.startsWith(page + "/")
  )
}

