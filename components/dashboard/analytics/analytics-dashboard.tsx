"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { EventComparison } from "@/components/dashboard/analytics/event-comparison"
import { EnhancedExport } from "@/components/dashboard/analytics/enhanced-export"
import { PerformanceHeatmap } from "@/components/dashboard/analytics/performance-heatmap"
import { AnalyticsFilters } from "@/components/dashboard/analytics/analytics-filters"
import { TrendAnalysis } from "@/components/dashboard/analytics/trend-analysis"
import { ConversionBreakdown } from "@/components/dashboard/analytics/conversion-breakdown"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Activity, AlertCircle, RefreshCw, DollarSign, Users, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Sample data structure with defaults
const defaultData = {
  summary: {
    totalEvents: 0,
    totalAttendees: 0,
    avgAttendees: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    overallROI: 0,
    totalClients: 0,
    overallConversionRate: 0,
    appointmentConversionRate: 0,
    avgAppointments: 0,
    avgClients: 0,
    totalAppointmentsSet: 0,
    totalAppointmentsMade: 0,
    totalRegistrants: 0,
  },
  events: [],
  monthlyData: [],
  metricsByType: [],
}

interface AnalyticsDashboardProps {
  analyticsData: any
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

export function AnalyticsDashboard({ analyticsData }: AnalyticsDashboardProps) {
  // Initialize state with the provided data or defaults
  const [filteredData, setFilteredData] = useState(() => analyticsData || defaultData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    dateRange: { from: undefined, to: undefined },
    locations: [],
    types: [],
    topics: [],
    timeSlots: [],
  })
  
  // Separate metric states for each component
  const [topPerformersMetric, setTopPerformersMetric] = useState<"ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients">("ROI")
  const [heatmapMetric, setHeatmapMetric] = useState<"ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients">("ROI")

  // Data validation
  const validateData = useCallback((data: any) => {
    if (!data) {
      setError("No Analytics Data Available")
      return false
    }

    if (!data.events || !Array.isArray(data.events)) {
      setError("Invalid Events Data Format")
      return false
    }

    if (!data.summary || typeof data.summary !== 'object') {
      setError("Invalid Summary Data Format")
      return false
    }

    setError(null)
    return true
  }, [])

