"use client"

import { User } from "lucide-react"
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
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

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
    <header className="border-b border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt h-14 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">{/* Left side empty for symmetry */}</div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-extrabold text-white tracking-tight">M8 Business Suite</h1>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-2">
          {events && events.length > 0 && onSelect && selectedEventId && (
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onSelect={onSelect}
              isLoading={isLoading}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 bg-m8bs-blue/20 text-white hover:bg-m8bs-blue/30 p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="text-xs bg-m8bs-blue text-white">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-m8bs-card border-m8bs-border text-white">
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
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium"
              >
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-m8bs-border" />
              <DropdownMenuItem 
                onClick={signOut}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
