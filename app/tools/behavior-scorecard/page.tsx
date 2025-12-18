"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Calendar, BarChart3, Settings, Download, RefreshCw, Users, Plus, CheckCircle2, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { behaviorScorecardService, type MonthlyScorecardData, type ScorecardRole, type ScorecardMetric, type PeriodType } from "@/lib/behavior-scorecard"
import { WeeklyDataEntry } from "@/components/behavior-scorecard/weekly-data-entry"
import { DataEntryForm } from "@/components/behavior-scorecard/data-entry-form"
import { ScorecardDisplay } from "@/components/behavior-scorecard/scorecard-display"
import { CompanySummary } from "@/components/behavior-scorecard/company-summary"
import { CSVExport } from "@/components/behavior-scorecard/csv-export"
import { PDFExport } from "@/components/behavior-scorecard/pdf-export"
import { MetricVisibilitySettings } from "@/components/behavior-scorecard/metric-visibility-settings"
import { RoleManagement } from "@/components/behavior-scorecard/role-management"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function BehaviorScorecardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
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

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const supabase = createClient()
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)
    }
    fetchProfile()
  }, [user])

  // Initialize scorecard and load data
  useEffect(() => {
    if (user) {
      initializeAndLoad()
    } else {
      setLoading(false)
    }
  }, [user])

  // Reload scorecard when period changes
  useEffect(() => {
    if (user && roles.length > 0) {
      loadScorecard()
    }
  }, [periodType, selectedMonth, selectedQuarter, selectedYear])

  const initializeAndLoad = async () => {
    setLoading(true)
    try {
      // Initialize scorecard if needed
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
      }

      // Load roles and metrics
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

      const { data: rolesData } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', authUser.id)
        .order('role_name', { ascending: true })

      if (rolesData) {
        const rolesWithMetrics: Array<{ id: string; name: ScorecardRole; metrics: ScorecardMetric[] }> = []
        
        for (const role of rolesData) {
          const metricsResult = await behaviorScorecardService.getRoleMetrics(role.id)
          if (metricsResult.success && metricsResult.data) {
            rolesWithMetrics.push({
              id: role.id,
              name: role.role_name as ScorecardRole,
              metrics: metricsResult.data,
            })
          }
        }

        setRoles(rolesWithMetrics)
        if (rolesWithMetrics.length > 0 && !selectedRole) {
          setSelectedRole(rolesWithMetrics[0].name)
        }
      }

      // Load scorecard
      await loadScorecard()
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

  const loadScorecard = async () => {
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
    }
  }

  const handleCalculateSummary = async () => {
    setInitializing(true)
    try {
      // For month view, calculate monthly summary
      if (periodType === 'month') {
        const result = await behaviorScorecardService.calculateMonthlySummary(selectedMonth, selectedYear)
        if (result.success) {
          await loadScorecard()
          toast({
            title: "Summary calculated",
            description: "Monthly summary has been calculated successfully.",
          })
        } else {
          toast({
            title: "Error calculating summary",
            description: result.error || "Failed to calculate summary",
            variant: "destructive",
          })
        }
      } else {
        // For quarter/year, just reload the aggregated data
        await loadScorecard()
        toast({
          title: "Data loaded",
          description: `${periodType === 'quarter' ? 'Quarterly' : 'Yearly'} data has been loaded.`,
        })
      }
    } catch (error) {
      console.error('Error calculating summary:', error)
      toast({
        title: "Error",
        description: "Failed to calculate summary",
        variant: "destructive",
      })
    } finally {
      setInitializing(false)
    }
  }

  const selectedRoleData = roles.find(r => r.name === selectedRole)

  // Helper function to check if user has any data
  const hasData = () => {
    if (!scorecardData) return false
    if (scorecardData.roleScorecards.length === 0) return false
    // Check if any role has metrics with actual values
    return scorecardData.roleScorecards.some(role => 
      role.metrics.some(metric => metric.actualValue > 0)
    )
  }

  // Helper function to check if roles have metrics
  const rolesHaveMetrics = () => {
    return roles.length > 0 && roles.some(role => role.metrics.length > 0)
  }

  // Helper function to check if any role has metrics
  const hasAnyMetrics = () => {
    return roles.some(role => role.metrics.length > 0)
  }

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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <Calculator className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Behavior Scorecard</h1>
            <p className="text-m8bs-muted mt-1">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Behavior Scorecard</h1>
            <p className="text-m8bs-muted mt-1">
              Track and analyze business behaviors and performance indicators
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodType} onValueChange={(v) => {
            setPeriodType(v as PeriodType)
            setTimeout(() => loadScorecard(), 100)
          }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          {periodType === 'month' && (
            <Select value={selectedMonth.toString()} onValueChange={(v) => {
              setSelectedMonth(parseInt(v))
              setTimeout(() => loadScorecard(), 100)
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
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
            <Select value={selectedQuarter.toString()} onValueChange={(v) => {
              setSelectedQuarter(parseInt(v))
              setTimeout(() => loadScorecard(), 100)
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Select value={selectedYear.toString()} onValueChange={(v) => {
            setSelectedYear(parseInt(v))
            setTimeout(() => loadScorecard(), 100)
          }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleCalculateSummary}
            disabled={initializing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
            {periodType === 'month' ? 'Calculate' : 'Refresh'}
          </Button>
          {scorecardData && (
            <>
              <CSVExport data={scorecardData} profile={profile} />
              <PDFExport data={scorecardData} profile={profile} />
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "view" | "entry" | "settings")} className="space-y-4">
        <TabsList className="bg-m8bs-card p-1 border border-m8bs-border rounded-lg shadow-lg grid w-full grid-cols-3">
          <TabsTrigger value="view" className="flex items-center gap-2 data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70 data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            <BarChart3 className="h-4 w-4" />
            View Scorecard
          </TabsTrigger>
          <TabsTrigger value="entry" className="flex items-center gap-2 data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70 data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            <Calendar className="h-4 w-4" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70 data-[state=active]:shadow-md py-2 text-sm font-medium transition-all">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          {scorecardData && scorecardData.companySummary && (
            <>
              <CompanySummary companySummary={scorecardData.companySummary} />
              
              <div className="grid gap-6 md:grid-cols-2">
                {scorecardData.roleScorecards.map((roleScorecard) => (
                  <ScorecardDisplay key={roleScorecard.roleId} roleScorecard={roleScorecard} />
                ))}
              </div>
            </>
          )}

          {(!hasData()) && (
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
                  {roles.length > 0 && !hasAnyMetrics() ? (
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
                  ) : roles.length > 0 && hasAnyMetrics() ? (
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
                  {rolesHaveMetrics() ? (
                    <div className="flex items-start gap-4 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-m8bs-blue flex items-center justify-center text-white font-bold">
                        {roles.length === 0 ? '1' : hasAnyMetrics() ? '3' : '2'}
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
                  {hasData() ? (
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

        <TabsContent value="entry" className="space-y-4">
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-m8bs-blue" />
                Select Role for Data Entry
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Choose a role to enter monthly data for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.name ? "default" : "outline"}
                    onClick={() => setSelectedRole(role.name)}
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <span className="font-semibold">{role.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.metrics.length} metrics
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedRoleData && (
            <DataEntryForm
              roleName={selectedRoleData.name}
              roleId={selectedRoleData.id}
              metrics={selectedRoleData.metrics}
              year={selectedYear}
              month={selectedMonth}
              onSave={async () => {
                // Reload roles and metrics to get updated goal values
                await initializeAndLoad()
                await loadScorecard()
                toast({
                  title: "Data saved",
                  description: "Goals and monthly data have been saved and summary calculated.",
                })
              }}
            />
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

          {!selectedRoleData && roles.length > 0 && !hasAnyMetrics() && (
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

          {!selectedRoleData && roles.length > 0 && hasAnyMetrics() && (
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

        <TabsContent value="settings" className="space-y-4">
          <RoleManagement
            roles={roles}
            onRoleChange={async () => {
              await initializeAndLoad()
            }}
          />

          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-m8bs-blue" />
                Customize Monthly Statistics Display
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Select which metrics to display for each role in the monthly statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={settingsRoleId === role.id ? "default" : "outline"}
                    onClick={() => setSettingsRoleId(role.id)}
                    className="h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <span className="font-semibold">{role.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.metrics.length} metrics
                    </span>
                  </Button>
                ))}
              </div>

              {settingsRoleId && (
                <MetricVisibilitySettings
                  roleId={settingsRoleId}
                  roleName={roles.find(r => r.id === settingsRoleId)?.name || 'Marketing Position'}
                  onSave={async () => {
                    // Reload scorecard data to reflect visibility changes
                    await loadScorecard()
                    toast({
                      title: "Settings updated",
                      description: "The scorecard display has been updated with your new visibility settings.",
                    })
                  }}
                />
              )}

              {!settingsRoleId && (
                <Card className="bg-m8bs-card-alt border-m8bs-border shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Settings className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Select a Role</h3>
                    <p className="text-m8bs-muted">
                      Please select a role above to customize its monthly statistics display.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
