"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"
import { Target, TrendingUp, DollarSign, Building2, Heart, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface GoalProgressProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function GoalProgress({ businessGoals, currentValues, clientMetrics }: GoalProgressProps) {
  // Calculate goal data - only display goals, no progress calculations
  const businessGoal = businessGoals?.business_goal || 0
  const aumGoal = businessGoals?.aum_goal || 0
  const annuityGoal = businessGoals?.annuity_goal || 0
  const lifeTargetGoal = businessGoals?.life_target_goal || 0

  // Calculate the sum of component goals
  const componentGoalsSum = aumGoal + annuityGoal + lifeTargetGoal
  
  const componentGoals = [
    { 
      name: "AUM Goal", 
      goal: aumGoal, 
      percentage: businessGoals?.aum_goal_percentage || 0,
      color: "#3b82f6",
      gradient: "from-blue-500 to-blue-700",
      icon: Building2,
      description: "Assets Under Management target",
      bgGradient: "from-blue-500/20 to-blue-700/20"
    },
    { 
      name: "Annuity Goal", 
      goal: annuityGoal, 
      percentage: businessGoals?.annuity_goal_percentage || 0,
      color: "#f97316",
      gradient: "from-orange-500 to-orange-700",
      icon: DollarSign,
      description: "Annuity sales target",
      bgGradient: "from-orange-500/20 to-orange-700/20"
    },
    { 
      name: "Life Target Goal", 
      goal: lifeTargetGoal, 
      percentage: businessGoals?.life_target_goal_percentage || 0,
      color: "#a855f7",
      gradient: "from-purple-500 to-purple-700",
      icon: Heart,
      description: "Life insurance production target",
      bgGradient: "from-purple-500/20 to-purple-700/20"
    },
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }

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
  const currentAUM = currentValues?.current_aum || 0
  const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
  const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
  const calculatedClientsNeeded = Math.ceil((E11 + E10) / 2)
  
  // Use the stored clients_needed value from the database, fallback to calculated value
  const clientsNeeded = clientMetrics?.clients_needed || calculatedClientsNeeded

  const clientMetricsData = [
    { metric: "Avg Annuity Size", value: `$${avgAnnuitySize.toLocaleString()}` },
    { metric: "Avg AUM Size", value: `$${avgAUMSize.toLocaleString()}` },
    { metric: "Avg Net Worth Needed", value: `$${avgNetWorthNeeded.toLocaleString()}` },
    { metric: "Appointment Attrition", value: `${appointmentAttrition}%` },
    { metric: "Average Close Ratio", value: `${avgCloseRatio}%` },
    { metric: "# of Annuity Closed", value: annuityClosed.toString() },
    { metric: "# of AUM Accounts", value: aumAccounts.toString() },
    { metric: "Clients Needed", value: clientsNeeded.toString() },
  ]

  // Calculate appointment metrics using proper formulas
  // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
  const annualIdealClosingProspects = avgCloseRatio > 0 
    ? Math.ceil((clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100))
    : Math.ceil(monthlyIdealProspects * 12) // Fallback to stored value

  // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
  const calculatedMonthlyIdealProspects = annualIdealClosingProspects / 12

  // Monthly New Appointments = Monthly Ideal Prospects * 3
  const totalNewMonthlyAppointments = Math.ceil(calculatedMonthlyIdealProspects * 3)
  
  // Annual Total Prospects Necessary = Monthly New Appointments * 12
  const annualTotalProspects = totalNewMonthlyAppointments * 12
  
  // Number of Campaigns Monthly = Total New Monthly Appointments / Appointments Per Campaign
  const numCampaignsMonthly = appointmentsPerCampaign > 0 
    ? Math.ceil(totalNewMonthlyAppointments / appointmentsPerCampaign) 
    : 0

  // Appointment & Prospect Metrics - no duplicates
  const appointmentMetrics = [
    { 
      metric: "Monthly Ideal Prospects", 
      value: Math.ceil(calculatedMonthlyIdealProspects).toString(), 
      metric2: "Total New Monthly Appointments Needed", 
      value2: totalNewMonthlyAppointments.toString() 
    },
    {
      metric: "Annual Ideal Closing Prospects Needed",
      value: annualIdealClosingProspects.toString(),
      metric2: "Annual Total Prospects Necessary",
      value2: annualTotalProspects.toString(),
    },
    { 
      metric: "Appointments Per Campaign", 
      value: Math.ceil(appointmentsPerCampaign).toString(), 
      metric2: "# of Campaigns Monthly", 
      value2: numCampaignsMonthly.toString() 
    },
  ]

  const chartData = componentGoals.map((item) => ({
    name: item.name,
    goal: item.goal,
    color: item.color,
  }))

  return (
    <div className="grid gap-6">
      {/* Main Business Goal Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-lg bg-black border-2 border-m8bs-border p-8"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-m8bs-blue/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-m8bs-purple/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-m8bs-blue to-m8bs-purple shadow-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Your Business Goal</h2>
              <p className="text-m8bs-muted mt-1 text-lg">Your total annual target to achieve</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 rounded-xl p-6 border border-m8bs-border/50">
            <div>
              <p className="text-sm text-m8bs-muted mb-2 uppercase tracking-wide">Total Annual Target</p>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-m8bs-blue via-m8bs-purple to-m8bs-pink bg-clip-text text-transparent tabular-nums">
                {formatCurrency(businessGoal)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-m8bs-muted mb-2">Breakdown</p>
              <div className="space-y-1">
                <div className="text-lg font-semibold text-white">
                  AUM: <span className="text-blue-400">{formatCurrency(aumGoal)}</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  Annuity: <span className="text-orange-400">{formatCurrency(annuityGoal)}</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  Life: <span className="text-purple-400">{formatCurrency(lifeTargetGoal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Component Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-m8bs-border to-transparent"></div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-m8bs-muted" />
            <h3 className="text-xl font-bold text-white">Reach These Targets To Achieve Your Business Goal</h3>
            <Sparkles className="h-5 w-5 text-m8bs-muted" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-m8bs-border to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {componentGoals.map((item, index) => {
            const Icon = item.icon
            const goalPercentage = businessGoal > 0 ? (item.goal / businessGoal) * 100 : 0
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className={`bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl relative group h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${item.gradient} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white text-xs font-bold`}>
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-2 flex-grow">
                      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">{item.name}</h3>
                      <div className="text-3xl font-extrabold text-white tabular-nums">
                        {formatCurrency(item.goal)}
                      </div>
                      <p className="text-xs text-m8bs-muted">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-m8bs-border/50">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-m8bs-muted">Of Business Goal</span>
                        <span className="text-white font-semibold">{goalPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-m8bs-border/30 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${goalPercentage}%` }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-m8bs-muted">
                        Target: ${item.goal.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Sum Verification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-black/20 border border-m8bs-border/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-m8bs-muted">AUM Goal</span>
            <span className="text-white font-semibold">{formatCurrency(aumGoal)}</span>
            <span className="text-m8bs-muted">+</span>
            <span className="text-m8bs-muted">Annuity Goal</span>
            <span className="text-white font-semibold">{formatCurrency(annuityGoal)}</span>
            <span className="text-m8bs-muted">+</span>
            <span className="text-m8bs-muted">Life Goal</span>
            <span className="text-white font-semibold">{formatCurrency(lifeTargetGoal)}</span>
            <span className="text-m8bs-muted">=</span>
            <span className="text-m8bs-muted font-semibold">Business Goal</span>
            <span className="text-white font-bold text-lg">{formatCurrency(businessGoal)}</span>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Client Metrics</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Key Client Performance Indicators</CardDescription>
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

        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Appointment & Prospect Metrics</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Appointment And Prospect Tracking</CardDescription>
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
