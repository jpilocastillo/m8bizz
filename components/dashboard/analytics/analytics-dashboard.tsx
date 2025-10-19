"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { EventComparison } from "@/components/dashboard/analytics/event-comparison"
import { EnhancedExport } from "@/components/dashboard/analytics/enhanced-export"
import { PerformanceHeatmap } from "@/components/dashboard/analytics/performance-heatmap"
import { AnalyticsFilters } from "@/components/dashboard/analytics/analytics-filters"
import { TrendAnalysis } from "@/components/dashboard/analytics/trend-analysis"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Activity, AlertCircle, RefreshCw, DollarSign, Users, Target } from "lucide-react"
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
      setError("No analytics data available")
      return false
    }

    if (!data.events || !Array.isArray(data.events)) {
      setError("Invalid events data format")
      return false
    }

    if (!data.summary || typeof data.summary !== 'object') {
      setError("Invalid summary data format")
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
      setError("Failed to refresh data. Please try again.")
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Multi-Event Analytics Dashboard</h1>
              <p className="text-m8bs-muted mt-1">Comprehensive insights across all your marketing events</p>
            </div>
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
      className="space-y-6 lg:space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
      role="main"
      aria-label="Multi-Event Analytics Dashboard"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl" aria-hidden="true">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Multi-Event Analytics Dashboard</h1>
            <p className="text-m8bs-muted mt-1">Comprehensive insights across all your marketing events</p>
          </div>
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
        <div className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-2xl p-6 shadow-lg card-hover">
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

        {/* Bottom Row - Event Comparison and Trend Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="space-y-4">
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
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-m8bs-blue" />
                  Monthly Summary
                </CardTitle>
                <p className="text-sm text-m8bs-muted mt-1">
                  Track your monthly performance across all marketing events with key metrics and ROI analysis
                </p>
              </CardHeader>
              <CardContent className="pt-2">
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
              </CardContent>
            </Card>
          </div>

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
        </div>
      </motion.div>
    </motion.div>
  )
}
