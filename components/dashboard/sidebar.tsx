"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  ChevronLeft,
  PieChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [isMarketingExpanded, setIsMarketingExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const supabase = createClient()
  const [isDashboardsExpanded, setIsDashboardsExpanded] = useState(true)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString())
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div
      className={cn(
        "border-r border-m8bs-border bg-gradient-to-b from-m8bs-card to-m8bs-card-alt flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 border-b border-m8bs-border bg-m8bs-card flex items-center justify-between h-14">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark text-white rounded-full p-2 w-8 h-8 flex items-center justify-center shadow-lg">
              <PieChart className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">M8BS</h2>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark text-white rounded-full p-2 w-8 h-8 flex items-center justify-center shadow-lg">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-m8bs-muted hover:text-white p-1 h-8 w-8"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsDashboardsExpanded(!isDashboardsExpanded)}
                className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-bold text-white hover:bg-m8bs-card-alt hover:text-white transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboards</span>
                </div>
                {isDashboardsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {isDashboardsExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/dashboard"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>Single Event Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/dashboard/analytics"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>Multi Event Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center justify-center rounded-md px-2 py-2 text-sm font-bold transition-all duration-200",
                  pathname === "/dashboard"
                    ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                    : "text-white hover:bg-m8bs-card-alt hover:text-white",
                )}
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/analytics"
                className={cn(
                  "flex items-center justify-center rounded-md px-2 py-2 text-sm font-bold transition-all duration-200",
                  pathname === "/dashboard/analytics"
                    ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                    : "text-white hover:bg-m8bs-card-alt hover:text-white",
                )}
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            </>
          )}

          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsMarketingExpanded(!isMarketingExpanded)}
                className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-bold text-white hover:bg-m8bs-card-alt hover:text-white transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Marketing Data</span>
                </div>
                {isMarketingExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {isMarketingExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/dashboard/events"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/dashboard/events"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>View All Events</span>
                  </Link>
                  <Link
                    href="/dashboard/events/new"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/dashboard/events/new"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>New Event</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/dashboard/events"
              className={cn(
                "flex items-center justify-center rounded-md px-2 py-2 text-sm font-bold transition-all duration-200",
                pathname.includes("/dashboard/events")
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                  : "text-white hover:bg-m8bs-card-alt hover:text-white",
              )}
            >
              <FileSpreadsheet className="h-5 w-5" />
            </Link>
          )}

          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
              pathname === "/dashboard/settings"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                : "text-white hover:bg-m8bs-card-alt hover:text-white",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-m8bs-border">
        <Button
          variant="ghost"
          className={cn(
            "justify-start text-white hover:text-white hover:bg-m8bs-card-alt transition-all duration-200 font-bold",
            isCollapsed ? "w-8 px-0 justify-center" : "w-full",
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-2">Log out</span>}
        </Button>
      </div>
    </div>
  )
}

// Add this alias for backward compatibility
export const DashboardSidebar = Sidebar
