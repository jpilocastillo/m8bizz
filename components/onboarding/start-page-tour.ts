"use client"

import type { User } from "@supabase/supabase-js"
import { driver } from "driver.js"
import { isBrandNewUser } from "@/lib/onboarding-eligibility"
import { getTourIdForPath, getTourStepsForPath } from "@/lib/tour-steps"
import type { TourId } from "@/lib/tour-steps"

const PREFIX = "m8bs-tour-done-"

export function markTourComplete(tourId: TourId): void {
  try {
    localStorage.setItem(PREFIX + tourId, "1")
  } catch {
    /* ignore */
  }
}

export function isTourComplete(tourId: TourId): boolean {
  try {
    return localStorage.getItem(PREFIX + tourId) === "1"
  } catch {
    return false
  }
}

function filterResolvableSteps(steps: ReturnType<typeof getTourStepsForPath>) {
  return steps.filter((step) => {
    const el = step.element
    if (el == null) return true
    if (typeof el === "string") return document.querySelector(el) != null
    if (typeof el === "function") return true
    return true
  })
}

/** Starts the interactive tour for the current route (brand-new accounts only). Returns true if a tour ran. */
export function startPageTour(pathname: string, user: User | null): boolean {
  if (!user || !isBrandNewUser(user)) return false

  const raw = getTourStepsForPath(pathname)
  if (raw.length === 0) return false

  const steps = filterResolvableSteps(raw)
  if (steps.length === 0) return false

  const tourId = getTourIdForPath(pathname)

  const d = driver({
    showProgress: true,
    smoothScroll: true,
    animate: true,
    steps,
    onDestroyed: () => {
      if (tourId) markTourComplete(tourId)
    },
  })
  d.drive()
  return true
}
