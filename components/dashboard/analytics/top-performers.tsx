"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { useState } from "react"
import { Tooltip } from "@/components/ui/tooltip"

type MetricType = "ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients"

interface TopPerformersProps {
  data: any[]
  activeMetric: MetricType
  onMetricChange: (metric: MetricType) => void
}

export function TopPerformers({ data, activeMetric, onMetricChange }: TopPerformersProps) {
  // Sort events based on the active metric
  const sortedEvents = [...data]
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
  const topValue = sortedEvents.length > 0 ? getMetricValue(sortedEvents[0]) : 1

  // Format value based on metric type
  const formatValue = (event: any, metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return `${(event.roi?.value || 0).toFixed(1)}%`
      case "Conversion":
        return `${((event.clients / event.attendees || 0) * 100).toFixed(1)}%`
      case "Revenue":
        return `$${(event.revenue || 0).toLocaleString()}`
      case "Attendees":
        return event.attendees || 0
      case "Clients":
        return event.clients || 0
      default:
        return "N/A"
    }
  }

  // Tooltip content for event details
  const getTooltipContent = (event: any) => (
    <div className="text-xs text-left space-y-1">
      <div><span className="font-semibold">Date:</span> {event.date ? format(new Date(event.date), "MMM d, yyyy") : "No date"}</div>
      <div><span className="font-semibold">Location:</span> {event.location || "Unknown location"}</div>
      <div><span className="font-semibold">Type:</span> {event.type || "Unknown type"}</div>
      <div><span className="font-semibold">Topic:</span> {event.topic || "N/A"}</div>
      <div><span className="font-semibold">Attendees:</span> {event.attendees || 0}</div>
      <div><span className="font-semibold">Clients:</span> {event.clients || 0}</div>
      <div><span className="font-semibold">Revenue:</span> {event.revenue ? `$${event.revenue.toLocaleString()}` : 0}</div>
      <div><span className="font-semibold">ROI:</span> {event.roi?.value !== undefined ? `${event.roi.value.toFixed(1)}%` : "N/A"}</div>
    </div>
  )

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-md card-hover">
      <CardHeader className="px-0 pt-0">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-4">Top Performing Events</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["ROI", "Conversion", "Revenue", "Attendees", "Clients"] as MetricType[]).map((metric) => (
            <Button
              key={metric}
              variant="outline"
              size="sm"
              className={`border-[#1f2037] ${
                activeMetric === metric
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-[#131525] text-white hover:bg-[#1f2037]"
              }`}
              onClick={() => onMetricChange(metric)}
            >
              {metric}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => {
              const value = getMetricValue(event)
              const percent = topValue > 0 ? Math.max(0, Math.min(100, (value / topValue) * 100)) : 0
              const isTop = index === 0
              return (
                <Tooltip key={event.id || index} content={getTooltipContent(event)}>
                  <div
                    className={`flex flex-col md:flex-row items-stretch justify-between p-6 rounded-xl transition-all border-2 gap-4 ${
                      isTop
                        ? "border-green-400 bg-gradient-to-r from-green-900/30 to-green-700/10 shadow-lg"
                        : "border-[#1f2037] bg-[#131525]"
                    } hover:border-blue-400 hover:bg-blue-900/10 cursor-pointer group min-h-[120px]`}
                  >
                    <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 w-32 shrink-0">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${isTop ? "bg-green-400 text-white" : "bg-blue-600 text-white"}`}>{index + 1}</div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide text-center md:text-left">{event.type || "Unknown type"}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="font-bold text-white text-lg md:text-xl truncate">{event.name || "Unnamed Event"}</div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-300">
                        <span>{event.date ? format(new Date(event.date), "MMM d, yyyy") : "No date"}</span>
                        <span>{event.location || "Unknown location"}</span>
                        <span>Topic: <span className="font-semibold text-white">{event.topic || "N/A"}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-300">
                        <span>Attendees: <span className="font-semibold text-white">{event.attendees || 0}</span></span>
                        <span>Clients: <span className="font-semibold text-white">{event.clients || 0}</span></span>
                        <span>Revenue: <span className="font-semibold text-white">{event.revenue ? `$${event.revenue.toLocaleString()}` : 0}</span></span>
                        <span>ROI: <span className="font-semibold text-white">{event.roi?.value !== undefined ? `${event.roi.value.toFixed(1)}%` : "N/A"}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center w-40 min-w-[120px]">
                      <div className="font-extrabold text-white text-2xl md:text-3xl mb-1">{formatValue(event, activeMetric)}</div>
                      <div className="w-full h-3 bg-[#23244a] rounded overflow-hidden mt-1">
                        <div
                          className={`h-full rounded transition-all duration-500 ${isTop ? "bg-yellow-400" : "bg-blue-600"}`}
                          style={{ width: `${percent}%`, background: isTop ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' : undefined }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              )
            })
          ) : (
            <div className="text-center py-6 text-gray-400">No events data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
