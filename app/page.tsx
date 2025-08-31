"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { createClient } from "@/lib/supabase/client"
import { fetchAllEvents } from "@/lib/data"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { AnimatedBackground } from "@/components/dashboard/animated-background"
import { DatabaseStatus } from "@/components/database-status"
import { Suspense } from "react"
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
  FileText,
  Plus,
  Settings,
  Briefcase,
  UserCheck,
  DollarSign as DollarSignIcon,
  TrendingDown,
  Eye,
  Edit,
  Database
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"

// Import dashboard widgets
import { ThreeDMetricCard } from "@/components/dashboard/3d-metric-card"
import { TopPerformers } from "@/components/dashboard/analytics/top-performers"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface HomepageData {
  events: any[]
  advisorData: any
  analyticsSummary: any
  topEvents: any[]
  latestMonthlyEntry: any
}

export default function Homepage() {
  const { user } = useAuth()
  const { data: advisorData, loading: advisorLoading } = useAdvisorBasecamp(user)
  const [data, setData] = useState<HomepageData>({
    events: [],
    advisorData: null,
    analyticsSummary: null,
    topEvents: [],
    latestMonthlyEntry: null
  })
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access your dashboard.</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    async function loadHomepageData() {
      if (!user) return

      try {
        setLoading(true)
        
        // Load events
        const events = await fetchAllEvents(user.id)
        
        // Calculate analytics summary from events
        const analyticsSummary = calculateAnalyticsSummary(events)
        
        // Get top 3 events by ROI
        const topEvents = getTopEvents(events, 3)
        
        // Get latest monthly entry
        const latestMonthlyEntry = getLatestMonthlyEntry(advisorData)
        
        setData({
          events,
          advisorData,
          analyticsSummary,
          topEvents,
          latestMonthlyEntry
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
        advisorData,
        latestMonthlyEntry: getLatestMonthlyEntry(advisorData)
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
      const attendance = event.attendance || {}
      const expenses = event.marketing_expenses || {}

      return {
        totalEvents: acc.totalEvents + 1,
        totalAttendees: acc.totalAttendees + (attendance.attendees || 0),
        totalRevenue: acc.totalRevenue + (event.revenue || 0),
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

  const getTopEvents = (events: any[], count: number) => {
    if (!events || events.length === 0) return []
    
    return events
      .map(event => {
        const totalProduction = (event.financial_production?.aum_fees || 0) + 
                              (event.financial_production?.annuity_commission || 0) + 
                              (event.financial_production?.life_insurance_commission || 0) + 
                              (event.financial_production?.financial_planning || 0)
        const expenses = event.marketing_expenses?.total_cost || 0
        const roi = expenses > 0 ? ((totalProduction - expenses) / expenses) * 100 : 0
        
        return {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          type: event.marketing_type || 'Other',
          topic: event.topic || 'N/A',
          revenue: totalProduction,
          expenses,
          profit: totalProduction - expenses,
          attendees: event.attendance?.attendees || 0,
          clients: event.attendance?.clients_from_event || 0,
          roi: { value: roi },
          conversionRate: (() => {
            const attendees = event.attendance?.attendees || 0;
            const clients = event.attendance?.clients_from_event || 0;
            return attendees > 0 ? (clients / attendees) * 100 : 0;
          })(),
        }
      })
      .sort((a, b) => (b.roi?.value || 0) - (a.roi?.value || 0))
      .slice(0, count)
  }

  const getLatestMonthlyEntry = (advisorData: any) => {
    if (!advisorData?.monthlyDataEntries || advisorData.monthlyDataEntries.length === 0) {
      return null
    }
    
    return advisorData.monthlyDataEntries
      .sort((a: any, b: any) => b.month_year.localeCompare(a.month_year))[0]
  }

  const calculateGoalProgress = (current: number, goal: number) => {
    if (goal === 0) return 0
    return Math.min((current / goal) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-500"
    if (progress >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (progress >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
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
    <div className="flex h-screen bg-m8bs-bg text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <DashboardHeader events={[]} />
        <main className="flex-1 overflow-y-auto p-6 bg-m8bs-bg bg-gradient-radial from-m8bs-card-alt/10 to-m8bs-bg">
          <DatabaseStatus />
          <Suspense fallback={<div>Loading...</div>}>
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

      {/* Marketing Events Metrics */}
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <ThreeDMetricCard
          title="Total Marketing Events"
          value={data.analyticsSummary?.totalEvents || 0}
          icon={<Calendar className="h-5 w-5 text-blue-400" />}
          description="Marketing events conducted"
          color="blue"
        />
        <ThreeDMetricCard
          title="Total Revenue"
          value={data.analyticsSummary?.totalRevenue || 0}
          format="currency"
          icon={<DollarSign className="h-5 w-5 text-green-400" />}
          description="Total revenue generated"
          color="green"
        />
        <ThreeDMetricCard
          title="Total Profit"
          value={data.analyticsSummary?.totalProfit || 0}
          format="currency"
          icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
          description="Net profit from events"
          color="purple"
        />
        <ThreeDMetricCard
          title="Total Attendees"
          value={data.analyticsSummary?.totalAttendees || 0}
          icon={<Users className="h-5 w-5 text-orange-400" />}
          description="Total event attendees"
          color="amber"
        />
      </motion.div>

      {/* Additional Metrics Row */}
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ThreeDMetricCard
          title="Total Clients"
          value={data.analyticsSummary?.totalClients || 0}
          icon={<UserCheck className="h-5 w-5 text-green-400" />}
          description="Clients acquired from events"
          color="green"
        />
        <ThreeDMetricCard
          title="Total Expenses"
          value={data.analyticsSummary?.totalExpenses || 0}
          format="currency"
          icon={<DollarSignIcon className="h-5 w-5 text-red-400" />}
          description="Total marketing expenses"
          color="red"
        />
        <ThreeDMetricCard
          title="Overall ROI"
          value={data.analyticsSummary?.overallROI || 0}
          format="percent"
          icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
          description="Return on investment"
          color="purple"
        />
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div variants={item} className="space-y-6">
        <TooltipProvider>
          {/* Top Events and Advisor Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Events */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-m8bs-blue" />
                  Top Performing Events
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Your best performing events by ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.topEvents.length > 0 ? (
                  <div className="space-y-3">
                    {data.topEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                            'bg-gradient-to-br from-orange-400 to-orange-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{event.name}</div>
                            <div className="text-sm text-m8bs-muted">
                              {event.date ? format(new Date(event.date), "MMM d, yyyy") : "No date"} • {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{event.roi?.value?.toFixed(1)}% ROI</div>
                          <div className="text-sm text-m8bs-muted">${event.revenue?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No events data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals and Progress Summary */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-m8bs-blue" />
                  Goals & Progress Summary
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Progress towards your business goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {advisorLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : advisorData?.businessGoals ? (
                  <div className="space-y-4">
                    {/* Business Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Business Goal</span>
                        <span className="text-white">
                          ${advisorData.currentValues?.current_aum?.toLocaleString() || 0} / ${advisorData.businessGoals.business_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(advisorData.currentValues?.current_aum || 0, advisorData.businessGoals.business_goal || 0)} 
                        className="h-2" 
                      />
                    </div>

                    {/* AUM Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">AUM Goal</span>
                        <span className="text-white">
                          ${advisorData.currentValues?.current_aum?.toLocaleString() || 0} / ${advisorData.businessGoals.aum_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(advisorData.currentValues?.current_aum || 0, advisorData.businessGoals.aum_goal || 0)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Annuity Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Annuity Goal</span>
                        <span className="text-white">
                          ${advisorData.currentValues?.current_annuity?.toLocaleString() || 0} / ${advisorData.businessGoals.annuity_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(advisorData.currentValues?.current_annuity || 0, advisorData.businessGoals.annuity_goal || 0)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Life Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Life Goal</span>
                        <span className="text-white">
                          ${advisorData.currentValues?.current_life_production?.toLocaleString() || 0} / ${advisorData.businessGoals.life_target_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(advisorData.currentValues?.current_life_production || 0, advisorData.businessGoals.life_target_goal || 0)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals data available</p>
                    <p className="text-sm mt-2">Set up your business goals in the Advisor Basecamp</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Total Advisor Book and Latest Monthly Entry Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Advisor Book */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-m8bs-blue" />
                  Total Advisor Book
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Your current book of business
                </CardDescription>
              </CardHeader>
              <CardContent>
                {advisorData?.financialBook ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-m8bs-muted">Annuity Book</span>
                        </div>
                        <span className="text-white font-semibold">
                          ${advisorData.financialBook.annuity_book_value?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-m8bs-muted">AUM Book</span>
                        </div>
                        <span className="text-white font-semibold">
                          ${advisorData.financialBook.aum_book_value?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-m8bs-muted">Qualified Money</span>
                        </div>
                        <span className="text-white font-semibold">
                          ${advisorData.financialBook.qualified_money_value?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-m8bs-border">
                      <div className="flex justify-between items-center">
                        <span className="text-m8bs-muted font-medium">Total Book Value</span>
                        <span className="text-white font-bold text-lg">
                          ${((advisorData.financialBook.annuity_book_value || 0) + 
                             (advisorData.financialBook.aum_book_value || 0) + 
                             (advisorData.financialBook.qualified_money_value || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No book data available</p>
                    <p className="text-sm mt-2">Set up your financial book in the Advisor Basecamp</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Monthly Entry */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-m8bs-blue" />
                  Latest Monthly Entry
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Your most recent monthly performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.latestMonthlyEntry ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-m8bs-muted">Period</span>
                      <span className="text-white font-semibold">
                        {format(new Date(data.latestMonthlyEntry.month_year + "-01"), "MMMM yyyy")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">{data.latestMonthlyEntry.new_clients}</div>
                        <div className="text-xs text-m8bs-muted">New Clients</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">{data.latestMonthlyEntry.new_appointments}</div>
                        <div className="text-xs text-m8bs-muted">Appointments</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">
                          ${(data.latestMonthlyEntry.annuity_sales + data.latestMonthlyEntry.aum_sales + data.latestMonthlyEntry.life_sales).toLocaleString()}
                        </div>
                        <div className="text-xs text-m8bs-muted">Total Sales</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">${data.latestMonthlyEntry.marketing_expenses?.toLocaleString()}</div>
                        <div className="text-xs text-m8bs-muted">Expenses</div>
                      </div>
                    </div>
                    {data.latestMonthlyEntry.notes && (
                      <div className="pt-2 border-t border-m8bs-border">
                        <div className="text-sm text-m8bs-muted mb-1">Notes</div>
                        <div className="text-sm text-white bg-m8bs-card-alt p-2 rounded">
                          {data.latestMonthlyEntry.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No monthly entries yet</p>
                    <p className="text-sm mt-2">Start tracking your monthly performance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Book Distribution and Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Book Distribution */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-m8bs-blue" />
                  Book Distribution
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Distribution of your financial book
                </CardDescription>
              </CardHeader>
              <CardContent>
                {advisorData?.financialBook ? (
                  <div className="space-y-4">
                    {(() => {
                      const annuity = advisorData.financialBook.annuity_book_value || 0
                      const aum = advisorData.financialBook.aum_book_value || 0
                      const qualified = advisorData.financialBook.qualified_money_value || 0
                      const total = annuity + aum + qualified
                      
                      if (total === 0) {
                        return (
                          <div className="text-center py-8 text-m8bs-muted">
                            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No book data to display</p>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-m8bs-muted">Annuity Book</span>
                              <span className="text-white">{((annuity / total) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(annuity / total) * 100} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-m8bs-muted">AUM Book</span>
                              <span className="text-white">{((aum / total) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(aum / total) * 100} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-m8bs-muted">Qualified Money</span>
                              <span className="text-white">{((qualified / total) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(qualified / total) * 100} className="h-2" />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No book data available</p>
                    <p className="text-sm mt-2">Set up your financial book in the Advisor Basecamp</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-m8bs-card border-m8bs-card-alt">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-m8bs-blue" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/events/new">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
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
                  <Link href="/dashboard/events">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings">
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button className="w-full justify-start" variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Tools & Calculators
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>
      </motion.div>
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  )
} 