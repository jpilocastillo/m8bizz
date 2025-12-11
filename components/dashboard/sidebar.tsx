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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User as SupabaseUser, Session } from "@supabase/supabase-js"

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
  const [user, setUser] = useState<SupabaseUser | null>(null)
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

  // Load user data
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()

    // Listen for auth state changes (like profile updates)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
        "border-r border-m8bs-border bg-m8bs-bg flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isCollapsed ? "w-16" : "w-64",
      )}
      style={{ marginLeft: '0' }}
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
          {/* Homepage - Standalone */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
              pathname === "/"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              isCollapsed && "justify-center px-2",
            )}
          >
            <LayoutDashboard className={cn("h-5 w-5 transition-transform duration-200", pathname === "/" ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
            {!isCollapsed && <span>Homepage</span>}
          </Link>

          {/* Advisor Basecamp Section */}
          <Link
            href="/business-dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
              pathname === "/business-dashboard"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Building2 className={cn("h-5 w-5 transition-transform duration-200", pathname === "/business-dashboard" ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
            {!isCollapsed && <span>Advisor Basecamp</span>}
          </Link>

          {/* Current Book Opportunities */}
          <Link
            href="/current-book-opportunities"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
              pathname === "/current-book-opportunities"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              isCollapsed && "justify-center px-2",
            )}
          >
            <BookOpen className={cn("h-5 w-5 transition-transform duration-200", pathname === "/current-book-opportunities" ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
            {!isCollapsed && <span>Current Book Opportunities</span>}
          </Link>

          {/* Marketing Section */}
          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsMarketingExpanded(!isMarketingExpanded)}
                className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-colors duration-200" />
                  <span>Marketing</span>
                </div>
                {isMarketingExpanded ? <ChevronDown className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-all duration-200" /> : <ChevronRight className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-all duration-200" />}
              </button>

              {isMarketingExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/single-event"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/single-event"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <span>Single Event Dashboard</span>
                  </Link>
                  <Link
                    href="/analytics"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/analytics"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <span>Multi Event Dashboard</span>
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/events"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <span>View All Events</span>
                  </Link>
                  <Link
                    href="/events/new"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/events/new"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>New Event</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/analytics"
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 group",
                pathname.startsWith("/analytics")
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                  : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              )}
              title="Marketing"
            >
              <BarChart3 className="h-5 w-5" />
            </Link>
          )}

          {/* Tools Section */}
          {!isCollapsed ? (
            <div>
              <button
                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-colors duration-200" />
                  <span>Tools</span>
                </div>
                {isToolsExpanded ? <ChevronDown className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-all duration-200" /> : <ChevronRight className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-all duration-200" />}
              </button>

              {isToolsExpanded && (
                <div className="pl-10 space-y-1 mt-1">
                  <Link
                    href="/tools/bucket-plan"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/bucket-plan"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <Calculator className="h-5 w-5" />
                    <span>Bucket Plan</span>
                  </Link>
                  <Link
                    href="/tools/annuity-analysis"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/annuity-analysis"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <Target className="h-5 w-5" />
                    <span>Annuity Analysis Program</span>
                  </Link>
                  <Link
                    href="/tools/missing-money"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/missing-money"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <Users className="h-5 w-5" />
                    <span>Missing Money Report</span>
                  </Link>
                  <Link
                    href="/tools/client-missing-money-report"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/client-missing-money-report"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Client Missing Money Report</span>
                  </Link>
                  <Link
                    href="/tools/annual-planner"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/annual-planner"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Annual Business Planner</span>
                  </Link>
                  <Link
                    href="/tools/behavior-scorecard"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/tools/behavior-scorecard"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <Calculator className="h-5 w-5" />
                    <span>Business Behavior Scorecard</span>
                  </Link>
                  <Link
                    href="/client-plans"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                      pathname === "/client-plans"
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
                    )}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Client Plans</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/tools"
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 group",
                pathname.startsWith("/tools")
                  ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                  : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              )}
              title="Tools"
            >
              <Wrench className="h-5 w-5" />
            </Link>
          )}

          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
              pathname === "/settings"
                ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                : "text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white hover:shadow-md",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Settings className={cn("h-5 w-5 transition-transform duration-200", pathname === "/settings" ? "text-white" : "text-m8bs-muted group-hover:text-m8bs-blue")} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt">
        {(() => {
          const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
          const userAvatar = user?.user_metadata?.avatar_url || ""

          if (isCollapsed) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-0 hover:bg-transparent"
                  >
                    <Avatar className="h-10 w-10 mx-auto cursor-pointer hover:ring-2 hover:ring-m8bs-blue transition-all">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="text-sm bg-m8bs-blue text-white">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-56 bg-black border-m8bs-border text-white">
                  <DropdownMenuLabel className="font-bold">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback className="text-xs bg-m8bs-blue text-white">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{userName}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-m8bs-border" />
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="hover:bg-black-alt cursor-pointer font-medium"
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="hover:bg-black-alt cursor-pointer font-medium"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-m8bs-border" />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="hover:bg-black-alt cursor-pointer font-medium"
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-white hover:bg-m8bs-card-alt transition-all duration-200 font-bold p-2 h-auto"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="text-xs bg-m8bs-blue text-white">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left">{userName}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-56 bg-black border-m8bs-border text-white">
                <DropdownMenuLabel className="font-bold">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="text-xs bg-m8bs-blue text-white">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{userName}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-m8bs-border" />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="hover:bg-black-alt cursor-pointer font-medium"
                >
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="hover:bg-black-alt cursor-pointer font-medium"
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-m8bs-border" />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="hover:bg-black-alt cursor-pointer font-medium"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })()}
      </div>
    </div>
  )
}

// Add this alias for backward compatibility
export const DashboardSidebar = Sidebar
