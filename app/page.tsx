"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { createClient } from "@/lib/supabase/client"
import { fetchAllEvents } from "@/lib/data"
import { Sidebar } from "@/components/dashboard/sidebar"
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

export default function Overview() {
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
          <p className="text-muted-foreground">Please Log In To Access Your Dashboard.</p>
          <Link href="/login">
            <Button className="mt-4">Go To Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    async function loadOverviewData() {
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
        console.error("Error loading overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOverviewData()
  }, [user, advisorData])

  // Update data when advisorData changes
  useEffect(() => {
    if (advisorData && user) {
      // Recalculate analytics when advisorData changes
      async function updateData() {
        try {
          const events = await fetchAllEvents(user.id)
          const analyticsSummary = calculateAnalyticsSummary(events)
          const topEvents = getTopEvents(events, 3)
          
          setData(prev => ({
            ...prev,
            advisorData,
            analyticsSummary,
            topEvents,
            latestMonthlyEntry: getLatestMonthlyEntry(advisorData)
          }))
        } catch (error) {
          console.error("Error updating overview data:", error)
        }
      }
      updateData()
    }
  }, [advisorData, user])

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
      // Handle attendance - could be object or array
      const attendance = Array.isArray(event.attendance) 
        ? (event.attendance[0] || {}) 
        : (event.attendance || {})
      
      // Handle expenses - could be object or array
      const expenses = Array.isArray(event.marketing_expenses) 
        ? (event.marketing_expenses[0] || {}) 
        : (event.marketing_expenses || {})
      
      // Handle financial_production - could be object or array
      const financial = Array.isArray(event.financial_production) 
        ? (event.financial_production[0] || {}) 
        : (event.financial_production || {})
      
      // Use the total if available, otherwise calculate from components
      const totalProduction = financial.total !== undefined 
        ? (financial.total || 0)
        : ((financial.aum_fees || 0) + 
           (financial.annuity_commission || 0) + 
           (financial.life_insurance_commission || 0) + 
           (financial.financial_planning || 0))

      return {
        totalEvents: acc.totalEvents + 1,
        totalAttendees: acc.totalAttendees + (Number(attendance.attendees) || 0),
        totalRevenue: acc.totalRevenue + (Number(totalProduction) || 0),
        totalExpenses: acc.totalExpenses + (Number(expenses.total_cost) || 0),
        totalClients: acc.totalClients + (Number(attendance.clients_from_event) || 0)
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
    summary.overallROI = summary.totalExpenses > 0 
      ? Math.round(((summary.totalProfit / summary.totalExpenses) * 100)) 
      : summary.totalRevenue > 0 
        ? 9999 // Show high ROI when there's revenue but no expenses
        : 0
    summary.overallConversionRate = summary.totalAttendees > 0 
      ? Number(((summary.totalClients / summary.totalAttendees) * 100).toFixed(1)) 
      : 0

    return summary
  }

  const getTopEvents = (events: any[], count: number) => {
    if (!events || events.length === 0) return []
    
    return events
      .map(event => {
        // Handle financial_production - could be object or array
        const financial = Array.isArray(event.financial_production) 
          ? (event.financial_production[0] || {}) 
          : (event.financial_production || {})
        
        // Use the total if available, otherwise calculate from components
        const totalProduction = financial.total !== undefined 
          ? (Number(financial.total) || 0)
          : ((Number(financial.aum_fees) || 0) + 
             (Number(financial.annuity_commission) || 0) + 
             (Number(financial.life_insurance_commission) || 0) + 
             (Number(financial.financial_planning) || 0))
        
        // Handle expenses - could be object or array
        const expenses = Array.isArray(event.marketing_expenses) 
          ? (Number(event.marketing_expenses[0]?.total_cost) || 0)
          : (Number(event.marketing_expenses?.total_cost) || 0)
        
        // Handle attendance - could be object or array
        const attendance = Array.isArray(event.attendance) 
          ? (event.attendance[0] || {}) 
          : (event.attendance || {})
        
        const attendees = Number(attendance.attendees) || 0
        const clients = Number(attendance.clients_from_event) || 0
        
        const profit = totalProduction - expenses
        const roi = expenses > 0 
          ? Number(((profit / expenses) * 100).toFixed(1))
          : totalProduction > 0 
            ? 9999 // Show high ROI when there's revenue but no expenses
            : 0
        
        const conversionRate = attendees > 0 
          ? Number(((clients / attendees) * 100).toFixed(1))
          : 0
        
        return {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          type: event.marketing_type || 'Other',
          topic: event.topic || 'N/A',
          revenue: totalProduction,
          expenses,
          profit,
          attendees,
          clients,
          roi: { value: roi },
          conversionRate,
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
    if (progress >= 100) return "text-m8bs-green"
    if (progress >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return <TrendingUp className="h-4 w-4 text-m8bs-green" />
    if (progress >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m8bs-blue mx-auto"></div>
          <p className="mt-2 text-m8bs-muted">Loading Your Dashboard...</p>
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
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6 xl:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-black">
          <DatabaseStatus />
          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<div>Loading...</div>}>
              <motion.div 
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
      {/* Enhanced Hero Section */}
      <motion.div variants={item} className="space-y-6 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-m8bs-blue via-m8bs-purple to-m8bs-pink bg-clip-text text-transparent">
              Welcome Back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-lg md:text-xl text-m8bs-muted max-w-2xl leading-relaxed">
              Your Business Overview At A Glance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/events/new">
              <Button className="bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue text-white shadow-lg shadow-m8bs-blue/30">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </Link>
            <Link href="/business-dashboard">
              <Button variant="outline" className="border-m8bs-border hover:bg-m8bs-card-alt">
                <Building2 className="h-4 w-4 mr-2" />
                Basecamp
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Key Achievements Banner */}
      {data.analyticsSummary && data.analyticsSummary.totalEvents > 0 && (
        <motion.div variants={item}>
          <Card className="bg-gradient-to-r from-m8bs-blue/10 via-m8bs-purple/10 to-m8bs-pink/10 border-m8bs-border rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">This Month's Highlights</h3>
                    <p className="text-sm text-m8bs-muted">Your Business Performance Summary</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {data.analyticsSummary.totalClients > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{data.analyticsSummary.totalClients}</div>
                      <div className="text-xs text-m8bs-muted">New Clients</div>
                    </div>
                  )}
                  {data.analyticsSummary.totalRevenue > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">${(data.analyticsSummary.totalRevenue / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-m8bs-muted">Revenue</div>
                    </div>
                  )}
                  {data.analyticsSummary.overallROI > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{data.analyticsSummary.overallROI}%</div>
                      <div className="text-xs text-m8bs-muted">ROI</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Marketing Events Metrics */}
      <motion.div 
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <ThreeDMetricCard
          title="Total Marketing Events"
          value={data.analyticsSummary?.totalEvents || 0}
          icon={<Calendar className="h-5 w-5 text-m8bs-muted" />}
          description="Marketing Events Conducted"
          color="blue"
        />
        <ThreeDMetricCard
          title="Total Revenue"
          value={data.analyticsSummary?.totalRevenue || 0}
          format="currency"
          icon={<DollarSign className="h-5 w-5 text-m8bs-green" />}
          description="Total Revenue Generated"
          color="green"
        />
        <ThreeDMetricCard
          title="Total Profit"
          value={data.analyticsSummary?.totalProfit || 0}
          format="currency"
          icon={<TrendingUp className="h-5 w-5 text-m8bs-purple" />}
          description="Net Profit From Events"
          color="purple"
        />
        <ThreeDMetricCard
          title="Total Attendees"
          value={data.analyticsSummary?.totalAttendees || 0}
          icon={<Users className="h-5 w-5 text-m8bs-orange" />}
          description="Total Event Attendees"
          color="amber"
        />
      </motion.div>

      {/* Additional Metrics Row */}
      <motion.div 
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <ThreeDMetricCard
          title="Total Clients"
          value={data.analyticsSummary?.totalClients || 0}
          icon={<UserCheck className="h-5 w-5 text-m8bs-green" />}
          description="Clients Acquired From Events"
          color="green"
        />
        <ThreeDMetricCard
          title="Total Expenses"
          value={data.analyticsSummary?.totalExpenses || 0}
          format="currency"
          icon={<DollarSignIcon className="h-5 w-5 text-red-500" />}
          description="Total Marketing Expenses"
          color="red"
        />
        <ThreeDMetricCard
          title="Overall ROI"
          value={data.analyticsSummary?.overallROI === 9999 ? 999 : (data.analyticsSummary?.overallROI || 0)}
          format="percent"
          icon={<BarChart3 className="h-5 w-5 text-m8bs-purple" />}
          description="Return On Investment"
          color="purple"
        />
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div variants={item} className="space-y-4">
        <TooltipProvider>
          {/* Top Events and Advisor Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Top Events */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-m8bs-muted" />
                  Top Performing Events
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Your Best Performing Events By ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.topEvents.length > 0 ? (
                  <div className="space-y-3">
                    {data.topEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-m8bs-muted to-m8bs-border' :
                            'bg-gradient-to-br from-m8bs-orange to-orange-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{event.name}</div>
                            <div className="text-sm text-m8bs-muted">
                              {event.date ? (() => {
                                try {
                                  const [year, month, day] = event.date.split('-').map(Number)
                                  const date = new Date(year, month - 1, day)
                                  return format(date, "MMM d, yyyy")
                                } catch {
                                  return event.date
                                }
                              })() : "No date"} • {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            {event.roi?.value === 9999 ? "999%+" : (event.roi?.value?.toFixed(1) || 0)}% ROI
                          </div>
                          <div className="text-sm text-m8bs-muted">${(event.revenue || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No Events Data Available</p>
                    <Link href="/events/new">
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals and Progress Summary */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Target className="h-5 w-5 text-m8bs-muted" />
                  Goals & Progress Summary
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Progress Towards Your Business Goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {advisorLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m8bs-muted"></div>
                  </div>
                ) : advisorData?.businessGoals ? (
                  <div className="space-y-4">
                    {/* Business Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Business Goal</span>
                        <span className="text-white">
                          {(() => {
                            // Calculate total sales from monthly entries for current year
                            const currentYear = new Date().getFullYear().toString()
                            const currentYearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                              entry.month_year.startsWith(currentYear)
                            ) || []
                            const totalSales = currentYearEntries.reduce((sum, entry) => 
                              sum + entry.annuity_sales + entry.aum_sales + entry.life_sales, 0
                            )
                            return `$${totalSales.toLocaleString()} / $${advisorData.businessGoals.business_goal?.toLocaleString()}`
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={(() => {
                          // Calculate total sales from monthly entries for current year
                          const currentYear = new Date().getFullYear().toString()
                          const currentYearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                            entry.month_year.startsWith(currentYear)
                          ) || []
                          const totalSales = currentYearEntries.reduce((sum, entry) => 
                            sum + entry.annuity_sales + entry.aum_sales + entry.life_sales, 0
                          )
                          return calculateGoalProgress(totalSales, advisorData.businessGoals.business_goal || 0)
                        })()} 
                        className="h-2" 
                      />
                    </div>

                    {/* AUM Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">AUM Goal</span>
                        <span className="text-white">
                          ${data.latestMonthlyEntry?.aum_sales?.toLocaleString() || 0} / ${advisorData.businessGoals.aum_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(data.latestMonthlyEntry?.aum_sales || 0, advisorData.businessGoals.aum_goal || 0)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Annuity Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Annuity Goal</span>
                        <span className="text-white">
                          ${data.latestMonthlyEntry?.annuity_sales?.toLocaleString() || 0} / ${advisorData.businessGoals.annuity_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(data.latestMonthlyEntry?.annuity_sales || 0, advisorData.businessGoals.annuity_goal || 0)} 
                        className="h-2" 
                      />
                    </div>

                    {/* Life Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Life Goal</span>
                        <span className="text-white">
                          ${data.latestMonthlyEntry?.life_sales?.toLocaleString() || 0} / ${advisorData.businessGoals.life_target_goal?.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={calculateGoalProgress(data.latestMonthlyEntry?.life_sales || 0, advisorData.businessGoals.life_target_goal || 0)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No Goals Data Available</p>
                    <p className="text-sm mb-4">Set Up Your Business Goals In The Advisor Basecamp</p>
                    <Link href="/business-dashboard">
                      <Button variant="outline" size="sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Go To Basecamp
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Total Advisor Book and Latest Monthly Entry Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Total Advisor Book */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-m8bs-muted" />
                  Total Advisor Book
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Your Current Book Of Business
                </CardDescription>
              </CardHeader>
              <CardContent>
                {advisorData?.currentValues ? (
                  <div className="space-y-4">
                    {(() => {
                      const annuity = advisorData.currentValues.current_annuity || 0
                      const aum = advisorData.currentValues.current_aum || 0
                      const life = advisorData.currentValues.current_life_production || 0
                      const total = annuity + aum + life
                      const annuityPercent = total > 0 ? ((annuity / total) * 100).toFixed(1) : 0
                      const aumPercent = total > 0 ? ((aum / total) * 100).toFixed(1) : 0
                      const lifePercent = total > 0 ? ((life / total) * 100).toFixed(1) : 0
                      
                      return (
                        <>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-m8bs-muted rounded-full"></div>
                                <span className="text-m8bs-muted">Annuity Book</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-semibold block">
                                  ${annuity.toLocaleString()}
                                </span>
                                <span className="text-xs text-m8bs-muted">
                                  {annuityPercent}%
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-m8bs-green rounded-full"></div>
                                <span className="text-m8bs-muted">AUM Book</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-semibold block">
                                  ${aum.toLocaleString()}
                                </span>
                                <span className="text-xs text-m8bs-muted">
                                  {aumPercent}%
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-m8bs-purple rounded-full"></div>
                                <span className="text-m8bs-muted">Life Production</span>
                              </div>
                              <div className="text-right">
                                <span className="text-white font-semibold block">
                                  ${life.toLocaleString()}
                                </span>
                                <span className="text-xs text-m8bs-muted">
                                  {lifePercent}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-m8bs-border">
                            <div className="flex justify-between items-center">
                              <span className="text-m8bs-muted font-medium">Total Book Value</span>
                              <span className="text-white font-bold text-lg">
                                ${total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-m8bs-muted">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No Book Data Available</p>
                    <p className="text-sm mb-4">Set Up Your Current Values In The Advisor Basecamp</p>
                    <Link href="/business-dashboard">
                      <Button variant="outline" size="sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        Set Up Book
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Monthly Entry */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-m8bs-muted" />
                  Latest Monthly Entry
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Your Most Recent Monthly Performance Data
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
                    <p className="mb-2">No Monthly Entries Yet</p>
                    <p className="text-sm mb-4">Start Tracking Your Monthly Performance</p>
                    <Link href="/business-dashboard">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Add Monthly Data
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns Section */}
          {advisorData?.campaigns && advisorData.campaigns.length > 0 && (() => {
            const activeCampaigns = advisorData.campaigns
              .filter(campaign => campaign.status === 'Active' || campaign.status === 'Planned')
              .slice(0, 3)
            
            if (activeCampaigns.length === 0) return null
            
            return (
              <motion.div variants={item}>
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                          <Target className="h-5 w-5 text-m8bs-muted" />
                          Active Campaigns
                        </CardTitle>
                        <CardDescription className="text-m8bs-muted mt-2">
                          Your Current Marketing Campaigns
                        </CardDescription>
                      </div>
                      <Link href="/business-dashboard">
                        <Button variant="ghost" size="sm" className="text-m8bs-muted hover:text-white">
                          View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeCampaigns.map((campaign) => (
                        <Link key={campaign.id} href="/business-dashboard">
                          <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg hover:bg-m8bs-card transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-m8bs-purple to-m8bs-pink rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs">
                                <span className="text-lg">{campaign.events || 0}</span>
                                <span className="text-[10px]">Events</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-white group-hover:text-m8bs-blue transition-colors">{campaign.name}</div>
                                <div className="text-sm text-m8bs-muted flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      campaign.status === 'Active' ? 'border-m8bs-green text-m8bs-green' :
                                      campaign.status === 'Planned' ? 'border-yellow-500 text-yellow-500' :
                                      'border-m8bs-muted text-m8bs-muted'
                                    }`}
                                  >
                                    {campaign.status}
                                  </Badge>
                                  {campaign.frequency && (
                                    <span>• {campaign.frequency}</span>
                                  )}
                                  {campaign.budget > 0 && (
                                    <span>• ${campaign.budget.toLocaleString()} Budget</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })()}

          {/* Recent Activity and Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Recent Activity Feed */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-m8bs-muted" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Your Latest Business Activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topEvents.length > 0 ? (
                    data.topEvents.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="w-8 h-8 bg-m8bs-card-alt rounded-full flex items-center justify-center border border-m8bs-border">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{event.name}</p>
                          <p className="text-xs text-m8bs-muted">
                            {event.date ? (() => {
                              try {
                                const [year, month, day] = event.date.split('-').map(Number)
                                const date = new Date(year, month - 1, day)
                                return format(date, "MMM d")
                              } catch {
                                return event.date
                              }
                            })() : "No date"} • {event.roi?.value?.toFixed(1)}% ROI
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-m8bs-muted">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No Recent Events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-m8bs-muted" />
                  Performance Insights
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Key Performance Indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-m8bs-green rounded-full"></div>
                      <span className="text-sm text-m8bs-muted">Conversion Rate</span>
                    </div>
                    <span className="text-white font-semibold">
                      {data.analyticsSummary?.overallConversionRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-m8bs-muted rounded-full"></div>
                      <span className="text-sm text-m8bs-muted">Avg Attendees</span>
                    </div>
                    <span className="text-white font-semibold">
                      {data.analyticsSummary?.avgAttendees || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-m8bs-purple rounded-full"></div>
                      <span className="text-sm text-m8bs-muted">Total ROI</span>
                    </div>
                    <span className="text-white font-semibold">
                      {data.analyticsSummary?.overallROI === 9999 ? "999%+" : (data.analyticsSummary?.overallROI || 0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Settings className="h-5 w-5 text-m8bs-muted" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">
                  Common Tasks And Shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  <Link href="/events/new">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <Plus className="h-5 w-5" />
                      <span className="text-xs">New Event</span>
                    </Button>
                  </Link>
                  <Link href="/business-dashboard">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs">Basecamp</span>
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">Events</span>
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <Database className="h-5 w-5" />
                      <span className="text-xs">Tools</span>
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button className="w-full h-auto p-3 flex flex-col items-center space-y-2" variant="outline">
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Settings</span>
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
          </div>
        </main>
      </div>
    </div>
  )
} 