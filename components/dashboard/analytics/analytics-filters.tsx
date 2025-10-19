"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Check, ChevronDown, Filter, X, Target, MapPin, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnalyticsFiltersProps {
  analyticsData: any
  onFilterChange: (filteredData: any) => void
}

export function AnalyticsFilters({ analyticsData, onFilterChange }: AnalyticsFiltersProps) {
  // Extract unique values for filters
  const allEvents = analyticsData?.events || []

  const uniqueTopics = [...new Set(allEvents.map((event: any) => event.type || "Unknown"))]
  const uniqueLocations = [...new Set(allEvents.map((event: any) => event.location || "Unknown"))]

  // Get min and max dates - parse manually to avoid timezone issues
  const dates = allEvents.map((event: any) => {
    try {
      const [year, month, day] = event.date.split('-').map(Number)
      return new Date(year, month - 1, day)
    } catch {
      return new Date()
    }
  })
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
      // Parse date manually to avoid timezone issues
      let eventDate: Date
      try {
        const [year, month, day] = event.date.split('-').map(Number)
        eventDate = new Date(year, month - 1, day)
      } catch {
        eventDate = new Date()
      }
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

  // Check if any filters are active
  const hasActiveFilters = filters.topics.length > 0 || filters.locations.length > 0 || 
    filters.dateRange.from !== minDate || filters.dateRange.to !== maxDate

  return (
    <motion.div 
      className="bg-gradient-to-r from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-m8bs-blue/20 p-2 rounded-lg">
            <Filter className="h-5 w-5 text-m8bs-blue" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Filter Analytics</h3>
            <p className="text-sm text-m8bs-muted">Refine your data view</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <Popover open={openDateRange} onOpenChange={setOpenDateRange}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className={cn(
                    "bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card hover:border-m8bs-blue/50",
                    hasActiveFilters && "border-m8bs-blue/50"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateRange.from && filters.dateRange.to ? (
                    `${format(filters.dateRange.from, "MMM dd")} - ${format(filters.dateRange.to, "MMM dd, yyyy")}`
                  ) : (
                    "Select date range"
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-m8bs-card border-m8bs-border" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={filters.dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setFilters(prev => ({ ...prev, dateRange: range }))
                  }
                }}
                numberOfMonths={2}
                className="bg-m8bs-card text-white"
              />
            </PopoverContent>
          </Popover>

          {/* Topics Filter */}
          <Popover open={openTopics} onOpenChange={setOpenTopics}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className={cn(
                    "bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card hover:border-m8bs-blue/50",
                    filters.topics.length > 0 && "border-m8bs-blue/50"
                  )}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Topics
                  {filters.topics.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-m8bs-blue text-white">
                      {filters.topics.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-m8bs-card border-m8bs-border" align="start">
              <Command>
                <CommandInput placeholder="Search topics..." className="bg-m8bs-card-alt border-m8bs-border text-white" />
                <CommandList>
                  <CommandEmpty>No topics found.</CommandEmpty>
                  <CommandGroup>
                    {uniqueTopics.map((topic) => (
                      <CommandItem
                        key={topic}
                        onSelect={() => {
                          setFilters(prev => ({
                            ...prev,
                            topics: prev.topics.includes(topic)
                              ? prev.topics.filter(t => t !== topic)
                              : [...prev.topics, topic]
                          }))
                        }}
                        className="bg-m8bs-card-alt hover:bg-m8bs-card text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.topics.includes(topic) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {topic}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Locations Filter */}
          <Popover open={openLocations} onOpenChange={setOpenLocations}>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className={cn(
                    "bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card hover:border-m8bs-blue/50",
                    filters.locations.length > 0 && "border-m8bs-blue/50"
                  )}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Locations
                  {filters.locations.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-m8bs-blue text-white">
                      {filters.locations.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-m8bs-card border-m8bs-border" align="start">
              <Command>
                <CommandInput placeholder="Search locations..." className="bg-m8bs-card-alt border-m8bs-border text-white" />
                <CommandList>
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    {uniqueLocations.map((location) => (
                      <CommandItem
                        key={location}
                        onSelect={() => {
                          setFilters(prev => ({
                            ...prev,
                            locations: prev.locations.includes(location)
                              ? prev.locations.filter(l => l !== location)
                              : [...prev.locations, location]
                          }))
                        }}
                        className="bg-m8bs-card-alt hover:bg-m8bs-card text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.locations.includes(location) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {location}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={resetFilters}
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.topics.length > 0 || filters.locations.length > 0) && (
        <motion.div 
          className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-m8bs-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <span className="text-sm text-m8bs-muted mr-2">Active filters:</span>
          {filters.topics.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="bg-m8bs-blue/20 text-m8bs-blue border-m8bs-blue/30"
            >
              <Target className="mr-1 h-3 w-3" />
              {topic}
              <button
                onClick={() => setFilters(prev => ({ ...prev, topics: prev.topics.filter(t => t !== topic) }))}
                className="ml-1 hover:bg-m8bs-blue/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.locations.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="bg-green-500/20 text-green-400 border-green-500/30"
            >
              <MapPin className="mr-1 h-3 w-3" />
              {location}
              <button
                onClick={() => setFilters(prev => ({ ...prev, locations: prev.locations.filter(l => l !== location) }))}
                className="ml-1 hover:bg-green-500/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
