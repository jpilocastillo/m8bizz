"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type MetricType = "ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients"

interface PerformanceHeatmapProps {
  data: any
  activeMetric: MetricType
  onMetricChange: (metric: MetricType) => void
}

export function PerformanceHeatmap({ data, activeMetric, onMetricChange }: PerformanceHeatmapProps) {
  // Grouping options for rows and columns
  const groupingOptions = [
    { label: "Topic", value: "topic" },
    { label: "Location", value: "location" },
    { label: "Time", value: "time" },
    { label: "Day of Week", value: "dayOfWeek" },
  ];
  const [rowGroup, setRowGroup] = useState<string>("topic");
  const [colGroup, setColGroup] = useState<string>("location");

  // Extract unique values for rows and columns
  const rowValues = [...new Set(data.events.map((event: any) => event[rowGroup] || "Unknown"))] as string[];
  const colValues = [...new Set(data.events.map((event: any) => event[colGroup] || "Unknown"))] as string[];
  
  // Debug logging for dayOfWeek
  if (rowGroup === 'dayOfWeek' || colGroup === 'dayOfWeek') {
    console.log('Heatmap dayOfWeek debug:', {
      rowGroup,
      colGroup,
      rowValues,
      colValues,
      sampleEvents: data.events.slice(0, 3).map((e: any) => ({
        name: e.name,
        date: e.date,
        dayOfWeek: e.dayOfWeek
      }))
    });
  }

  // Create a matrix of performance data
  const matrix = rowValues.map((row) => {
    const rowEvents = data.events.filter((event: any) => (event[rowGroup] || "Unknown") === row);

    const colData = colValues.map((col) => {
      const eventsAtCell = rowEvents.filter((event: any) => (event[colGroup] || "Unknown") === col);

      if (eventsAtCell.length === 0) {
        return { value: null, count: 0 };
      }

      let metricValue = 0;

      switch (activeMetric) {
        case "ROI":
          metricValue =
            eventsAtCell.reduce((sum: number, event: any) => sum + (event.roi?.value || 0), 0) / eventsAtCell.length;
          break;
        case "Conversion":
          metricValue =
            eventsAtCell.reduce((sum: number, event: any) => {
              const conversion = event.attendees ? (event.clients / event.attendees) * 100 : 0;
              return sum + conversion;
            }, 0) / eventsAtCell.length;
          break;
        case "Revenue":
          metricValue =
            eventsAtCell.reduce((sum: number, event: any) => sum + (event.revenue || 0), 0) /
            eventsAtCell.length;
          break;
        case "Attendees":
          metricValue =
            eventsAtCell.reduce((sum: number, event: any) => sum + (event.attendees || 0), 0) /
            eventsAtCell.length;
          break;
        case "Clients":
          metricValue =
            eventsAtCell.reduce((sum: number, event: any) => sum + (event.clients || 0), 0) /
            eventsAtCell.length;
          break;
      }

      return {
        value: metricValue,
        count: eventsAtCell.length,
      };
    });

    return {
      row,
      cols: colData,
    };
  });

  // Get color based on metric value with enhanced gradients
  const getColor = (value: number | null, metric: MetricType) => {
    if (value === null) return "bg-m8bs-card border border-m8bs-border"

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

    // Enhanced color gradients
    if (value <= thresholds[1]) return "bg-gradient-to-br from-red-900/20 to-red-800/30 border border-red-800/40"
    if (value <= thresholds[2]) return "bg-gradient-to-br from-orange-800/30 to-orange-700/40 border border-orange-700/50"
    if (value <= thresholds[3]) return "bg-gradient-to-br from-yellow-700/40 to-yellow-600/50 border border-yellow-600/60"
    if (value <= thresholds[4]) return "bg-gradient-to-br from-green-600/50 to-green-500/60 border border-green-500/70"
    return "bg-gradient-to-br from-emerald-500/60 to-emerald-400/70 border border-emerald-400/80"
  }

  // Format value based on metric type
  const formatValue = (value: number | null, metric: MetricType) => {
    if (value === null) return "N/A"

    switch (metric) {
      case "ROI":
      case "Conversion":
        return `${value.toFixed(1)}%`
      case "Revenue":
        return formatCurrency(value)
      case "Attendees":
      case "Clients":
        return value.toFixed(1)
      default:
        return value.toString()
    }
  }

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return <TrendingUp className="h-4 w-4" />
      case "Conversion":
        return <Target className="h-4 w-4" />
      case "Revenue":
        return <DollarSign className="h-4 w-4" />
      case "Attendees":
      case "Clients":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-2">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-1.5">
        {(["ROI", "Conversion", "Revenue", "Attendees", "Clients"] as MetricType[]).map((metric) => (
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
            >
              {getMetricIcon(metric)}
              <span className="ml-2">{metric}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Grouping Controls */}
      <div className="flex flex-wrap gap-3 items-center p-2 bg-m8bs-card rounded-lg border border-m8bs-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">Rows:</span>
          <select
            className="bg-m8bs-card-alt border border-m8bs-border text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-m8bs-blue"
            value={rowGroup}
            onChange={e => setRowGroup(e.target.value)}
          >
            {groupingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">Columns:</span>
          <select
            className="bg-m8bs-card-alt border border-m8bs-border text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-m8bs-blue"
            value={colGroup}
            onChange={e => setColGroup(e.target.value)}
          >
            {groupingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        {matrix.length > 0 && colValues.length > 0 ? (
          <div className="bg-m8bs-card rounded-lg border border-m8bs-border p-2">
            <table className="w-full">
              <thead className="sticky top-0 bg-m8bs-card z-10">
                <tr>
                  <th className="text-left p-1.5 text-xs font-semibold text-m8bs-muted border-b border-m8bs-border">
                    {groupingOptions.find(opt => opt.value === rowGroup)?.label || "Row"}
                  </th>
                  {colValues.map((col) => (
                    <th key={col} className="p-1.5 text-xs font-semibold text-m8bs-muted text-center border-b border-m8bs-border">
                      {col.length > 15 ? `${col.substring(0, 15)}...` : col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <motion.tr 
                    key={row.row}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                  >
                    <td className="p-1.5 text-xs font-medium text-white border-b border-m8bs-border/50">
                      {row.row.length > 15 ? `${row.row.substring(0, 15)}...` : row.row}
                    </td>
                    {row.cols.map((cell, i) => (
                      <motion.td
                        key={`${row.row}-${colValues[i]}`}
                        className={`p-1.5 text-center ${getColor(cell.value, activeMetric)} rounded m-0.5 transition-all duration-300 hover:scale-105`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-xs font-semibold text-white mb-0.5">
                          {formatValue(cell.value, activeMetric)}
                        </div>
                        {cell.count > 0 && (
                          <div className="text-[10px] text-white/70 bg-black/20 rounded-full px-1 py-0.5 inline-block">
                            {cell.count}
                          </div>
                        )}
                      </motion.td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-m8bs-muted bg-m8bs-card rounded-lg border border-m8bs-border">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No data available for heatmap</p>
            <p className="text-xs mt-1">Try adjusting your filters or grouping options</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 p-2 bg-m8bs-card rounded-lg border border-m8bs-border">
        <span className="text-xs font-medium text-white">Scale:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-br from-red-900/20 to-red-800/30 border border-red-800/40 rounded"></div>
          <span className="text-[10px] text-m8bs-muted">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-br from-orange-800/30 to-orange-700/40 border border-orange-700/50 rounded"></div>
          <span className="text-[10px] text-m8bs-muted">Med</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-br from-green-600/50 to-green-500/60 border border-green-500/70 rounded"></div>
          <span className="text-[10px] text-m8bs-muted">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-500/60 to-emerald-400/70 border border-emerald-400/80 rounded"></div>
          <span className="text-[10px] text-m8bs-muted">Excel</span>
        </div>
      </div>
    </div>
  )
}