  // Handle data refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      // In a real implementation, you would refetch data here
      // For now, we'll just validate the current data
      if (validateData(analyticsData)) {
        setFilteredData(analyticsData)
      }
    } catch (err) {
      setError("Failed To Refresh Data. Please Try Again.")
    } finally {
      setIsRefreshing(false)
    }
  }, [analyticsData, validateData])

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    if (!analyticsData?.events) return []
    
    return analyticsData.events.filter((event: any) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          event.name?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.topic?.toLowerCase().includes(searchLower) ||
          event.type?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const eventDate = new Date(event.date)
        if (filters.dateRange.from && eventDate < filters.dateRange.from) return false
        if (filters.dateRange.to && eventDate > filters.dateRange.to) return false
      }

      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(event.location)) {
        return false
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false
      }

      // Topic filter
      if (filters.topics.length > 0 && !filters.topics.includes(event.topic)) {
        return false
      }

      // Time slot filter
      if (filters.timeSlots.length > 0 && !filters.timeSlots.includes(event.time)) {
        return false
      }

      return true
    })
  }, [analyticsData?.events, filters])

  // Update filtered data when filters change
  useEffect(() => {
    if (analyticsData) {
      const updatedData = {
        ...analyticsData,
        events: filteredEvents,
        summary: {
          ...analyticsData.summary,
          totalEvents: filteredEvents.length,
          totalAttendees: filteredEvents.reduce((sum, event) => sum + (event.attendees || 0), 0),
          totalRevenue: filteredEvents.reduce((sum, event) => sum + (event.revenue || 0), 0),
          totalExpenses: filteredEvents.reduce((sum, event) => sum + (event.expenses || 0), 0),
          totalProfit: filteredEvents.reduce((sum, event) => sum + (event.profit || 0), 0),
          totalClients: filteredEvents.reduce((sum, event) => sum + (event.clients || 0), 0),
          totalAppointmentsSet: filteredEvents.reduce((sum, event) => sum + (event.appointmentsSet || 0), 0),
          totalAppointmentsMade: filteredEvents.reduce((sum, event) => sum + (event.appointmentsMade || 0), 0),
          totalRegistrants: filteredEvents.reduce((sum, event) => sum + (event.registrants || 0), 0),
        }
      }
      setFilteredData(updatedData)
    }
  }, [analyticsData, filteredEvents])

  // Validate data on mount and when analyticsData changes
  useEffect(() => {
    validateData(analyticsData)
    if (analyticsData) {
      setFilteredData(analyticsData)
    }
  }, [analyticsData, validateData])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Multi Event</h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-m8bs-blue-light to-m8bs-blue bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Alert className="bg-red-900/20 border-red-800/40 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6 lg:space-y-8 pb-0"
      variants={container}
      initial="hidden"
      animate="show"
      role="main"
      aria-label="Multi-Event Analytics Dashboard"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={item}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Multi Event</h1>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-m8bs-blue-light to-m8bs-blue bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt"
            aria-label={isRefreshing ? "Refreshing data" : "Refresh analytics data"}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
          <EnhancedExport data={filteredData} />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <AnalyticsFilters 
          onFiltersChange={setFilters}
          events={analyticsData?.events || []}
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 gap-4 lg:gap-6"
        variants={item}
      >
        <div className="bg-m8bs-card rounded-2xl p-6 shadow-sm">
          <AnalyticsSummary data={filteredData?.summary || defaultData.summary} />
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={item} className="space-y-4">
        {/* Top Row - Top Performers and Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-m8bs-blue" />
                Top Performing Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <TopPerformers
                data={filteredData?.events || []}
                activeMetric={topPerformersMetric}
                onMetricChange={setTopPerformersMetric}
              />
            </CardContent>
          </Card>

          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-m8bs-blue" />
                Performance Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <PerformanceHeatmap
                data={filteredData}
                activeMetric={heatmapMetric}
                onMetricChange={setHeatmapMetric}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Event Comparison, Monthly Summary, Conversion Funnel, and Trend Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
          <div className="space-y-4 flex flex-col">
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-m8bs-blue" />
                  Event Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <EventComparison events={filteredData?.events || []} />
              </CardContent>
            </Card>

            {/* Monthly Summary Card */}
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-m8bs-blue" />
                  Monthly Summary
                </CardTitle>
                <p className="text-sm text-m8bs-muted mt-1">
                  Track your monthly performance across all marketing events with key metrics and ROI analysis
                </p>
              </CardHeader>
              <CardContent className="pt-2 flex-1 flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-m8bs-border">
                        <th className="text-left py-3 px-3 text-m8bs-muted font-medium text-sm">📅 Month</th>
                        <th className="text-center py-3 px-3 text-m8bs-muted font-medium text-sm">📊 Events</th>
                        <th className="text-right py-3 px-3 text-m8bs-muted font-medium text-sm">💰 Revenue</th>
                        <th className="text-right py-3 px-3 text-m8bs-muted font-medium text-sm">👥 Attendees</th>
                        <th className="text-right py-3 px-3 text-m8bs-muted font-medium text-sm">🎯 Clients</th>
                        <th className="text-right py-3 px-3 text-m8bs-muted font-medium text-sm">📈 ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Group events by month
                        const monthlyData: { [key: string]: any[] } = {}
                        const events = filteredData?.events || []
                        
                        events.forEach(event => {
                          const eventDate = new Date(event.date)
                          const monthKey = eventDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          
                          if (!monthlyData[monthKey]) {
                            monthlyData[monthKey] = []
                          }
                          monthlyData[monthKey].push(event)
                        })

                        // Calculate metrics for each month
                        const processedData = Object.entries(monthlyData)
                          .map(([month, monthEvents]) => {
                            const totalRevenue = monthEvents.reduce((sum, event) => sum + (event.revenue || 0), 0)
                            const totalAttendees = monthEvents.reduce((sum, event) => sum + (event.attendees || 0), 0)
                            const totalClients = monthEvents.reduce((sum, event) => sum + (event.clients || 0), 0)
                            const totalExpenses = monthEvents.reduce((sum, event) => sum + (event.expenses || 0), 0)
                            const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0

                            return {
                              month,
                              events: monthEvents.length,
                              revenue: totalRevenue,
                              expenses: totalExpenses,
                              profit: totalRevenue - totalExpenses,
                              attendees: totalAttendees,
                              clients: totalClients,
                              roi: roi
                            }
                          })
                          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
                          .slice(-6) // Show last 6 months

                        return processedData.map((data, index) => (
                          <tr key={index} className="border-b border-m8bs-border/50 hover:bg-m8bs-card-alt/50 transition-colors">
                            <td className="py-3 px-3 text-white font-medium text-sm">{data.month}</td>
                            <td className="py-3 px-3 text-center text-white text-sm">{data.events}</td>
                            <td className="py-3 px-3 text-right text-white text-sm">
                              {data.revenue >= 1000000 
                                ? `$${(data.revenue / 1000000).toFixed(1)}M`
                                : data.revenue >= 1000 
                                ? `$${(data.revenue / 1000).toFixed(1)}K`
                                : `$${data.revenue.toFixed(0)}`
                              }
                            </td>
                            <td className="py-3 px-3 text-right text-white text-sm">{data.attendees}</td>
                            <td className="py-3 px-3 text-right text-white text-sm">{data.clients}</td>
                            <td className="py-3 px-3 text-right text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                data.roi > 0 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : data.roi < 0 
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {data.roi > 0 ? '+' : ''}{data.roi.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Monthly Trends Chart */}
                {(() => {
                  // Group events by month for chart
                  const monthlyData: { [key: string]: any[] } = {}
                  const events = filteredData?.events || []
                  
                  events.forEach(event => {
                    const eventDate = new Date(event.date)
                    const monthKey = eventDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    
                    if (!monthlyData[monthKey]) {
                      monthlyData[monthKey] = []
                    }
                    monthlyData[monthKey].push(event)
                  })

                  // Calculate metrics for each month
                  const chartData = Object.entries(monthlyData)
                    .map(([month, monthEvents]) => {
                      const totalRevenue = monthEvents.reduce((sum, event) => sum + (event.revenue || 0), 0)
                      const totalExpenses = monthEvents.reduce((sum, event) => sum + (event.expenses || 0), 0)
                      const totalProfit = totalRevenue - totalExpenses

                      return {
                        month,
                        revenue: Math.round(totalRevenue),
                        expenses: Math.round(totalExpenses),
                        profit: Math.round(totalProfit),
                      }
                    })
                    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
                    .slice(-6) // Show last 6 months

                  if (chartData.length === 0) return null

                  const formatCurrency = (value: number) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
                    return `$${value.toFixed(0)}`
                  }

                  return (
                    <div className="mt-4 pt-4 border-t border-m8bs-border">
                      <h4 className="text-sm font-semibold text-white mb-3">Monthly Financial Trends</h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#94a3b8"
                              tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis 
                              stroke="#94a3b8"
                              tick={{ fill: '#94a3b8', fontSize: 12 }}
                              tickFormatter={(value) => {
                                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                                return `$${value}`
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#131525",
                                border: "1px solid #1f2037",
                                borderRadius: "6px",
                                color: "#fff",
                              }}
                              formatter={(value: number, name: string) => {
                                return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                            />
                            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 flex flex-col">
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-m8bs-blue" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <TrendAnalysis events={filteredData?.events || []} />
              </CardContent>
            </Card>

            {/* Conversion Breakdown Card */}
            <div className="flex-1">
              <ConversionBreakdown
                registrants={filteredData?.summary?.totalRegistrants || 0}
                attendees={filteredData?.summary?.totalAttendees || 0}
                appointmentsSet={filteredData?.summary?.totalAppointmentsSet || 0}
                clientsCreated={filteredData?.summary?.totalClients || 0}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
