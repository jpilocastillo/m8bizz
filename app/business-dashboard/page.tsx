"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMetrics } from "@/components/business-dashboard/dashboard-metrics"
import { GoalProgress } from "@/components/business-dashboard/goal-progress"
import { IncomeBreakdown } from "@/components/business-dashboard/income-breakdown"
import { CampaignTable } from "@/components/business-dashboard/campaign-table"
import { FinancialOptions } from "@/components/business-dashboard/financial-options"
import { PerformanceCharts } from "@/components/business-dashboard/performance-charts"
import { ClientAcquisition } from "@/components/business-dashboard/client-acquisition"
import { DataEntryFormV2 } from "@/components/business-dashboard/data-entry-form-v2"
import { MonthlyDataEntryComponent } from "@/components/business-dashboard/monthly-data-entry"
import { PDFExport } from "@/components/business-dashboard/pdf-export"
import { useAuth } from "@/components/auth-provider"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { data, loading, loadData } = useAdvisorBasecamp(user)
  const [editMode, setEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Debug logging to track data changes
  useEffect(() => {
    console.log('BusinessDashboard data updated:', data)
  }, [data])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }
      setProfileLoading(true)
      const supabase = createClient()
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)
      setProfileLoading(false)
    }
    fetchProfile()
  }, [user])

  // Removed auto-refresh interval - data will only refresh when:
  // 1. User manually clicks refresh
  // 2. User submits new data
  // 3. Component mounts initially

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleDataSubmitted = async () => {
    setEditMode(false)
    await loadData() // Refresh data after successful submission
  }

  // Helper: check if all sections are filled
  const isComplete = !!(
    data.businessGoals &&
    data.currentValues &&
    data.clientMetrics &&
    data.campaigns && data.campaigns.length > 0 &&
    data.commissionRates &&
    data.financialBook
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the advisor basecamp.</p>
        </div>
      </div>
    )
  }

  if (!mounted || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Access control removed - all authenticated users can access the business dashboard

  // Show data entry form if not complete or in edit mode
  if (!isComplete || editMode) {
    return (
      <div className="py-8">
        <DataEntryFormV2
          user={user}
          onComplete={handleDataSubmitted}
          isEditMode={editMode}
        />
      </div>
    )
  }

  // Show dashboard if all sections are filled
  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            M8 Advisor Basecamp
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your financial metrics, client acquisition, and business goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setEditMode(true)}>
            Edit Business Data
          </Button>
        </div>
      </div>

      <DashboardMetrics 
        key={`metrics-${JSON.stringify(data)}`}
        businessGoals={data.businessGoals}
        currentValues={data.currentValues}
        clientMetrics={data.clientMetrics}
      />

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-8 w-full h-auto">
          <TabsTrigger value="overview" className="py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="goals" className="py-2">
            Goals & Metrics
          </TabsTrigger>
          <TabsTrigger value="clients" className="py-2">
            Client Acquisition
          </TabsTrigger>
          <TabsTrigger value="income" className="py-2">
            Income Details
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="py-2">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="options" className="py-2">
            Financial Options
          </TabsTrigger>
          <TabsTrigger value="monthly" className="py-2">
            Monthly Data
          </TabsTrigger>
          <TabsTrigger value="pdf" className="py-2">
            PDF Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PerformanceCharts 
            key={`charts-${JSON.stringify(data)}`}
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalProgress 
            key={`goals-${JSON.stringify(data)}`}
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientAcquisition />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <IncomeBreakdown />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignTable />
        </TabsContent>

        <TabsContent value="options" className="space-y-6">
          <FinancialOptions />
        </TabsContent>
        <TabsContent value="monthly" className="space-y-6">
          <MonthlyDataEntryComponent />
        </TabsContent>
        
        <TabsContent value="pdf" className="space-y-6">
          <PDFExport data={data} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 