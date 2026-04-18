import type { DriveStep } from "driver.js"

/** Storage key suffixes for tour completion (prefix: m8bs-tour-done-) */
export type TourId = "overview"

const TOUR_SELECTOR = {
  sidebar: '[data-tour="tour-sidebar-nav"]',
  overviewHero: '[data-tour="tour-overview-hero"]',
  overviewActions: '[data-tour="tour-overview-actions"]',
  overviewMetrics: '[data-tour="tour-overview-metrics"]',
  pageGuide: '[data-tour="tour-page-guide"]',
} as const

const OVERVIEW_STEPS: DriveStep[] = [
  {
    element: TOUR_SELECTOR.sidebar,
    popover: {
      title: "Sidebar navigation",
      description:
        "Move between Overview, Advisor Basecamp, Marketing (events and analytics), Tools, and Settings. Expand sections when you need more links.",
      side: "right",
      align: "start",
    },
  },
  {
    element: TOUR_SELECTOR.pageGuide,
    popover: {
      title: "Page instructions",
      description:
        "Every main screen includes this panel: what the page is for, steps to succeed, and quick links. Collapse it anytime—your choice is remembered.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: TOUR_SELECTOR.overviewHero,
    popover: {
      title: "Overview",
      description:
        "Your year-scoped snapshot of marketing performance. Pick a year to match the data you are reviewing.",
      side: "bottom",
    },
  },
  {
    element: TOUR_SELECTOR.overviewActions,
    popover: {
      title: "Year and shortcuts",
      description:
        "Switch the working year, jump to New Event, or open Advisor Basecamp for goals and monthly numbers.",
      side: "bottom",
    },
  },
  {
    element: TOUR_SELECTOR.overviewMetrics,
    popover: {
      title: "Key metrics",
      description:
        "Scan totals for events, revenue, profit, attendees, and clients. Use How it works in the sidebar for the full onboarding map.",
      side: "top",
    },
  },
]

export function getTourIdForPath(pathname: string): TourId | null {
  const p = pathname.split("?")[0] || "/"
  if (p === "/") return "overview"
  return null
}

export function getTourStepsForPath(pathname: string): DriveStep[] {
  const id = getTourIdForPath(pathname)
  if (id === "overview") return OVERVIEW_STEPS
  return []
}

export function hasTourForPath(pathname: string): boolean {
  return getTourStepsForPath(pathname).length > 0
}
