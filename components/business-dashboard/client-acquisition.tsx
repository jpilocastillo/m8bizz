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
import { AdvisorBasecampData, MarketingCampaign, ClientMetrics } from "@/lib/advisor-basecamp"
import { useMemo } from "react"

interface ClientAcquisitionProps {
  data?: AdvisorBasecampData
}

const colors = ["#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#64748b", "#22c55e", "#eab308", "#ec4899"]

export function ClientAcquisition({ data }: ClientAcquisitionProps) {
  const campaigns = data?.campaigns || []
  const clientMetrics = data?.clientMetrics

  // Calculate metrics from campaign data and monthly entries
  const calculatedMetrics = useMemo(() => {
    // Get client metrics values
    const appointmentAttrition = clientMetrics?.appointment_attrition || 0
    const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
    const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0
    const monthlyEntries = data?.monthlyDataEntries || []

    // Calculate totals from monthly entries if available (more accurate)
    let totalLeads = 0
    let totalAppointments = 0
    let totalClients = 0
    
    if (monthlyEntries.length > 0) {
      // Use real monthly data
      totalLeads = monthlyEntries.reduce((sum, entry) => sum + (entry.new_leads || 0), 0)
      totalAppointments = monthlyEntries.reduce((sum, entry) => sum + (entry.new_appointments || 0), 0)
      totalClients = monthlyEntries.reduce((sum, entry) => sum + (entry.new_clients || 0), 0)
    } else {
      // Fallback to campaign calculations
      totalLeads = campaigns.reduce((sum, campaign) => sum + (campaign.leads || 0), 0)
      const totalEvents = campaigns.reduce((sum, campaign) => sum + (campaign.events || 0), 0)
      
      // Calculate appointments from campaigns
      totalAppointments = appointmentsPerCampaign > 0 
        ? totalEvents * appointmentsPerCampaign
        : Math.round(totalLeads * 0.4) // Fallback: assume 40% of leads become appointments
      
      // Calculate clients from prospects and close ratio
      const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
      totalClients = Math.round(totalProspects * (avgCloseRatio / 100))
    }

    // Calculate prospects (appointments after accounting for attrition)
    const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))

    // Calculate budget from campaigns
    const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)

    // Calculate costs
    const costPerLead = totalLeads > 0 ? totalBudget / totalLeads : 0
    const costPerClient = totalClients > 0 ? totalBudget / totalClients : 0

    // Calculate ROI (simplified - would need revenue data for accurate calculation)
    // For now, using a placeholder calculation
    const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = clientMetrics?.avg_aum_size || 0
    const avgClientValue = (avgAnnuitySize + avgAUMSize) / 2
    const totalRevenue = totalClients * avgClientValue
    const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0

    // Calculate client lifetime value (simplified)
    const clientLifetimeValue = avgClientValue

    return {
      totalLeads,
      totalAppointments,
      totalProspects,
      totalClients,
      totalBudget,
      costPerLead,
      costPerClient,
      clientLifetimeValue,
      roi,
      appointmentAttrition,
      avgCloseRatio,
    }
  }, [campaigns, clientMetrics, data?.monthlyDataEntries])

  // Client acquisition funnel data
  const funnelData = [
    { name: "Leads", value: calculatedMetrics.totalLeads, color: "#3b82f6" },
    { name: "Appointments", value: calculatedMetrics.totalAppointments, color: "#8b5cf6" },
    { name: "Prospects", value: calculatedMetrics.totalProspects, color: "#f97316" },
    { name: "Clients", value: calculatedMetrics.totalClients, color: "#ef4444" },
  ]

  // Monthly client acquisition data - use real monthly data entries if available
  const monthlyData = useMemo(() => {
    const monthlyEntries = data?.monthlyDataEntries || []
    const appointmentAttrition = clientMetrics?.appointment_attrition || 0
    
    // Create a map of month_year to entry data for quick lookup
    const entriesMap = new Map<string, typeof monthlyEntries[0]>()
    monthlyEntries.forEach(entry => {
      entriesMap.set(entry.month_year, entry)
    })

    // Get current year for building month keys
    const currentYear = new Date().getFullYear()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    // Build monthly data array for the current year
    return monthNames.map((monthName, index) => {
      const monthNumber = (index + 1).toString().padStart(2, '0')
      const monthYear = `${currentYear}-${monthNumber}`
      const entry = entriesMap.get(monthYear)
      
      if (entry) {
        // Use real data from monthly entries
        const leads = entry.new_leads || 0
        const appointments = entry.new_appointments || 0
        // Calculate prospects: appointments after accounting for attrition
        const prospects = Math.round(appointments * (1 - appointmentAttrition / 100))
        // Use actual clients from monthly entry
        const clients = entry.new_clients || 0
        
        return {
          name: monthName,
          leads,
          appointments,
          prospects,
          clients,
        }
      } else {
        // No data for this month - show zeros
        return {
          name: monthName,
          leads: 0,
          appointments: 0,
          prospects: 0,
          clients: 0,
        }
      }
    })
  }, [data?.monthlyDataEntries, clientMetrics?.appointment_attrition])

  // Lead source data from campaigns
  const leadSourceData = useMemo(() => {
    if (campaigns.length === 0) {
      return [
        { name: "No Campaigns", value: 1, color: "#64748b" },
      ]
    }

    return campaigns.map((campaign, index) => ({
      name: campaign.name || `Campaign ${index + 1}`,
      value: campaign.leads || 0,
      color: colors[index % colors.length],
    }))
  }, [campaigns])

  // Client acquisition metrics
  const acquisitionMetrics = [
    { metric: "Average Close Ratio", value: `${calculatedMetrics.avgCloseRatio.toFixed(1)}%` },
    { metric: "Appointment Attrition", value: `${calculatedMetrics.appointmentAttrition.toFixed(1)}%` },
    { metric: "Cost Per Lead", value: `$${calculatedMetrics.costPerLead.toFixed(2)}` },
    { metric: "Cost Per Client", value: `$${calculatedMetrics.costPerClient.toFixed(2)}` },
    { metric: "Client Lifetime Value", value: `$${calculatedMetrics.clientLifetimeValue.toLocaleString()}` },
    { metric: "ROI", value: `${calculatedMetrics.roi.toFixed(1)}%` },
  ]

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg md:col-span-2">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Monthly Client Acquisition</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Tracking Leads To Clients Conversion</CardDescription>
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

        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Lead Sources</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Distribution Of Lead Generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
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
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, fill }) => {
                      // Hide labels for very small slices (less than 1%)
                      if (percent < 0.01) return '';
                      
                      // Calculate label position outside the chart
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 20; // Position outside the chart
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill={fill} 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          fontSize="12"
                          fontWeight="600"
                        >
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={{
                      stroke: '#94a3b8',
                      strokeWidth: 1,
                      length: 10,
                      lengthType: 'straight'
                    }}
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const color = props.payload?.color || '#fff';
                      const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
                      return [<span style={{ color, fontWeight: 600 }}>{`${formattedValue} leads`}</span>];
                    }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#fff', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Client Acquisition Funnel</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">From Leads To Clients Conversion</CardDescription>
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
                      <Badge variant="outline">{item.value.toLocaleString()}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {funnelData[0].value > 0 ? Math.round((item.value / funnelData[0].value) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0}
                    className="h-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="h-full"
                      style={{ backgroundColor: item.color, width: `${funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0}%` }}
                    ></div>
                  </Progress>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Acquisition Metrics</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Key Performance Indicators</CardDescription>
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
