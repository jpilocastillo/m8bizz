"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { useState, memo, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { TrendingUp, Target, DollarSign, Users, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type MetricType = "ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients"

interface TopPerformersProps {
  data: any[]
  activeMetric: MetricType
  onMetricChange: (metric: MetricType) => void
}

export const TopPerformers = memo(function TopPerformers({ data, activeMetric, onMetricChange }: TopPerformersProps) {
  // Sort events based on the active metric
  const sortedEvents = useMemo(() => {
    return [...data]
      .sort((a, b) => {
        switch (activeMetric) {
          case "ROI":
            return (b.roi?.value || 0) - (a.roi?.value || 0)
          case "Conversion":
            return (b.clients / b.attendees || 0) - (a.clients / a.attendees || 0)
          case "Revenue":
            return (b.revenue || 0) - (a.revenue || 0)
          case "Attendees":
            return (b.attendees || 0) - (a.attendees || 0)
          case "Clients":
            return (b.clients || 0) - (a.clients || 0)
          default:
            return 0
        }
      })
      .slice(0, 5) // Get top 5
  }, [data, activeMetric])

  // Get the top value for progress scaling
  const getMetricValue = (event: any) => {
    switch (activeMetric) {
      case "ROI":
        return event.roi?.value || 0
      case "Conversion":
        return event.attendees > 0 ? (event.clients / event.attendees) * 100 : 0
      case "Revenue":
        return event.revenue || 0
      case "Attendees":
        return event.attendees || 0
      case "Clients":
        return event.clients || 0
      default:
        return 0
    }
  }
  const topValue = useMemo(() => {
    return sortedEvents.length > 0 ? getMetricValue(sortedEvents[0]) : 1
  }, [sortedEvents])

  // Format value based on metric type
  const formatValue = (event: any, metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return `${(event.roi?.value || 0).toFixed(1)}%`
      case "Conversion":
        return `${((event.clients / event.attendees || 0) * 100).toFixed(1)}%`
      case "Revenue":
        return formatCurrency(event.revenue || 0)
      case "Attendees":
        return event.attendees || 0
      case "Clients":
        return event.clients || 0
      default:
        return "N/A"
    }
  }

  // Get metric icon and color
  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return { icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/20" }
      case "Conversion":
        return { icon: Target, color: "text-gray-400", bgColor: "bg-gray-500/20" }
      case "Revenue":
        return { icon: DollarSign, color: "text-green-400", bgColor: "bg-green-500/20" }
      case "Attendees":
        return { icon: Users, color: "text-purple-400", bgColor: "bg-purple-500/20" }
      case "Clients":
        return { icon: Award, color: "text-amber-400", bgColor: "bg-amber-500/20" }
      default:
        return { icon: TrendingUp, color: "text-gray-400", bgColor: "bg-gray-500/20" }
    }
  }

  // Tooltip content for event details
  const getTooltipContent = (event: any) => (
    <div className="text-xs text-left space-y-1">
      <div><span className="font-semibold">Date:</span> {event.date ? (() => {
        try {
          const [year, month, day] = event.date.split('-').map(Number)
          const date = new Date(year, month - 1, day)
          return format(date, "MMM d, yyyy")
        } catch {
          return event.date
        }
      })() : "No date"}</div>
      <div><span className="font-semibold">Location:</span> {event.location || "Unknown location"}</div>
      <div><span className="font-semibold">Type:</span> {event.type || "Unknown type"}</div>
      <div><span className="font-semibold">Topic:</span> {event.topic || "N/A"}</div>
      <div><span className="font-semibold">Attendees:</span> {event.attendees || 0}</div>
      <div><span className="font-semibold">Clients:</span> {event.clients || 0}</div>
      <div><span className="font-semibold">Revenue:</span> {formatCurrency(event.revenue || 0)}</div>
      <div><span className="font-semibold">ROI:</span> {event.roi?.value !== undefined ? `${event.roi.value.toFixed(1)}%` : "N/A"}</div>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-1.5">
        {(["ROI", "Conversion", "Revenue", "Attendees", "Clients"] as MetricType[]).map((metric) => {
          const icon = getMetricIcon(metric)
          return (
            <motion.div
              key={metric}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                className={`border-m8bs-border transition-all duration-200 ${
                  activeMetric === metric
                    ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white border-m8bs-blue shadow-lg"
                    : "bg-m8bs-card text-white hover:bg-m8bs-card-alt hover:border-m8bs-blue/50"
                }`}
                onClick={() => onMetricChange(metric)}
                aria-pressed={activeMetric === metric}
                aria-label={`Sort by ${metric}`}
              >
                <icon.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                {metric}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event, index) => {
            const value = getMetricValue(event)
            const percent = topValue > 0 ? Math.max(0, Math.min(100, (value / topValue) * 100)) : 0
            const isTop = index === 0
            
            return (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        isTop
                          ? "border-emerald-400/60 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 shadow-lg"
                          : "border-m8bs-border bg-m8bs-card hover:border-m8bs-blue/50 hover:bg-m8bs-card-alt"
                      }`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Event: ${event.name || "Unnamed Event"}, Rank: ${index + 1}, ${activeMetric}: ${formatValue(event, activeMetric)}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          // Handle click action if needed
                        }
                      }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      </div>

                      <div className="relative p-3">
                        <div className="flex items-center justify-between">
                          {/* Left Section - Rank and Event Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${
                              isTop 
                                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg" 
                                : "bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark text-white"
                            }`}>
                              {index + 1}
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white text-base truncate">
                                  {event.name || "Unnamed Event"}
                                </h3>
                                {isTop && (
                                  <div className="flex-shrink-0 px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                                    <span className="text-xs font-semibold text-emerald-400">TOP</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-m8bs-muted">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-m8bs-blue rounded-full"></span>
                                  {event.date ? (() => {
                                    try {
                                      const [year, month, day] = event.date.split('-').map(Number)
                                      const date = new Date(year, month - 1, day)
                                      return format(date, "MMM d, yyyy")
                                    } catch {
                                      return event.date
                                    }
                                  })() : "No date"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                  {event.location || "Unknown location"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                  {event.type || "Unknown type"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Section - Metric Value and Progress */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Key Metrics - Hidden on mobile, shown on larger screens */}
                            <div className="hidden lg:flex flex-col items-end gap-1 text-sm">
                              <div className="text-m8bs-muted">
                                Attendees: <span className="text-white font-semibold">{(event.attendees || 0).toLocaleString()}</span>
                              </div>
                              <div className="text-m8bs-muted">
                                Clients: <span className="text-white font-semibold">{(event.clients || 0).toLocaleString()}</span>
                              </div>
                              <div className="text-m8bs-muted">
                                Revenue: <span className="text-white font-semibold">
                                  {formatCurrency(event.revenue || 0)}
                                </span>
                              </div>
                            </div>

                            {/* Main Metric Value */}
                            <div className="text-right">
                              <div className={`text-lg sm:text-xl font-extrabold ${
                                isTop ? "text-emerald-400" : "text-white"
                              }`}>
                                {formatValue(event, activeMetric)}
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-16 sm:w-20 h-1.5 bg-m8bs-card-alt rounded-full overflow-hidden mt-1.5">
                                <motion.div
                                  className={`h-full rounded-full ${
                                    isTop 
                                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600" 
                                      : "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark"
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-m8bs-card border-m8bs-border p-3">
                    {getTooltipContent(event)}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-12 text-m8bs-muted bg-m8bs-card rounded-lg border border-m8bs-border">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No events data available</p>
            <p className="text-sm mt-2">Create some events to see top performers</p>
          </div>
        )}
      </div>
    </div>
  )
})
