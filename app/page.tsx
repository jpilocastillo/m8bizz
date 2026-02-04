"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { createClient } from "@/lib/supabase/client"
import { fetchAllEvents } from "@/lib/data"
import { aggregateEventDataByMonth, recalculateMonthlyEntryFromEvents } from "@/lib/client-tracking"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface HomepageData {
  events: any[]
  advisorData: any
  analyticsSummary: any
  topEvents: any[]
  latestMonthlyEntry: any
}

export default function Overview() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [dataAvailability, setDataAvailability] = useState<{
    hasEvents: boolean
    hasBusinessData: boolean
    hasScorecardData: boolean
  }>({
    hasEvents: false,
    hasBusinessData: false,
    hasScorecardData: false
  })
  const { data: advisorData, loading: advisorLoading } = useAdvisorBasecamp(user, selectedYear)
  const [data, setData] = useState<HomepageData>({
    events: [],
    advisorData: null,
    analyticsSummary: null,
    topEvents: [],
    latestMonthlyEntry: null
  })
  const [loading, setLoading] = useState(true)

  // Load saved year from localStorage
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const savedYear = localStorage.getItem(`overview-year-${user.id}`)
      if (savedYear) {
        const yearNum = Number.parseInt(savedYear)
        if (!isNaN(yearNum)) {
          setSelectedYear(yearNum)
        }
      }
    }
  }, [user])

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

  // Load available years from events
  const loadAvailableYears = useCallback(async () => {
    if (!user) return
    
    try {
      const allEvents = await fetchAllEvents(user.id)
      const years = new Set<number>()
      const currentYear = 2026 // Always include current year
      
      // Always add current year (2026)
      years.add(currentYear)
      
      allEvents.forEach(event => {
        if (event.date) {
          try {
            const [year] = event.date.split('-').map(Number)
            if (!isNaN(year)) {
              years.add(year)
            }
          } catch {
            // Skip invalid dates
          }
        }
      })
      
      const sortedYears = Array.from(years).sort((a, b) => b - a)
      setAvailableYears(sortedYears)
      
      // Set selected year to current year (2026) if not already set or if selected year is not in list
      setSelectedYear(prev => {
        if (!sortedYears.includes(prev)) {
          return currentYear
        }
        return prev
      })
    } catch (error) {
      console.error("Error loading available years:", error)
      // Fallback to just current year
      setAvailableYears([2026])
      setSelectedYear(2026)
    }
  }, [user])

  useEffect(() => {
    loadAvailableYears()
  }, [loadAvailableYears])

  const calculateAnalyticsSummary = useCallback((events: any[]) => {
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
      // Use flat properties first (from fetchAllEvents normalization)
      // Fall back to nested objects if flat properties don't exist
      
      // Revenue: use flat property first, then calculate from financial_production
      let revenue = 0
      if (event.revenue !== undefined) {
        revenue = Number(event.revenue) || 0
      } else {
        // Handle financial_production - could be object or array
        const financial = Array.isArray(event.financial_production) 
          ? (event.financial_production[0] || {}) 
          : (event.financial_production || {})
        
        // Use the total if available, otherwise calculate from components
        revenue = financial.total !== undefined 
          ? (Number(financial.total) || 0)
          : ((Number(financial.aum_fees) || 0) + 
             (Number(financial.annuity_commission) || 0) + 
             (Number(financial.life_insurance_commission) || 0) + 
             (Number(financial.financial_planning) || 0))
      }
      
      // Attendees: use flat property first, then fall back to attendance object
      let attendees = 0
      if (event.attendees !== undefined) {
        attendees = Number(event.attendees) || 0
      } else {
        const attendance = Array.isArray(event.attendance) 
          ? (event.attendance[0] || {}) 
          : (event.attendance || {})
        attendees = Number(attendance.attendees) || 0
      }
      
      // Clients: use flat property first, then fall back to attendance object
      let clients = 0
      if (event.clients !== undefined) {
        clients = Number(event.clients) || 0
      } else {
        const attendance = Array.isArray(event.attendance) 
          ? (event.attendance[0] || {}) 
          : (event.attendance || {})
        clients = Number(attendance.clients_from_event) || 0
      }
      
      // Expenses: extract from marketing_expenses
      let expenses = 0
      if (event.expenses !== undefined) {
        expenses = Number(event.expenses) || 0
      } else {
        const expensesObj = Array.isArray(event.marketing_expenses) 
          ? (event.marketing_expenses[0] || {}) 
          : (event.marketing_expenses || {})
        expenses = Number(expensesObj.total_cost) || 0
      }

      return {
        totalEvents: acc.totalEvents + 1,
        totalAttendees: acc.totalAttendees + attendees,
        totalRevenue: acc.totalRevenue + revenue,
        totalExpenses: acc.totalExpenses + expenses,
        totalClients: acc.totalClients + clients
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
  }, [])

  const getTopEvents = useCallback((events: any[], count: number) => {
    if (!events || events.length === 0) return []
    
    return events
      .map(event => {
        // Revenue: use flat property first, then calculate from financial_production
        let revenue = 0
        if (event.revenue !== undefined) {
          revenue = Number(event.revenue) || 0
        } else {
          const financial = Array.isArray(event.financial_production) 
            ? (event.financial_production[0] || {}) 
            : (event.financial_production || {})
          
          revenue = financial.total !== undefined 
            ? (Number(financial.total) || 0)
            : ((Number(financial.aum_fees) || 0) + 
               (Number(financial.annuity_commission) || 0) + 
               (Number(financial.life_insurance_commission) || 0) + 
               (Number(financial.financial_planning) || 0))
        }
        
        // Expenses: extract from marketing_expenses
        let expenses = 0
        if (event.expenses !== undefined) {
          expenses = Number(event.expenses) || 0
        } else {
          expenses = Array.isArray(event.marketing_expenses) 
            ? (Number(event.marketing_expenses[0]?.total_cost) || 0)
            : (Number(event.marketing_expenses?.total_cost) || 0)
        }
        
        // Attendees: use flat property first, then fall back to attendance object
        let attendees = 0
        if (event.attendees !== undefined) {
          attendees = Number(event.attendees) || 0
        } else {
          const attendance = Array.isArray(event.attendance) 
            ? (event.attendance[0] || {}) 
            : (event.attendance || {})
          attendees = Number(attendance.attendees) || 0
        }
        
        // Clients: use flat property first, then fall back to attendance object
        let clients = 0
        if (event.clients !== undefined) {
          clients = Number(event.clients) || 0
        } else {
          const attendance = Array.isArray(event.attendance) 
            ? (event.attendance[0] || {}) 
            : (event.attendance || {})
          clients = Number(attendance.clients_from_event) || 0
        }
        
        const profit = revenue - expenses
        const roi = expenses > 0 
          ? Number(((profit / expenses) * 100).toFixed(1))
          : revenue > 0 
            ? 9999 // Show high ROI when there's revenue but no expenses
            : 0
        
        const conversionRate = attendees > 0 
          ? Number(((clients / attendees) * 100).toFixed(1))
          : 0
        
        // Extract year from date for sorting
        const getYear = (dateString: string | null | undefined): number => {
          if (!dateString) return 0
          try {
            const [year] = dateString.split('-').map(Number)
            return year || 0
          } catch {
            return 0
          }
        }
        
        return {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          type: event.marketing_type || 'Other',
          topic: event.topic || 'N/A',
          revenue,
          expenses,
          profit,
          attendees,
          clients,
          roi: { value: roi },
          conversionRate,
          year: getYear(event.date),
        }
      })
      .sort((a, b) => {
        // First sort by year (descending - newest years first)
        if (b.year !== a.year) {
          return b.year - a.year
        }
        // Then sort by ROI (descending - highest ROI first)
        return (b.roi?.value || 0) - (a.roi?.value || 0)
      })
      .slice(0, count)
  }, [])

  const getLatestMonthlyEntry = useCallback((advisorData: any, year: number) => {
    if (!advisorData?.monthlyDataEntries || !Array.isArray(advisorData.monthlyDataEntries) || advisorData.monthlyDataEntries.length === 0) {
      return null
    }
    
    // Filter entries by selected year first
    const yearEntries = advisorData.monthlyDataEntries.filter((entry: any) => {
      if (!entry || !entry.month_year) return false
      return entry.month_year.startsWith(year.toString())
    })
    
    if (yearEntries.length === 0) {
      return null
    }
    
    // Sort by month_year descending and get the latest
    const sorted = yearEntries.sort((a: any, b: any) => {
      if (!a.month_year || !b.month_year) return 0
      return b.month_year.localeCompare(a.month_year)
    })
    
    const latestEntry = sorted[0]
    if (!latestEntry) return null
    
    // Ensure all numeric values are properly converted (database may return strings for decimals)
    // Handle both string and number types from database
    return {
      ...latestEntry,
      new_clients: Number(latestEntry.new_clients) || 0,
      new_appointments: Number(latestEntry.new_appointments) || 0,
      new_leads: Number(latestEntry.new_leads) || 0,
      annuity_sales: parseFloat(String(latestEntry.annuity_sales || 0)) || 0,
      aum_sales: parseFloat(String(latestEntry.aum_sales || 0)) || 0,
      life_sales: parseFloat(String(latestEntry.life_sales || 0)) || 0,
      marketing_expenses: parseFloat(String(latestEntry.marketing_expenses || 0)) || 0,
    }
  }, [])

  useEffect(() => {
    async function loadOverviewData() {
      if (!user) return
      
      // Wait for advisorData to be loaded if it's still loading
      if (advisorLoading) {
        console.log('Waiting for advisorData to load...')
        return
      }

      try {
        setLoading(true)
        
        // Load events filtered by selected year
        const allEvents = await fetchAllEvents(user.id)
        const yearEvents = allEvents.filter(event => {
          if (!event.date) return false
          try {
            const [year] = event.date.split('-').map(Number)
            return !isNaN(year) && year === selectedYear
          } catch {
            return false
          }
        })
        
        // Calculate analytics summary from filtered events
        const analyticsSummary = calculateAnalyticsSummary(yearEvents)
        
        // Get top 3 events by ROI (already sorted by year)
        const topEvents = getTopEvents(yearEvents, 3)
        
        // Get latest monthly entry for selected year
        let latestMonthlyEntry = getLatestMonthlyEntry(advisorData, selectedYear)
        
        // If monthly entry has notes with "Clients from events" but 0 values, recalculate from events
        if (latestMonthlyEntry && latestMonthlyEntry.notes && latestMonthlyEntry.notes.includes("Clients from events:")) {
          const hasZeroValues = 
            (Number(latestMonthlyEntry.new_clients) || 0) === 0 &&
            (parseFloat(String(latestMonthlyEntry.annuity_sales || 0)) || 0) === 0 &&
            (parseFloat(String(latestMonthlyEntry.aum_sales || 0)) || 0) === 0 &&
            (parseFloat(String(latestMonthlyEntry.life_sales || 0)) || 0) === 0
          
          if (hasZeroValues) {
            // Try to recalculate from events
            try {
              const [year, month] = latestMonthlyEntry.month_year.split('-').map(Number)
              const result = await recalculateMonthlyEntryFromEvents(user.id, latestMonthlyEntry.month_year)
              if (result.success) {
                // Reload the entry after recalculation
                const eventData = await aggregateEventDataByMonth(user.id, month, year)
                latestMonthlyEntry = {
                  ...latestMonthlyEntry,
                  new_clients: eventData.new_clients,
                  annuity_sales: eventData.annuity_sales,
                  aum_sales: eventData.aum_sales,
                  life_sales: eventData.life_sales,
                  new_appointments: eventData.appointments_booked,
                  marketing_expenses: eventData.marketing_expenses,
                }
              }
            } catch (error) {
              console.error("Error recalculating monthly entry:", error)
              // Fall back to showing event data directly if recalculation fails
              try {
                const [year, month] = latestMonthlyEntry.month_year.split('-').map(Number)
                const eventData = await aggregateEventDataByMonth(user.id, month, year)
                latestMonthlyEntry = {
                  ...latestMonthlyEntry,
                  new_clients: eventData.new_clients,
                  annuity_sales: eventData.annuity_sales,
                  aum_sales: eventData.aum_sales,
                  life_sales: eventData.life_sales,
                  new_appointments: eventData.appointments_booked,
                  marketing_expenses: eventData.marketing_expenses,
                }
              } catch (fallbackError) {
                console.error("Error getting event data as fallback:", fallbackError)
              }
            }
          }
        }
        
        // Check data availability for other pages
        const hasEvents = yearEvents.length > 0
        const hasBusinessData = advisorData?.monthlyDataEntries?.some((entry: any) => 
          entry.month_year?.startsWith(selectedYear.toString())
        ) || false
        
        // Check scorecard data
        let hasScorecardData = false
        try {
          const supabase = createClient()
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser) {
            const { data: scorecardRoles } = await supabase
              .from('scorecard_roles')
              .select('id')
              .eq('user_id', authUser.id)
              .limit(1)
            
            if (scorecardRoles && scorecardRoles.length > 0) {
              const { data: summaries } = await supabase
                .from('scorecard_monthly_summaries')
                .select('id')
                .eq('year', selectedYear)
                .limit(1)
              
              hasScorecardData = (summaries && summaries.length > 0) || false
            }
          }
        } catch (error) {
          // Ignore errors checking scorecard
        }
        
        setDataAvailability({
          hasEvents,
          hasBusinessData,
          hasScorecardData
        })
        
        setData({
          events: yearEvents,
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
  }, [user, advisorData, advisorLoading, selectedYear, calculateAnalyticsSummary, getTopEvents, getLatestMonthlyEntry])

  // Save selected year to localStorage
  useEffect(() => {
    if (user && typeof window !== 'undefined' && selectedYear) {
      localStorage.setItem(`overview-year-${user.id}`, selectedYear.toString())
    }
  }, [selectedYear, user])

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
            <div className="flex items-center gap-2 bg-m8bs-card border border-m8bs-border rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-m8bs-muted" />
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => {
                  const year = Number.parseInt(value)
                  setSelectedYear(year)
                  if (user && typeof window !== 'undefined') {
                    localStorage.setItem(`overview-year-${user.id}`, year.toString())
                  }
                }}
              >
                <SelectTrigger className="w-[120px] border-none bg-transparent text-white focus:ring-0 focus:ring-offset-0 h-auto p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-m8bs-card border-m8bs-border">
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

      {/* Data Availability Alert */}
      {selectedYear !== 2026 && (
        <motion.div variants={item}>
          <Alert className="bg-yellow-500/10 border-yellow-500/50">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertTitle className="text-yellow-400">Viewing {selectedYear} Data</AlertTitle>
            <AlertDescription className="text-yellow-300/80">
              {!dataAvailability.hasEvents && !dataAvailability.hasBusinessData && !dataAvailability.hasScorecardData && (
                <span>No data found for {selectedYear}. Consider switching to the current year or adding data for this year.</span>
              )}
              {(!dataAvailability.hasEvents || !dataAvailability.hasBusinessData || !dataAvailability.hasScorecardData) && (
                <div className="mt-2 space-y-1">
                  {!dataAvailability.hasEvents && (
                    <div>• No events found for {selectedYear}. <Link href="/events/new" className="underline">Create an event</Link></div>
                  )}
                  {!dataAvailability.hasBusinessData && (
                    <div>• No business dashboard data for {selectedYear}. <Link href="/business-dashboard" className="underline">Add monthly data</Link></div>
                  )}
                  {!dataAvailability.hasScorecardData && (
                    <div>• No behavior scorecard data for {selectedYear}. <Link href="/tools/behavior-scorecard" className="underline">Set up scorecard</Link></div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

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
                            // Calculate YTD total sales from monthly entries for selected year
                            const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                              entry.month_year.startsWith(selectedYear.toString())
                            ) || []
                            const totalSales = yearEntries.reduce((sum, entry) => 
                              sum + (entry.annuity_sales || 0) + (entry.aum_sales || 0) + (entry.life_sales || 0), 0
                            )
                            return `$${totalSales.toLocaleString()} / $${advisorData.businessGoals.business_goal?.toLocaleString()}`
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={(() => {
                          // Calculate YTD total sales from monthly entries for selected year
                          const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                            entry.month_year.startsWith(selectedYear.toString())
                          ) || []
                          const totalSales = yearEntries.reduce((sum, entry) => 
                            sum + (entry.annuity_sales || 0) + (entry.aum_sales || 0) + (entry.life_sales || 0), 0
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
                          {(() => {
                            // Calculate YTD AUM sales from monthly entries for selected year
                            const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                              entry.month_year.startsWith(selectedYear.toString())
                            ) || []
                            const ytdAumSales = yearEntries.reduce((sum, entry) => 
                              sum + (entry.aum_sales || 0), 0
                            )
                            return `$${ytdAumSales.toLocaleString()} / $${advisorData.businessGoals.aum_goal?.toLocaleString()}`
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={(() => {
                          // Calculate YTD AUM sales from monthly entries for selected year
                          const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                            entry.month_year.startsWith(selectedYear.toString())
                          ) || []
                          const ytdAumSales = yearEntries.reduce((sum, entry) => 
                            sum + (entry.aum_sales || 0), 0
                          )
                          return calculateGoalProgress(ytdAumSales, advisorData.businessGoals.aum_goal || 0)
                        })()} 
                        className="h-2" 
                      />
                    </div>

                    {/* Annuity Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Annuity Goal</span>
                        <span className="text-white">
                          {(() => {
                            // Calculate YTD Annuity sales from monthly entries for selected year
                            const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                              entry.month_year.startsWith(selectedYear.toString())
                            ) || []
                            const ytdAnnuitySales = yearEntries.reduce((sum, entry) => 
                              sum + (entry.annuity_sales || 0), 0
                            )
                            return `$${ytdAnnuitySales.toLocaleString()} / $${advisorData.businessGoals.annuity_goal?.toLocaleString()}`
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={(() => {
                          // Calculate YTD Annuity sales from monthly entries for selected year
                          const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                            entry.month_year.startsWith(selectedYear.toString())
                          ) || []
                          const ytdAnnuitySales = yearEntries.reduce((sum, entry) => 
                            sum + (entry.annuity_sales || 0), 0
                          )
                          return calculateGoalProgress(ytdAnnuitySales, advisorData.businessGoals.annuity_goal || 0)
                        })()} 
                        className="h-2" 
                      />
                    </div>

                    {/* Life Goal */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-m8bs-muted">Life Goal</span>
                        <span className="text-white">
                          {(() => {
                            // Calculate YTD Life sales from monthly entries for selected year
                            const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                              entry.month_year.startsWith(selectedYear.toString())
                            ) || []
                            const ytdLifeSales = yearEntries.reduce((sum, entry) => 
                              sum + (entry.life_sales || 0), 0
                            )
                            return `$${ytdLifeSales.toLocaleString()} / $${advisorData.businessGoals.life_target_goal?.toLocaleString()}`
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={(() => {
                          // Calculate YTD Life sales from monthly entries for selected year
                          const yearEntries = advisorData.monthlyDataEntries?.filter(entry => 
                            entry.month_year.startsWith(selectedYear.toString())
                          ) || []
                          const ytdLifeSales = yearEntries.reduce((sum, entry) => 
                            sum + (entry.life_sales || 0), 0
                          )
                          return calculateGoalProgress(ytdLifeSales, advisorData.businessGoals.life_target_goal || 0)
                        })()} 
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
                        {(() => {
                          try {
                            if (data.latestMonthlyEntry.month_year) {
                              const [year, month] = data.latestMonthlyEntry.month_year.split('-')
                              const date = new Date(Number(year), Number(month) - 1, 1)
                              return format(date, "MMMM yyyy")
                            }
                            return "N/A"
                          } catch {
                            return data.latestMonthlyEntry.month_year || "N/A"
                          }
                        })()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">
                          {Number(data.latestMonthlyEntry.new_clients) || 0}
                        </div>
                        <div className="text-xs text-m8bs-muted">New Clients</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">
                          {Number(data.latestMonthlyEntry.new_appointments) || 0}
                        </div>
                        <div className="text-xs text-m8bs-muted">Appointments</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">
                          ${(() => {
                            // Handle decimal values from database (might be strings)
                            const annuity = parseFloat(String(data.latestMonthlyEntry.annuity_sales || 0)) || 0
                            const aum = parseFloat(String(data.latestMonthlyEntry.aum_sales || 0)) || 0
                            const life = parseFloat(String(data.latestMonthlyEntry.life_sales || 0)) || 0
                            const total = annuity + aum + life
                            return total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          })()}
                        </div>
                        <div className="text-xs text-m8bs-muted">Total Sales</div>
                      </div>
                      <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="text-white font-bold">
                          ${(() => {
                            // Handle decimal values from database (might be strings)
                            const expenses = parseFloat(String(data.latestMonthlyEntry.marketing_expenses || 0)) || 0
                            return expenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          })()}
                        </div>
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