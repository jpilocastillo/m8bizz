"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Area, AreaChart } from "recharts"
import { TrendingUp } from "lucide-react"

type MetricType = "revenue" | "expenses" | "profit" | "roi" | "attendees" | "clients" | "conversion"

interface TrendAnalysisChartProps {
  monthlyData: any[]
}

export function TrendAnalysisChart({ monthlyData }: TrendAnalysisChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<MetricType[]>(["revenue", "expenses", "profit"])

  const toggleMetric = (metric: MetricType) => {
    if (activeMetrics.includes(metric)) {
      setActiveMetrics(activeMetrics.filter((m) => m !== metric))
    } else {
      setActiveMetrics([...activeMetrics, metric])
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }

  // Get chart colors
  const getMetricColor = (metric: MetricType) => {
    switch (metric) {
      case "revenue":
        return "#4ade80" // green
      case "expenses":
        return "#f87171" // red
      case "profit":
        return "#60a5fa" // blue
      case "roi":
        return "#a78bfa" // purple
      case "attendees":
        return "#fbbf24" // yellow
      case "clients":
        return "#38bdf8" // sky
      case "conversion":
        return "#fb923c" // orange
      default:
        return "#60a5fa" // blue
    }
  }

  // Get display name for the metric
  const getMetricName = (metric: MetricType): string => {
    switch (metric) {
      case "roi":
        return "ROI"
      case "conversion":
        return "Conversion Rate"
      default:
        return metric.charAt(0).toUpperCase() + metric.slice(1)
    }
  }

  // Get formatter for the y-axis
  const getYAxisFormatter = (metrics: MetricType[]) => {
    if (metrics.includes("roi") || metrics.includes("conversion")) {
      return (value: number) => `${value}%`
    }
    if (metrics.includes("revenue") || metrics.includes("expenses") || metrics.includes("profit")) {
      return (value: number) => `$${value >= 1000 ? `${value / 1000}k` : value}`
    }
    return (value: number) => value
  }

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-md card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-lg font-medium text-white">Performance Trends</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { metric: "revenue", label: "Revenue" },
            { metric: "expenses", label: "Expenses" },
            { metric: "profit", label: "Profit" },
            { metric: "roi", label: "ROI" },
            { metric: "attendees", label: "Attendees" },
            { metric: "clients", label: "Clients" },
            { metric: "conversion", label: "Conversion" },
          ].map(({ metric, label }) => (
            <Button
              key={metric}
              variant="outline"
              size="sm"
              className={`border-[#1f2037] ${
                activeMetrics.includes(metric as MetricType)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-[#131525] text-white hover:bg-[#1f2037]"
              }`}
              onClick={() => toggleMetric(metric as MetricType)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <defs>
                {activeMetrics.map((metric) => (
                  <linearGradient key={metric} id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getMetricColor(metric)} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getMetricColor(metric)} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={getYAxisFormatter(activeMetrics)}
              />
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #2a2a45",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  // Format the value based on the metric type
                  if (name === "ROI" || name === "Conversion Rate") {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  if (name === "Revenue" || name === "Expenses" || name === "Profit") {
                    return [`$${value.toLocaleString()}`, name]
                  }
                  return [value.toLocaleString(), name]
                }}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  paddingTop: "10px",
                }}
                formatter={(value) => <span style={{ color: "#fff", fontSize: "12px" }}>{value}</span>}
              />
              {activeMetrics.map((metric) => (
                <Area
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={getMetricName(metric)}
                  stroke={getMetricColor(metric)}
                  fillOpacity={1}
                  fill={`url(#color${metric})`}
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
