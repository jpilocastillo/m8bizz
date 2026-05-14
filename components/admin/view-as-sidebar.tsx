"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useParams } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  ChevronLeft,
  Building2,
  Wrench,
  Calculator,
  BookOpen,
  ArrowLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { hasFullAccess, isPageVisible } from "@/lib/page-visibility"
import type { ViewAsProfile } from "@/components/admin/view-as-user-context"

const VIEW_AS_BASE = (userId: string) => `/admin/users/${userId}`

export function ViewAsSidebar({ profile }: { profile: ViewAsProfile | null }) {
  const pathname = usePathname()
  const params = useParams()
  const userId = (params?.userId as string) || ""
  const base = VIEW_AS_BASE(userId)

  const [isMarketingExpanded, setIsMarketingExpanded] = useState(true)
  const [isToolsExpanded, setIsToolsExpanded] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const userEmail = profile?.email ?? null
  const canSeeAllPages = hasFullAccess(userEmail)

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) setIsCollapsed(savedState === "true")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString())
  }, [isCollapsed])

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const isOverview = pathname === base
  const isBusiness = pathname === `${base}/business-dashboard`
  const isAnalytics = pathname === `${base}/analytics`
  const isEvents = pathname === `${base}/events`
  const isSingleEvent = pathname === `${base}/single-event`
  const isScorecard = pathname === `${base}/behavior-scorecard`

  return (
    <div
      className={cn(
        "border-r border-m8bs-border bg-m8bs-bg flex flex-col transition-all duration-300 ease-in-out shadow-lg relative z-10",
        isCollapsed ? "w-16" : "w-64",
      )}
      style={{ marginLeft: "0" }}
    >
      <div className="p-4 border-b border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt flex items-center justify-between h-16 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={150} height={40} className="brightness-110" />
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={32} height={32} className="brightness-110" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt p-2 h-9 w-9 rounded-lg transition-all duration-200 hover:scale-110"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {/* Overview */}
          {isPageVisible("/", userEmail) && (
            <Link
              href={base}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
                isOverview
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                  : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                isCollapsed && "justify-center px-2",
              )}
            >
              <LayoutDashboard className={cn("h-5 w-5", isOverview ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
              {!isCollapsed && <span>Overview</span>}
            </Link>
          )}

          {/* Advisor Basecamp */}
          {isPageVisible("/business-dashboard", userEmail) && (
            <Link
              href={`${base}/business-dashboard`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
                isBusiness
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                  : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                isCollapsed && "justify-center px-2",
              )}
            >
              <Building2 className={cn("h-5 w-5", isBusiness ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
              {!isCollapsed && <span>Advisor Basecamp</span>}
            </Link>
          )}

          {/* Current Book Opportunities - view-as has no route; show only if full access, link to overview for now */}
          {canSeeAllPages && !isCollapsed && (
            <div className="rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted/70 cursor-not-allowed flex items-center gap-3" title="Not available in view mode">
              <BookOpen className="h-5 w-5" />
              <span>Current Book Opportunities</span>
            </div>
          )}

          {/* Marketing Section */}
          {(canSeeAllPages || isPageVisible("/analytics", userEmail) || isPageVisible("/events", userEmail) || isPageVisible("/single-event", userEmail)) && (
            !isCollapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsMarketingExpanded(!isMarketingExpanded)}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-colors duration-200" />
                    <span>Marketing</span>
                  </div>
                  {isMarketingExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                {isMarketingExpanded && (
                  <div className="pl-10 space-y-1 mt-1">
                    {isPageVisible("/single-event", userEmail) && (
                      <Link
                        href={`${base}/single-event`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                          isSingleEvent
                            ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                            : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                        )}
                      >
                        <span>Single Event Dashboard</span>
                      </Link>
                    )}
                    {isPageVisible("/analytics", userEmail) && (
                      <Link
                        href={`${base}/analytics`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                          isAnalytics
                            ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                            : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                        )}
                      >
                        <span>Multi Event Dashboard</span>
                      </Link>
                    )}
                    {isPageVisible("/events", userEmail) && (
                      <Link
                        href={`${base}/events`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                          isEvents
                            ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                            : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                        )}
                      >
                        <span>View All Events</span>
                      </Link>
                    )}
                    {isPageVisible("/events/new", userEmail) && (
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                        <PlusCircle className="h-5 w-5" />
                        <span>New Event</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`${base}/analytics`}
                className={cn(
                  "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 group",
                  isAnalytics
                    ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                    : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                )}
                title="Marketing"
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            )
          )}

          {/* Tools - only Behavior Scorecard has view-as route */}
          {(canSeeAllPages || isPageVisible("/tools/behavior-scorecard", userEmail)) && (
            !isCollapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-colors duration-200" />
                    <span>Tools</span>
                  </div>
                  {isToolsExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                {isToolsExpanded && (
                  <div className="pl-10 space-y-1 mt-1">
                    {isPageVisible("/tools/behavior-scorecard", userEmail) && (
                      <Link
                        href={`${base}/behavior-scorecard`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                          isScorecard
                            ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                            : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                        )}
                      >
                        <Calculator className="h-5 w-5" />
                        <span>Business Behavior Scorecard</span>
                      </Link>
                    )}
                    {canSeeAllPages && (
                      <>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <Calculator className="h-5 w-5" />
                          <span>Bucket Plan</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <span>Annuity Analysis Program</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <span>Missing Money Report</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <span>Client Missing Money Report</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <span>Annual Business Planner</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-m8bs-muted/70 cursor-not-allowed" title="Not available in view mode">
                          <span>Client Plans</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`${base}/behavior-scorecard`}
                className={cn(
                  "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 group",
                  isScorecard
                    ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                    : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                )}
                title="Tools"
              >
                <Wrench className="h-5 w-5" />
              </Link>
            )
          )}

          {/* Settings - no view-as route */}
          {isPageVisible("/settings", userEmail) && !isCollapsed && (
            <div className="rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted/70 cursor-not-allowed flex items-center gap-3" title="Not available in view mode">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </div>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt">
        <div className="flex flex-col gap-2">
          {!isCollapsed && profile && (
            <div className="text-xs text-m8bs-muted font-medium truncate px-1" title={profile.email ?? undefined}>
              Viewing as {profile.full_name || profile.email || "User"}
            </div>
          )}
          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2 border-m8bs-border bg-m8bs-card-alt text-m8bs-muted hover:bg-m8bs-blue/20 hover:text-m8bs-blue hover:border-m8bs-blue"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Back to admin</span>}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
