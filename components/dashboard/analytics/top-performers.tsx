"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

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
          return (b.roi || 0) - (a.roi || 0)
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

  // Format value based on metric type
  const formatValue = (event: any, metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return `${(event.roi || 0).toFixed(1)}%`
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

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-medium text-white">Top Performing Events</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
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
            sortedEvents.map((event, index) => (
              <div
                key={event.id || index}
                className="flex items-center justify-between p-3 rounded-md bg-[#131525] border border-[#1f2037]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{event.name || "Unnamed Event"}</div>
                    <div className="text-xs text-gray-400">
                      {event.date ? format(new Date(event.date), "MMM d, yyyy") : "No date"} •{" "}
                      {event.location || "Unknown location"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{formatValue(event, activeMetric)}</div>
                  <div className="text-xs text-gray-400">{event.type || "Unknown type"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">No events data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
