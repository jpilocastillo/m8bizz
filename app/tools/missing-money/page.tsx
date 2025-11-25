"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MissingMoneyPieChart } from "@/components/missing-money/missing-money-pie-chart"
import { OpportunityCostsChart } from "@/components/missing-money/opportunity-costs-chart"
import { CostAnalysisTable } from "@/components/missing-money/cost-analysis-table"
import { MissingMoneyDataEntry } from "@/components/missing-money/missing-money-data-entry"
import { PDFExport } from "@/components/missing-money/pdf-export"
import { CSVExport } from "@/components/missing-money/csv-export"
import { CumulativeGrowthChart } from "@/components/missing-money/cumulative-growth-chart"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { missingMoneyService } from "@/lib/missing-money"
import { DollarSign, Calculator, TrendingUp, AlertCircle, Lightbulb } from "lucide-react"

export interface CostCenter {
  id: string
  name: string
  current: number
  proposed: number
  color: string
}

export interface MissingMoneyData {
  costCenters: CostCenter[]
  oneYearTotal: number
  fiveYearTotal: number
  tenYearTotal: number
}

// Color palette for cost centers
const costCenterColors = [
  "#16a34a", "#ea580c", "#dc2626", "#9333ea", "#a3a3a3", 
  "#f97316", "#6b7280", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#10b981"
]

