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
import { BusinessGoals, CurrentValues, ClientMetrics, CommissionRates } from "@/lib/advisor-basecamp"
import { formatCurrency } from "@/lib/utils"

interface IncomeBreakdownProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
  commissionRates?: CommissionRates | null
}

export function IncomeBreakdown({ 
  businessGoals, 
  currentValues, 
  clientMetrics, 
  commissionRates 
}: IncomeBreakdownProps) {
  // Show loading state if data is not available
  if (!businessGoals || !currentValues || !clientMetrics || !commissionRates) {
    return (
      <div className="space-y-6">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income Breakdown</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Loading income data...</CardDescription>
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
        marketingROI: 0
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
        source: `Average Planning Fees (@ ${formatCurrency(commissionRates.planning_fee_rate || 0)})`, 
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
    const marketingROI = 1215 // This would need to be calculated from actual marketing data

    return {
      incomeData,
      totalIncome,
      totalAnnualIncome,
      marketingROI
    }
  }

  const { incomeData, totalIncome, totalAnnualIncome, marketingROI } = calculateIncomeData()

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
              <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income Details</CardTitle>
              <CardDescription className="text-m8bs-muted mt-2">Breakdown Of Income Sources</CardDescription>
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
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{item.commission}</TableCell>
                      <TableCell>{((item.amount / totalIncome) * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell>{formatCurrency(totalIncome)}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>100%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Marketing ROI</TableCell>
                    <TableCell colSpan={3}>{marketingROI}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Annual Income</TableCell>
                    <TableCell colSpan={3}>{formatCurrency(totalAnnualIncome)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income Distribution</CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">Percentage Breakdown By Source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const color = props.payload?.color || '#fff';
                          return [<span style={{ color, fontWeight: 600 }}>{formatCurrency(value as number)}</span>];
                        }}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                <CardTitle className="text-xl font-extrabold text-white tracking-tight">Annual Income</CardTitle>
                <CardDescription className="text-m8bs-muted mt-2">Visual Comparison By Source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return formatCurrency(value / 1000000) + 'M'
                          if (value >= 1000) return formatCurrency(value / 1000) + 'K'
                          return formatCurrency(value)
                        }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), undefined]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "14px",
                          fontWeight: "500",
                          padding: "8px 12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income Projections</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Projected Income For Next Year</CardDescription>
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
                      <TableCell>{formatCurrency(currentAmount)}</TableCell>
                      <TableCell>{formatCurrency(projectedAmount)}</TableCell>
                      <TableCell className="text-green-500">+{growthPercentage}%</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{formatCurrency(totalIncome)}</TableCell>
                  <TableCell>{formatCurrency(totalIncome * 1.15)}</TableCell>
                  <TableCell className="text-green-500">+15.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Income vs Expenses</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">ROI And Profitability Metrics</CardDescription>
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
                  <TableCell>{formatCurrency(totalAnnualIncome)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing Expenses</TableCell>
                  <TableCell>$62,376.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operational Expenses</TableCell>
                  <TableCell>$180,000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Expenses</TableCell>
                  <TableCell>$242,376.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Net Income</TableCell>
                  <TableCell>{formatCurrency(totalAnnualIncome - 242376)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Profit Margin</TableCell>
                  <TableCell>{totalAnnualIncome > 0 ? ((totalAnnualIncome - 242376) / totalAnnualIncome * 100).toFixed(1) : 0}%</TableCell>
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
