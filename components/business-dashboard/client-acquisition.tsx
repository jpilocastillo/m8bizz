"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ClientAcquisition() {
  // Client acquisition funnel data
  const funnelData = [
    { name: "Leads", value: 140, color: "#3b82f6" },
    { name: "Appointments", value: 47, color: "#8b5cf6" },
    { name: "Prospects", value: 36, color: "#f97316" },
    { name: "Clients", value: 30, color: "#ef4444" },
  ]

  // Monthly client acquisition data - consistent amounts for each month
  const monthlyData = [
    { name: "Jan", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Feb", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Mar", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Apr", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "May", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Jun", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Jul", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Aug", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Sep", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Oct", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Nov", leads: 12, appointments: 4, prospects: 3, clients: 3 },
    { name: "Dec", leads: 12, appointments: 4, prospects: 3, clients: 3 },
  ]

  // Lead source data
  const leadSourceData = [
    { name: "Facebook Seminars", value: 20, color: "#3b82f6" },
    { name: "Referrals", value: 8, color: "#8b5cf6" },
    { name: "COI", value: 5, color: "#f97316" },
    { name: "Existing Clients", value: 4, color: "#ef4444" },
    { name: "Other", value: 3, color: "#64748b" },
  ]

  // Client acquisition metrics
  const acquisitionMetrics = [
    { metric: "Average Close Ratio", value: "70%" },
    { metric: "Appointment Attrition", value: "10%" },
    { metric: "Cost Per Lead", value: "$259.90" },
    { metric: "Cost Per Client", value: "$1,732.67" },
    { metric: "Client Lifetime Value", value: "$48,333.33" },
    { metric: "ROI", value: "2,689%" },
  ]

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Client Acquisition</CardTitle>
            <CardDescription>Tracking Leads To Clients Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorProspects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
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
                    dataKey="leads"
                    name="Leads"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    name="Appointments"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorAppointments)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="prospects"
                    name="Prospects"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorProspects)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="clients"
                    name="Clients"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorClients)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Distribution Of Lead Generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const color = props.payload?.color || '#fff';
                      return [<span style={{ color, fontWeight: 600 }}>{`${value} leads`}</span>];
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Client Acquisition Funnel</CardTitle>
            <CardDescription>From Leads To Clients Conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.value}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((item.value / funnelData[0].value) * 100)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(item.value / funnelData[0].value) * 100}
                    className="h-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="h-full"
                      style={{ backgroundColor: item.color, width: `${(item.value / funnelData[0].value) * 100}%` }}
                    ></div>
                  </Progress>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Acquisition Metrics</CardTitle>
            <CardDescription>Key Performance Indicators</CardDescription>
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
                {acquisitionMetrics.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.metric}</TableCell>
                    <TableCell>{item.value}</TableCell>
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
