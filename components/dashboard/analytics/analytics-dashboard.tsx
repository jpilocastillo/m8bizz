"use client"

import { useState, useCallback } from "react"
import { AnalyticsFilters } from "@/components/dashboard/analytics/analytics-filters"
import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { EventComparison } from "@/components/dashboard/analytics/event-comparison"
import { EnhancedExport } from "@/components/dashboard/analytics/enhanced-export"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsByType } from "@/components/dashboard/analytics/metrics-by-type"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
  const [activeMetric, setActiveMetric] = useState<"ROI" | "Conversion" | "Revenue" | "Attendees" | "Clients">("ROI")
  const [activeTab, setActiveTab] = useState("overview")

  // Handle filter changes with useCallback to prevent recreation on every render
  const handleFilterChange = useCallback((newFilteredData: any) => {
    setFilteredData(newFilteredData)
  }, [])

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Multi-Event Analytics Dashboard</h1>
        <EnhancedExport data={filteredData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-2xl p-8 shadow-lg card-hover">
          <AnalyticsSummary data={filteredData?.summary || defaultData.summary} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-m8bs-card border-m8bs-card-alt">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Top Performing Events</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <TopPerformers
              data={filteredData?.events || []}
              activeMetric={activeMetric}
              onMetricChange={setActiveMetric}
            />
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card border-m8bs-card-alt">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Event Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <EventComparison events={filteredData?.events || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
