"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Check, ChevronDown, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnalyticsFiltersProps {
  analyticsData: any
  onFilterChange: (filteredData: any) => void
}

export function AnalyticsFilters({ analyticsData, onFilterChange }: AnalyticsFiltersProps) {
  // Extract unique values for filters
  const allEvents = analyticsData?.events || []

  const uniqueTopics = [...new Set(allEvents.map((event: any) => event.type || "Unknown"))]
  const uniqueLocations = [...new Set(allEvents.map((event: any) => event.location || "Unknown"))]

  // Get min and max dates
  const dates = allEvents.map((event: any) => new Date(event.date))
  const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date()
  const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date()

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: { from: minDate, to: maxDate },
    topics: [] as string[],
    locations: [] as string[],
  })

  // Open state for popovers
  const [openDateRange, setOpenDateRange] = useState(false)
  const [openTopics, setOpenTopics] = useState(false)
  const [openLocations, setOpenLocations] = useState(false)

  // Memoize the filter function to prevent recreation on every render
  const applyFilters = useCallback(() => {
    // Skip processing if analyticsData is not available
    if (!analyticsData || !analyticsData.events) {
      return
    }

    // Filter events based on selected criteria
    const filteredEvents = allEvents.filter((event: any) => {
      const eventDate = new Date(event.date)
      const dateInRange = eventDate >= filters.dateRange.from && eventDate <= filters.dateRange.to

      const topicMatches = filters.topics.length === 0 || filters.topics.includes(event.type || "Unknown")
      const locationMatches = filters.locations.length === 0 || filters.locations.includes(event.location || "Unknown")

      return dateInRange && topicMatches && locationMatches
    })

    // Calculate summary metrics for filtered events
    const summary = {
      totalEvents: filteredEvents.length,
      totalAttendees: filteredEvents.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0),
      avgAttendees:
        filteredEvents.length > 0
          ? filteredEvents.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0) / filteredEvents.length
          : 0,
      totalRevenue: filteredEvents.reduce((sum: number, event: any) => sum + (event.revenue || 0), 0),
      totalExpenses: filteredEvents.reduce((sum: number, event: any) => sum + (event.expenses || 0), 0),
      totalProfit: filteredEvents.reduce(
        (sum: number, event: any) => sum + ((event.revenue || 0) - (event.expenses || 0)),
        0,
      ),
      overallROI:
        filteredEvents.length > 0
          ? filteredEvents.reduce((sum: number, event: any) => sum + (event.roi || 0), 0) / filteredEvents.length
          : 0,
      totalClients: filteredEvents.reduce((sum: number, event: any) => sum + (event.clients || 0), 0),
      overallConversionRate:
        filteredEvents.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0) > 0
          ? (filteredEvents.reduce((sum: number, event: any) => sum + (event.clients || 0), 0) /
              filteredEvents.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0)) *
            100
          : 0,
    }

    // Pass filtered data to parent component
    onFilterChange({
      events: filteredEvents,
      summary,
    })
  }, [filters, allEvents, analyticsData, onFilterChange])

  // Apply filters when filters change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateRange: { from: minDate, to: maxDate },
      topics: [],
      locations: [],
    })
  }

  // Count active filters
  const activeFilterCount =
    (filters.dateRange.from !== minDate || filters.dateRange.to !== maxDate ? 1 : 0) +
    filters.topics.length +
    filters.locations.length

  return (
    <div className="space-y-6 bg-gradient-to-r from-[#131525] to-[#0f1029] p-5 rounded-lg border border-[#1f2037] shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2037]">
        <h2 className="text-lg font-medium text-white flex items-center">
          <Filter className="mr-2 h-5 w-5 text-blue-400" />
          Filter Analytics
        </h2>

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="bg-[#1f2037] border-[#1f2037] text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500 transition-colors"
          >
            <X className="mr-1 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Date Range Filter */}
        <Popover open={openDateRange} onOpenChange={setOpenDateRange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#1f2037] border-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors",
                (filters.dateRange.from !== minDate || filters.dateRange.to !== maxDate) &&
                  "border-blue-600 bg-blue-600/20 text-blue-400",
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
              {(filters.dateRange.from !== minDate || filters.dateRange.to !== maxDate) && (
                <Badge className="ml-2 bg-blue-600/30 text-blue-400 border border-blue-600">
                  {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d, yyyy")}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#131525] border-[#1f2037] text-white shadow-xl" align="start">
            <CalendarComponent
              mode="range"
              selected={filters.dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setFilters({ ...filters, dateRange: range })
                }
              }}
              defaultMonth={filters.dateRange.from}
              numberOfMonths={2}
              className="bg-[#131525]"
            />
          </PopoverContent>
        </Popover>

        {/* Topics Filter */}
        <Popover open={openTopics} onOpenChange={setOpenTopics}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#1f2037] border-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors",
                filters.topics.length > 0 && "border-green-600 bg-green-600/20 text-green-400",
              )}
            >
              Topic
              {filters.topics.length > 0 && (
                <Badge className="ml-2 bg-green-600/30 text-green-400 border border-green-600">
                  {filters.topics.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-[#131525] border-[#1f2037] text-white shadow-xl" align="start">
            <Command className="bg-transparent">
              <CommandInput placeholder="Search topics..." className="border-none focus:ring-0" />
              <CommandList>
                <CommandEmpty>No topics found</CommandEmpty>
                <CommandGroup>
                  {uniqueTopics.map((topic) => {
                    const isSelected = filters.topics.includes(topic)
                    return (
                      <CommandItem
                        key={topic}
                        onSelect={() => {
                          setFilters({
                            ...filters,
                            topics: isSelected ? filters.topics.filter((t) => t !== topic) : [...filters.topics, topic],
                          })
                        }}
                        className="flex items-center justify-between cursor-pointer hover:bg-green-600/20"
                      >
                        <span>{topic}</span>
                        {isSelected && <Check className="h-4 w-4 text-green-600" />}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Locations Filter */}
        <Popover open={openLocations} onOpenChange={setOpenLocations}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "bg-[#1f2037] border-[#1f2037] text-white hover:bg-[#2a2b47] hover:text-white transition-colors",
                filters.locations.length > 0 && "border-purple-600 bg-purple-600/20 text-purple-400",
              )}
            >
              Location
              {filters.locations.length > 0 && (
                <Badge className="ml-2 bg-purple-600/30 text-purple-400 border border-purple-600">
                  {filters.locations.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 bg-[#131525] border-[#1f2037] text-white shadow-xl" align="start">
            <Command className="bg-transparent">
              <CommandInput placeholder="Search locations..." className="border-none focus:ring-0" />
              <CommandList>
                <CommandEmpty>No locations found</CommandEmpty>
                <CommandGroup>
                  {uniqueLocations.map((location) => {
                    const isSelected = filters.locations.includes(location)
                    return (
                      <CommandItem
                        key={location}
                        onSelect={() => {
                          setFilters({
                            ...filters,
                            locations: isSelected
                              ? filters.locations.filter((l) => l !== location)
                              : [...filters.locations, location],
                          })
                        }}
                        className="flex items-center justify-between cursor-pointer hover:bg-purple-600/20"
                      >
                        <span>{location}</span>
                        {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 p-3 bg-[#1f2037]/50 rounded-md border border-[#1f2037]">
          <div className="w-full text-xs text-gray-400 mb-2">Active Filters:</div>
          {filters.topics.map((topic) => (
            <Badge
              key={topic}
              className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600 cursor-pointer transition-colors"
              onClick={() => {
                setFilters({
                  ...filters,
                  topics: filters.topics.filter((t) => t !== topic),
                })
              }}
            >
              {topic}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}

          {filters.locations.map((location) => (
            <Badge
              key={location}
              className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600 cursor-pointer transition-colors"
              onClick={() => {
                setFilters({
                  ...filters,
                  locations: filters.locations.filter((l) => l !== location),
                })
              }}
            >
              {location}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}

          {(filters.dateRange.from !== minDate || filters.dateRange.to !== maxDate) && (
            <Badge
              className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600 cursor-pointer transition-colors"
              onClick={() => {
                setFilters({
                  ...filters,
                  dateRange: { from: minDate, to: maxDate },
                })
              }}
            >
              {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d, yyyy")}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
