"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell, Legend } from "recharts"
import { Check, ChevronsUpDown, BarChart3, TrendingUp, TrendingDown, Target, DollarSign, Users, Award, Activity } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { motion } from "framer-motion"

type MetricType = "ROI" | "Conversion" | "Revenue" | "Expenses" | "Profit" | "Attendees" | "Clients"

interface EventComparisonProps {
  events: any[]
}

export function EventComparison({ events }: EventComparisonProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>("ROI")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [animate, setAnimate] = useState(false)

  // Trigger animation when chart data changes
  useEffect(() => {
    setAnimate(false)
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [activeMetric, selectedEvents])

  // Get top 5 events by default if none selected
  const getComparisonEvents = () => {
    if (selectedEvents.length > 0) {
      return events
        .filter((event) => selectedEvents.includes(event.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    // Default to top 5 by the active metric
    return [...events]
      .sort((a, b) => {
        switch (activeMetric) {
          case "ROI":
            return (b.roi || 0) - (a.roi || 0)
          case "Conversion":
            return (b.clients / b.attendees || 0) - (a.clients / a.attendees || 0)
          case "Revenue":
            return (b.revenue || 0) - (a.revenue || 0)
          case "Expenses":
            return (b.expenses || 0) - (a.expenses || 0)
          case "Profit":
            return (b.profit || 0) - (a.profit || 0)
          case "Attendees":
            return (b.attendees || 0) - (a.attendees || 0)
          case "Clients":
            return (b.clients || 0) - (a.clients || 0)
          default:
            return 0
        }
      })
      .slice(0, 5)
  }

  // Format value based on metric type
  const formatValue = (value: number | null | undefined, metric: MetricType) => {
    const numValue = Number(value) || 0;
    
    switch (metric) {
      case "ROI":
      case "Conversion":
        return `${numValue.toFixed(1)}%`
      case "Revenue":
      case "Expenses":
      case "Profit":
        return `$${numValue.toLocaleString()}`
      case "Attendees":
      case "Clients":
        return numValue.toLocaleString()
      default:
        return String(numValue)
    }
  }

  // Get metric icon and color
  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return { icon: TrendingUp, color: "text-emerald-400", bgColor: "bg-emerald-500/20" }
      case "Conversion":
        return { icon: Target, color: "text-blue-400", bgColor: "bg-blue-500/20" }
      case "Revenue":
        return { icon: DollarSign, color: "text-green-400", bgColor: "bg-green-500/20" }
      case "Expenses":
        return { icon: Activity, color: "text-red-400", bgColor: "bg-red-500/20" }
      case "Profit":
        return { icon: TrendingUp, color: "text-purple-400", bgColor: "bg-purple-500/20" }
      case "Attendees":
        return { icon: Users, color: "text-amber-400", bgColor: "bg-amber-500/20" }
      case "Clients":
        return { icon: Award, color: "text-cyan-400", bgColor: "bg-cyan-500/20" }
      default:
        return { icon: TrendingUp, color: "text-blue-400", bgColor: "bg-blue-500/20" }
    }
  }

  // Helper function to create a timezone-safe local date from a string like "2024-05-19"
  const createLocalDate = (dateString: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date in UTC to prevent any local timezone shifts.
    // The month is 0-indexed in Date.UTC, so we subtract 1.
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Transform data for the chart
  const chartData = getComparisonEvents().map((event) => {
    let metricValue = 0

    switch (activeMetric) {
      case "ROI":
        metricValue = event.roi || 0
        break
      case "Conversion":
        metricValue = event.attendees > 0 ? (event.clients / event.attendees) * 100 : 0
        break
      case "Revenue":
        metricValue = event.revenue || 0
        break
      case "Expenses":
        metricValue = event.expenses || 0
        break
      case "Profit":
        metricValue = event.profit || 0
        break
      case "Attendees":
        metricValue = event.attendees || 0
        break
      case "Clients":
        metricValue = event.clients || 0
        break
    }

    return {
      name: event.name,
      value: metricValue,
      type: event.type,
      date: event.date,
      id: event.id,
      location: event.location,
      label: event.name,
    }
  })

  // Calculate summary statistics
  const calculateSummary = () => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[0] > values[values.length - 1] ? "down" : "up";
    
    return { avg, max, min, trend };
  }

  const summary = calculateSummary();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const localDate = createLocalDate(data.date);
      return (
        <div className="bg-m8bs-card border border-m8bs-border p-3 rounded-lg shadow-lg">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-sm text-m8bs-muted mb-1">
            {localDate ? format(localDate, "MMM d, yyyy") : 'No date'} • {data.location}
          </p>
          <p className="text-sm font-semibold text-white">
            {activeMetric}: {formatValue(data.value, activeMetric)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get gradient colors based on metric for the chart
  const getGradientColors = (metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return { start: "#10B981", end: "#34D399" } // emerald
      case "Conversion":
        return { start: "#3B82F6", end: "#60A5FA" } // blue
      case "Revenue":
        return { start: "#22C55E", end: "#4ADE80" } // green
      case "Expenses":
        return { start: "#EF4444", end: "#F87171" } // red
      case "Profit":
        return { start: "#8B5CF6", end: "#A78BFA" } // purple
      case "Attendees":
        return { start: "#F59E0B", end: "#FBBF24" } // amber
      case "Clients":
        return { start: "#06B6D4", end: "#22D3EE" } // cyan
      default:
        return { start: "#3B82F6", end: "#60A5FA" } // blue
    }
  }

  const colors = getGradientColors(activeMetric)

  // Remove ROI from the metric selection
  const metricOptions: MetricType[] = ["Conversion", "Revenue", "Expenses", "Profit", "Attendees", "Clients"];

  return (
    <div className="space-y-3">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-1.5">
        {metricOptions.map((metric) => {
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
                onClick={() => setActiveMetric(metric)}
              >
                <icon.icon className="h-4 w-4 mr-2" />
                {metric}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Event Selector */}
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[300px] justify-between bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {selectedEvents.length > 0 ? `${selectedEvents.length} events selected` : "Select events to compare..."}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[400px] p-0 bg-m8bs-card border-m8bs-border text-white">
            <Command className="bg-transparent">
              <CommandInput placeholder="Search events..." className="border-none focus:ring-0 bg-m8bs-card-alt" />
              <CommandList>
                <CommandEmpty>No events found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {events.map((event) => (
                    <CommandItem
                      key={event.id}
                      value={event.id}
                      onSelect={() => {
                        setSelectedEvents(
                          selectedEvents.includes(event.id)
                            ? selectedEvents.filter((id) => id !== event.id)
                            : [...selectedEvents, event.id],
                        )
                      }}
                      className="bg-m8bs-card-alt hover:bg-m8bs-card"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEvents.includes(event.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-xs text-m8bs-muted">
                          {event.date ? format(createLocalDate(event.date)!, "MMM d, yyyy") : 'No date'} • {event.location || 'No location'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      {summary && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-m8bs-card p-4 rounded-lg border border-m8bs-border">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${getMetricIcon(activeMetric).bgColor}`}>
                <BarChart3 className={`h-4 w-4 ${getMetricIcon(activeMetric).color}`} />
              </div>
              <p className="text-sm text-m8bs-muted">Average {activeMetric}</p>
            </div>
            <p className="text-xl font-bold text-white">{formatValue(summary.avg, activeMetric)}</p>
          </div>
          
          <div className="bg-m8bs-card p-4 rounded-lg border border-m8bs-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-sm text-m8bs-muted">Highest {activeMetric}</p>
            </div>
            <p className="text-xl font-bold text-white">{formatValue(summary.max, activeMetric)}</p>
          </div>
          
          <div className="bg-m8bs-card p-4 rounded-lg border border-m8bs-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-sm text-m8bs-muted">Lowest {activeMetric}</p>
            </div>
            <p className="text-xl font-bold text-white">{formatValue(summary.min, activeMetric)}</p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div 
        className="bg-m8bs-card rounded-lg border border-m8bs-border p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="h-[400px] w-full">
          <svg className="w-0 h-0">
            <defs>
              <linearGradient id={`barGradient-${activeMetric}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 200, left: 20, bottom: 20 }}
              barGap={16}
            >
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={14}
                tick={{ style: { fill: '#94a3b8' } }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (activeMetric === "Revenue" || activeMetric === "Expenses" || activeMetric === "Profit") {
                    return `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString()}`
                  }
                  if (activeMetric === "ROI" || activeMetric === "Conversion") {
                    return `${value.toFixed(1)}%`
                  }
                  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString()
                }}
              />
              <YAxis
                dataKey="label"
                type="category"
                stroke="#888888"
                fontSize={14}
                tick={{ style: { fill: '#94a3b8' } }}
                tickLine={false}
                axisLine={false}
                width={180}
              />
              <Bar
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
                radius={[0, 8, 8, 0]}
                barSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${activeMetric})`}
                    style={{
                      filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.2))",
                      opacity: animate ? 1 : 0,
                      transition: `opacity 0.5s ease-in-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`,
                      transform: animate ? "translateX(0)" : "translateX(-20px)",
                    }}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  content={({ x, y, width, height, value, index }) => {
                    if (!x || !y || !width || !height || typeof index !== 'number') return null;
                    const event = chartData[index];
                    return (
                      <g>
                        <text
                          x={Number(x) + Number(width) + 8}
                          y={Number(y) + Number(height) / 2 - 10}
                          fill="#fff"
                          fontSize={14}
                          fontWeight="600"
                          dominantBaseline="middle"
                        >
                          {formatValue(Number(value), activeMetric)}
                        </text>
                        <text
                          x={Number(x) + Number(width) + 8}
                          y={Number(y) + Number(height) / 2 + 10}
                          fill="#94a3b8"
                          fontSize={12}
                          fontWeight="400"
                          dominantBaseline="middle"
                        >
                          {event.date ? format(createLocalDate(event.date)!, "MMM d, yyyy") : 'No date'} • {event.location || 'No location'}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div 
        className="bg-m8bs-card rounded-lg border border-m8bs-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-m8bs-border bg-m8bs-card-alt">
                <th className="text-left py-3 px-4 text-sm font-medium text-m8bs-muted">Event Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-m8bs-muted">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-m8bs-muted">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-m8bs-muted">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-m8bs-muted">{activeMetric}</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((event, index) => (
                <motion.tr 
                  key={event.id} 
                  className="border-b border-m8bs-border hover:bg-m8bs-card-alt transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <td className="py-3 px-4 text-sm text-white font-medium">{event.name}</td>
                  <td className="py-3 px-4 text-sm text-m8bs-muted">
                    {event.date ? format(createLocalDate(event.date)!, "MMM d, yyyy") : 'No date'}
                  </td>
                  <td className="py-3 px-4 text-sm text-m8bs-muted">{event.location || 'No location'}</td>
                  <td className="py-3 px-4 text-sm text-m8bs-muted">{event.type}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium text-right">
                    {formatValue(event.value, activeMetric)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="text-center text-sm text-m8bs-muted">
        {selectedEvents.length > 0
          ? "Showing your selected events"
          : `Showing top ${chartData.length} events by ${activeMetric}`}
      </div>
    </div>
  )
}
