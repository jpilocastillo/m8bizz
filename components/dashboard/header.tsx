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
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { EventSelector, type Event } from "@/components/dashboard/event-selector"

interface DashboardHeaderProps {
  events?: Event[]
  selectedEventId?: string
  onSelectEvent?: (eventId: string) => void
  isLoading?: boolean
}

export function DashboardHeader({
  events = [],
  selectedEventId,
  onSelectEvent,
  isLoading = false,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <header className="border-b border-m8bs-border bg-gradient-to-r from-m8bs-card to-m8bs-card-alt h-14 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">{/* Left side empty for symmetry */}</div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-extrabold text-white tracking-tight">M8 Business Suite</h1>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-2">
          {events && events.length > 0 && onSelectEvent && selectedEventId && (
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onSelectEvent={onSelectEvent}
              isLoading={isLoading}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 bg-m8bs-blue/20 text-white hover:bg-m8bs-blue/30"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-m8bs-card border-m8bs-border text-white">
              <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-m8bs-border" />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
                className="hover:bg-m8bs-card-alt cursor-pointer font-medium"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-m8bs-border" />
              <DropdownMenuItem onClick={() => signOut()} className="hover:bg-m8bs-card-alt cursor-pointer font-medium">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
