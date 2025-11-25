"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
  Building2,
  User as UserIcon,
  Wrench,
  Calculator,
  Target,
  Users,
  FileText,
  Calendar,
  Search,
  Bell,
  Star,
  Clock,
  Activity,
  Zap,
  Shield,
  HelpCircle,
  BookOpen,
  TrendingDown,
  DollarSign,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [isMarketingExpanded, setIsMarketingExpanded] = useState(true)
  const [isToolsExpanded, setIsToolsExpanded] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [recentItems, setRecentItems] = useState([
    { name: "Retirement Planning Workshop", href: "/events", icon: Calendar, type: "Event" },
    { name: "Q4 Analytics Report", href: "/analytics", icon: BarChart3, type: "Report" },
    { name: "Client Acquisition Goals", href: "/business-dashboard", icon: Target, type: "Goal" },
  ])
  const [favorites, setFavorites] = useState([
    { name: "Analytics Dashboard", href: "/analytics", icon: BarChart3 },
    { name: "Event Management", href: "/events", icon: Calendar },
  ])
  const supabase = createClient()

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

  const addToFavorites = (item: any) => {
    if (!favorites.find(fav => fav.href === item.href)) {
      setFavorites([...favorites, item])
    }
  }

  const removeFromFavorites = (href: string) => {
    setFavorites(favorites.filter(fav => fav.href !== href))
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
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={150} height={40} />
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={32} height={32} />
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
          {/* Homepage - Standalone */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
              pathname === "/"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                : "text-white hover:bg-m8bs-card-alt hover:text-white",
              isCollapsed && "justify-center px-2",
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            {!isCollapsed && <span>Homepage</span>}
          </Link>

          {/* Advisor Basecamp Section */}
          <Link
            href="/business-dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
              pathname === "/business-dashboard"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                : "text-white hover:bg-m8bs-card-alt hover:text-white",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Building2 className="h-5 w-5" />
            {!isCollapsed && <span>Advisor Basecamp</span>}
          </Link>

          {/* Marketing Section */}
          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsMarketingExpanded(!isMarketingExpanded)}
                className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-bold text-white hover:bg-m8bs-card-alt hover:text-white transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <span>Marketing</span>
                </div>
                {isMarketingExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {isMarketingExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/single-event"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/single-event"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>Single Event Dashboard</span>
                  </Link>
                  <Link
                    href="/analytics"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/analytics"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>Multi Event Dashboard</span>
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/events"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <span>View All Events</span>
                  </Link>
                  <Link
                    href="/events/new"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/events/new"
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
              href="/analytics"
              className={cn(
                "flex items-center justify-center rounded-md px-2 py-2 text-sm font-bold transition-all duration-200",
                pathname.startsWith("/analytics")
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                  : "text-white hover:bg-m8bs-card-alt hover:text-white",
              )}
            >
              <BarChart3 className="h-5 w-5" />
            </Link>
          )}

          {/* Tools Section */}
          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-bold text-white hover:bg-m8bs-card-alt hover:text-white transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5" />
                  <span>Tools</span>
                </div>
                {isToolsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {isToolsExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/tools/bucket-plan"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/bucket-plan"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Bucket Plan</span>
                  </Link>
                  <Link
                    href="/tools/annuity-analysis"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/annuity-analysis"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <Target className="h-4 w-4" />
                    <span>Annuity Analysis Program</span>
                  </Link>
                  <Link
                    href="/tools/missing-money"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/missing-money"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Missing Money Report</span>
                  </Link>
                  <Link
                    href="/tools/client-missing-money-report"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/client-missing-money-report"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Client Missing Money Report</span>
                  </Link>
                  <Link
                    href="/tools/annual-planner"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/annual-planner"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Annual Business Planner</span>
                  </Link>
                  <Link
                    href="/tools/behavior-scorecard"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/tools/behavior-scorecard"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Business Behavior Scorecard</span>
                  </Link>
                  <Link
                    href="/client-plans"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
                      pathname === "/client-plans"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                        : "text-white hover:bg-m8bs-card-alt hover:text-white",
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Client Plans</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/tools"
              className={cn(
                "flex items-center justify-center rounded-md px-2 py-2 text-sm font-bold transition-all duration-200",
                pathname.startsWith("/tools")
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                  : "text-white hover:bg-m8bs-card-alt hover:text-white",
              )}
            >
              <Wrench className="h-5 w-5" />
            </Link>
          )}

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
              pathname === "/settings"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                : "text-white hover:bg-m8bs-card-alt hover:text-white",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition-all duration-200",
              pathname === "/profile"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-md"
                : "text-white hover:bg-m8bs-card-alt hover:text-white",
              isCollapsed && "justify-center px-2",
            )}
          >
            <UserIcon className="h-5 w-5" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-m8bs-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "justify-start text-white hover:text-white hover:bg-m8bs-card-alt transition-all duration-200 font-bold",
            isCollapsed ? "w-8 px-0 justify-center" : "w-full",
          )}
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
