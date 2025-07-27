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

export function IncomeBreakdown() {
  const incomeData = [
    { source: "Planning Fees (@ $1,000)", amount: 29777.78, commission: "-", color: "#64748b" },
    { source: "Annuity", amount: 520000000, commission: "6.50%", color: "#3b82f6" },
    { source: "AUM", amount: 120000, commission: "1.00%", color: "#f97316" },
    { source: "Life Production", amount: 180000, commission: "1.0%", color: "#a855f7" },
  ]

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)

  const chartData = incomeData.map((item) => ({
    name: item.source,
    value: item.amount,
    color: item.color,
  }))

  // Monthly income data
  const monthlyIncomeData = [
    { name: "Jan", annuity: 38000000, aum: 9000, life: 12000, fees: 2000 },
    { name: "Feb", annuity: 40000000, aum: 9500, life: 13000, fees: 2200 },
    { name: "Mar", annuity: 42000000, aum: 10000, life: 14000, fees: 2400 },
    { name: "Apr", annuity: 41000000, aum: 9800, life: 13500, fees: 2300 },
    { name: "May", annuity: 43000000, aum: 10200, life: 14500, fees: 2500 },
    { name: "Jun", annuity: 45000000, aum: 10500, life: 15000, fees: 2600 },
    { name: "Jul", annuity: 44000000, aum: 10300, life: 14800, fees: 2550 },
    { name: "Aug", annuity: 46000000, aum: 10700, life: 15500, fees: 2700 },
    { name: "Sep", annuity: 47000000, aum: 11000, life: 16000, fees: 2800 },
    { name: "Oct", annuity: 48000000, aum: 11200, life: 16500, fees: 2900 },
    { name: "Nov", annuity: 50000000, aum: 11500, life: 17000, fees: 3000 },
    { name: "Dec", annuity: 52000000, aum: 12000, life: 18000, fees: 3200 },
  ]

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
                    <TableCell colSpan={3}>1215%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Annual Income</TableCell>
                    <TableCell colSpan={3}>$1,440,000.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>Percentage breakdown by source</CardDescription>
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
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Annual Income</CardTitle>
                <CardDescription>Visual comparison by source</CardDescription>
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
                          if (value >= 1000000) return `$${value / 1000000}M`
                          if (value >= 1000) return `$${value / 1000}K`
                          return `$${value}`
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
                        formatter={(value) => [`$${(value as number).toLocaleString()}`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
                <TableRow>
                  <TableCell className="font-medium">Planning Fees</TableCell>
                  <TableCell>$29,777.78</TableCell>
                  <TableCell>$35,000.00</TableCell>
                  <TableCell className="text-green-500">+17.5%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Annuity</TableCell>
                  <TableCell>$520,000,000.00</TableCell>
                  <TableCell>$600,000,000.00</TableCell>
                  <TableCell className="text-green-500">+15.4%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AUM</TableCell>
                  <TableCell>$120,000.00</TableCell>
                  <TableCell>$150,000.00</TableCell>
                  <TableCell className="text-green-500">+25.0%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Life Production</TableCell>
                  <TableCell>$180,000.00</TableCell>
                  <TableCell>$220,000.00</TableCell>
                  <TableCell className="text-green-500">+22.2%</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>$520,329,777.78</TableCell>
                  <TableCell>$600,405,000.00</TableCell>
                  <TableCell className="text-green-500">+15.4%</TableCell>
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
                  <TableCell>$1,440,000.00</TableCell>
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
                  <TableCell>$1,197,624.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Profit Margin</TableCell>
                  <TableCell>83.2%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Marketing ROI</TableCell>
                  <TableCell className="text-green-500">1215%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
