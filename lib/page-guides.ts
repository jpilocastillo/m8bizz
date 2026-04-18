/**
 * Per-route help copy for the PageGuide component.
 * Match order: exact pathname, then first matching pattern (patterns should list most specific first).
 */

export interface PageGuideLink {
  label: string
  href: string
}

export interface PageGuideEntry {
  title: string
  summary: string
  steps?: string[]
  links?: PageGuideLink[]
}

const DEFAULT_GUIDE: PageGuideEntry = {
  title: "This page",
  summary:
    "Use the sidebar to move between Overview, Advisor Basecamp, marketing dashboards, tools, and settings.",
  steps: ["Open How it works in the sidebar for the recommended setup order.", "Use Settings for your profile and preferences."],
  links: [{ label: "How it works", href: "/getting-started" }],
}

function G(
  title: string,
  summary: string,
  steps?: string[],
  links?: PageGuideLink[],
): PageGuideEntry {
  return { title, summary, steps, links }
}

/** Static routes — keep in sync with app routes (page.tsx files). */
const EXACT_GUIDES: Record<string, PageGuideEntry> = {
  "/": G(
    "Overview",
    "Year-scoped snapshot of marketing performance, events, and quick links into the rest of the suite.",
    [
      "Pick the year you want to analyze (saved per account).",
      "Scan metric cards for events, revenue, profit, and clients.",
      "Use New Event or Basecamp when you are ready to enter or review detailed data.",
    ],
    [
      { label: "How it works", href: "/getting-started" },
      { label: "Create an event", href: "/events/new" },
      { label: "Advisor Basecamp", href: "/business-dashboard" },
    ],
  ),
  "/getting-started": G(
    "How it works",
    "This page is only available during your first week on the suite. Follow the steps below, then use Overview and Advisor Basecamp with the guided tour where offered.",
    [
      "Read the numbered steps below, then open Overview with your working year selected.",
      "Enter business goals and monthly numbers in Advisor Basecamp.",
      "Add marketing events, then review Multi Event or Single Event dashboards.",
      "Explore Tools (for example Behavior Scorecard) as your process matures.",
    ],
    [{ label: "Overview", href: "/" }, { label: "Advisor Basecamp", href: "/business-dashboard" }],
  ),
  "/business-dashboard": G(
    "Advisor Basecamp",
    "Central place for annual targets, monthly production, client metrics, and scorecard-linked inputs that feed your overview.",
    [
      "Choose the correct year before entering numbers.",
      "Fill monthly revenue and client counts so analytics stay accurate.",
      "Revisit after events to update production and acquisition.",
    ],
    [
      { label: "Overview", href: "/" },
      { label: "Behavior Scorecard", href: "/tools/behavior-scorecard" },
    ],
  ),
  "/analytics": G(
    "Multi Event Dashboard",
    "Compare performance across multiple marketing events with filters and rollups.",
    ["Filter by date range or event types as provided on the page.", "Use results to decide which events to repeat or scale."],
    [{ label: "All events", href: "/events" }, { label: "Single Event Dashboard", href: "/single-event" }],
  ),
  "/single-event": G(
    "Single Event Dashboard",
    "Deep dive into one event type or campaign pattern when you want detail without multi-event noise.",
    ["Select the event context the page asks for.", "Cross-check numbers against the event record on View All Events."],
    [{ label: "View all events", href: "/events" }, { label: "Multi Event Dashboard", href: "/analytics" }],
  ),
  "/events": G(
    "View All Events",
    "List and manage marketing events—dates, attendance, revenue, and related production.",
    ["Open an event to edit details.", "Create new events from here or from the sidebar shortcut."],
    [{ label: "New event", href: "/events/new" }, { label: "Overview", href: "/" }],
  ),
  "/events/new": G(
    "New Event",
    "Create a marketing event with date, attendance, financial production, and notes so dashboards stay consistent.",
    [
      "Enter the event date and realistic attendance.",
      "Record revenue and expenses so ROI and profit calculate correctly.",
      "Save and return to View All Events to verify the new row.",
    ],
    [{ label: "All events", href: "/events" }],
  ),
  "/campaigns": G(
    "Campaigns",
    "Organize and track campaigns tied to your marketing calendar.",
    ["Create or edit campaigns as your workflow requires.", "Link follow-up back to events and analytics where applicable."],
    [{ label: "Events", href: "/events" }],
  ),
  "/current-book-opportunities": G(
    "Current Book Opportunities",
    "Review opportunities tied to your current book of business.",
    ["Work entries from top to bottom or filter as the UI allows.", "Feed insights back into Basecamp goals if needed."],
    [{ label: "Advisor Basecamp", href: "/business-dashboard" }],
  ),
  "/client-plans": G(
    "Client Plans",
    "Access or maintain client plan documents associated with your practice.",
    ["Open an existing plan or follow the page actions to add context.", "Keep plan data aligned with CRM or internal process."],
    [{ label: "Tools", href: "/tools" }],
  ),
  "/settings": G(
    "Settings",
    "Account and application preferences that apply across the dashboard.",
    ["Review notification and display options.", "Sign out from the sidebar user menu if you are on a shared device."],
    [{ label: "Profile", href: "/profile" }],
  ),
  "/profile": G(
    "Profile",
    "Update your display name, avatar, and related profile fields used in the suite.",
    ["Save changes before navigating away.", "Contact your admin if account email or role must change."],
    [{ label: "Settings", href: "/settings" }],
  ),
  "/tools": G(
    "Tools",
    "Shortcuts to calculators, planners, and analysis tools. Each tool has its own guide when you open it.",
    ["Pick the tool that matches today’s task.", "Return here any time from the sidebar under Tools."],
    [{ label: "Behavior Scorecard", href: "/tools/behavior-scorecard" }, { label: "How it works", href: "/getting-started" }],
  ),
  "/tools/bucket-plan": G(
    "Bucket Plan",
    "Model or present the bucket approach to income and assets for client conversations.",
    ["Enter values in the order the form requests.", "Export or print only after you have verified numbers."],
    [{ label: "Tools home", href: "/tools" }],
  ),
  "/tools/annuity-analysis": G(
    "Annuity Analysis Program",
    "Analyze annuity scenarios with the inputs and outputs defined on this screen.",
    ["Confirm assumptions before sharing results.", "Use Goal Tracker when you need to extend the workflow."],
    [
      { label: "Goal Tracker", href: "/tools/annuity-analysis/goal-tracker" },
      { label: "Tools home", href: "/tools" },
    ],
  ),
  "/tools/annuity-analysis/goal-tracker": G(
    "Goal Tracker",
    "Track goals that extend the annuity analysis workflow.",
    ["Complete prerequisite fields on the annuity tool if something looks missing.", "Save progress before leaving the page."],
    [{ label: "Annuity Analysis", href: "/tools/annuity-analysis" }],
  ),
  "/tools/missing-money": G(
    "Missing Money Report",
    "Search and summarize unclaimed or missing-money style opportunities for prospects or clients.",
    ["Run the report with the identifiers the form asks for.", "Treat results as starting points for client follow-up only."],
    [{ label: "Tools home", href: "/tools" }],
  ),
  "/tools/client-missing-money-report": G(
    "Client Missing Money Report",
    "Client-focused missing money lookup and reporting.",
    ["Enter client inputs carefully to avoid false matches.", "Document follow-up in your CRM."],
    [{ label: "Tools home", href: "/tools" }],
  ),
  "/tools/annual-planner": G(
    "Annual Business Planner",
    "Lay out annual business activities and targets in one place.",
    ["Align entries with Advisor Basecamp for consistency.", "Revisit quarterly to adjust the plan."],
    [{ label: "Advisor Basecamp", href: "/business-dashboard" }, { label: "Tools home", href: "/tools" }],
  ),
  "/tools/eight-elements": G(
    "Eight Elements",
    "Work through the eight-elements framework used in your practice.",
    ["Complete sections in sequence if the tool is gated.", "Save or export according to your compliance process."],
    [{ label: "Tools home", href: "/tools" }],
  ),
  "/tools/client-manager": G(
    "Client Manager",
    "Manage client records or lists used alongside other tools.",
    ["Search before creating duplicates.", "Keep sensitive data off shared screenshots."],
    [{ label: "Tools home", href: "/tools" }],
  ),
  "/tools/behavior-scorecard": G(
    "Business Behavior Scorecard",
    "Capture behavioral metrics and summaries used with coaching and reporting.",
    ["Enter periods consistently so trends are comparable.", "Export PDF or CSV only after reviewing totals."],
    [{ label: "Advisor Basecamp", href: "/business-dashboard" }, { label: "Overview", href: "/" }],
  ),
  "/login": G(
    "Sign in",
    "Enter the email and password for your M8 Business Suite account.",
    ["Use Forgot password if you cannot sign in.", "After login you land on Overview."],
    [{ label: "Forgot password", href: "/forgot-password" }],
  ),
  "/forgot-password": G(
    "Forgot password",
    "Request a reset link to your email. Follow the message to set a new password.",
    ["Check spam folders.", "Return to Sign in once reset is complete."],
    [{ label: "Sign in", href: "/login" }],
  ),
  "/reset-password": G(
    "Reset password",
    "Choose a strong new password when you arrive from the email link.",
    ["Submit once—then sign in from the login page.", "If the link expired, request a new reset."],
    [{ label: "Sign in", href: "/login" }],
  ),
  "/landing": G(
    "Landing",
    "Marketing or entry landing content for the product.",
    ["Use primary actions on the page to continue.", "Sign in when you are ready to use the dashboard."],
    [{ label: "Sign in", href: "/login" }],
  ),
  "/clear-auth": G(
    "Clear auth",
    "Clears local session state—useful when troubleshooting sign-in loops.",
    ["Follow any on-screen confirmation.", "Then try signing in again from the login page."],
    [{ label: "Sign in", href: "/login" }],
  ),
  "/debug": G(
    "Debug",
    "Internal diagnostics—developers and support only.",
    ["Do not share screenshots containing secrets.", "Close when finished."],
    [{ label: "Overview", href: "/" }],
  ),
  "/admin/login": G(
    "Admin sign in",
    "Administrator authentication for admin dashboards and impersonation flows.",
    ["Use admin credentials only.", "Contact the platform owner if access fails."],
    [{ label: "Home", href: "/" }],
  ),
  "/admin": G(
    "Admin",
    "Administrative entry—follow links to user management or dashboards.",
    [],
    [{ label: "Admin dashboard", href: "/admin/dashboard" }],
  ),
  "/admin/dashboard": G(
    "Admin dashboard",
    "High-level admin controls and links to manage users or view activity.",
    ["Open a user to impersonate or inspect their data.", "Exit admin flows when returning to your own account."],
    [{ label: "Admin home", href: "/admin" }],
  ),
}

