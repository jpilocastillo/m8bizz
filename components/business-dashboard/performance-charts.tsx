"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"

interface PerformanceChartsProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function PerformanceCharts({ businessGoals, currentValues, clientMetrics }: PerformanceChartsProps) {
  // Annuity vs AUM data
  const pieData = [
    { name: "Annuity", value: currentValues?.current_annuity || 0, color: "#3b82f6" },
    { name: "AUM", value: currentValues?.current_aum || 0, color: "#f97316" },
  ]

  // Monthly performance data (simplified - using current values distributed across months)
  const currentAnnuity = currentValues?.current_annuity || 0
  const currentAUM = currentValues?.current_aum || 0
  const monthlyAnnuity = currentAnnuity / 12
  const monthlyAUM = currentAUM / 12

  const monthlyData = [
    { name: "Jan", annuity: monthlyAnnuity * 0.8, aum: monthlyAUM * 0.8 },
    { name: "Feb", annuity: monthlyAnnuity * 0.9, aum: monthlyAUM * 0.9 },
    { name: "Mar", annuity: monthlyAnnuity * 1.0, aum: monthlyAUM * 1.0 },
    { name: "Apr", annuity: monthlyAnnuity * 0.95, aum: monthlyAUM * 0.95 },
    { name: "May", annuity: monthlyAnnuity * 1.1, aum: monthlyAUM * 1.1 },
    { name: "Jun", annuity: monthlyAnnuity * 1.05, aum: monthlyAUM * 1.05 },
    { name: "Jul", annuity: monthlyAnnuity * 1.2, aum: monthlyAUM * 1.2 },
    { name: "Aug", annuity: monthlyAnnuity * 1.25, aum: monthlyAUM * 1.25 },
    { name: "Sep", annuity: monthlyAnnuity * 1.15, aum: monthlyAUM * 1.15 },
    { name: "Oct", annuity: monthlyAnnuity * 1.3, aum: monthlyAUM * 1.3 },
    { name: "Nov", annuity: monthlyAnnuity * 1.35, aum: monthlyAUM * 1.35 },
    { name: "Dec", annuity: monthlyAnnuity * 1.4, aum: monthlyAUM * 1.4 },
  ]

  // Goal progress data
  const goalData = [
    { name: "Goal", value: businessGoals?.business_goal || 0, color: "#22c55e" },
    { name: "AUM", value: businessGoals?.aum_goal || 0, color: "#3b82f6" },
    { name: "Annuity", value: businessGoals?.annuity_goal || 0, color: "#f97316" },
    { name: "Life Target", value: businessGoals?.life_target_goal || 0, color: "#a855f7" },
  ]

  // Attrition vs Close Ratio data
  const ratioData = [
    { name: "Appointment Attrition", value: clientMetrics?.appointment_attrition || 0 },
    { name: "Average Close Ratio", value: clientMetrics?.avg_close_ratio || 0 },
  ]

  // Annuity Closed vs AUM Accounts data
  const accountData = [
    { name: "Annuity Closed", value: clientMetrics?.annuity_closed || 0, color: "#3b82f6" },
    { name: "AUM Accounts", value: clientMetrics?.aum_accounts || 0, color: "#f97316" },
  ]

  // Performance trend data
  const performanceTrendData = monthlyData.map((item) => ({
    name: item.name,
    total: item.annuity + item.aum,
    growth: ((item.annuity + item.aum) / ((currentAnnuity + currentAUM) / 12)) * 100 - 100,
  }))

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
          <TabsTrigger value="distribution">Book Distribution</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Annuity vs AUM monthly performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAnnuity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="annuity"
                      name="Annuity"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorAnnuity)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="aum"
                      name="AUM"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorAum)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="distribution">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Book Distribution</CardTitle>
                <CardDescription>Annuity vs AUM distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
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
                <CardTitle>Account Distribution</CardTitle>
                <CardDescription>Annuity Closed vs AUM Accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={accountData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(value) => [`${value} accounts`, undefined]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {accountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="trends">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg md:col-span-2">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Monthly growth and total value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={performanceTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        yAxisId="left"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000000}M`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "total") return [`$${(value as number).toLocaleString()}`, "Total Value"]
                          if (name === "growth") return [`${(value as number).toFixed(1)}%`, "Growth Rate"]
                          return [value, name]
                        }}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          color: "var(--popover-foreground)",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" name="Total Value" dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line
                        yAxisId="right"
                        name="Growth Rate"
                        type="monotone"
                        dataKey="growth"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Current progress towards goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={goalData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000000}M`}
                  />
                  <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
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
                    {goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Performance Ratios</CardTitle>
            <CardDescription>Attrition vs Close Ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={ratioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, undefined]}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      color: "var(--popover-foreground)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#22c55e" />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Total Book Value</CardTitle>
            <CardDescription>Current total book value</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              $242M
            </div>
            <div className="text-xl text-center mb-6">Total Book Value</div>
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-semibold text-blue-500">$180M</div>
                <div className="text-sm text-muted-foreground">Annuity (74.4%)</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-semibold text-orange-500">$62M</div>
                <div className="text-sm text-muted-foreground">AUM (25.6%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
