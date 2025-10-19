"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Calendar as CalendarIcon, Search, MapPin, Tag, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  events: any[]
}

interface FilterState {
  search: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  locations: string[]
  types: string[]
  topics: string[]
  timeSlots: string[]
}

export function AnalyticsFilters({ onFiltersChange, events }: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    locations: [],
    types: [],
    topics: [],
    timeSlots: [],
  })

  const [isOpen, setIsOpen] = useState(false)

  // Extract unique values for filter options
  const uniqueLocations = [...new Set(events.map(event => event.location).filter(Boolean))]
  const uniqueTypes = [...new Set(events.map(event => event.type).filter(Boolean))]
  const uniqueTopics = [...new Set(events.map(event => event.topic).filter(Boolean))]
  const uniqueTimeSlots = [...new Set(events.map(event => event.time).filter(Boolean))]

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      dateRange: { from: undefined, to: undefined },
      locations: [],
      types: [],
      topics: [],
      timeSlots: [],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const toggleArrayFilter = (array: string[], value: string, key: keyof FilterState) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
    updateFilters({ [key]: newArray })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.locations.length > 0) count++
    if (filters.types.length > 0) count++
    if (filters.topics.length > 0) count++
    if (filters.timeSlots.length > 0) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-m8bs-muted" />
          <span className="text-sm font-medium text-white">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-m8bs-blue text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-m8bs-muted hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 bg-m8bs-card border-m8bs-border" align="end">
              <Card className="border-0 bg-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Filter Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-white">Search Events</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-m8bs-muted" />
                      <Input
                        id="search"
                        placeholder="Search by name, location, or topic..."
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="pl-10 bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-m8bs-muted"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-white">Date Range</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-m8bs-card-alt border-m8bs-border text-white",
                              !filters.dateRange.from && "text-m8bs-muted"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-m8bs-card border-m8bs-border" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.from}
                            onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, from: date } })}
                            initialFocus
                            className="bg-m8bs-card text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-m8bs-card-alt border-m8bs-border text-white",
                              !filters.dateRange.to && "text-m8bs-muted"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-m8bs-card border-m8bs-border" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.to}
                            onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, to: date } })}
                            initialFocus
                            className="bg-m8bs-card text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Locations
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueLocations.map((location) => (
                        <Badge
                          key={location}
                          variant={filters.locations.includes(location) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            filters.locations.includes(location)
                              ? "bg-m8bs-blue text-white"
                              : "border-m8bs-border text-m8bs-muted hover:bg-m8bs-card-alt"
                          )}
                          onClick={() => toggleArrayFilter(filters.locations, location, "locations")}
                        >
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Types */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Event Types
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={filters.types.includes(type) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            filters.types.includes(type)
                              ? "bg-m8bs-blue text-white"
                              : "border-m8bs-border text-m8bs-muted hover:bg-m8bs-card-alt"
                          )}
                          onClick={() => toggleArrayFilter(filters.types, type, "types")}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    <Label className="text-white">Topics</Label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTopics.map((topic) => (
                        <Badge
                          key={topic}
                          variant={filters.topics.includes(topic) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            filters.topics.includes(topic)
                              ? "bg-m8bs-blue text-white"
                              : "border-m8bs-border text-m8bs-muted hover:bg-m8bs-card-alt"
                          )}
                          onClick={() => toggleArrayFilter(filters.topics, topic, "topics")}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Slots
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTimeSlots.map((time) => (
                        <Badge
                          key={time}
                          variant={filters.timeSlots.includes(time) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            filters.timeSlots.includes(time)
                              ? "bg-m8bs-blue text-white"
                              : "border-m8bs-border text-m8bs-muted hover:bg-m8bs-card-alt"
                          )}
                          onClick={() => toggleArrayFilter(filters.timeSlots, time, "timeSlots")}
                        >
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="bg-m8bs-blue text-white">
              Search: {filters.search}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ search: "" })}
              />
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="bg-m8bs-blue text-white">
              Date: {filters.dateRange.from ? format(filters.dateRange.from, "MMM d") : "..."} - {filters.dateRange.to ? format(filters.dateRange.to, "MMM d") : "..."}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ dateRange: { from: undefined, to: undefined } })}
              />
            </Badge>
          )}
          {filters.locations.map((location) => (
            <Badge key={location} variant="secondary" className="bg-m8bs-blue text-white">
              {location}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.locations, location, "locations")}
              />
            </Badge>
          ))}
          {filters.types.map((type) => (
            <Badge key={type} variant="secondary" className="bg-m8bs-blue text-white">
              {type}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.types, type, "types")}
              />
            </Badge>
          ))}
          {filters.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="bg-m8bs-blue text-white">
              {topic}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.topics, topic, "topics")}
              />
            </Badge>
          ))}
          {filters.timeSlots.map((time) => (
            <Badge key={time} variant="secondary" className="bg-m8bs-blue text-white">
              {time}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter(filters.timeSlots, time, "timeSlots")}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}