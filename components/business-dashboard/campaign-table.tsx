"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download, FileText } from "lucide-react"

export function CampaignTable() {
  const campaignData = [
    {
      campaign: "Facebook Seminars",
      price: 2599.0,
      events: 2,
      leads: 20,
      budget: 5198.0,
      status: "Active",
    },
    {
      campaign: "College Events",
      price: 0,
      events: 0,
      leads: 0,
      budget: 0,
      status: "Planned",
    },
    {
      campaign: "Food Cost",
      price: 0,
      events: 0,
      leads: 0,
      budget: 0,
      status: "Planned",
    },
    {
      campaign: "Referrals/Events",
      price: 0,
      events: 0,
      leads: 0,
      budget: 0,
      status: "Planned",
    },
    {
      campaign: "COI",
      price: 0,
      events: 0,
      leads: 0,
      budget: 0,
      status: "Planned",
    },
    {
      campaign: "Existing Clients",
      price: 0,
      events: 0,
      leads: 0,
      budget: 0,
      status: "Planned",
    },
  ]

  // Calculate totals
  const totalEvents = campaignData.reduce((sum, item) => sum + item.events, 0)
  const totalLeads = campaignData.reduce((sum, item) => sum + item.leads, 0)
  const totalBudget = campaignData.reduce((sum, item) => sum + item.budget, 0)

  // Campaign performance data for chart
  const performanceData = [
    { name: "Q1", budget: 15594, leads: 60, roi: 22 },
    { name: "Q2", budget: 15594, leads: 65, roi: 24 },
    { name: "Q3", budget: 15594, leads: 70, roi: 26 },
    { name: "Q4", budget: 15594, leads: 75, roi: 28 },
  ]

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Campaign
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Campaigns Monthly Budget</CardTitle>
          <CardDescription>Track campaign performance and budget allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaigns</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Monthly Events</TableHead>
                <TableHead>Leads Generated</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.campaign}</TableCell>
                  <TableCell>${item.price.toLocaleString()}</TableCell>
                  <TableCell>{item.events}</TableCell>
                  <TableCell>{item.leads}</TableCell>
                  <TableCell>${item.budget.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Active" ? "default" : "outline"}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Total</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{totalEvents}</TableCell>
                <TableCell>{totalLeads}</TableCell>
                <TableCell>${totalBudget.toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marketing Appt Goal</TableCell>
                <TableCell colSpan={4}>171%</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Monthly Budget</TableCell>
                <TableCell colSpan={4}>${totalBudget.toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Annual Budget</TableCell>
                <TableCell colSpan={4}>${(totalBudget * 12).toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Quarterly budget and lead generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "budget") return [`$${(value as number).toLocaleString()}`, "Budget"]
                      if (name === "leads") return [`${value}`, "Leads"]
                      if (name === "roi") return [`${value}%`, "ROI"]
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
                  <Bar yAxisId="left" name="Budget" dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" name="Leads" dataKey="leads" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" name="ROI %" dataKey="roi" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Campaign ROI</CardTitle>
            <CardDescription>Return on investment metrics</CardDescription>
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
                  <TableCell className="font-medium">Cost Per Lead</TableCell>
                  <TableCell>${(totalBudget / totalLeads).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost Per Appointment</TableCell>
                  <TableCell>${(totalBudget / 12).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost Per Client</TableCell>
                  <TableCell>${(totalBudget / 5).toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Lead to Appointment Ratio</TableCell>
                  <TableCell>60%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Appointment to Client Ratio</TableCell>
                  <TableCell>42%</TableCell>
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
