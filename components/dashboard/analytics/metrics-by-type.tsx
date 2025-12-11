"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface TypeMetrics {
  type: string
  events: number
  revenue: number
  expenses: number
  profit: number
  attendees: number
  clients: number
  roi: number
  conversionRate: number
}

interface MetricsByTypeProps {
  data: TypeMetrics[]
}

export function MetricsByType({ data }: MetricsByTypeProps) {
  // Format the data for the charts
  const formattedData = data.map(item => ({
    ...item,
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
      <Card className="bg-m8bs-card text-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Revenue & Expenses by Event Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                <XAxis dataKey="type" stroke="#94a3b8" />
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
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-m8bs-card text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">ROI by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                  <XAxis dataKey="type" stroke="#94a3b8" />
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
                  <Bar dataKey="roi" fill="#8b5cf6" name="ROI %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Conversion Rate by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2037" />
                  <XAxis dataKey="type" stroke="#94a3b8" />
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
                  <Bar dataKey="conversionRate" fill="#f59e0b" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-m8bs-card text-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Event Type Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2037]">
                  <th className="text-left py-3 px-4">Event Type</th>
                  <th className="text-right py-3 px-4">Events</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                  <th className="text-right py-3 px-4">Expenses</th>
                  <th className="text-right py-3 px-4">Profit</th>
                  <th className="text-right py-3 px-4">ROI</th>
                  <th className="text-right py-3 px-4">Attendees</th>
                  <th className="text-right py-3 px-4">Clients</th>
                  <th className="text-right py-3 px-4">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {formattedData.map((item) => (
                  <tr key={item.type} className="border-b border-[#1f2037] hover:bg-[#1f2037]">
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="text-right py-3 px-4">{item.events}</td>
                    <td className="text-right py-3 px-4">${item.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">${item.expenses.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">${item.profit.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{item.roi.toFixed(1)}%</td>
                    <td className="text-right py-3 px-4">{item.attendees}</td>
                    <td className="text-right py-3 px-4">{item.clients}</td>
                    <td className="text-right py-3 px-4">{item.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 