interface PatternGuide {
  pattern: RegExp
  guide: PageGuideEntry
}

/** Evaluated after EXACT_GUIDES; first match wins—order from most specific to general. */
const PATTERN_GUIDES: PatternGuide[] = [
  {
    pattern: /^\/events\/edit\/.+/,
    guide: G(
      "Edit event",
      "Update an existing marketing event. Changes flow to analytics and overview for that year.",
      ["Verify date and financial fields before saving.", "Delete only if you intend to remove history."],
      [{ label: "All events", href: "/events" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/business-dashboard$/,
    guide: G(
      "Advisor Basecamp (view as)",
      "You are viewing this user’s Basecamp data as an admin. Changes may affect their live records.",
      ["Confirm you are editing the intended user.", "Use Exit or back to admin when finished."],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/analytics$/,
    guide: G(
      "Multi Event Dashboard (view as)",
      "Multi-event analytics for the selected user account.",
      [],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/events$/,
    guide: G(
      "Events (view as)",
      "Event list for the selected user.",
      [],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/single-event$/,
    guide: G(
      "Single Event Dashboard (view as)",
      "Single-event dashboard for the selected user.",
      [],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/behavior-scorecard$/,
    guide: G(
      "Behavior Scorecard (view as)",
      "Behavior scorecard data for the selected user.",
      [],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
  {
    pattern: /^\/admin\/users\/[^/]+$/,
    guide: G(
      "View as user",
      "Admin impersonation shell: sidebar and data reflect the selected user, not your personal account.",
      [
        "Check the banner or profile context so you know whose data you see.",
        "Navigate like the user would; avoid destructive actions unless intended.",
      ],
      [{ label: "Admin dashboard", href: "/admin/dashboard" }],
    ),
  },
]

export function resolvePageGuide(pathname: string): PageGuideEntry {
  const normalized = pathname.split("?")[0] || "/"
  const exact = EXACT_GUIDES[normalized]
  if (exact) return exact
  for (const { pattern, guide } of PATTERN_GUIDES) {
    if (pattern.test(normalized)) return guide
  }
  return DEFAULT_GUIDE
}

export function pageGuideStorageKey(pathname: string, userId?: string | null): string {
  const path = pathname.split("?")[0] || "/"
  const uid = userId || "anon"
  return `m8bs-page-guide-dismissed-${uid}-${encodeURIComponent(path)}`
}
