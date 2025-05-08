"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type MetricType = "ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients"

interface PerformanceHeatmapProps {
  data: any
  activeMetric: MetricType
  onMetricChange: (metric: MetricType) => void
}

export function PerformanceHeatmap({ data, activeMetric, onMetricChange }: PerformanceHeatmapProps) {
  // Extract unique event types and locations
  const eventTypes = [...new Set(data.events.map((event: any) => event.type || "Unknown"))]
  const locations = [...new Set(data.events.map((event: any) => event.location || "Unknown"))]

  // Create a matrix of performance data
  const matrix = eventTypes.map((type) => {
    const typeEvents = data.events.filter((event: any) => (event.type || "Unknown") === type)

    const locationData = locations.map((location) => {
      const eventsAtLocation = typeEvents.filter((event: any) => (event.location || "Unknown") === location)

      if (eventsAtLocation.length === 0) {
        return { value: null, count: 0 }
      }

      let metricValue = 0

      switch (activeMetric) {
        case "ROI":
          metricValue =
            eventsAtLocation.reduce((sum: number, event: any) => sum + (event.roi || 0), 0) / eventsAtLocation.length
          break
        case "Conversion":
          metricValue =
            eventsAtLocation.reduce((sum: number, event: any) => {
              const conversion = event.attendees ? (event.clients / event.attendees) * 100 : 0
              return sum + conversion
            }, 0) / eventsAtLocation.length
          break
        case "Revenue":
          metricValue =
            eventsAtLocation.reduce((sum: number, event: any) => sum + (event.revenue || 0), 0) /
            eventsAtLocation.length
          break
        case "Attendees":
          metricValue =
            eventsAtLocation.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0) /
            eventsAtLocation.length
          break
        case "Clients":
          metricValue =
            eventsAtLocation.reduce((sum: number, event: any) => sum + (event.clients || 0), 0) /
            eventsAtLocation.length
          break
      }

      return {
        value: metricValue,
        count: eventsAtLocation.length,
      }
    })

    return {
      type,
      locations: locationData,
    }
  })

  // Get color based on metric value
  const getColor = (value: number | null, metric: MetricType) => {
    if (value === null) return "bg-[#131525]"

    // Define thresholds based on metric type
    let thresholds: number[] = []

    switch (metric) {
      case "ROI":
        thresholds = [0, 50, 100, 200, 300]
        break
      case "Conversion":
        thresholds = [0, 5, 10, 15, 20]
        break
      case "Revenue":
        thresholds = [0, 10000, 25000, 50000, 100000]
        break
      case "Attendees":
        thresholds = [0, 10, 20, 30, 50]
        break
      case "Clients":
        thresholds = [0, 2, 5, 10, 15]
        break
    }

    // Determine color based on thresholds
    if (value <= thresholds[1]) return "bg-blue-900/30"
    if (value <= thresholds[2]) return "bg-blue-700/40"
    if (value <= thresholds[3]) return "bg-blue-600/60"
    if (value <= thresholds[4]) return "bg-blue-500/80"
    return "bg-blue-400"
  }

  // Format value based on metric type
  const formatValue = (value: number | null, metric: MetricType) => {
    if (value === null) return "N/A"

    switch (metric) {
      case "ROI":
      case "Conversion":
        return `${value.toFixed(1)}%`
      case "Revenue":
        return `$${value.toLocaleString()}`
      case "Attendees":
      case "Clients":
        return value.toFixed(1)
      default:
        return value.toString()
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-medium text-white">Performance Heatmap</CardTitle>
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
        {matrix.length > 0 && locations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 text-sm font-medium text-gray-400">Event Type</th>
                  {locations.map((location) => (
                    <th key={location} className="p-2 text-sm font-medium text-gray-400 text-center">
                      {location}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.type}>
                    <td className="p-2 text-sm font-medium text-white">{row.type}</td>
                    {row.locations.map((cell, i) => (
                      <td
                        key={`${row.type}-${locations[i]}`}
                        className={`p-2 text-center ${getColor(cell.value, activeMetric)} rounded-md m-1`}
                      >
                        <div className="text-sm font-medium text-white">{formatValue(cell.value, activeMetric)}</div>
                        {cell.count > 0 && (
                          <div className="text-xs text-gray-400">
                            {cell.count} event{cell.count !== 1 ? "s" : ""}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">No data available for heatmap</div>
        )}
      </CardContent>
    </Card>
  )
}
