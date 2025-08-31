"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { createClient } from "@/lib/supabase/client"
import { fetchAllEvents } from "@/lib/data"
import { 
  BarChart3, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  ArrowRight,
  Activity,
  PieChart,
  Award,
  FileText
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Import dashboard widgets
import { ThreeDMetricCard } from "@/components/dashboard/3d-metric-card"
import { DashboardMetrics } from "@/components/business-dashboard/dashboard-metrics"
import { PerformanceCharts } from "@/components/business-dashboard/performance-charts"
import { AnalyticsSummary } from "@/components/dashboard/analytics/analytics-summary"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { TooltipProvider } from "@/components/ui/tooltip"

interface HomepageData {
  events: any[]
  advisorData: any
  analyticsSummary: any
}

export default function Homepage() {
  const { user } = useAuth()
  const { data: advisorData, loading: advisorLoading } = useAdvisorBasecamp(user)
  const [data, setData] = useState<HomepageData>({
    events: [],
    advisorData: null,
    analyticsSummary: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHomepageData() {
      if (!user) return

      try {
        setLoading(true)
        
        // Load events
        const events = await fetchAllEvents(user.id)
        
        // Calculate analytics summary from events
        const analyticsSummary = calculateAnalyticsSummary(events)
        
        setData({
          events,
          advisorData,
          analyticsSummary
        })
      } catch (error) {
        console.error("Error loading homepage data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadHomepageData()
  }, [user, advisorData])

  // Update data when advisorData changes
  useEffect(() => {
    if (advisorData) {
      setData(prev => ({
        ...prev,
        advisorData
      }))
    }
  }, [advisorData])

  const calculateAnalyticsSummary = (events: any[]) => {
    if (!events || events.length === 0) {
      return {
        totalEvents: 0,
        totalAttendees: 0,
        avgAttendees: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        overallROI: 0,
        totalClients: 0,
        overallConversionRate: 0
      }
    }



    const summary = events.reduce((acc, event) => {
      // Data is already flattened by fetchAllEvents, so access directly
      const attendance = event.attendance || {}
      const expenses = event.marketing_expenses || {}

      return {
        totalEvents: acc.totalEvents + 1,
        totalAttendees: acc.totalAttendees + (attendance.attendees || 0),
        totalRevenue: acc.totalRevenue + (event.revenue || 0), // Use pre-calculated revenue from fetchAllEvents
        totalExpenses: acc.totalExpenses + (expenses.total_cost || 0),
        totalClients: acc.totalClients + (attendance.clients_from_event || 0)
      }
    }, {
      totalEvents: 0,
      totalAttendees: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalClients: 0
    })

    summary.avgAttendees = summary.totalEvents > 0 ? Math.round(summary.totalAttendees / summary.totalEvents) : 0
    summary.totalProfit = summary.totalRevenue - summary.totalExpenses
    summary.overallROI = summary.totalExpenses > 0 ? ((summary.totalProfit / summary.totalExpenses) * 100) : 0
    summary.overallConversionRate = summary.totalAttendees > 0 ? ((summary.totalClients / summary.totalAttendees) * 100) : 0



    return summary
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Welcome to M8 Business Suite
        </h1>
        <p className="text-xl text-muted-foreground">
          Your comprehensive business management dashboard
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ThreeDMetricCard
          title="Total Events"
          value={data.analyticsSummary?.totalEvents || 0}
          icon={<Calendar className="h-5 w-5 text-blue-400" />}
          description="Marketing events conducted"
          color="blue"
        />
        <ThreeDMetricCard
          title="Total Clients"
          value={data.analyticsSummary?.totalClients || 0}
          icon={<Users className="h-5 w-5 text-green-400" />}
          description="Clients acquired"
          color="green"
        />
        <ThreeDMetricCard
          title="Total Revenue"
          value={data.analyticsSummary?.totalRevenue || 0}
          format="currency"
          icon={<DollarSign className="h-5 w-5 text-purple-400" />}
          description="Commission & fees earned"
          color="purple"
        />
        <ThreeDMetricCard
          title="Overall ROI"
          value={data.analyticsSummary?.overallROI || 0}
          format="percent"
          icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
          description="Return on investment"
          color="amber"
        />
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div variants={item} className="space-y-6">
        <TooltipProvider>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Marketing Summary */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-m8bs-blue" />
                  Marketing Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsSummary data={data.analyticsSummary} />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-m8bs-blue" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Latest Event</span>
                    <span className="text-white font-medium">
                      {data.events[0]?.name || "No events yet"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Attendees</span>
                    <span className="text-white font-medium">
                      {data.analyticsSummary?.totalAttendees || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="text-white font-medium">
                      {data.analyticsSummary?.overallConversionRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Profit</span>
                    <span className="text-white font-medium">
                      ${data.analyticsSummary?.totalProfit?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-m8bs-blue" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/events/new">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Create New Event
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/business-dashboard">
                    <Button className="w-full justify-start" variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      View Advisor Basecamp
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/analytics">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers and Advisor Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Events */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-m8bs-blue" />
                  Top Performing Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopPerformers 
                  data={data.events} 
                  activeMetric="ROI"
                  onMetricChange={() => {}}
                />
              </CardContent>
            </Card>

            {/* Advisor Metrics */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-m8bs-blue" />
                  Advisor Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {advisorLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <DashboardMetrics 
                    businessGoals={advisorData?.businessGoals}
                    currentValues={advisorData?.currentValues}
                    clientMetrics={advisorData?.clientMetrics}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts Row */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-m8bs-blue" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {advisorLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <PerformanceCharts 
                    businessGoals={advisorData?.businessGoals}
                    currentValues={advisorData?.currentValues}
                    clientMetrics={advisorData?.clientMetrics}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>
      </motion.div>
    </motion.div>
  )
}
