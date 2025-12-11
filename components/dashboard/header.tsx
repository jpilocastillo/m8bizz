"use client"

import { User, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { EventSelector, type Event } from "@/components/dashboard/event-selector"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User as SupabaseUser, Session } from "@supabase/supabase-js"
import { useTheme } from "next-themes"

interface DashboardHeaderProps {
  events?: Event[]
  selectedEventId?: string
  onSelect?: (eventId: string) => void
  isLoading?: boolean
}

export function DashboardHeader({
  events = [],
  selectedEventId,
  onSelect,
  isLoading = false,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
  const userAvatar = user?.user_metadata?.avatar_url || ""

  return (
    <header className="border-b border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt h-16 flex items-center px-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">{/* Left side empty for symmetry */}</div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-extrabold text-white tracking-tight bg-gradient-to-r from-m8bs-blue to-m8bs-purple bg-clip-text text-transparent">
            M8 Business Suite
          </h1>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-3">
          {events && events.length > 0 && onSelect && selectedEventId && (
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onSelect={onSelect}
              isLoading={isLoading}
            />
          )}

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-card-alt transition-all duration-200"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9 bg-m8bs-blue/20 text-white hover:bg-m8bs-blue/40 hover:scale-105 transition-all duration-200 p-0 border border-m8bs-border hover:border-m8bs-blue/50"
              >
                <Avatar className="h-8 w-8 ring-2 ring-m8bs-blue/30 hover:ring-m8bs-blue/60 transition-all duration-200">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-m8bs-blue to-m8bs-purple text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-m8bs-card border-m8bs-border text-white shadow-xl">
              <DropdownMenuLabel className="font-semibold">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6 ring-2 ring-m8bs-blue/30">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-m8bs-blue to-m8bs-purple text-white font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{userName}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-m8bs-border" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium transition-colors duration-200"
              >
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium transition-colors duration-200"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-m8bs-border" />
              <DropdownMenuItem 
                onClick={signOut}
                className="hover:bg-red-500/20 hover:text-red-400 cursor-pointer font-medium transition-colors duration-200"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
