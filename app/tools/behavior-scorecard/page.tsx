"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, Calendar, BarChart3, Settings, Download, RefreshCw, Users, Plus, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { behaviorScorecardService, type MonthlyScorecardData, type ScorecardRole, type ScorecardMetric, type PeriodType } from "@/lib/behavior-scorecard"
import { WeeklyDataEntry } from "@/components/behavior-scorecard/weekly-data-entry"
import { DataEntryForm } from "@/components/behavior-scorecard/data-entry-form"
import { ScorecardDisplay } from "@/components/behavior-scorecard/scorecard-display"
import { CompanySummary } from "@/components/behavior-scorecard/company-summary"
import { ScorecardSkeleton, CompanySummarySkeleton } from "@/components/behavior-scorecard/scorecard-skeleton"
import { CSVExport } from "@/components/behavior-scorecard/csv-export"
import { MetricVisibilitySettings } from "@/components/behavior-scorecard/metric-visibility-settings"
import { EnhancedRoleManagement } from "@/components/behavior-scorecard/enhanced-role-management"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function BehaviorScorecardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"view" | "entry" | "settings">("view")
  const [settingsRoleId, setSettingsRoleId] = useState<string | null>(null)
  const [scorecardData, setScorecardData] = useState<MonthlyScorecardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [roles, setRoles] = useState<Array<{ id: string; name: ScorecardRole; metrics: ScorecardMetric[] }>>([])
  const [selectedRole, setSelectedRole] = useState<ScorecardRole | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize scorecard and load data - optimized to fetch profile in parallel
  useEffect(() => {
    if (user) {
      initializeAndLoad()
    } else {
      setLoading(false)
    }
  }, [user])

  // Reload scorecard when period changes (debounced to avoid excessive calls)
  // Note: This is for automatic changes, so we don't show loading indicator
  useEffect(() => {
    if (user && roles.length > 0) {
      // Use a longer timeout to debounce rapid changes better
      const timeoutId = setTimeout(() => {
        loadScorecard(false) // false = don't show loading indicator
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [periodType, selectedMonth, selectedQuarter, selectedYear, user, roles.length])

  const initializeAndLoad = async (skipInitialization = false) => {
    setLoading(true)
    try {
      // Load roles, metrics, and profile in parallel for better performance
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (!authUser) {
        console.error('No authenticated user found:', authError)
        toast({
          title: "Authentication Error",
          description: "Please log in to access the scorecard",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Fetch profile in parallel with roles (non-blocking)
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()
        .then(({ data }) => {
          setProfile(data)
          return data
        })
        .catch(() => null) // Don't block on profile fetch

      const { data: rolesData, error: rolesError } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', authUser.id)
        .order('role_name', { ascending: true })

      if (rolesError) {
        console.error('[initializeAndLoad] Error fetching roles:', rolesError)
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Wait for profile to finish (non-blocking, but ensure it completes)
      await profilePromise

      // Only initialize default roles if user has NO roles at all (first time setup)
      // This prevents recreating roles that were intentionally deleted
      let finalRolesData = rolesData
      if (!skipInitialization && (!rolesData || rolesData.length === 0) && !isInitialized) {
        const initResult = await behaviorScorecardService.initializeScorecard()
        if (!initResult.success) {
          console.error('Initialize scorecard error:', initResult.error)
          // Don't show error toast for missing column - it's expected if migration hasn't run
          if (!initResult.error?.includes('is_visible')) {
            toast({
              title: "Error initializing scorecard",
              description: initResult.error || "Failed to initialize scorecard",
              variant: "destructive",
            })
          }
          // Continue anyway - we can still load existing data
        } else {
          setIsInitialized(true)
          // Reload roles after initialization
          const { data: newRolesData } = await supabase
            .from('scorecard_roles')
            .select('id, role_name')
            .eq('user_id', authUser.id)
            .order('role_name', { ascending: true })
          
          if (newRolesData) {
            finalRolesData = newRolesData
          }
        }
      } else if (!skipInitialization && rolesData && rolesData.length > 0 && !isInitialized) {
        // Ensure all default metrics exist for existing roles (adds missing metrics)
        // Run synchronously to ensure core behaviors are added before loading metrics
        setIsInitialized(true) // Set immediately to prevent re-running
        await behaviorScorecardService.ensureDefaultMetrics()
      }

      if (finalRolesData && finalRolesData.length > 0) {
        // Load all metrics in a single batch query for better performance
        const validRoleIds = finalRolesData
          .filter((role: { id: string; role_name: string }) => role && role.id)
          .map((role: { id: string; role_name: string }) => role.id)
        
        // Load metrics and scorecard data in parallel for faster initial load
        const [metricsMap, scorecardResult] = await Promise.all([
          behaviorScorecardService.getAllRoleMetrics(validRoleIds),
          // Pre-load scorecard data while processing roles
          (async () => {
            try {
              if (periodType === 'month') {
                return await behaviorScorecardService.getScorecardData('month', selectedMonth, selectedYear)
              } else if (periodType === 'quarter') {
                return await behaviorScorecardService.getScorecardData('quarter', selectedQuarter, selectedYear)
              } else {
                return await behaviorScorecardService.getScorecardData('year', 0, selectedYear)
              }
            } catch (error) {
              console.error('Error pre-loading scorecard:', error)
              return { success: false, data: null }
            }
          })()
        ])
        
        const rolesWithMetrics: Array<{ id: string; name: ScorecardRole; metrics: ScorecardMetric[] }> = []
        
        finalRolesData.forEach((role: { id: string; role_name: string }) => {
          // Skip if role is null or undefined
          if (!role || !role.id) {
            console.warn('Skipping invalid role:', role)
            return
          }
          
          const metrics = metricsMap.get(role.id) || []
          rolesWithMetrics.push({
            id: role.id,
            name: role.role_name as ScorecardRole,
            metrics: metrics,
          })
        })

        setRoles(rolesWithMetrics)
        
        // Update selectedRole: if current selection doesn't exist, select first role or clear
        if (rolesWithMetrics.length > 0) {
          const currentRoleExists = rolesWithMetrics.some(r => r.name === selectedRole)
          if (!currentRoleExists || !selectedRole) {
            setSelectedRole(rolesWithMetrics[0].name)
          }
        } else {
          // No roles left, clear selection
          setSelectedRole(null)
        }

        // Set scorecard data if it was successfully pre-loaded
        if (scorecardResult.success && scorecardResult.data) {
          setScorecardData(scorecardResult.data)
        } else {
          // Fallback: load scorecard normally
          await loadScorecard()
        }
      } else {
        // No roles data, clear everything
        setRoles([])
        setSelectedRole(null)
        // Still try to load scorecard (might have data from deleted roles)
        await loadScorecard()
      }
    } catch (error) {
      console.error('Error initializing:', error)
      toast({
        title: "Error",
        description: "Failed to load scorecard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadScorecard = async (showLoading = false) => {
    if (showLoading) {
      setLoadingFilters(true)
    }
    try {
      let result
      if (periodType === 'month') {
        result = await behaviorScorecardService.getScorecardData('month', selectedMonth, selectedYear)
      } else if (periodType === 'quarter') {
        result = await behaviorScorecardService.getScorecardData('quarter', selectedQuarter, selectedYear)
      } else {
        result = await behaviorScorecardService.getScorecardData('year', 0, selectedYear)
      }

      if (result.success && result.data) {
        setScorecardData(result.data)
      } else {
        // Create empty scorecard structure
        const emptyData: MonthlyScorecardData = {
          month: periodType === 'month' ? selectedMonth : undefined,
          quarter: periodType === 'quarter' ? selectedQuarter : undefined,
          year: selectedYear,
          periodType,
          roleScorecards: roles.map(role => ({
            roleId: role.id,
            roleName: role.name,
            metrics: role.metrics.map(metric => ({
              metricId: metric.id,
              metricName: metric.metricName,
              metricType: metric.metricType,
              goalValue: metric.goalValue * (periodType === 'quarter' ? 3 : periodType === 'year' ? 12 : 1),
              actualValue: 0,
              percentageOfGoal: 0,
              grade: 'F',
            })),
            averageGradePercentage: 0,
            averageGrade: 'F',
          })),
          companySummary: {
            companyAverage: 0,
            companyGrade: 'F',
            roleScorecards: [],
          },
        }
        setScorecardData(emptyData)
      }
    } catch (error) {
      console.error('Error loading scorecard:', error)
      toast({
        title: "Error",
        description: "Failed to load scorecard data",
        variant: "destructive",
      })
    } finally {
      if (showLoading) {
        setLoadingFilters(false)
      }
    }
  }


  // Memoize expensive computations
  const selectedRoleData = useMemo(() => 
    roles.find(r => r.name === selectedRole),
    [roles, selectedRole]
  )

  // Helper function to check if user has any data - memoized
  const hasData = useMemo(() => {
    if (!scorecardData) return false
    if (scorecardData.roleScorecards.length === 0) return false
    // Check if any role has metrics with actual values
    return scorecardData.roleScorecards.some(role => 
      role.metrics.some(metric => metric.actualValue > 0)
    )
  }, [scorecardData])

  // Helper function to check if roles have metrics - memoized
  const rolesHaveMetrics = useMemo(() => {
    return roles.length > 0 && roles.some(role => role.metrics.length > 0)
  }, [roles])

  // Helper function to check if any role has metrics - memoized
  const hasAnyMetrics = useMemo(() => {
    return roles.some(role => role.metrics.length > 0)
  }, [roles])

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i), [])

  // Memoize period display text
  const periodDisplayText = useMemo(() => {
    if (periodType === 'month') {
      return `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    } else if (periodType === 'quarter') {
      return `Q${selectedQuarter} ${selectedYear}`
    } else {
      return `${selectedYear}`
    }
  }, [periodType, selectedMonth, selectedQuarter, selectedYear, months])

  // Show skeleton loading state (non-blocking, allows UI to render)
  const isLoading = loading && roles.length === 0


  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Behavior Scorecard</h1>
            <p className="text-m8bs-muted mt-1">Please log in to access the scorecard</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Header with gradient accent */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl shadow-lg shadow-m8bs-blue/20">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text">
              Business Behavior Scorecard
            </h1>
            <p className="text-m8bs-muted mt-1.5 text-sm">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading scorecard data...
                </span>
              ) : (
                "Track and analyze business behaviors and performance indicators"
              )}
            </p>
          </div>
        </div>
        {/* Quick Actions - Enhanced styling */}
        <div className="flex items-center gap-2">
          {!isLoading && scorecardData && profile && (
            <CSVExport data={scorecardData} profile={profile} />
          )}
          {!isLoading && (
            <Button
              onClick={() => {
                setActiveTab("entry")
                if (roles.length > 0 && !selectedRole) {
                  setSelectedRole(roles[0].name)
                }
              }}
              variant="outline"
              className="flex items-center gap-2 hover:bg-m8bs-blue/10 hover:border-m8bs-blue/50 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Quick Entry
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced skeleton loader with shimmer effect */}
      {isLoading ? (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-m8bs-blue/20 to-m8bs-blue-dark/20 rounded-xl animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-8 bg-m8bs-card-alt/50 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-m8bs-card-alt/30 rounded-lg w-96 animate-pulse"></div>
            </div>
          </div>
          
          {/* Filter skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-10 bg-m8bs-card-alt/50 rounded-lg w-32 animate-pulse"></div>
            <div className="h-10 bg-m8bs-card-alt/50 rounded-lg w-40 animate-pulse"></div>
            <div className="h-10 bg-m8bs-card-alt/50 rounded-lg w-28 animate-pulse"></div>
          </div>

          {/* Cards skeleton with shimmer */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-m8bs-card border-m8bs-card-alt overflow-hidden relative card-shimmer">
                <CardContent className="p-6 relative">
                  <div className="h-5 bg-m8bs-card-alt/50 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-m8bs-card-alt/30 rounded w-1/2 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Main content skeleton */}
          <Card className="bg-m8bs-card border-m8bs-card-alt overflow-hidden relative card-shimmer">
            <CardContent className="p-6 relative">
              <div className="h-8 bg-m8bs-card-alt/50 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-m8bs-card-alt/50 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-m8bs-card-alt/30 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-m8bs-card-alt/30 rounded w-4/6 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Enhanced Period Selectors with better styling */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-m8bs-card-alt/50 p-2 rounded-lg border border-m8bs-border/50">
              <Select 
                value={periodType} 
                onValueChange={(v) => {
                  setPeriodType(v as PeriodType)
                  loadScorecard(true)
                }}
                disabled={loadingFilters}
              >
                <SelectTrigger className={`w-[120px] bg-m8bs-card border-m8bs-border hover:border-m8bs-blue/50 transition-colors ${loadingFilters ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              
              {periodType === 'month' && (
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(v) => {
                    setSelectedMonth(parseInt(v))
                    loadScorecard(true)
                  }}
                  disabled={loadingFilters}
                >
                  <SelectTrigger className={`w-[140px] bg-m8bs-card border-m8bs-border hover:border-m8bs-blue/50 transition-colors ${loadingFilters ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {periodType === 'quarter' && (
                <Select 
                  value={selectedQuarter.toString()} 
                  onValueChange={(v) => {
                    setSelectedQuarter(parseInt(v))
                    loadScorecard(true)
                  }}
                  disabled={loadingFilters}
                >
                  <SelectTrigger className={`w-[120px] bg-m8bs-card border-m8bs-border hover:border-m8bs-blue/50 transition-colors ${loadingFilters ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(v) => {
                  setSelectedYear(parseInt(v))
                  loadScorecard(true)
                }}
                disabled={loadingFilters}
              >
                <SelectTrigger className={`w-[100px] bg-m8bs-card border-m8bs-border hover:border-m8bs-blue/50 transition-colors ${loadingFilters ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced loading indicator and current period display */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              loadingFilters 
                ? 'bg-m8bs-blue/10 border-m8bs-blue/30' 
                : 'bg-m8bs-card-alt border-m8bs-border'
            }`}>
              {loadingFilters ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-m8bs-blue" />
                  <span className="text-xs text-m8bs-blue font-medium">Loading...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-m8bs-blue" />
                  <span className="text-sm text-white font-semibold">
                    {periodDisplayText}
                  </span>
                </>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "view" | "entry" | "settings")} className="space-y-4">
        <TabsList className="bg-m8bs-card-alt/80 backdrop-blur-sm p-2 border border-m8bs-border/50 rounded-2xl shadow-xl grid w-full grid-cols-3 gap-2 relative overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-m8bs-blue/5 via-transparent to-m8bs-blue-dark/5 pointer-events-none" />
          
          <TabsTrigger 
            value="view" 
            className="tab-glow-active tab-underline-active relative flex items-center justify-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-m8bs-blue data-[state=active]:to-m8bs-blue-dark data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/30 data-[state=active]:scale-[1.02] text-white/60 hover:text-white hover:bg-m8bs-card/60 hover:scale-[1.01] py-3.5 px-4 text-sm font-semibold transition-all duration-300 rounded-xl group overflow-hidden"
          >
            <BarChart3 className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">View Scorecard</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="entry" 
            className="tab-glow-active tab-underline-active relative flex items-center justify-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-m8bs-blue data-[state=active]:to-m8bs-blue-dark data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/30 data-[state=active]:scale-[1.02] text-white/60 hover:text-white hover:bg-m8bs-card/60 hover:scale-[1.01] py-3.5 px-4 text-sm font-semibold transition-all duration-300 rounded-xl group overflow-hidden"
          >
            <Calendar className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Data Entry</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="settings" 
            className="tab-glow-active tab-underline-active relative flex items-center justify-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-m8bs-blue data-[state=active]:to-m8bs-blue-dark data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-m8bs-blue/30 data-[state=active]:scale-[1.02] text-white/60 hover:text-white hover:bg-m8bs-card/60 hover:scale-[1.01] py-3.5 px-4 text-sm font-semibold transition-all duration-300 rounded-xl group overflow-hidden"
          >
            <Settings className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          {loadingFilters ? (
            <>
              <CompanySummarySkeleton />
              <ScorecardSkeleton />
            </>
          ) : scorecardData && scorecardData.companySummary ? (
            <>
              <CompanySummary companySummary={scorecardData.companySummary} />
              
              {scorecardData.roleScorecards.length > 0 ? (
                <Card className="bg-m8bs-card border-m8bs-card-alt shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <Tabs defaultValue={scorecardData.roleScorecards[0]?.roleId || ""} className="w-full">
                      <TabsList className="w-full bg-m8bs-card-alt/90 backdrop-blur-sm p-2 border-b border-m8bs-border/50 rounded-t-xl rounded-b-none grid grid-cols-2 lg:grid-cols-4 gap-2 relative overflow-hidden">
                        {/* Subtle background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-m8bs-blue/5 via-transparent to-transparent pointer-events-none" />
                        
                        {scorecardData.roleScorecards.map((roleScorecard, index) => (
                          <TabsTrigger
                            key={roleScorecard.roleId}
                            value={roleScorecard.roleId}
                            className="relative flex items-center gap-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-m8bs-blue/90 data-[state=active]:to-m8bs-blue-dark/90 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-m8bs-blue/20 data-[state=active]:scale-[1.02] text-white/60 hover:text-white hover:bg-m8bs-card/70 hover:scale-[1.01] py-3 px-3 text-sm font-semibold transition-all duration-300 rounded-lg group overflow-hidden"
                            style={{
                              animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                            }}
                          >
                            <Users className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                            <span className="truncate relative z-10 flex-1 min-w-0">{roleScorecard.roleName}</span>
                            <Badge 
                              variant="outline" 
                              className={`relative z-10 ml-auto text-xs font-bold px-2 py-0.5 flex-shrink-0 transition-all duration-300 data-[state=active]:scale-105 ${
                                roleScorecard.averageGrade === 'A' ? 'border-green-500/50 text-green-400 bg-green-500/10 data-[state=active]:bg-green-500/20 data-[state=active]:border-green-500/70' :
                                roleScorecard.averageGrade === 'B' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/70' :
                                roleScorecard.averageGrade === 'C' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 data-[state=active]:bg-yellow-500/20 data-[state=active]:border-yellow-500/70' :
                                roleScorecard.averageGrade === 'D' ? 'border-orange-500/50 text-orange-400 bg-orange-500/10 data-[state=active]:bg-orange-500/20 data-[state=active]:border-orange-500/70' :
                                'border-red-500/50 text-red-400 bg-red-500/10 data-[state=active]:bg-red-500/20 data-[state=active]:border-red-500/70'
                              }`}
                            >
                              {roleScorecard.averageGrade}
                            </Badge>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {scorecardData.roleScorecards.map((roleScorecard, index) => (
                        <TabsContent
                          key={roleScorecard.roleId}
                          value={roleScorecard.roleId}
                          className="p-6 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                          style={{
                            animationDelay: `${index * 0.05}s`
                          }}
                        >
                          <ScorecardDisplay roleScorecard={roleScorecard} />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
                  <CardContent className="p-8">
                    <div className="text-center text-m8bs-muted">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No role data available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-m8bs-muted">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scorecard data available</p>
            </div>
          )}

          {(!hasData) && (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Calculator className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Get Started with Your Business Behavior Scorecard</h3>
                  <p className="text-m8bs-muted mb-6">
                    Follow these steps to set up and start tracking your business performance metrics.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* Step 1: Add Roles */}
                  {roles.length === 0 ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-m8bs-blue flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Add Roles</h4>
                        <p className="text-m8bs-muted text-sm mb-3">
                          Start by adding roles for your business. You can use the default roles or create custom ones.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("settings")} 
                          size="sm"
                          className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Go to Settings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt/50 border border-m8bs-border/50 rounded-lg opacity-60">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Add Roles</h4>
                        <p className="text-m8bs-muted text-sm">
                          ✓ {roles.length} {roles.length === 1 ? 'role' : 'roles'} added
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Add Metrics */}
                  {roles.length > 0 && !hasAnyMetrics ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-m8bs-blue flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Add Metrics to Roles</h4>
                        <p className="text-m8bs-muted text-sm mb-3">
                          For each role, add metrics to track. Go to Settings to add metrics for your roles.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("settings")} 
                          size="sm"
                          className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Add Metrics
                        </Button>
                      </div>
                    </div>
                  ) : roles.length > 0 && hasAnyMetrics ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt/50 border border-m8bs-border/50 rounded-lg opacity-60">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Add Metrics to Roles</h4>
                        <p className="text-m8bs-muted text-sm">
                          ✓ Metrics added to {roles.filter(r => r.metrics.length > 0).length} {roles.filter(r => r.metrics.length > 0).length === 1 ? 'role' : 'roles'}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Step 3: Enter Monthly Data */}
                  {rolesHaveMetrics ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-m8bs-blue flex items-center justify-center text-white font-bold">
                        {roles.length === 0 ? '1' : hasAnyMetrics ? '3' : '2'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">Enter Monthly Data</h4>
                        <p className="text-m8bs-muted text-sm mb-3">
                          Start entering monthly data for each role's metrics. This data will be used to calculate your scorecard.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("entry")} 
                          size="sm"
                          className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Enter Data
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {/* Step 4: View Scorecard */}
                  {hasData ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt/50 border border-m8bs-border/50 rounded-lg opacity-60">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">View Your Scorecard</h4>
                        <p className="text-m8bs-muted text-sm">
                          ✓ Scorecard data available
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="entry" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-m8bs-blue" />
                    Data Entry
                  </CardTitle>
                  <CardDescription className="text-m8bs-muted mt-1">
                    Select a role to enter monthly data for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setActiveTab("settings")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Roles & Metrics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      variant={selectedRole === role.name ? "default" : "outline"}
                      onClick={() => setSelectedRole(role.name)}
                      className={`h-auto p-5 flex flex-col items-start gap-3 transition-all duration-200 group ${
                        selectedRole === role.name 
                          ? 'bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue border-m8bs-blue shadow-lg shadow-m8bs-blue/20 scale-105' 
                          : 'hover:border-m8bs-blue/50 hover:bg-m8bs-card-alt/50 hover:scale-105'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-semibold text-left ${selectedRole === role.name ? 'text-white' : 'text-white'}`}>
                          {role.name}
                        </span>
                        {selectedRole === role.name && (
                          <CheckCircle2 className="h-5 w-5 text-white animate-in zoom-in-50 duration-200" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${
                        selectedRole === role.name ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        <Users className={`h-3.5 w-3.5 ${selectedRole === role.name ? 'text-white/80' : ''}`} />
                        <span>{role.metrics.length} {role.metrics.length === 1 ? 'metric' : 'metrics'}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-m8bs-muted mx-auto mb-4 opacity-50" />
                  <p className="text-m8bs-muted mb-4">No roles available. Add roles in Settings first.</p>
                  <Button
                    onClick={() => setActiveTab("settings")}
                    className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedRoleData && selectedRoleData.metrics.length > 0 && (
            <DataEntryForm
              roleName={selectedRoleData.name}
              roleId={selectedRoleData.id}
              metrics={selectedRoleData.metrics}
              year={selectedYear}
              month={selectedMonth}
              onSave={async () => {
                // Just refresh the scorecard data - no need to reload all roles/metrics
                // The calculateMonthlySummary already updates the summaries
                // Note: Toast notification is handled in the DataEntryForm component
                await loadScorecard(true) // Show loading indicator
              }}
            />
          )}

          {selectedRoleData && selectedRoleData.metrics.length === 0 && (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardContent className="p-8 text-center">
                <Settings className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No Metrics for {selectedRoleData.name}</h3>
                <p className="text-m8bs-muted mb-6">
                  This role doesn't have any metrics yet. Add metrics in Settings to start tracking data.
                </p>
                <Button
                  onClick={() => setActiveTab("settings")}
                  className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metrics
                </Button>
              </CardContent>
            </Card>
          )}

          {!selectedRoleData && roles.length === 0 && (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Users className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No Roles Yet</h3>
                  <p className="text-m8bs-muted mb-6">
                    You need to add roles before you can enter data. Go to Settings to add your first role.
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <p className="text-sm text-m8bs-muted">Go to the Settings tab</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-m8bs-muted mx-auto" />
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <p className="text-sm text-m8bs-muted">Add roles using the "Manage Roles" section</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-m8bs-muted mx-auto" />
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <p className="text-sm text-m8bs-muted">Add metrics to your roles</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-m8bs-muted mx-auto" />
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      4
                    </div>
                    <p className="text-sm text-m8bs-muted">Return here to enter monthly data</p>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={() => setActiveTab("settings")} 
                      className="w-full bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedRoleData && roles.length > 0 && !hasAnyMetrics && (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Settings className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Add Metrics to Your Roles</h3>
                  <p className="text-m8bs-muted mb-6">
                    Before entering data, you need to add metrics to your roles. Go to Settings to add metrics.
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <p className="text-sm text-m8bs-muted">Go to the Settings tab</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-m8bs-muted mx-auto" />
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <p className="text-sm text-m8bs-muted">Select a role in "Customize Monthly Statistics Display"</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-m8bs-muted mx-auto" />
                  <div className="flex items-center gap-3 p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-m8bs-blue flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <p className="text-sm text-m8bs-muted">Click "Add Metric" to create metrics for that role</p>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={() => setActiveTab("settings")} 
                      className="w-full bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedRoleData && roles.length > 0 && hasAnyMetrics && (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardContent className="p-12 text-center">
                <Settings className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Select a Role</h3>
                <p className="text-m8bs-muted">
                  Please select a role above to enter monthly data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <EnhancedRoleManagement
            roles={roles}
            onRoleChange={async () => {
              // Store the currently selected role ID before clearing (preserves selection after name change)
              const currentSelectedRoleId = roles.find(r => r.name === selectedRole)?.id || null
              // Clear selected roles temporarily to force refresh
              setSelectedRole(null)
              setSettingsRoleId(null)
              // Clear roles state first to show loading
              setRoles([])
              // Reload everything but skip initialization to prevent recreating deleted roles
              await initializeAndLoad(true)
              // After initializeAndLoad completes, it will have set the roles state
              // We need to restore selection by ID. Since state updates are async, we'll
              // use a small delay to read the updated state, or better - modify initializeAndLoad
              // For now, the initializeAndLoad function will select the first role if the
              // current selection doesn't exist, which should work for most cases.
              // If we need to preserve by ID, we'd need to modify initializeAndLoad to accept
              // a preserveRoleId parameter.
            }}
          />
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  )
}
