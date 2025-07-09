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

  const clientMetricsData = [
    { metric: "Avg Annuity Size", value: `$${avgAnnuitySize.toLocaleString()}` },
    { metric: "Avg AUM Size", value: `$${avgAUMSize.toLocaleString()}` },
    { metric: "Avg Net Worth Needed", value: `$${avgNetWorthNeeded.toLocaleString()}` },
    { metric: "Appointment Attrition", value: `${appointmentAttrition}%` },
    { metric: "Average Close Ratio", value: `${avgCloseRatio}%` },
    { metric: "# of Annuity Closed", value: annuityClosed.toString() },
    { metric: "# of AUM Accounts", value: aumAccounts.toString() },
  ]

  // Calculate appointment metrics using formulas
  const totalNewMonthlyAppointments = monthlyIdealProspects * 3 // H8 = H6 * 3
  const numCampaignsMonthly = appointmentsPerCampaign > 0 ? totalNewMonthlyAppointments / appointmentsPerCampaign : 0 // H8 / H12

  // Calculate clients needed using formulas
  const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
  const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
  const clientsNeeded = (E11 + E10) / 2

  const appointmentMetrics = [
    { metric: "Monthly Ideal Prospects", value: monthlyIdealProspects.toString(), metric2: "Total New Monthly Appointments Needed", value2: totalNewMonthlyAppointments.toString() },
    {
      metric: "Annual Ideal Closing Prospects Needed",
      value: (monthlyIdealProspects * 12).toString(),
      metric2: "Annual Total Prospects Necessary",
      value2: (totalNewMonthlyAppointments * 12).toString(),
    },
    { metric: "Appointments Per Campaign", value: appointmentsPerCampaign.toString(), metric2: "# of Campaigns Monthly", value2: numCampaignsMonthly.toFixed(1) },
    { metric: "Total New Monthly Appointments", value: totalNewMonthlyAppointments.toString(), metric2: "Clients Needed", value2: clientsNeeded.toFixed(1) },
  ]

  const chartData = goalData.map((item) => ({
    name: item.name,
    goal: item.goal,
    current: item.current,
    color: item.color,
  }))

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>Progress towards business goals using your actual data</CardDescription>
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
        </TabsContent>
        <TabsContent value="chart">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Goal Progress Visualization</CardTitle>
              <CardDescription>Visual comparison of goals vs current values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000000}M`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                        undefined
                      ]}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '6px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar name="Goal" dataKey="goal" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar name="Current" dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Client Metrics</CardTitle>
            <CardDescription>Key client performance indicators</CardDescription>
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
            <CardDescription>Appointment and prospect tracking</CardDescription>
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
                    <TableCell className={item.metric2 === "Clients Needed" ? "text-red-500 font-bold" : ""}>
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
