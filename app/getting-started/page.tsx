import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Calendar,
  Wrench,
  Settings,
  ArrowRight,
  ListOrdered,
} from "lucide-react"

const steps = [
  {
    n: 1,
    title: "Overview",
    href: "/",
    body: "Pick your working year and scan marketing totals. Use this as your home base between tasks.",
    icon: LayoutDashboard,
  },
  {
    n: 2,
    title: "Advisor Basecamp",
    href: "/business-dashboard",
    body: "Enter annual goals and monthly production so ROI and overview metrics stay grounded in real numbers.",
    icon: Building2,
  },
  {
    n: 3,
    title: "Marketing events",
    href: "/events",
    body: "Create and maintain events with dates, attendance, and financial production. Everything downstream depends on clean event data.",
    icon: Calendar,
  },
  {
    n: 4,
    title: "Analytics dashboards",
    href: "/analytics",
    body: "Use Multi Event or Single Event dashboards to compare campaigns and spot what to repeat or fix.",
    icon: BarChart3,
  },
  {
    n: 5,
    title: "Tools",
    href: "/tools",
    body: "Open calculators, planners, and the Business Behavior Scorecard as your process grows.",
    icon: Wrench,
  },
  {
    n: 6,
    title: "Settings & profile",
    href: "/settings",
    body: "Adjust preferences and profile details while you are still in your onboarding window.",
    icon: Settings,
  },
]

export default function GettingStartedPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How it works</h1>
        <p className="text-m8bs-muted text-lg max-w-3xl leading-relaxed">
          This checklist and the expandable <span className="text-white/90">page instructions</span> panels elsewhere are only shown during your
          first week after signup. Use <span className="text-white/90">Start tour</span> on Overview when you see it.
        </p>
      </div>

      <Card className="border-m8bs-border bg-m8bs-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ListOrdered className="h-5 w-5 text-m8bs-blue" />
            Recommended order
          </CardTitle>
          <CardDescription className="text-m8bs-muted">
            You can jump anywhere from the sidebar; this sequence minimizes rework.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-4">
            {steps.map(({ n, title, href, body, icon: Icon }) => (
              <li key={href} className="flex gap-4 rounded-lg border border-m8bs-border bg-m8bs-card-alt/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-m8bs-blue/20 text-lg font-bold text-m8bs-blue">
                  {n}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="h-5 w-5 text-m8bs-muted" />
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                  </div>
                  <p className="text-sm text-m8bs-muted leading-relaxed">{body}</p>
                  <Link href={href}>
                    <Button variant="outline" size="sm" className="border-m8bs-border mt-1 gap-2">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-m8bs-border bg-gradient-to-br from-m8bs-card to-m8bs-card-alt">
        <CardHeader>
          <CardTitle className="text-white">Documentation</CardTitle>
          <CardDescription className="text-m8bs-muted">
            A printable-style manual may live in your repo as <code className="text-white/80">USER_MANUAL.md</code> for deeper reference.
            In-product help stays in sync with those topics at a high level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button className="bg-m8bs-blue hover:bg-m8bs-blue-dark">Go to Overview</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