export default function MissingMoneyPage() {
  const { user } = useAuth()
  const [data, setData] = useState<MissingMoneyData>({
    costCenters: [],
    oneYearTotal: 0,
    fiveYearTotal: 0,
    tenYearTotal: 0
  })
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch user profile
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

  // Fetch missing money report data
  useEffect(() => {
    async function fetchMissingMoneyData() {
      if (!user) {
        setDataLoading(false)
        return
      }
      setDataLoading(true)
      const result = await missingMoneyService.getMissingMoneyReport()
      if (result.success && result.data) {
        // Use data from database, or empty array if no data exists
        setData(result.data)
      } else {
        // Start with empty cost centers if no data exists
        setData({
          costCenters: [],
          oneYearTotal: 0,
          fiveYearTotal: 0,
          tenYearTotal: 0
        })
      }
      setDataLoading(false)
    }
    fetchMissingMoneyData()
  }, [user])

  // Calculate totals whenever cost centers change
  useEffect(() => {
    const oneYearTotal = data.costCenters.reduce((sum, center) => {
      const difference = center.proposed - center.current
      return sum + difference
    }, 0)
    
    const fiveYearTotal = oneYearTotal * 5
    const tenYearTotal = oneYearTotal * 10

    setData(prev => ({
      ...prev,
      oneYearTotal,
      fiveYearTotal,
      tenYearTotal
    }))
  }, [data.costCenters])

  const handleDataUpdate = async (updatedCostCenters: CostCenter[]) => {
    // Calculate totals before updating
    const oneYearTotal = updatedCostCenters.reduce((sum, center) => {
      const difference = center.proposed - center.current
      return sum + difference
    }, 0)
    
    const fiveYearTotal = oneYearTotal * 5
    const tenYearTotal = oneYearTotal * 10

    const updatedData = {
      costCenters: updatedCostCenters,
      oneYearTotal,
      fiveYearTotal,
      tenYearTotal
    }
    setData(updatedData)
    
    // Save to Supabase
    if (user) {
      setSaving(true)
      const result = await missingMoneyService.saveMissingMoneyReport(updatedData)
      if (!result.success) {
        console.error('Error saving missing money report:', result.error)
      }
      setSaving(false)
    }
  }

  const handleDataSubmit = async () => {
    // Save to Supabase before exiting edit mode
    if (user) {
      setSaving(true)
      const result = await missingMoneyService.saveMissingMoneyReport(data)
      if (!result.success) {
        console.error('Error saving missing money report:', result.error)
      }
      setSaving(false)
    }
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Missing Money Report</h1>
            <p className="text-m8bs-muted mt-1">
              Presented by {profile?.company || "Your Firm"} - Financial Opportunity Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 text-blue-300 border-m8bs-border/50 hover:bg-m8bs-card-alt/50"
          >
            <Calculator className="h-4 w-4" />
            {editMode ? "View Report" : "Edit Data"}
          </Button>
          <CSVExport data={data} profile={profile} />
          <PDFExport data={data} profile={profile} />
        </div>
      </div>

      {editMode ? (
        <MissingMoneyDataEntry 
          data={data}
          onUpdate={handleDataUpdate}
          onSubmit={handleDataSubmit}
        />
      ) : data.costCenters.length === 0 ? (
        <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
          <CardContent className="p-12 text-center">
            <Calculator className="h-16 w-16 text-m8bs-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Cost Centers Added Yet</h3>
            <p className="text-m8bs-muted mb-6">
              Start by adding cost centers to analyze missing money opportunities
            </p>
            <Button 
              onClick={() => setEditMode(true)}
              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Add Cost Centers
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Metrics Card */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white">Summary Metrics</CardTitle>
              <CardDescription className="text-m8bs-muted">
                Key insights and opportunity cost overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                  <div className="text-sm text-m8bs-muted mb-1">1 Year Missing Money</div>
                  <div className={`text-2xl font-bold ${
                    data.oneYearTotal < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.oneYearTotal < 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.abs(data.oneYearTotal))}
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    {data.costCenters.length} cost centers analyzed
                  </div>
                </div>
                <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                  <div className="text-sm text-m8bs-muted mb-1">5 Year Missing Money</div>
                  <div className={`text-2xl font-bold ${
                    data.fiveYearTotal < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.fiveYearTotal < 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.abs(data.fiveYearTotal))}
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    Cumulative over 5 years
                  </div>
                </div>
                <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                  <div className="text-sm text-m8bs-muted mb-1">10 Year Missing Money</div>
                  <div className={`text-2xl font-bold ${
                    data.tenYearTotal < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.tenYearTotal < 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.abs(data.tenYearTotal))}
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    Cumulative over 10 years
                  </div>
                </div>
                <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                  <div className="text-sm text-m8bs-muted mb-1">Average Annual Impact</div>
                  <div className={`text-2xl font-bold ${
                    data.oneYearTotal < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.oneYearTotal < 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.abs(data.costCenters.length > 0 ? data.oneYearTotal / data.costCenters.length : 0))}
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    Per cost center
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white">Missing Money Breakdown</CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Visual breakdown of opportunity costs by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MissingMoneyPieChart data={data} />
              </CardContent>
            </Card>

            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white">1, 5 and 10 Year Opportunity Costs</CardTitle>
                <CardDescription className="text-m8bs-muted">
                  Cumulative missing money over different time horizons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OpportunityCostsChart data={data} />
              </CardContent>
            </Card>
          </div>

          {/* Cumulative Growth Chart */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-m8bs-blue" />
                Cumulative Growth Over Time
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Track how missing money accumulates year over year from 1 to 10 years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CumulativeGrowthChart data={data} />
            </CardContent>
          </Card>

          {/* Cost Analysis Table */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white">Cost Analysis</CardTitle>
              <CardDescription className="text-m8bs-muted">
                Current vs proposed numbers with difference calculations and percentage changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CostAnalysisTable data={data} />
            </CardContent>
          </Card>

          {/* Insights and Recommendations Section */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-m8bs-blue" />
                Key Insights & Recommendations
              </CardTitle>
              <CardDescription className="text-m8bs-muted">
                Analysis of your financial opportunities and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const topOpportunities = data.costCenters
                  .map(center => ({
                    ...center,
                    difference: center.proposed - center.current,
                    absDifference: Math.abs(center.proposed - center.current)
                  }))
                  .filter(center => center.difference !== 0)
                  .sort((a, b) => b.absDifference - a.absDifference)
                  .slice(0, 3)

                const totalCurrent = data.costCenters.reduce((sum, center) => sum + center.current, 0)
                const totalProposed = data.costCenters.reduce((sum, center) => sum + center.proposed, 0)
                // Use data.oneYearTotal for consistency with calculated values
                const totalDifference = data.oneYearTotal
                const percentageChange = totalCurrent !== 0 
                  ? ((totalProposed - totalCurrent) / Math.abs(totalCurrent)) * 100 
                  : 0

                return (
                  <>
                    <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-m8bs-blue" />
                        Overall Impact
                      </h4>
                      <p className="text-sm text-m8bs-muted">
                        By implementing the proposed changes, you could save or recover{' '}
                        <span className="font-semibold text-green-400">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(Math.abs(data.oneYearTotal))}
                        </span>{' '}
                        in the first year alone. Over 10 years, this represents{' '}
                        <span className="font-semibold text-green-400">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(Math.abs(data.tenYearTotal))}
                        </span>{' '}
                        in cumulative opportunity cost.
                      </p>
                    </div>

                    {topOpportunities.length > 0 && (
                      <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-m8bs-blue" />
                          Top Opportunities
                        </h4>
                        <ul className="space-y-2">
                          {topOpportunities.map((center, index) => (
                            <li key={center.id} className="flex items-start gap-2 text-sm">
                              <span className="font-semibold text-m8bs-blue">{index + 1}.</span>
                              <div className="flex-1">
                                <span className="font-medium text-m8bs-muted">{center.name}:</span>{' '}
                                <span className={center.difference < 0 ? 'text-green-400' : 'text-red-400'}>
                                  {center.difference < 0 ? 'Potential savings of' : 'Potential recovery of'}{' '}
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(Math.abs(center.difference))}{' '}
                                  per year
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-m8bs-card-alt p-4 rounded-lg border border-m8bs-border">
                      <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-m8bs-muted">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Review each cost center to understand the specific opportunities for improvement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Prioritize implementation of changes with the highest impact first</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Monitor progress quarterly to track actual savings vs. projected savings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Consider reinvesting recovered funds to maximize long-term growth potential</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 