"use client"

import { useState, useCallback } from "react"
import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { EventComparison } from "@/components/dashboard/analytics/event-comparison"
import { EnhancedExport } from "@/components/dashboard/analytics/enhanced-export"
import { PerformanceHeatmap } from "@/components/dashboard/analytics/performance-heatmap"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Activity } from "lucide-react"

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

export function AnalyticsDashboard({ analyticsData }: AnalyticsDashboardProps) {
  // Initialize state with the provided data or defaults
  const [filteredData, setFilteredData] = useState(() => analyticsData || defaultData)
  
  // Separate metric states for each component
  const [topPerformersMetric, setTopPerformersMetric] = useState<"ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients">("ROI")
  const [heatmapMetric, setHeatmapMetric] = useState<"ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients">("ROI")

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

  return (
    <motion.div 
      className="space-y-6 lg:space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2"
        variants={item}
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Multi-Event Analytics Dashboard</h1>
            <p className="text-m8bs-muted mt-1">Comprehensive insights across all your marketing events</p>
          </div>
        </div>
        <EnhancedExport data={filteredData} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        {/* Bottom Row - Event Comparison (Full Width) */}
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
      </motion.div>
    </motion.div>
  )
}
