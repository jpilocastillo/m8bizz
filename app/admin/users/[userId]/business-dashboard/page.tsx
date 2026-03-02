"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMetrics } from "@/components/business-dashboard/dashboard-metrics"
import { GoalProgress } from "@/components/business-dashboard/goal-progress"
import { CurrentAdvisorBook } from "@/components/business-dashboard/current-advisor-book"
import { IncomeBreakdown } from "@/components/business-dashboard/income-breakdown"
import { PerformanceCharts } from "@/components/business-dashboard/performance-charts"
import { ClientAcquisition } from "@/components/business-dashboard/client-acquisition"
import { PDFExport } from "@/components/business-dashboard/pdf-export"
import { CSVExport } from "@/components/business-dashboard/csv-export"
import { MonthlyDataEntryComponent } from "@/components/business-dashboard/monthly-data-entry"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { getAdvisorBasecampDataForViewAs } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdminViewAsBusinessDashboardPage() {
  const params = useParams()
  const userId = params.userId as string
  const basePath = `/admin/users/${userId}`
  const { viewAsUserId, profile: viewAsProfile } = useViewAsUserOrThrow()

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [data, setData] = useState<import("@/lib/advisor-basecamp").AdvisorBasecampData>({ campaigns: [] })
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("goals")
  const [refreshing, setRefreshing] = useState(false)
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()])

  const loadData = useCallback(async () => {
    if (!viewAsUserId) return
    setDataError(null)
    const res = await getAdvisorBasecampDataForViewAs(viewAsUserId, selectedYear)
    if (!res.success) {
      setDataError(res.error || "Failed to load data")
      return
    }
    setData(res.data ?? { campaigns: [] })
    const d = res.data
    if (d) {
      const years = new Set<number>([new Date().getFullYear(), selectedYear])
      d.monthlyDataEntries?.forEach((e: any) => {
        if (e?.month_year) {
          const y = Number(e.month_year.split("-")[0])
          if (!isNaN(y)) years.add(y)
        }
      })
      if (d.businessGoals?.year) years.add(Number(d.businessGoals.year))
      setAvailableYears(Array.from(years).sort((a, b) => b - a))
    }
  }, [viewAsUserId, selectedYear])

  useEffect(() => {
    if (!viewAsUserId) return
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [viewAsUserId, selectedYear, loadData])

  useEffect(() => {
    if (viewAsUserId && typeof window !== "undefined") {
      const savedTab = localStorage.getItem(`advisor-basecamp-tab-viewas-${viewAsUserId}`)
      if (savedTab) setActiveTab(savedTab)
      const savedYear = localStorage.getItem(`advisor-basecamp-year-viewas-${viewAsUserId}`)
      if (savedYear) {
        const yearNum = Number.parseInt(savedYear)
        if (!isNaN(yearNum)) setSelectedYear(yearNum)
      }
    }
  }, [viewAsUserId])

  useEffect(() => {
    if (viewAsUserId && typeof window !== "undefined" && activeTab) {
      localStorage.setItem(`advisor-basecamp-tab-viewas-${viewAsUserId}`, activeTab)
    }
  }, [activeTab, viewAsUserId])

  useEffect(() => {
    if (viewAsUserId && typeof window !== "undefined" && selectedYear) {
      localStorage.setItem(`advisor-basecamp-year-viewas-${viewAsUserId}`, selectedYear.toString())
    }
  }, [selectedYear, viewAsUserId])

  const filteredMonthlyData = useMemo(() => {
    return data?.monthlyDataEntries?.filter((entry) => entry.month_year.startsWith(selectedYear.toString())) || []
  }, [data?.monthlyDataEntries, selectedYear])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const isComplete = !!(
    data?.businessGoals &&
    data?.currentValues &&
    data?.clientMetrics &&
    data?.campaigns != null &&
    data.campaigns.length > 0 &&
    data?.commissionRates &&
    data?.financialBook
  )

  const displayProfile = viewAsProfile
    ? {
        first_name: viewAsProfile.full_name?.split(" ")[0] || "",
        last_name: viewAsProfile.full_name?.split(" ").slice(1).join(" ") || "",
      }
    : null

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-m8bs-blue/20 border-t-m8bs-blue mx-auto" />
          <p className="text-m8bs-muted">Loading Advisor Basecamp...</p>
        </div>
      </div>
    )
  }

  if (dataError && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-400">{dataError}</p>
          <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={refreshing ? "animate-spin h-4 w-4" : "h-4 w-4"} />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!isComplete) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Building2 className="h-16 w-16 text-m8bs-muted mx-auto" />
          <h2 className="text-2xl font-bold text-white">Advisor Basecamp Not Set Up</h2>
          <p className="text-m8bs-muted">This user has not completed the Advisor Basecamp setup. You can view their overview or other data from the sidebar.</p>
          <Link href={basePath}>
            <Button variant="outline">View Overview</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4 w-full max-w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">M8 Advisor Basecamp</h1>
          <p className="text-m8bs-muted mt-1">View only — {viewAsProfile?.full_name || viewAsProfile?.email || "User"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-m8bs-card border border-m8bs-border rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-m8bs-muted" />
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
              <SelectTrigger className="w-[120px] border-none bg-transparent text-white focus:ring-0 focus:ring-offset-0 h-auto p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-m8bs-card border-m8bs-border">
                {availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white">
                      {year}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={selectedYear.toString()} className="text-white">
                    {selectedYear}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt">
            <RefreshCw className={refreshing ? "animate-spin h-4 w-4" : "h-4 w-4"} />
            Refresh
          </Button>
          {displayProfile && <CSVExport data={data} profile={displayProfile} />}
        </div>
      </div>

      <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="bg-m8bs-card p-1 border border-m8bs-border rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-7 w-full h-auto">
          <TabsTrigger value="goals" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Goals
          </TabsTrigger>
          <TabsTrigger value="book" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Current Book
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Client Acquisition
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Income Details
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            Monthly Data
          </TabsTrigger>
          <TabsTrigger value="pdf" className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            PDF Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Business Goals</h2>
            <p className="text-m8bs-muted">Target business goals (view only)</p>
            <DashboardMetrics businessGoals={data.businessGoals} currentValues={data.currentValues} clientMetrics={data.clientMetrics} />
            <GoalProgress businessGoals={data.businessGoals} currentValues={data.currentValues} clientMetrics={data.clientMetrics} campaigns={data.campaigns} />
          </div>
        </TabsContent>

        <TabsContent value="book" className="space-y-4">
          <CurrentAdvisorBook currentValues={data.currentValues} />
          <PerformanceCharts
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
            monthlyDataEntries={filteredMonthlyData}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <ClientAcquisition data={data} />
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <IncomeBreakdown
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
            commissionRates={data.commissionRates}
            campaigns={data.campaigns}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Marketing Campaigns</h2>
            <p className="text-m8bs-muted">View only</p>
          </div>
          {data.campaigns && data.campaigns.length > 0 ? (
            <Card className="bg-m8bs-card border-m8bs-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-m8bs-border">
                      <TableHead className="text-m8bs-muted">Name</TableHead>
                      <TableHead className="text-m8bs-muted">Status</TableHead>
                      <TableHead className="text-m8bs-muted">Events</TableHead>
                      <TableHead className="text-m8bs-muted">Leads</TableHead>
                      <TableHead className="text-m8bs-muted">Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.campaigns.map((c: any) => (
                      <TableRow key={c.id} className="border-m8bs-border">
                        <TableCell className="text-white font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={c.status === "Active" ? "border-m8bs-green text-m8bs-green" : "border-m8bs-muted text-m8bs-muted"}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{c.events ?? 0}</TableCell>
                        <TableCell className="text-white">{c.leads ?? 0}</TableCell>
                        <TableCell className="text-white">${(c.budget ?? 0).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <p className="text-m8bs-muted">No campaigns</p>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyDataEntryComponent
            viewOnlyData={data}
            viewOnlyYear={selectedYear}
          />
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          {displayProfile && <PDFExport data={data} profile={displayProfile} year={selectedYear} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
