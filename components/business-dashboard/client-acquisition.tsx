"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdvisorBasecampData, MarketingCampaign, ClientMetrics } from "@/lib/advisor-basecamp"
import { useMemo } from "react"
import { Users, Target, Calendar } from "lucide-react"

interface ClientAcquisitionProps {
  data?: AdvisorBasecampData
  businessGoals?: any
  commissionRates?: any
  monthlyDataEntries?: any[]
  selectedYear?: string
}

const colors = ["#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#64748b", "#22c55e", "#eab308", "#ec4899"]

export function ClientAcquisition({ data, businessGoals, commissionRates, monthlyDataEntries = [], selectedYear }: ClientAcquisitionProps) {
  const campaigns = data?.campaigns || []
  const clientMetrics = data?.clientMetrics
  const currentYear = selectedYear || new Date().getFullYear().toString()

  // Calculate metrics from campaign data (campaigns represent annual goals directly)
  const calculatedMetrics = useMemo(() => {
    // Get client metrics values
    const appointmentAttrition = clientMetrics?.appointment_attrition || 0
    const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
    const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0

    // Campaigns store monthly values - need to convert to annual for totals
    const totalLeads = campaigns.reduce((sum, campaign) => sum + (campaign.leads || 0), 0) * 12
    const totalEvents = campaigns.reduce((sum, campaign) => sum + (campaign.events || 0), 0) * 12
    const monthlyBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)
    const totalBudget = monthlyBudget * 12 // Annual budget
    
    // Calculate appointments from campaigns (annual)
    const totalAppointments = appointmentsPerCampaign > 0 
      ? totalEvents * appointmentsPerCampaign
      : Math.round(totalLeads * 0.4) // Fallback: assume 40% of leads become appointments
    
    // Calculate clients from prospects and close ratio
    const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
    const totalClients = Math.round(totalProspects * (avgCloseRatio / 100))

    // Calculate costs
    const costPerLead = totalLeads > 0 ? totalBudget / totalLeads : 0
    const costPerClient = totalClients > 0 ? totalBudget / totalClients : 0

    // Calculate avgClientValue for use in calculations
    const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = clientMetrics?.avg_aum_size || 0
    const avgClientValue = (avgAnnuitySize + avgAUMSize) / 2
    
    // Calculate ROI using the same formula as marketing ROI in income-breakdown
    // Marketing ROI = ((marketingIncome - marketingExpenses) / marketingExpenses) * 100
    // Marketing income = annuity income + AUM income + life income + planning fees
    // Exclude trail income as it's from existing clients, not marketing
    
    let marketingIncome = 0
    let roi = 0
    
    if (businessGoals && commissionRates && clientMetrics) {
      // Calculate goal amounts
      const businessGoalAmount = businessGoals.business_goal || 0
      const aumGoalAmount = (businessGoalAmount * (businessGoals.aum_goal_percentage || 0)) / 100
      const annuityGoalAmount = (businessGoalAmount * (businessGoals.annuity_goal_percentage || 0)) / 100
      const lifeTargetGoalAmount = (businessGoalAmount * (businessGoals.life_target_goal_percentage || 0)) / 100
      
      // Calculate income from commissions
      const annuityIncome = (annuityGoalAmount * (commissionRates.annuity_commission || 0)) / 100
      const aumIncome = (aumGoalAmount * (commissionRates.aum_commission || 0)) / 100
      const lifeIncome = (lifeTargetGoalAmount * (commissionRates.life_commission || 0)) / 100
      
      // Calculate planning fees
      const clientsNeeded = Math.round(((clientMetrics.annuity_closed || 0) + (clientMetrics.aum_accounts || 0)) / 2)
      const planningFeesValue = (commissionRates.planning_fee_rate || 0) * clientsNeeded
      
      // Marketing income excludes trail income (from existing clients)
      marketingIncome = annuityIncome + aumIncome + lifeIncome + planningFeesValue
      
      // Use actual campaign budget as marketing expenses (annual)
      const marketingExpenses = totalBudget
      
      // Calculate marketing ROI
      roi = marketingExpenses > 0 
        ? Math.round(((marketingIncome - marketingExpenses) / marketingExpenses) * 100 * 10) / 10
        : marketingIncome > 0 
          ? 9999 // Show high ROI when there's income but no expenses
          : 0
    } else {
      // Fallback to simple calculation if data not available
      const totalRevenue = totalClients * avgClientValue
      roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0
    }

    // Calculate client lifetime value (simplified)
    const clientLifetimeValue = avgClientValue

    return {
      totalLeads,
      totalAppointments,
      totalProspects,
      totalClients,
      totalBudget,
      costPerLead,
      costPerClient,
      clientLifetimeValue,
      roi,
      appointmentAttrition,
      avgCloseRatio,
    }
  }, [campaigns, clientMetrics])

  // Annual client acquisition goals data - using same calculations as DashboardMetrics
  const annualGoalsData = useMemo(() => {
    if (!data?.currentValues || !data?.clientMetrics) {
      return []
    }

    const currentValues = data.currentValues
    const clientMetrics = data.clientMetrics

    // Calculate clients needed using same formula as DashboardMetrics: (E11 + E10) / 2
    const currentAUM = currentValues.current_aum || 0
    const currentAnnuity = currentValues.current_annuity || 0
    const avgAnnuitySize = clientMetrics.avg_annuity_size || 0
    const avgAUMSize = clientMetrics.avg_aum_size || 0
    const annuityClosed = clientMetrics.annuity_closed || 0
    
    const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
    const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
    const calculatedClientsNeeded = Math.ceil((E11 + E10) / 2)
    
    // Use the stored clients_needed value from the database, fallback to calculated value
    const clientsNeeded = clientMetrics.clients_needed || calculatedClientsNeeded

    // Get additional metrics needed for proper calculations
    const appointmentAttrition = clientMetrics.appointment_attrition || 0
    const avgCloseRatio = clientMetrics.avg_close_ratio || 0
    const monthlyIdealProspects = clientMetrics.monthly_ideal_prospects || 0

    // Calculate proper formulas based on business logic (same as DashboardMetrics)
    // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
    const annualIdealClosingProspects = avgCloseRatio > 0 
      ? Math.ceil((clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100))
      : Math.ceil(monthlyIdealProspects * 12) // Fallback to stored value

    // Monthly Ideal Prospects = Annual Closing Prospects / 12
    const calculatedMonthlyIdealProspects = annualIdealClosingProspects / 12

    // Monthly New Appointments = Monthly Ideal Prospects * 3
    const monthlyNewAppointmentsNeeded = Math.ceil(calculatedMonthlyIdealProspects * 3)
    
    // Annual Total Prospects Necessary = Monthly New Appointments * 12
    const annualTotalProspectsNecessary = monthlyNewAppointmentsNeeded * 12
    
    return [
      { name: "Clients Needed", value: clientsNeeded, color: "#ef4444" },
      { name: "Monthly New Appointments Needed", value: monthlyNewAppointmentsNeeded, color: "#3b82f6" },
      { name: "Annual Ideal Closing Prospects Needed", value: annualIdealClosingProspects, color: "#22c55e" },
      { name: "Annual Total Prospects Necessary", value: annualTotalProspectsNecessary, color: "#8b5cf6" },
    ]
  }, [data?.currentValues, data?.clientMetrics])

  // Lead source data from campaigns (campaigns represent annual goals directly)
  const leadSourceData = useMemo(() => {
    if (campaigns.length === 0) {
      return [
        { name: "No Campaigns", value: 1, color: "#64748b" },
      ]
    }

    return campaigns.map((campaign, index) => ({
      name: campaign.name || `Campaign ${index + 1}`,
      value: campaign.leads || 0, // Annual leads goal (campaigns are annual)
      monthlyValue: Math.round((campaign.leads || 0) / 12), // Monthly average
      color: colors[index % colors.length],
    }))
  }, [campaigns])
  
  // Campaign performance data for bar chart (campaigns represent annual goals directly)
  const campaignPerformanceData = useMemo(() => {
    if (campaigns.length === 0) return []
    
    const appointmentAttrition = clientMetrics?.appointment_attrition || 0
    const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
    const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0
    
    return campaigns.map((campaign, index) => {
      // Campaigns represent annual goals directly
      const annualLeads = campaign.leads || 0
      const annualEvents = campaign.events || 0
      const annualBudget = campaign.budget || 0
      
      // Calculate appointments, prospects, and clients
      const annualAppointments = appointmentsPerCampaign > 0 
        ? annualEvents * appointmentsPerCampaign
        : Math.round(annualLeads * 0.4)
      const annualProspects = Math.round(annualAppointments * (1 - appointmentAttrition / 100))
      const annualClients = Math.round(annualProspects * (avgCloseRatio / 100))
      
      return {
        name: campaign.name || `Campaign ${index + 1}`,
        leads: annualLeads,
        appointments: annualAppointments,
        prospects: annualProspects,
        clients: annualClients,
        budget: annualBudget,
        color: colors[index % colors.length],
      }
    })
  }, [campaigns, clientMetrics])

  // Client acquisition metrics
  const acquisitionMetrics = [
    { metric: "Average Close Ratio", value: `${calculatedMetrics.avgCloseRatio.toFixed(1)}%` },
    { metric: "Appointment Attrition", value: `${calculatedMetrics.appointmentAttrition.toFixed(1)}%` },
    { metric: "Cost Per Lead", value: `$${calculatedMetrics.costPerLead.toFixed(2)}` },
    { metric: "Cost Per Client", value: `$${calculatedMetrics.costPerClient.toFixed(2)}` },
    { metric: "ROI", value: `${calculatedMetrics.roi.toFixed(1)}%` },
  ]

  // Get color config matching DashboardMetrics style
  const getColorConfig = (color: string) => {
    const colorMap: { [key: string]: { bgColor: string; iconColor: string } } = {
      red: {
        bgColor: "bg-red-500/20",
        iconColor: "text-red-500",
      },
      purple: {
        bgColor: "bg-purple-500/20",
        iconColor: "text-purple-500",
      },
      blue: {
        bgColor: "bg-m8bs-card-alt",
        iconColor: "text-m8bs-blue",
      },
      yellow: {
        bgColor: "bg-yellow-500/20",
        iconColor: "text-yellow-500",
      },
      green: {
        bgColor: "bg-green-500/20",
        iconColor: "text-green-500",
      },
    }
    return colorMap[color] || {
      bgColor: "bg-gray-500/20",
      iconColor: "text-gray-500",
    }
  }

  return (
    <div className="grid gap-6">
      {/* Goals Highlight - Card Grid */}
      <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight">Annual Goals - {currentYear}</CardTitle>
          <CardDescription className="text-m8bs-muted mt-2">Key Annual Goals Based On Campaign Data</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {annualGoalsData.map((goal, index) => {
              const icons = [Users, Calendar, Target, Target]
              const Icon = icons[index] || Target
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-m8bs-border bg-m8bs-card-alt/30 transition-all duration-300 hover:bg-m8bs-card-alt/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: goal.color }} />
                    </div>
                    <h3 className="text-sm font-semibold text-white/90">{goal.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-extrabold"
                      style={{ color: goal.color }}
                    >
                      {goal.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lead Sources - Cards */}
      <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight">Lead Sources - {currentYear}</CardTitle>
          <CardDescription className="text-m8bs-muted mt-2">Campaign Lead Generation Goals</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadSourceData.map((source, index) => {
              const totalLeads = leadSourceData.reduce((sum, s) => sum + s.value, 0)
              const percentage = totalLeads > 0 ? (source.value / totalLeads) * 100 : 0
              const monthlyValue = 'monthlyValue' in source ? source.monthlyValue : Math.round(source.value / 12)
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-m8bs-border bg-m8bs-card-alt/30 transition-all duration-300 hover:bg-m8bs-card-alt/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: source.color }}
                    />
                    <h3 className="text-sm font-semibold text-white/90 truncate">{source.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-extrabold"
                        style={{ color: source.color }}
                      >
                        {source.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-white/60">leads</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{monthlyValue.toLocaleString()}/month</span>
                      <span>•</span>
                      <span>{percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Acquisition Metrics</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Key Performance Indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acquisitionMetrics.map((item, index) => {
                  const isROI = item.metric === "ROI"
                  const isPositive = isROI && parseFloat(item.value) >= 0
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.metric}</TableCell>
                      <TableCell className={isROI ? (isPositive ? "text-green-400" : "text-red-400") : ""}>
                        {item.value}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Campaign Summary Card */}
        {campaigns.length > 0 && (
          <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
              <CardTitle className="text-xl font-extrabold text-white tracking-tight">Campaign Summary - {currentYear}</CardTitle>
              <CardDescription className="text-m8bs-muted mt-2">Total Annual Campaign Goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Annual Leads</TableCell>
                    <TableCell className="text-blue-400 font-semibold">{calculatedMetrics.totalLeads.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Annual Appointments</TableCell>
                    <TableCell className="text-purple-400 font-semibold">{calculatedMetrics.totalAppointments.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Annual Prospects</TableCell>
                    <TableCell className="text-orange-400 font-semibold">{calculatedMetrics.totalProspects.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Annual Clients</TableCell>
                    <TableCell className="text-red-400 font-semibold">{calculatedMetrics.totalClients.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Annual Budget</TableCell>
                    <TableCell className="font-semibold">${calculatedMetrics.totalBudget.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
