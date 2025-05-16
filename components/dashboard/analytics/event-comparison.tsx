"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell } from "recharts"
import { Check, ChevronsUpDown, BarChart3 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

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
      label: `${event.name} (${event.date ? new Date(event.date).toLocaleDateString() : 'No date'} • ${event.location || 'No location'})`,
    }
  })

  // Get gradient colors based on metric for the chart
  const getGradientColors = (metric: MetricType) => {
    switch (metric) {
      case "ROI":
        return { start: "#9333ea", end: "#c084fc" } // purple
      case "Conversion":
        return { start: "#f97316", end: "#fdba74" } // orange
      case "Revenue":
        return { start: "#16a34a", end: "#86efac" } // green
      case "Expenses":
        return { start: "#dc2626", end: "#fca5a5" } // red
      case "Profit":
        return { start: "#2563eb", end: "#93c5fd" } // blue
      case "Attendees":
        return { start: "#ca8a04", end: "#fde68a" } // yellow
      case "Clients":
        return { start: "#0284c7", end: "#7dd3fc" } // sky
      default:
        return { start: "#2563eb", end: "#93c5fd" } // blue
    }
  }

  const colors = getGradientColors(activeMetric)

  // Remove ROI from the metric selection
  const metricOptions: MetricType[] = ["Conversion", "Revenue", "Expenses", "Profit", "Attendees", "Clients"];

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-md card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-2 h-8 rounded bg-gradient-to-b from-purple-500 to-purple-700 mr-2" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Event Comparison</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
          <div className="flex flex-wrap gap-2">
            {metricOptions.map(
              (metric) => (
                <Button
                  key={metric}
                  variant="outline"
                  size="sm"
                  className={`border-[#1f2037] ${
                    activeMetric === metric
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-[#131525] text-white hover:bg-[#1f2037]"
                  }`}
                  onClick={() => setActiveMetric(metric)}
                >
                  {metric}
                </Button>
              ),
            )}
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[200px] justify-between bg-[#131525] border-[#1f2037] text-white"
              >
                {selectedEvents.length > 0 ? `${selectedEvents.length} events selected` : "Select events..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[400px] p-0 bg-[#131525] border-[#1f2037] text-white">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search events..." className="border-none focus:ring-0" />
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
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEvents.includes(event.id) ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{event.name} <span className="text-xs text-gray-400">({new Date(event.date).toLocaleDateString()} • {event.location || 'No location'})</span></span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[400px] mt-6 w-full">
          <svg className="w-0 h-0">
            <defs>
              <linearGradient id={`barGradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 30, right: 80, left: 10, bottom: 30 }}
              barGap={16}
            >
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={22}
                fontWeight="bold"
                tick={{ style: { fontWeight: 700, fontSize: 22, fill: '#fff' } }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (activeMetric === "Revenue" || activeMetric === "Expenses" || activeMetric === "Profit") {
                    return `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`
                  }
                  if (activeMetric === "ROI" || activeMetric === "Conversion") {
                    return `${value}%`
                  }
                  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }}
              />
              <YAxis
                dataKey="label"
                type="category"
                stroke="#888888"
                fontSize={22}
                fontWeight="bold"
                tick={false}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #2a2a45",
                  borderRadius: "8px",
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border border-[#2a2a45] bg-[#1a1a2e] p-3 shadow-lg">
                        <div className="grid gap-1">
                          <div className="font-extrabold text-white text-2xl">{data.name} <span className="text-xl text-gray-400">({data.date ? new Date(data.date).toLocaleDateString() : 'No date'} • {data.location || 'No location'})</span></div>
                          <div className="font-extrabold text-white text-3xl mt-2">{formatValue(data.value, activeMetric)}</div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
                radius={[0, 6, 6, 0]}
                barSize={48}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${activeMetric})`}
                    style={{
                      filter: "drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.3))",
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
                    const event = chartData[index];
                    return (
                      <g>
                        <text
                          x={x + width + 12}
                          y={y + height / 2 - 10}
                          fill="#fff"
                          fontSize={18}
                          fontWeight="bold"
                          alignmentBaseline="middle"
                        >
                          {formatValue(value, activeMetric)}
                        </text>
                        <text
                          x={x + 16}
                          y={y + height / 2 + 8}
                          fill="#cbd5e1"
                          fontSize={14}
                          fontWeight="bold"
                          alignmentBaseline="middle"
                        >
                          {event.type} | {event.date ? new Date(event.date).toLocaleDateString() : 'No date'} | {event.location}
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          {selectedEvents.length > 0
            ? "Showing your selected events"
            : `Showing top ${chartData.length} events by ${activeMetric}`}
        </div>
      </CardContent>
    </Card>
  )
}
