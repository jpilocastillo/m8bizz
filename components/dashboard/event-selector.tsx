"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  name: string
  date: string
  location: string
}

interface EventSelectorProps {
  events: Event[]
  selectedEventId?: string
  onSelect: (eventId: string) => void
  isLoading?: boolean
}

export function EventSelector({ events, selectedEventId, onSelect, isLoading = false }: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedEvent = events.find((event) => event.id === selectedEventId)

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto bg-[#131525] border-[#1f2037] text-white hover:bg-[#1f2037] hover:text-white"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
          {selectedEvent ? (
            <span className="flex-1 text-left mr-2 truncate">{selectedEvent.name}</span>
          ) : (
            <span className="flex-1 text-left mr-2">Select Event</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] bg-[#131525] border-[#1f2037] text-white">
        <DropdownMenuLabel>Marketing Events</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#1f2037]" />
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <DropdownMenuItem
              key={event.id}
              className={`flex flex-col items-start cursor-pointer ${
                event.id === selectedEventId ? "bg-blue-600/20" : ""
              } hover:bg-[#1f2037]`}
              onClick={() => {
                onSelect(event.id)
                setIsOpen(false)
              }}
            >
              <div className="font-medium">{event.name}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {format(new Date(event.date), "MMM d, yyyy")} • {event.location}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-4 text-center text-sm text-gray-400">No events found</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type { Event }
