"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface MonthlyData {
  month: string
  events: number
  revenue: number
  expenses: number
  profit: number
  attendees: number
  clients: number
  roi: number
  conversionRate: number
}

interface MonthlyTrendsProps {
  data: MonthlyData[]
}

export function MonthlyTrends({ data }: MonthlyTrendsProps) {
  // Format the data for the charts
  const formattedData = data.map(item => ({
    ...item,
    month: format(new Date(item.month + "-01"), "MMM yyyy"),
    revenue: Math.round(item.revenue),
    expenses: Math.round(item.expenses),
    profit: Math.round(item.profit),
    roi: Number(item.roi.toFixed(1)),
    conversionRate: Number(item.conversionRate.toFixed(1)),
  }))

  // Custom tooltip formatter
  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes("Rate") || name.includes("ROI")) {
      return `${value.toFixed(1)}%`
    }
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Monthly Revenue & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#131525",
                    border: "1px solid #1f2037",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                  formatter={formatTooltipValue}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Monthly ROI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#131525",
                      border: "1px solid #1f2037",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    formatter={formatTooltipValue}
                  />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                    name="ROI %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Monthly Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#131525",
                      border: "1px solid #1f2037",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    formatter={formatTooltipValue}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b" }}
                    name="Conversion Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 