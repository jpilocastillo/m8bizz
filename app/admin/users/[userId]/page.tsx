"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { fetchAllEvents } from "@/lib/data"
import { getAdvisorBasecampDataForViewAs } from "@/app/admin/actions"
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
  Award,
  FileText,
  Briefcase,
  UserCheck,
  DollarSign as DollarSignIcon,
  Settings,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { format } from "date-fns"
import { ThreeDMetricCard } from "@/components/dashboard/3d-metric-card"
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

export default function AdminViewAsOverviewPage() {
  const params = useParams()
  const userId = params.userId as string
  const { viewAsUser, viewAsUserId, profile } = useViewAsUserOrThrow()

  const basePath = `/admin/users/${userId}`
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [dataAvailability, setDataAvailability] = useState<{
    hasEvents: boolean
    hasBusinessData: boolean
    hasScorecardData: boolean
  }>({
    hasEvents: false,
    hasBusinessData: false,
    hasScorecardData: false,
  })
  const [data, setData] = useState<HomepageData>({
    events: [],
    advisorData: null,
    analyticsSummary: null,
    topEvents: [],
    latestMonthlyEntry: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && viewAsUserId) {
      const savedYear = localStorage.getItem(`overview-year-viewas-${viewAsUserId}`)
      if (savedYear) {
        const yearNum = Number.parseInt(savedYear)
        if (!isNaN(yearNum)) setSelectedYear(yearNum)
      }
    }
  }, [viewAsUserId])

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
        overallConversionRate: 0,
      }
    }
    const summary = events.reduce(
      (acc, event) => {
        let revenue = 0
        if (event.revenue !== undefined) revenue = Number(event.revenue) || 0
        else {
          const financial = Array.isArray(event.financial_production) ? event.financial_production[0] || {} : event.financial_production || {}
          revenue = financial.total !== undefined ? Number(financial.total) || 0 : (Number(financial.aum_fees) || 0) + (Number(financial.annuity_commission) || 0) + (Number(financial.life_insurance_commission) || 0) + (Number(financial.financial_planning) || 0)
        }
        let attendees = 0
        if (event.attendees !== undefined) attendees = Number(event.attendees) || 0
        else {
          const attendance = Array.isArray(event.attendance) ? event.attendance[0] || {} : event.attendance || {}
          attendees = Number(attendance.attendees) || 0
        }
        let clients = 0
        if (event.clients !== undefined) clients = Number(event.clients) || 0
        else {
          const attendance = Array.isArray(event.attendance) ? event.attendance[0] || {} : event.attendance || {}
          clients = Number(attendance.clients_from_event) || 0
        }
        let expenses = 0
        if (event.expenses !== undefined) expenses = Number(event.expenses) || 0
        else {
          const expensesObj = Array.isArray(event.marketing_expenses) ? event.marketing_expenses[0] || {} : event.marketing_expenses || {}
          expenses = Number(expensesObj.total_cost) || 0
        }
        return {
          totalEvents: acc.totalEvents + 1,
          totalAttendees: acc.totalAttendees + attendees,
          totalRevenue: acc.totalRevenue + revenue,
          totalExpenses: acc.totalExpenses + expenses,
          totalClients: acc.totalClients + clients,
        }
      },
      { totalEvents: 0, totalAttendees: 0, totalRevenue: 0, totalExpenses: 0, totalClients: 0 }
    )
    summary.avgAttendees = summary.totalEvents > 0 ? Math.round(summary.totalAttendees / summary.totalEvents) : 0
    summary.totalProfit = summary.totalRevenue - summary.totalExpenses
    summary.overallROI = summary.totalExpenses > 0 ? Math.round((summary.totalProfit / summary.totalExpenses) * 100) : summary.totalRevenue > 0 ? 9999 : 0
    summary.overallConversionRate = summary.totalAttendees > 0 ? Number(((summary.totalClients / summary.totalAttendees) * 100).toFixed(1)) : 0
    return summary
  }, [])

  const getTopEvents = useCallback((events: any[], count: number) => {
    if (!events || events.length === 0) return []
    return events
      .map((event: any) => {
        let revenue = 0
        if (event.revenue !== undefined) revenue = Number(event.revenue) || 0
        else {
          const financial = Array.isArray(event.financial_production) ? event.financial_production[0] || {} : event.financial_production || {}
          revenue = financial.total !== undefined ? Number(financial.total) || 0 : (Number(financial.aum_fees) || 0) + (Number(financial.annuity_commission) || 0) + (Number(financial.life_insurance_commission) || 0) + (Number(financial.financial_planning) || 0)
        }
        let expenses = 0
        if (event.expenses !== undefined) expenses = Number(event.expenses) || 0
        else {
          expenses = Array.isArray(event.marketing_expenses) ? Number(event.marketing_expenses[0]?.total_cost) || 0 : Number(event.marketing_expenses?.total_cost) || 0
        }
        let attendees = 0
        if (event.attendees !== undefined) attendees = Number(event.attendees) || 0
        else {
          const attendance = Array.isArray(event.attendance) ? event.attendance[0] || {} : event.attendance || {}
          attendees = Number(attendance.attendees) || 0
        }
        let clients = 0
        if (event.clients !== undefined) clients = Number(event.clients) || 0
        else {
          const attendance = Array.isArray(event.attendance) ? event.attendance[0] || {} : event.attendance || {}
          clients = Number(attendance.clients_from_event) || 0
        }
        const profit = revenue - expenses
        const roi = expenses > 0 ? Number(((profit / expenses) * 100).toFixed(1)) : revenue > 0 ? 9999 : 0
        const getYear = (dateString: string | null | undefined): number => {
          if (!dateString) return 0
          try {
            const [year] = dateString.split("-").map(Number)
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
          revenue,
          expenses,
          profit,
          attendees,
          clients,
          roi: { value: roi },
          year: getYear(event.date),
        }
      })
      .sort((a, b) => (b.year !== a.year ? b.year - a.year : (b.roi?.value || 0) - (a.roi?.value || 0)))
      .slice(0, count)
  }, [])

  const getLatestMonthlyEntry = useCallback((advisorData: any, year: number) => {
    if (!advisorData?.monthlyDataEntries?.length) return null
    const yearEntries = advisorData.monthlyDataEntries.filter((e: any) => e?.month_year?.startsWith(year.toString()))
    if (yearEntries.length === 0) return null
    const sorted = yearEntries.sort((a: any, b: any) => (b.month_year || "").localeCompare(a.month_year || ""))
    const latestEntry = sorted[0]
    if (!latestEntry) return null
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
      if (!viewAsUserId) return
      try {
        setLoading(true)
        const [allEventsRes, advisorRes] = await Promise.all([
          fetchAllEvents(viewAsUserId),
          getAdvisorBasecampDataForViewAs(viewAsUserId, selectedYear),
        ])
        const allEvents = allEventsRes ?? []
        const advisorData = advisorRes.success ? advisorRes.data : null

        const yearEvents = allEvents.filter((event: any) => {
          if (!event.date) return false
          try {
            const [year] = event.date.split("-").map(Number)
            return !isNaN(year) && year === selectedYear
          } catch {
            return false
          }
        })
        const analyticsSummary = calculateAnalyticsSummary(yearEvents)
        const topEvents = getTopEvents(yearEvents, 3)
        const latestMonthlyEntry = getLatestMonthlyEntry(advisorData, selectedYear)

        // Merge available years from events and advisor data (monthly entries, goals)
        const years = new Set<number>()
        years.add(2026)
        allEvents.forEach((event: any) => {
          if (event.date) {
            try {
              const [y] = event.date.split("-").map(Number)
              if (!isNaN(y)) years.add(y)
            } catch {
              // skip
            }
          }
        })
        if (advisorData?.monthlyDataEntries?.length) {
          advisorData.monthlyDataEntries.forEach((e: any) => {
            if (e?.month_year) {
              const y = Number(e.month_year.split("-")[0])
              if (!isNaN(y)) years.add(y)
            }
          })
        }
        if (advisorData?.businessGoals?.year) years.add(Number(advisorData.businessGoals.year))
        const sortedYears = Array.from(years).sort((a, b) => b - a)
        setAvailableYears(sortedYears)
        if (!sortedYears.includes(selectedYear)) setSelectedYear(2026)

        const hasEvents = yearEvents.length > 0
        const hasBusinessData =
          !!advisorData?.monthlyDataEntries?.some((e: any) =>
            e?.month_year?.startsWith(selectedYear.toString())
          )
        let hasScorecardData = false
        try {
          const { getScorecardDataForViewAs: getScorecard } = await import("@/app/admin/actions")
          const r = await getScorecard(viewAsUserId, "month", new Date().getMonth() + 1, selectedYear)
          hasScorecardData = r.success && !!r.data
        } catch {
          // ignore
        }
        setDataAvailability({ hasEvents, hasBusinessData, hasScorecardData })
        setData({
          events: yearEvents,
          advisorData,
          analyticsSummary,
          topEvents,
          latestMonthlyEntry,
        })
      } catch (err) {
        console.error("Error loading overview data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadOverviewData()
  }, [viewAsUserId, selectedYear, calculateAnalyticsSummary, getTopEvents, getLatestMonthlyEntry])

  useEffect(() => {
    if (viewAsUserId && typeof window !== "undefined" && selectedYear) {
      localStorage.setItem(`overview-year-viewas-${viewAsUserId}`, selectedYear.toString())
    }
  }, [selectedYear, viewAsUserId])

  const calculateGoalProgress = (current: number, goal: number) => (goal === 0 ? 0 : Math.min((current / goal) * 100, 100))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m8bs-blue mx-auto" />
          <p className="mt-2 text-m8bs-muted">Loading overview...</p>
        </div>
      </div>
    )
  }

  const displayName = profile?.full_name || profile?.email || "User"
  const advisorData = data.advisorData
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <div className="px-4 sm:px-5 lg:px-6 xl:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-black">
      <div className="max-w-5xl mx-auto">
        <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="space-y-6 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-m8bs-blue via-m8bs-purple to-m8bs-pink bg-clip-text text-transparent">
                  {displayName}&apos;s Overview
                </h1>
                <p className="text-lg md:text-xl text-m8bs-muted max-w-2xl">Business overview at a glance (view only)</p>
              </div>
              <div className="flex items-center gap-2 bg-m8bs-card border border-m8bs-border rounded-lg px-3 py-2">
                <Calendar className="h-4 w-4 text-m8bs-muted" />
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[120px] border-none bg-transparent text-white focus:ring-0 focus:ring-offset-0 h-auto p-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-m8bs-card border-m8bs-border">
                    {(availableYears.length ? availableYears : [selectedYear]).map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link href={`${basePath}/business-dashboard`}>
                  <Button variant="outline" className="border-m8bs-border hover:bg-m8bs-card-alt">
                    <Building2 className="h-4 w-4 mr-2" />
                    Advisor Basecamp
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {selectedYear !== 2026 && (
            <motion.div variants={item}>
              <Alert className="bg-yellow-500/10 border-yellow-500/50">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertTitle className="text-yellow-400">Viewing {selectedYear} Data</AlertTitle>
                <AlertDescription className="text-yellow-300/80">
                  {!dataAvailability.hasEvents && !dataAvailability.hasBusinessData && !dataAvailability.hasScorecardData && (
                    <span>No data found for {selectedYear}.</span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

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
                        <h3 className="text-lg font-bold text-white">Highlights</h3>
                        <p className="text-sm text-m8bs-muted">Performance summary</p>
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

          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <ThreeDMetricCard title="Total Marketing Events" value={data.analyticsSummary?.totalEvents || 0} icon={<Calendar className="h-5 w-5 text-m8bs-muted" />} description="Events" color="blue" />
            <ThreeDMetricCard title="Total Revenue" value={data.analyticsSummary?.totalRevenue || 0} format="currency" icon={<DollarSign className="h-5 w-5 text-m8bs-green" />} description="Revenue" color="green" />
            <ThreeDMetricCard title="Total Profit" value={data.analyticsSummary?.totalProfit || 0} format="currency" icon={<TrendingUp className="h-5 w-5 text-m8bs-purple" />} description="Profit" color="purple" />
            <ThreeDMetricCard title="Total Attendees" value={data.analyticsSummary?.totalAttendees || 0} icon={<Users className="h-5 w-5 text-m8bs-orange" />} description="Attendees" color="amber" />
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ThreeDMetricCard title="Total Clients" value={data.analyticsSummary?.totalClients || 0} icon={<UserCheck className="h-5 w-5 text-m8bs-green" />} description="Clients from events" color="green" />
            <ThreeDMetricCard title="Total Expenses" value={data.analyticsSummary?.totalExpenses || 0} format="currency" icon={<DollarSignIcon className="h-5 w-5 text-red-500" />} description="Expenses" color="red" />
            <ThreeDMetricCard title="Overall ROI" value={data.analyticsSummary?.overallROI === 9999 ? 999 : (data.analyticsSummary?.overallROI || 0)} format="percent" icon={<BarChart3 className="h-5 w-5 text-m8bs-purple" />} description="ROI" color="purple" />
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <TooltipProvider>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-m8bs-muted" />
                      Top Performing Events
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Best by ROI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.topEvents.length > 0 ? (
                      <div className="space-y-3">
                        {data.topEvents.map((event, index) => (
                          <div key={event.id} className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? "bg-gradient-to-br from-yellow-500 to-yellow-600" : index === 1 ? "bg-gradient-to-br from-m8bs-muted to-m8bs-border" : "bg-gradient-to-br from-m8bs-orange to-orange-600"}`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{event.name}</div>
                                <div className="text-sm text-m8bs-muted">
                                  {event.date ? (() => { try { const [y, m, d] = event.date.split("-").map(Number); return format(new Date(y, m - 1, d), "MMM d, yyyy") } catch { return event.date } })() : "No date"} • {event.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white">{event.roi?.value === 9999 ? "999%+" : (event.roi?.value?.toFixed(1) || 0)}% ROI</div>
                              <div className="text-sm text-m8bs-muted">${(event.revenue || 0).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-m8bs-muted">
                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No events data for this year</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-m8bs-muted" />
                      Goals & Progress
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Progress towards goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center h-32 items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m8bs-muted" />
                      </div>
                    ) : advisorData?.businessGoals ? (
                      <div className="space-y-4">
                        {[
                          {
                            label: "Business Goal",
                            getCurrent: () => (advisorData.monthlyDataEntries?.filter((e: any) => e?.month_year?.startsWith(selectedYear.toString())) || []).reduce((s: number, e: any) => s + (e.annuity_sales || 0) + (e.aum_sales || 0) + (e.life_sales || 0), 0),
                            goal: advisorData.businessGoals.business_goal || 0,
                          },
                          {
                            label: "AUM Goal",
                            getCurrent: () => (advisorData.monthlyDataEntries?.filter((e: any) => e?.month_year?.startsWith(selectedYear.toString())) || []).reduce((s: number, e: any) => s + (e.aum_sales || 0), 0),
                            goal: advisorData.businessGoals.aum_goal || 0,
                          },
                          {
                            label: "Annuity Goal",
                            getCurrent: () => (advisorData.monthlyDataEntries?.filter((e: any) => e?.month_year?.startsWith(selectedYear.toString())) || []).reduce((s: number, e: any) => s + (e.annuity_sales || 0), 0),
                            goal: advisorData.businessGoals.annuity_goal || 0,
                          },
                          {
                            label: "Life Goal",
                            getCurrent: () => (advisorData.monthlyDataEntries?.filter((e: any) => e?.month_year?.startsWith(selectedYear.toString())) || []).reduce((s: number, e: any) => s + (e.life_sales || 0), 0),
                            goal: advisorData.businessGoals.life_target_goal || 0,
                          },
                        ].map(({ label, getCurrent, goal }) => (
                          <div key={label} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-m8bs-muted">{label}</span>
                              <span className="text-white">${getCurrent().toLocaleString()} / ${goal?.toLocaleString()}</span>
                            </div>
                            <Progress value={calculateGoalProgress(getCurrent(), goal)} className="h-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-m8bs-muted">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No goals data</p>
                        <Link href={`${basePath}/business-dashboard`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Building2 className="h-4 w-4 mr-2" />
                            Advisor Basecamp
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4">
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-m8bs-muted" />
                      Total Advisor Book
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Current book of business</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {advisorData?.currentValues ? (
                      (() => {
                        const annuity = advisorData.currentValues.current_annuity || 0
                        const aum = advisorData.currentValues.current_aum || 0
                        const life = advisorData.currentValues.current_life_production || 0
                        const total = annuity + aum + life
                        const ap = total > 0 ? ((annuity / total) * 100).toFixed(1) : 0
                        const aump = total > 0 ? ((aum / total) * 100).toFixed(1) : 0
                        const lp = total > 0 ? ((life / total) * 100).toFixed(1) : 0
                        return (
                          <>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                                <span className="text-m8bs-muted">Annuity Book</span>
                                <span className="text-white font-semibold">${annuity.toLocaleString()} ({ap}%)</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                                <span className="text-m8bs-muted">AUM Book</span>
                                <span className="text-white font-semibold">${aum.toLocaleString()} ({aump}%)</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-m8bs-card-alt rounded-lg">
                                <span className="text-m8bs-muted">Life Production</span>
                                <span className="text-white font-semibold">${life.toLocaleString()} ({lp}%)</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-m8bs-border flex justify-between items-center">
                              <span className="text-m8bs-muted font-medium">Total Book Value</span>
                              <span className="text-white font-bold text-lg">${total.toLocaleString()}</span>
                            </div>
                          </>
                        )
                      })()
                    ) : (
                      <div className="text-center py-8 text-m8bs-muted">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No book data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-m8bs-muted" />
                      Latest Monthly Entry
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Most recent monthly data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.latestMonthlyEntry ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-m8bs-muted">Period</span>
                          <span className="text-white font-semibold">
                            {data.latestMonthlyEntry.month_year ? (() => { try { const [y, m] = data.latestMonthlyEntry.month_year.split("-"); return format(new Date(Number(y), Number(m) - 1, 1), "MMMM yyyy") } catch { return data.latestMonthlyEntry.month_year } })() : "N/A"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                            <div className="text-white font-bold">{Number(data.latestMonthlyEntry.new_clients) || 0}</div>
                            <div className="text-xs text-m8bs-muted">New Clients</div>
                          </div>
                          <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                            <div className="text-white font-bold">{Number(data.latestMonthlyEntry.new_appointments) || 0}</div>
                            <div className="text-xs text-m8bs-muted">Appointments</div>
                          </div>
                          <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                            <div className="text-white font-bold">
                              ${(parseFloat(String(data.latestMonthlyEntry.annuity_sales || 0)) + parseFloat(String(data.latestMonthlyEntry.aum_sales || 0)) + parseFloat(String(data.latestMonthlyEntry.life_sales || 0))).toLocaleString()}
                            </div>
                            <div className="text-xs text-m8bs-muted">Total Sales</div>
                          </div>
                          <div className="text-center p-3 bg-m8bs-card-alt rounded-lg">
                            <div className="text-white font-bold">${parseFloat(String(data.latestMonthlyEntry.marketing_expenses || 0)).toLocaleString()}</div>
                            <div className="text-xs text-m8bs-muted">Expenses</div>
                          </div>
                        </div>
                        {data.latestMonthlyEntry.notes && (
                          <div className="pt-2 border-t border-m8bs-border">
                            <div className="text-sm text-m8bs-muted mb-1">Notes</div>
                            <div className="text-sm text-white bg-m8bs-card-alt p-2 rounded">{data.latestMonthlyEntry.notes}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-m8bs-muted">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No monthly entries yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {advisorData?.campaigns?.filter((c: any) => c.status === "Active" || c.status === "Planned").length > 0 && (
                <motion.div variants={item} className="mt-4">
                  <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                    <CardHeader className="bg-m8bs-card px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                            <Target className="h-5 w-5 text-m8bs-muted" />
                            Active Campaigns
                          </CardTitle>
                          <CardDescription className="text-m8bs-muted mt-2">Current marketing campaigns</CardDescription>
                        </div>
                        <Link href={`${basePath}/business-dashboard`}>
                          <Button variant="ghost" size="sm" className="text-m8bs-muted hover:text-white">
                            View All <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {advisorData.campaigns
                          .filter((c: any) => c.status === "Active" || c.status === "Planned")
                          .slice(0, 3)
                          .map((campaign: any) => (
                            <Link key={campaign.id} href={`${basePath}/business-dashboard`}>
                              <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg hover:bg-m8bs-card cursor-pointer group">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-m8bs-purple to-m8bs-pink rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs">
                                    <span className="text-lg">{campaign.events || 0}</span>
                                    <span className="text-[10px]">Events</span>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white group-hover:text-m8bs-blue">{campaign.name}</div>
                                    <div className="text-sm text-m8bs-muted flex items-center gap-2">
                                      <Badge variant="outline" className={`text-xs ${campaign.status === "Active" ? "border-m8bs-green text-m8bs-green" : "border-yellow-500 text-yellow-500"}`}>
                                        {campaign.status}
                                      </Badge>
                                      {campaign.budget > 0 && <span>• ${campaign.budget.toLocaleString()} Budget</span>}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-m8bs-muted group-hover:text-m8bs-blue" />
                              </div>
                            </Link>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Activity, Performance Insights, Quick Action — match main overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-m8bs-muted" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Latest events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topEvents.length > 0 ? (
                        data.topEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center space-x-3 p-3 bg-m8bs-card-alt rounded-lg">
                            <Calendar className="h-4 w-4 text-white" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{event.name}</p>
                              <p className="text-xs text-m8bs-muted">
                                {event.date ? (() => { try { const [y, m, d] = event.date.split("-").map(Number); return format(new Date(y, m - 1, d), "MMM d") } catch { return event.date } })() : "No date"} • {event.roi?.value?.toFixed(1)}% ROI
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-m8bs-muted text-sm">No recent events</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-m8bs-muted" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-m8bs-green rounded-full" />
                          <span className="text-sm text-m8bs-muted">Conversion Rate</span>
                        </div>
                        <span className="text-white font-semibold">
                          {data.analyticsSummary?.overallConversionRate?.toFixed(1) ?? 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-m8bs-muted rounded-full" />
                          <span className="text-sm text-m8bs-muted">Avg Attendees</span>
                        </div>
                        <span className="text-white font-semibold">
                          {data.analyticsSummary?.avgAttendees ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-m8bs-card-alt rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-m8bs-purple rounded-full" />
                          <span className="text-sm text-m8bs-muted">Total ROI</span>
                        </div>
                        <span className="text-white font-semibold">
                          {data.analyticsSummary?.overallROI === 9999 ? "999%+" : `${data.analyticsSummary?.overallROI ?? 0}%`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
                  <CardHeader className="bg-m8bs-card px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-m8bs-muted" />
                      Quick Action
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">View full dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`${basePath}/business-dashboard`}>
                      <Button className="w-full" variant="outline">
                        <Building2 className="h-5 w-5 mr-2" />
                        Open Advisor Basecamp
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TooltipProvider>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
