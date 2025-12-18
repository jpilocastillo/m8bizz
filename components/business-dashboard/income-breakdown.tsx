"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessGoals, CurrentValues, ClientMetrics, CommissionRates, MarketingCampaign } from "@/lib/advisor-basecamp"
import { formatCurrency } from "@/lib/utils"

interface IncomeBreakdownProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
  commissionRates?: CommissionRates | null
  campaigns?: MarketingCampaign[]
}

export function IncomeBreakdown({ 
  businessGoals, 
  currentValues, 
  clientMetrics, 
  commissionRates,
  campaigns = []
}: IncomeBreakdownProps) {
  // Show loading state if data is not available
  if (!businessGoals || !currentValues || !clientMetrics || !commissionRates) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-none">
          <CardHeader>
            <CardTitle className="text-white">Income Breakdown</CardTitle>
            <CardDescription className="text-gray-300">Loading income data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate income values from business data
  const calculateIncomeData = () => {
    if (!businessGoals || !currentValues || !clientMetrics || !commissionRates) {
      return {
        incomeData: [],
        totalIncome: 0,
        totalAnnualIncome: 0,
        marketingROI: 0,
        totalMarketingExpenses: 0,
        totalOperationalExpenses: 0
      }
    }

    // Calculate goal amounts
    const businessGoalAmount = businessGoals.business_goal || 0
    const aumGoalAmount = (businessGoalAmount * (businessGoals.aum_goal_percentage || 0)) / 100
    const annuityGoalAmount = (businessGoalAmount * (businessGoals.annuity_goal_percentage || 0)) / 100
    const lifeTargetGoalAmount = (businessGoalAmount * (businessGoals.life_target_goal_percentage || 0)) / 100

    // Calculate income values
    const annuityIncome = (annuityGoalAmount * (commissionRates.annuity_commission || 0)) / 100
    const aumIncome = (aumGoalAmount * (commissionRates.aum_commission || 0)) / 100
    const lifeIncome = (lifeTargetGoalAmount * (commissionRates.life_commission || 0)) / 100
    const trailIncome = ((currentValues.current_aum || 0) * (commissionRates.trail_income_percentage || 0)) / 100
    
    // Calculate planning fees
    const clientsNeeded = Math.round(((clientMetrics.annuity_closed || 0) + (clientMetrics.aum_accounts || 0)) / 2)
    const planningFeesValue = (commissionRates.planning_fee_rate || 0) * clientsNeeded

    const incomeData = [
      { 
        source: `Planning Fees (@ $${(commissionRates.planning_fee_rate || 0).toLocaleString()})`, 
        amount: planningFeesValue, 
        commission: "-", 
        color: "#64748b" 
      },
      { 
        source: "Annuity", 
        amount: annuityIncome, 
        commission: `${commissionRates.annuity_commission || 0}%`, 
        color: "#3b82f6" 
      },
      { 
        source: "AUM", 
        amount: aumIncome, 
        color: "#f97316" 
      },
      { 
        source: "Life Production", 
        amount: lifeIncome, 
        commission: `${commissionRates.life_commission || 0}%`, 
        color: "#a855f7" 
      },
      { 
        source: "Trail Income", 
        amount: trailIncome, 
        commission: `${commissionRates.trail_income_percentage || 0}%`, 
        color: "#10b981" 
      },
    ]

    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
    const totalAnnualIncome = totalIncome // This represents annual income from goals
    
    // Calculate marketing expenses from campaigns
    // Campaigns store monthly budget, so multiply by 12 for annual
    const totalMarketingExpenses = campaigns.reduce((sum, campaign) => {
      const frequency = (campaign as any).frequency || "Monthly"
      const multiplier = frequency === "Monthly" ? 12 : frequency === "Quarterly" ? 4 : frequency === "Semi-Annual" ? 2 : 1
      const foodCosts = (campaign as any).food_costs || 0
      return sum + ((campaign.budget || 0) * multiplier) + (foodCosts * multiplier)
    }, 0)
    
    // Calculate operational expenses (if not available in data, set to 0)
    // This should come from business data form if needed, for now set to 0
    const totalOperationalExpenses = 0
    
    // Calculate Marketing ROI from actual campaign data
    // ROI = ((Revenue - Marketing Costs) / Marketing Costs) * 100
    // Revenue is calculated from clients acquired through campaigns
    const appointmentAttrition = clientMetrics.appointment_attrition || 0
    const avgCloseRatio = clientMetrics.avg_close_ratio || 0
    const appointmentsPerCampaign = clientMetrics.appointments_per_campaign || 0
    const avgAnnuitySize = clientMetrics.avg_annuity_size || 0
    const avgAUMSize = clientMetrics.avg_aum_size || 0
    const avgClientValue = (avgAnnuitySize + avgAUMSize) / 2
    
    // Calculate total events, leads, and appointments from campaigns
    let totalEvents = 0
    let totalLeads = 0
    
    campaigns.forEach(campaign => {
      const frequency = (campaign as any).frequency || "Monthly"
      const multiplier = frequency === "Monthly" ? 12 : frequency === "Quarterly" ? 4 : frequency === "Semi-Annual" ? 2 : 1
      totalEvents += (campaign.events || 0) * multiplier
      totalLeads += (campaign.leads || 0) * multiplier
    })
    
    // Calculate clients from campaigns
    const totalAppointments = appointmentsPerCampaign > 0 
      ? totalEvents * appointmentsPerCampaign
      : Math.round(totalLeads * 0.4) // Fallback: 40% of leads become appointments
    
    const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
    const totalClients = Math.round(totalProspects * (avgCloseRatio / 100))
    const campaignRevenue = totalClients * avgClientValue
    
    // Calculate ROI
    const marketingROI = totalMarketingExpenses > 0 
      ? ((campaignRevenue - totalMarketingExpenses) / totalMarketingExpenses) * 100
      : 0

    return {
      incomeData,
      totalIncome,
      totalAnnualIncome,
      marketingROI,
      totalMarketingExpenses,
      totalOperationalExpenses
    }
  }

  const { incomeData, totalIncome, totalAnnualIncome, marketingROI, totalMarketingExpenses, totalOperationalExpenses } = calculateIncomeData()
  const totalExpenses = totalMarketingExpenses + totalOperationalExpenses

  const chartData = incomeData.map((item) => ({
    name: item.source,
    value: item.amount,
    color: item.color,
  }))

  // Monthly income data - using calculated values for projections
  const monthlyIncomeData = [
    { name: "Jan", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Feb", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Mar", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Apr", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "May", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Jun", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Jul", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Aug", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Sep", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Oct", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Nov", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
    { name: "Dec", annuity: (incomeData[1]?.amount || 0) / 12, aum: (incomeData[2]?.amount || 0) / 12, life: (incomeData[3]?.amount || 0) / 12, fees: (incomeData[0]?.amount || 0) / 12 },
  ]

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="bg-gray-800/50 p-1 border border-gray-700/50 rounded-lg shadow-lg grid w-full grid-cols-2">
          <TabsTrigger 
            value="table" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white/70"
          >
            Table View
          </TabsTrigger>
          <TabsTrigger 
            value="chart" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white/70"
          >
            Chart View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Income Details</CardTitle>
              <CardDescription>Breakdown of income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Income Source</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.source}</TableCell>
                      <TableCell>${item.amount.toLocaleString()}</TableCell>
                      <TableCell>{item.commission}</TableCell>
                      <TableCell>{((item.amount / totalIncome) * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell>${totalIncome.toLocaleString()}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>100%</TableCell>
                  </TableRow>
                <TableRow>
                  <TableCell>Marketing ROI</TableCell>
                  <TableCell colSpan={3}>{marketingROI.toFixed(1)}%</TableCell>
                </TableRow>
                  <TableRow>
                    <TableCell>Total Annual Income</TableCell>
                    <TableCell colSpan={3}>${totalAnnualIncome.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
              <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income Distribution</CardTitle>
              <CardDescription className="text-m8bs-muted mt-2">Percentage Breakdown By Source</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Chart Section */}
                <div className="h-[450px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {chartData.map((entry, index) => {
                          const baseColor = entry.color || '#64748b';
                          const gradientId = `gradient-${index}`;
                          return (
                            <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={0.75} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={110}
                        outerRadius={170}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          const percentValue = (percent * 100).toFixed(1);
                          
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#ffffff"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={14}
                              fontWeight={800}
                              style={{
                                textShadow: '0 2px 6px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              {percentValue}%
                            </text>
                          );
                        }}
                        labelLine={false}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {chartData.map((entry, index) => {
                          const baseColor = entry.color || '#64748b';
                          const gradientId = `gradient-${index}`;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#${gradientId})`}
                              stroke="#1f2937" 
                              strokeWidth={3}
                              style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                              }}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Total Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2 font-semibold">Total Income</div>
                      <div className="text-3xl font-black text-green-400" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.3)' }}>
                        {formatCurrency(totalIncome)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Legend Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  {chartData.map((entry, index) => {
                    const percent = ((entry.value / totalIncome) * 100).toFixed(1);
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div 
                            className="w-5 h-5 rounded-full flex-shrink-0 shadow-lg"
                            style={{ 
                              backgroundColor: entry.color,
                              boxShadow: `0 0 10px ${entry.color}60`
                            }}
                          />
                          <span className="text-sm font-semibold text-white truncate">
                            {entry.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                          <span 
                            className="text-base font-bold"
                            style={{ color: entry.color }}
                          >
                            {percent}%
                          </span>
                          <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                            {formatCurrency(entry.value)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Income Projections</CardTitle>
            <CardDescription>Projected income for next year</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Income Source</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Projected</TableHead>
                  <TableHead>Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeData.map((item, index) => {
                  const currentAmount = item.amount
                  const projectedAmount = currentAmount * 1.15 // 15% growth projection
                  const growthPercentage = 15.0
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.source}</TableCell>
                      <TableCell>${currentAmount.toLocaleString()}</TableCell>
                      <TableCell>${projectedAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-500">+{growthPercentage}%</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>${totalIncome.toLocaleString()}</TableCell>
                  <TableCell>${(totalIncome * 1.15).toLocaleString()}</TableCell>
                  <TableCell className="text-green-500">+15.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>ROI and profitability metrics</CardDescription>
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
                  <TableCell className="font-medium">Total Annual Income</TableCell>
                  <TableCell>${totalAnnualIncome.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing Expenses</TableCell>
                  <TableCell>${totalMarketingExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operational Expenses</TableCell>
                  <TableCell>${totalOperationalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Expenses</TableCell>
                  <TableCell>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Net Income</TableCell>
                  <TableCell>${(totalAnnualIncome - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Profit Margin</TableCell>
                  <TableCell>{totalAnnualIncome > 0 ? ((totalAnnualIncome - totalExpenses) / totalAnnualIncome * 100).toFixed(1) : 0}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing ROI</TableCell>
                  <TableCell className="text-green-500">{marketingROI}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
