"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"

interface GoalProgressProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function GoalProgress({ businessGoals, currentValues, clientMetrics }: GoalProgressProps) {
  // Calculate goal data using real values
  const businessGoal = businessGoals?.business_goal || 0
  const aumGoal = businessGoals?.aum_goal || 0
  const annuityGoal = businessGoals?.annuity_goal || 0
  const lifeTargetGoal = businessGoals?.life_target_goal || 0
  
  const currentAUM = currentValues?.current_aum || 0
  const currentAnnuity = currentValues?.current_annuity || 0
  const currentLifeProduction = currentValues?.current_life_production || 0

  const goalData = [
    { 
      name: "Business Goal", 
      goal: businessGoal, 
      current: businessGoal, 
      progress: 100, 
      color: "#64748b" 
    },
    { 
      name: "AUM Goal", 
      goal: aumGoal, 
      current: currentAUM, 
      progress: aumGoal > 0 ? Math.min(100, (currentAUM / aumGoal) * 100) : 0, 
      color: "#3b82f6" 
    },
    { 
      name: "Annuity Goal", 
      goal: annuityGoal, 
      current: currentAnnuity, 
      progress: annuityGoal > 0 ? Math.min(100, (currentAnnuity / annuityGoal) * 100) : 0, 
      color: "#f97316" 
    },
    { 
      name: "Life Target Goal", 
      goal: lifeTargetGoal, 
      current: currentLifeProduction, 
      progress: lifeTargetGoal > 0 ? Math.min(100, (currentLifeProduction / lifeTargetGoal) * 100) : 0, 
      color: "#a855f7" 
    },
  ]

  // Calculate client metrics using real data
  const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
  const avgAUMSize = clientMetrics?.avg_aum_size || 0
  const avgNetWorthNeeded = clientMetrics?.avg_net_worth_needed || 0
  const appointmentAttrition = clientMetrics?.appointment_attrition || 0
  const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
  const annuityClosed = clientMetrics?.annuity_closed || 0
  const aumAccounts = clientMetrics?.aum_accounts || 0
  const monthlyIdealProspects = clientMetrics?.monthly_ideal_prospects || 0
  const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0

  // Calculate clients needed using formulas
  const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
  const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
  const clientsNeeded = (E11 + E10) / 2

  const clientMetricsData = [
    { metric: "Avg Annuity Size", value: `$${avgAnnuitySize.toLocaleString()}` },
    { metric: "Avg AUM Size", value: `$${avgAUMSize.toLocaleString()}` },
    { metric: "Avg Net Worth Needed", value: `$${avgNetWorthNeeded.toLocaleString()}` },
    { metric: "Appointment Attrition", value: `${appointmentAttrition}%` },
    { metric: "Average Close Ratio", value: `${avgCloseRatio}%` },
    { metric: "# of Annuity Closed", value: annuityClosed.toString() },
    { metric: "# of AUM Accounts", value: aumAccounts.toString() },
    { metric: "Clients Needed", value: clientMetrics?.clients_needed?.toString() || clientsNeeded.toFixed(1) },
  ]

  // Calculate appointment metrics using proper formulas
  // Note: appointmentAttrition and avgCloseRatio are already defined above

  // Calculate proper formulas based on business logic
  // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
  const annualIdealClosingProspects = avgCloseRatio > 0 
    ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
    : monthlyIdealProspects * 12 // Fallback to stored value

  // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
  const calculatedMonthlyIdealProspects = annualIdealClosingProspects / 12

  // Monthly New Appointments = Monthly Ideal Prospects * 3
  const totalNewMonthlyAppointments = calculatedMonthlyIdealProspects * 3
  
  // Annual Total Prospects Necessary = Monthly New Appointments * 12
  const annualTotalProspects = totalNewMonthlyAppointments * 12
  
  const numCampaignsMonthly = appointmentsPerCampaign > 0 ? totalNewMonthlyAppointments / appointmentsPerCampaign : 0 // H8 / H12

  const appointmentMetrics = [
    { metric: "Monthly Ideal Prospects", value: calculatedMonthlyIdealProspects.toFixed(2), metric2: "Total New Monthly Appointments Needed", value2: totalNewMonthlyAppointments.toFixed(2) },
    {
      metric: "Annual Ideal Closing Prospects Needed",
      value: annualIdealClosingProspects.toFixed(2),
      metric2: "Annual Total Prospects Necessary",
      value2: annualTotalProspects.toFixed(2),
    },
    { metric: "Appointments Per Campaign", value: appointmentsPerCampaign.toFixed(2), metric2: "# of Campaigns Monthly", value2: numCampaignsMonthly.toFixed(2) },
    { metric: "Total New Monthly Appointments", value: totalNewMonthlyAppointments.toFixed(2), metric2: "Annual Total Prospects Necessary", value2: annualTotalProspects.toFixed(2) },
  ]

  const chartData = goalData.map((item) => ({
    name: item.name,
    goal: item.goal,
    current: item.current,
    color: item.color,
  }))

  return (
    <div className="grid gap-6">

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>Progress Towards Business Goals Using Your Actual Data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>${item.goal.toLocaleString()}</TableCell>
                      <TableCell>${item.current.toLocaleString()}</TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground w-12">{item.progress.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Client Metrics</CardTitle>
            <CardDescription>Key Client Performance Indicators</CardDescription>
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
                {clientMetricsData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.metric}</TableCell>
                    <TableCell>{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Appointment & Prospect Metrics</CardTitle>
            <CardDescription>Appointment And Prospect Tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentMetrics.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.metric}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell className="font-medium">{item.metric2}</TableCell>
                    <TableCell className={item.metric2 === "Annual Total Prospects Necessary" ? "text-red-500 font-bold" : ""}>
                      {item.value2}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
