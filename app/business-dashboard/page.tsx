"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardMetrics } from "@/components/business-dashboard/dashboard-metrics"
import { GoalProgress } from "@/components/business-dashboard/goal-progress"
import { CurrentAdvisorBook } from "@/components/business-dashboard/current-advisor-book"
import { IncomeBreakdown } from "@/components/business-dashboard/income-breakdown"
import { CampaignTable } from "@/components/business-dashboard/campaign-table"
import { PerformanceCharts } from "@/components/business-dashboard/performance-charts"
import { ClientAcquisition } from "@/components/business-dashboard/client-acquisition"
import { DataEntryFormV2 } from "@/components/business-dashboard/data-entry-form-v2"
import { MonthlyDataEntryComponent } from "@/components/business-dashboard/monthly-data-entry"
import { PDFExport } from "@/components/business-dashboard/pdf-export"
import { CSVExport } from "@/components/business-dashboard/csv-export"
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
  const [activeTab, setActiveTab] = useState("goals")
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load saved tab from localStorage on mount
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`advisor-basecamp-tab-${user.id}`)
      if (savedTab) {
        setActiveTab(savedTab)
      }
    }
  }, [user])

  // Save tab to localStorage when it changes
  useEffect(() => {
    if (user && typeof window !== 'undefined' && activeTab) {
      localStorage.setItem(`advisor-basecamp-tab-${user.id}`, activeTab)
    }
  }, [activeTab, user])

  // Debug logging to track data changes
  useEffect(() => {
    console.log('BusinessDashboard data updated:', data)
    console.log('Data completeness check:', {
      businessGoals: !!data.businessGoals,
      currentValues: !!data.currentValues,
      clientMetrics: !!data.clientMetrics,
      campaigns: data.campaigns && data.campaigns.length > 0,
      commissionRates: !!data.commissionRates,
      financialBook: !!data.financialBook,
      isComplete: !!(data.businessGoals && data.currentValues && data.clientMetrics && data.campaigns && data.campaigns.length > 0 && data.commissionRates && data.financialBook)
    })
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
    console.log('handleDataSubmitted called - refreshing data...')
    setEditMode(false)
    
    // Add a small delay to ensure the database has been updated
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await loadData() // Refresh data after successful submission
    console.log('Data refresh completed')
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

  // Debug completion check
  console.log('Completion check details:', {
    businessGoals: data.businessGoals,
    currentValues: data.currentValues,
    clientMetrics: data.clientMetrics,
    campaigns: data.campaigns,
    campaignsLength: data.campaigns?.length,
    commissionRates: data.commissionRates,
    financialBook: data.financialBook,
    isComplete
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please Log In To Access The Advisor Basecamp.</p>
        </div>
      </div>
    )
  }

  if (!mounted || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-white">
            <h3 className="text-lg font-semibold">Loading Advisor Basecamp</h3>
            <p className="text-gray-300">Preparing Your Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Access control removed - all authenticated users can access the business dashboard

  // Show data entry form if not complete or in edit mode
  if (!isComplete || editMode) {
    console.log('Showing data entry form - isComplete:', isComplete, 'editMode:', editMode)
    return (
      <div className="py-8 space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  M8 Advisor Basecamp
                </h1>
                <p className="text-m8bs-muted mt-1">
                  Complete Your Profile To Unlock All Dashboard Features
                </p>
              </div>
              
              <DataEntryFormV2
                user={user}
                onComplete={handleDataSubmitted}
                onCancel={() => setEditMode(false)}
                isEditMode={editMode}
              />
      </div>
    )
  }

  console.log('Showing dashboard - all data is complete')

  // Show dashboard if all sections are filled
  return (
      <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            M8 Advisor Basecamp
          </h1>
          <p className="text-m8bs-muted mt-1">
            Track Your Financial Metrics, Client Acquisition, And Business Goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-m8bs-card border-m8bs-border text-white hover:bg-m8bs-card-alt"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <CSVExport data={data} profile={profile} />
          <Button variant="outline" onClick={() => setEditMode(true)}>
            Edit Business Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-m8bs-card p-1 border border-m8bs-border rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-7 w-full h-auto">
          <TabsTrigger 
            value="goals" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Goals
          </TabsTrigger>
          <TabsTrigger 
            value="book" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Current Book
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Client Acquisition
          </TabsTrigger>
          <TabsTrigger 
            value="income" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Income Details
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            Monthly Data
          </TabsTrigger>
          <TabsTrigger 
            value="pdf" 
            className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white data-[state=active]:shadow-md py-2 text-sm font-medium transition-all"
          >
            PDF Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          {/* Dashboard Metrics - Top 5 Cards */}
          <DashboardMetrics 
            key={`metrics-${JSON.stringify(data)}`}
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
          />

          {/* Goals Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Business Goals</h2>
              <p className="text-m8bs-muted">Your Target Business Goals</p>
            </div>
            <GoalProgress 
              key={`goals-${JSON.stringify(data)}`}
              businessGoals={data.businessGoals}
              currentValues={data.currentValues}
              clientMetrics={data.clientMetrics}
            />
          </div>
        </TabsContent>

        <TabsContent value="book" className="space-y-6">
          <CurrentAdvisorBook 
            key={`book-${JSON.stringify(data)}`}
            currentValues={data.currentValues}
          />
          <PerformanceCharts 
            key={`charts-${JSON.stringify(data)}`}
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientAcquisition data={data} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <IncomeBreakdown 
            businessGoals={data.businessGoals}
            currentValues={data.currentValues}
            clientMetrics={data.clientMetrics}
            commissionRates={data.commissionRates}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignTable />
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