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
  // Debug logging to track data updates
  console.log('PerformanceCharts received data:', {
    businessGoals,
    currentValues,
    clientMetrics
  })

  // Calculate total advisor book value from actual data
  const totalBookValue = (currentValues?.current_annuity || 0) + (currentValues?.current_aum || 0)
  const annuityPercentage = totalBookValue > 0 ? ((currentValues?.current_annuity || 0) / totalBookValue) * 100 : 0
  const aumPercentage = totalBookValue > 0 ? ((currentValues?.current_aum || 0) / totalBookValue) * 100 : 0

  console.log('Calculated values:', {
    totalBookValue,
    annuityPercentage,
    aumPercentage
  })

  // Annuity vs AUM data
  const pieData = [
    { name: "Annuity", value: currentValues?.current_annuity || 0, color: "#3b82f6" },
    { name: "AUM", value: currentValues?.current_aum || 0, color: "#f97316" },
  ]

  // Monthly performance data (using actual values with realistic distribution)
  const currentAnnuity = currentValues?.current_annuity || 0
  const currentAUM = currentValues?.current_aum || 0
  
  // Generate more realistic monthly data based on actual values
  const monthlyData = [
    { name: "Jan", annuity: currentAnnuity * 0.08, aum: currentAUM * 0.08 },
    { name: "Feb", annuity: currentAnnuity * 0.09, aum: currentAUM * 0.09 },
    { name: "Mar", annuity: currentAnnuity * 0.10, aum: currentAUM * 0.10 },
    { name: "Apr", annuity: currentAnnuity * 0.09, aum: currentAUM * 0.09 },
    { name: "May", annuity: currentAnnuity * 0.11, aum: currentAUM * 0.11 },
    { name: "Jun", annuity: currentAnnuity * 0.10, aum: currentAUM * 0.10 },
    { name: "Jul", annuity: currentAnnuity * 0.12, aum: currentAUM * 0.12 },
    { name: "Aug", annuity: currentAnnuity * 0.13, aum: currentAUM * 0.13 },
    { name: "Sep", annuity: currentAnnuity * 0.11, aum: currentAUM * 0.11 },
    { name: "Oct", annuity: currentAnnuity * 0.14, aum: currentAUM * 0.14 },
    { name: "Nov", annuity: currentAnnuity * 0.15, aum: currentAUM * 0.15 },
    { name: "Dec", annuity: currentAnnuity * 0.16, aum: currentAUM * 0.16 },
  ]

  // Goal progress data
  const goalData = [
    { name: "Business Goal", value: businessGoals?.business_goal || 0, color: "#22c55e" },
    { name: "AUM Goal", value: businessGoals?.aum_goal || 0, color: "#3b82f6" },
    { name: "Annuity Goal", value: businessGoals?.annuity_goal || 0, color: "#f97316" },
    { name: "Life Target", value: businessGoals?.life_target_goal || 0, color: "#a855f7" },
  ]

  // Attrition vs Close Ratio data
  const ratioData = [
    { name: "Appointment Attrition", value: clientMetrics?.appointment_attrition || 0 },
    { name: "Average Close Ratio", value: clientMetrics?.avg_close_ratio || 0 },
  ]

  // Annuity Closed vs AUM Accounts vs Clients Needed data
  const accountData = [
    { name: "Annuity Closed", value: clientMetrics?.annuity_closed || 0, color: "#3b82f6" },
    { name: "AUM Accounts", value: clientMetrics?.aum_accounts || 0, color: "#f97316" },
    { name: "Clients Needed", value: clientMetrics?.clients_needed || 0, color: "#22c55e" },
  ]

  // Performance trend data
  const performanceTrendData = monthlyData.map((item, index) => {
    const total = item.annuity + item.aum
    const avgMonthlyTotal = (currentAnnuity + currentAUM) / 12
    const growth = avgMonthlyTotal > 0 ? ((total / avgMonthlyTotal) - 1) * 100 : 0
    
    return {
      name: item.name,
      total,
      growth,
    }
  })

  // Format currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="grid gap-6">
      {/* Distribution Charts - Side by Side */}
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
                  <defs>
                    <linearGradient id="pieAnnuity" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="pieAum" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#b45309" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                    animationDuration={900}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#${entry.name === 'Annuity' ? 'pieAnnuity' : 'pieAum'})`} filter="url(#shadow)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const color = props.payload?.color || '#fff';
                      return [<span style={{ color, fontWeight: 600 }}>{`$${value.toLocaleString()}`}</span>];
                    }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ color: '#fff', fontWeight: 500, fontSize: 14 }}
                  />
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
                    formatter={(value, name, props) => {
                      const color = props.payload?.color || '#fff';
                      return [<span style={{ color }}>{`${value} accounts`}</span>];
                    }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
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
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value, name, props) => {
                      const color = props.payload?.color || '#fff';
                      return [<span style={{ color }}>{`$${value.toLocaleString()}`}</span>];
                    }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
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
                    formatter={(value, name, props) => {
                      let color = '#fff';
                      if (props && props.payload && props.payload.name === 'Appointment Attrition') color = '#ef4444';
                      if (props && props.payload && props.payload.name === 'Average Close Ratio') color = '#22c55e';
                      return [<span style={{ color }}>{`${value}%`}</span>];
                    }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
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
            <CardTitle>Total Advisor Book Value</CardTitle>
            <CardDescription>Current total advisor book value</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {formatCurrency(totalBookValue)}
            </div>
            <div className="text-xl text-center mb-6">Total Advisor Book Value</div>
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-semibold text-blue-500">{formatCurrency(currentValues?.current_annuity || 0)}</div>
                <div className="text-sm text-muted-foreground">Annuity ({annuityPercentage.toFixed(1)}%)</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-semibold text-orange-500">{formatCurrency(currentValues?.current_aum || 0)}</div>
                <div className="text-sm text-muted-foreground">AUM ({aumPercentage.toFixed(1)}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
