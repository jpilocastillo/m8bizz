"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, DollarSign, Target, Calendar, ArrowUp, ArrowDown, Info } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"

interface TrendAnalysisProps {
  events: any[]
}

export function TrendAnalysis({ events }: TrendAnalysisProps) {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "attendees" | "clients" | "roi">("revenue")

  // Process events for trend analysis
  const processedData = useMemo(() => {
    if (!events || events.length === 0) return []

    // Group events by month
    const groupedData: { [key: string]: any[] } = {}
    
    events.forEach(event => {
      if (!event.date) return
      
      // Parse date properly - handle YYYY-MM-DD format
      let eventDate: Date
      if (typeof event.date === 'string' && event.date.includes('-')) {
        const [year, month, day] = event.date.split('-').map(Number)
        eventDate = new Date(year, month - 1, day) // month is 0-indexed
      } else {
        eventDate = new Date(event.date)
      }
      
      // Validate date
      if (isNaN(eventDate.getTime())) return
      
      const monthKey = format(eventDate, "MMM yyyy")
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = []
      }
      groupedData[monthKey].push(event)
    })

    // Calculate metrics for each month
    return Object.entries(groupedData)
      .map(([month, monthEvents]) => {
        const totalRevenue = monthEvents.reduce((sum, event) => {
          // Handle both flat revenue property and nested financial_production
          if (event.revenue !== undefined) {
            return sum + (Number(event.revenue) || 0)
          }
          // Fallback to calculating from financial_production if available
          if (event.financial_production) {
            const fp = event.financial_production
            return sum + (
              (Number(fp.aum_fees) || 0) +
              (Number(fp.annuity_commission) || 0) +
              (Number(fp.life_insurance_commission) || 0) +
              (Number(fp.financial_planning) || 0)
            )
          }
          return sum
        }, 0)
        
        const totalAttendees = monthEvents.reduce((sum, event) => {
          // Handle both flat attendees property and nested attendance
          if (event.attendees !== undefined) {
            return sum + (Number(event.attendees) || 0)
          }
          if (event.attendance?.attendees !== undefined) {
            return sum + (Number(event.attendance.attendees) || 0)
          }
          return sum
        }, 0)
        
        const totalClients = monthEvents.reduce((sum, event) => {
          // Handle both flat clients property and nested attendance
          if (event.clients !== undefined) {
            return sum + (Number(event.clients) || 0)
          }
          if (event.attendance?.clients_from_event !== undefined) {
            return sum + (Number(event.attendance.clients_from_event) || 0)
          }
          return sum
        }, 0)
        
        const totalExpenses = monthEvents.reduce((sum, event) => {
          // Handle both flat expenses property and nested marketing_expenses
          if (event.expenses !== undefined) {
            return sum + (Number(event.expenses) || 0)
          }
          if (event.marketing_expenses?.total_cost !== undefined) {
            return sum + (Number(event.marketing_expenses.total_cost) || 0)
          }
          return sum
        }, 0)
        
        // Calculate ROI: ((Revenue - Expenses) / Expenses) * 100
        const roi = totalExpenses > 0 
          ? Math.round(((totalRevenue - totalExpenses) / totalExpenses) * 100)
          : totalRevenue > 0 
            ? 9999 // High ROI when there's revenue but no expenses
            : 0

        // Get the first event's date for proper sorting
        let firstEventDate: Date
        if (typeof monthEvents[0].date === 'string' && monthEvents[0].date.includes('-')) {
          const [year, month, day] = monthEvents[0].date.split('-').map(Number)
          firstEventDate = new Date(year, month - 1, day)
        } else {
          firstEventDate = new Date(monthEvents[0].date)
        }

        return {
          month,
          revenue: totalRevenue,
          attendees: totalAttendees,
          clients: totalClients,
          roi: roi,
          eventCount: monthEvents.length,
          sortDate: firstEventDate, // Add sort date for proper ordering
        }
      })
      .sort((a, b) => {
        // Sort by the actual date
        return a.sortDate.getTime() - b.sortDate.getTime()
      })
      .map(({ sortDate, ...rest }) => rest) // Remove sortDate from final result
  }, [events])

  // Calculate trend direction and percentage
  const getTrendData = (metric: string) => {
    if (processedData.length < 2) return { direction: "stable", percentage: 0, icon: Minus }

    const latest = processedData[processedData.length - 1]
    const previous = processedData[processedData.length - 2]
    
    const latestValue = Number(latest[metric]) || 0
    const previousValue = Number(previous[metric]) || 0
    
    // Handle zero cases
    if (previousValue === 0) {
      if (latestValue > 0) {
        return { direction: "up", percentage: 100, icon: TrendingUp }
      }
      return { direction: "stable", percentage: 0, icon: Minus }
    }
    
    // Calculate percentage change
    const percentage = ((latestValue - previousValue) / previousValue) * 100
    
    // Use a threshold to determine direction (5% for most metrics, but handle ROI differently)
    const threshold = metric === "roi" ? 10 : 5 // ROI can be more volatile
    const direction = percentage > threshold ? "up" : percentage < -threshold ? "down" : "stable"
    const icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus
    
    return { direction, percentage: Math.abs(percentage), icon }
  }

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case "revenue":
        return formatCurrency(value)
      case "attendees":
      case "clients":
        return value.toString()
      case "roi":
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "revenue":
        return "Revenue"
      case "attendees":
        return "Attendees"
      case "clients":
        return "Clients"
      case "roi":
        return "ROI"
      default:
        return metric
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "revenue":
        return DollarSign
      case "attendees":
        return Users
      case "clients":
        return Target
      case "roi":
        return BarChart3
      default:
        return BarChart3
    }
  }

  const getMetricDescription = (metric: string) => {
    switch (metric) {
      case "revenue":
        return "Total Income Generated From Your Events"
      case "attendees":
        return "Number Of People Who Attended Your Events"
      case "clients":
        return "New Clients You Acquired From Events"
      case "roi":
        return "Return On Investment - How Much Profit Per Dollar Spent"
      default:
        return ""
    }
  }

  const trendData = getTrendData(activeMetric)
  const MetricIcon = getMetricIcon(activeMetric)

  if (processedData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-m8bs-card-alt p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-m8bs-blue" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Trend Data Available</h3>
        <p className="text-m8bs-muted max-w-md mx-auto">
          Create More Events Across Different Months To See How Your Performance Is Trending Over Time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Description */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">📈 Performance Trends</h3>
        <p className="text-m8bs-muted text-sm max-w-2xl mx-auto">
          See How Your Marketing Events Are Performing Over Time. Track Your Progress And Identify What's Working Best.
        </p>
      </div>

      {/* Metric Selection */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-white mb-3">What Would You Like To Track?</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {(["revenue", "attendees", "clients", "roi"] as const).map((metric) => (
              <Button
                key={metric}
                variant={activeMetric === metric ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMetric(metric)}
                className={`flex items-center gap-2 transition-all ${
                  activeMetric === metric
                    ? "bg-m8bs-blue text-white shadow-lg"
                    : "bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt hover:border-m8bs-blue/50"
                }`}
              >
                {React.createElement(getMetricIcon(metric), { className: "h-4 w-4" })}
                {getMetricLabel(metric)}
              </Button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-m8bs-card-alt rounded-lg border border-m8bs-border">
            <div className="flex items-center gap-2 text-sm text-m8bs-muted">
              <Info className="h-4 w-4" />
              <span>{getMetricDescription(activeMetric)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-m8bs-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-m8bs-card-alt">
                <MetricIcon className="h-6 w-6 text-m8bs-blue" />
              </div>
              <Badge variant="secondary" className="bg-m8bs-card-alt text-m8bs-blue border-m8bs-border">
                Latest
              </Badge>
            </div>
            <div>
              <p className="text-sm text-m8bs-muted mb-1">Most Recent {getMetricLabel(activeMetric)}</p>
              <p className="text-2xl font-bold text-white">
                {formatValue(processedData[processedData.length - 1]?.[activeMetric] || 0, activeMetric)}
              </p>
              <p className="text-xs text-m8bs-muted mt-1">
                {processedData[processedData.length - 1]?.eventCount || 0} events in {processedData[processedData.length - 1]?.month}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                trendData.direction === "up" ? "bg-green-500/20" : 
                trendData.direction === "down" ? "bg-red-500/20" : 
                "bg-m8bs-muted/20"
              }`}>
                {trendData.direction === "up" ? (
                  <ArrowUp className="h-6 w-6 text-green-400" />
                ) : trendData.direction === "down" ? (
                  <ArrowDown className="h-6 w-6 text-red-400" />
                ) : (
                  <Minus className="h-6 w-6 text-m8bs-muted" />
                )}
              </div>
              <Badge 
                variant="secondary" 
                className={`${
                  trendData.direction === "up" ? "bg-green-500/20 text-green-400 border-green-500/50" :
                  trendData.direction === "down" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                  "bg-m8bs-muted/20 text-m8bs-muted border-m8bs-muted/50"
                }`}
              >
                {trendData.direction === "up" ? "Growing" : 
                 trendData.direction === "down" ? "Declining" : 
                 "Stable"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-m8bs-muted mb-1">Trend Direction</p>
              <p className={`text-2xl font-bold ${
                trendData.direction === "up" ? "text-green-400" : 
                trendData.direction === "down" ? "text-red-400" : 
                "text-m8bs-muted"
              }`}>
                {trendData.direction === "up" ? "↗ Growing" : 
                 trendData.direction === "down" ? "↘ Declining" : 
                 "→ Stable"}
              </p>
              <p className="text-xs text-m8bs-muted mt-1">
                {trendData.direction === "up" ? "Keep up the great work!" : 
                 trendData.direction === "down" ? "Time to make some adjustments" : 
                 "Consistent performance"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                trendData.direction === "up" ? "bg-green-500/20" : 
                trendData.direction === "down" ? "bg-red-500/20" : 
                "bg-m8bs-muted/20"
              }`}>
                <trendData.icon className={`h-6 w-6 ${
                  trendData.direction === "up" ? "text-green-400" : 
                  trendData.direction === "down" ? "text-red-400" : 
                  "text-m8bs-muted"
                }`} />
              </div>
              <Badge 
                variant="secondary" 
                className={`${
                  trendData.direction === "up" ? "bg-green-500/20 text-green-400 border-green-500/50" :
                  trendData.direction === "down" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                  "bg-m8bs-muted/20 text-m8bs-muted border-m8bs-muted/50"
                }`}
              >
                Change
              </Badge>
            </div>
            <div>
              <p className="text-sm text-m8bs-muted mb-1">vs Previous Month</p>
              <p className={`text-2xl font-bold ${
                trendData.direction === "up" ? "text-green-400" : 
                trendData.direction === "down" ? "text-red-400" : 
                "text-m8bs-muted"
              }`}>
                {trendData.direction === "up" ? "+" : trendData.direction === "down" ? "-" : ""}
                {trendData.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-m8bs-muted mt-1">
                {trendData.direction === "up" ? "Excellent improvement!" : 
                 trendData.direction === "down" ? "Consider new strategies" : 
                 "Steady as she goes"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Chart */}
      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <BarChart3 className="h-5 w-5 text-m8bs-blue" />
            {getMetricLabel(activeMetric)} Over Time
          </CardTitle>
          <p className="text-sm text-m8bs-muted">
            Monthly Performance Showing Your {getMetricLabel(activeMetric)} Trends
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[28rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (activeMetric === "revenue") return `$${(value / 1000).toFixed(0)}k`
                    if (activeMetric === "roi") return `${value}%`
                    return value.toString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    color: "#F9FAFB",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                  }}
                  formatter={(value: any) => [formatValue(value, activeMetric), getMetricLabel(activeMetric)]}
                  labelFormatter={(label) => `📅 ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#3B82F6"
                  strokeWidth={4}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 3, fill: "#1E40AF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}