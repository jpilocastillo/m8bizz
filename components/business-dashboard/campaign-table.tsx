"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { useAuth } from "@/components/auth-provider"
import { MarketingCampaign } from "@/lib/advisor-basecamp"
import { useMemo } from "react"
import { toast } from "@/components/ui/use-toast"

// Helper function to get annual multiplier based on frequency
const getAnnualMultiplier = (frequency: string | undefined): number => {
  switch (frequency) {
    case "Monthly":
      return 12
    case "Quarterly":
      return 4
    case "Semi-Annual":
      return 2
    case "Annual":
      return 1
    default:
      return 12 // Default to monthly
  }
}

// Helper function to get frequency label
const getFrequencyLabel = (frequency: string | undefined): string => {
  switch (frequency) {
    case "Monthly":
      return "Monthly"
    case "Quarterly":
      return "Quarterly"
    case "Semi-Annual":
      return "Semi-Annual"
    case "Annual":
      return "Annual"
    default:
      return "Monthly"
  }
}

// Campaign form schema
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign Name Is Required"),
  price: z.string().min(1, "Price Is Required"),
  events: z.string().min(1, "Number Of Events Is Required"),
  leads: z.string().min(1, "Number Of Leads Is Required"),
  budget: z.string().min(1, "Budget Is Required"),
  status: z.enum(["Active", "Planned", "Completed", "Paused"]),
})

type CampaignFormData = z.infer<typeof campaignSchema>

export function CampaignTable() {
  const { user } = useAuth()
  const { data, addCampaign, updateCampaign, deleteCampaign, loadData } = useAdvisorBasecamp(user)
  
  // Get campaigns from actual data, or empty array if no data
  const actualCampaigns = data.campaigns || []
  
  const [campaigns, setCampaigns] = useState<any[]>([])

  // Update campaigns when actual data changes
  useEffect(() => {
    if (actualCampaigns.length > 0) {
      const mappedCampaigns = actualCampaigns.map((campaign, index) => {
        const frequency = (campaign as any).frequency || "Monthly"
        const multiplier = getAnnualMultiplier(frequency)
        return {
          id: campaign.id || `temp-${index}`,
          campaignId: campaign.id, // Store the actual database ID
          campaign: campaign.name,
          price: campaign.events > 0 ? campaign.budget / campaign.events : 0, // Calculate price per event
          events: campaign.events,
          leads: campaign.leads,
          budget: campaign.budget,
          status: campaign.status as "Active" | "Planned" | "Completed" | "Paused",
          frequency: frequency,
          multiplier: multiplier,
        }
      })
      setCampaigns(mappedCampaigns)
    } else {
      setCampaigns([])
    }
  }, [actualCampaigns])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      price: "",
      events: "",
      leads: "",
      budget: "",
      status: "Planned",
    },
  })

  // Calculate totals - account for frequency multipliers
  const totalEvents = campaigns.reduce((sum, item) => {
    const multiplier = item.multiplier || getAnnualMultiplier(item.frequency)
    return sum + ((item.events || 0) * multiplier)
  }, 0)
  const totalLeads = campaigns.reduce((sum, item) => {
    const multiplier = item.multiplier || getAnnualMultiplier(item.frequency)
    return sum + ((item.leads || 0) * multiplier)
  }, 0)
  const totalBudget = campaigns.reduce((sum, item) => {
    const multiplier = item.multiplier || getAnnualMultiplier(item.frequency)
    return sum + ((item.budget || 0) * multiplier)
  }, 0)

  // Calculate accurate ROI metrics
  const roiMetrics = useMemo(() => {
    const clientMetrics = data.clientMetrics
    const appointmentAttrition = clientMetrics?.appointment_attrition || 0
    const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
    const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0
    const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = clientMetrics?.avg_aum_size || 0
    const avgClientValue = (avgAnnuitySize + avgAUMSize) / 2

    // Calculate appointments
    const totalAppointments = appointmentsPerCampaign > 0 
      ? totalEvents * appointmentsPerCampaign
      : Math.round(totalLeads * 0.4) // Fallback: 40% of leads become appointments

    // Calculate prospects (appointments after attrition)
    const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))

    // Calculate clients (prospects * close ratio)
    const totalClients = Math.round(totalProspects * (avgCloseRatio / 100))

    // Calculate costs
    const costPerLead = totalLeads > 0 ? totalBudget / totalLeads : 0
    const costPerAppointment = totalAppointments > 0 ? totalBudget / totalAppointments : 0
    const costPerClient = totalClients > 0 ? totalBudget / totalClients : 0

    // Calculate ratios
    const leadToAppointmentRatio = totalLeads > 0 ? (totalAppointments / totalLeads) * 100 : 0
    const appointmentToClientRatio = totalAppointments > 0 ? (totalClients / totalAppointments) * 100 : 0

    // Calculate ROI
    const totalRevenue = totalClients * avgClientValue
    const marketingROI = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0

    return {
      costPerLead,
      costPerAppointment,
      costPerClient,
      leadToAppointmentRatio,
      appointmentToClientRatio,
      marketingROI,
    }
  }, [totalEvents, totalLeads, totalBudget, data.clientMetrics])

  const onSubmit = async (formData: CampaignFormData) => {
    try {
      const campaignData = {
        name: formData.name,
        budget: parseFloat(formData.budget),
        events: parseInt(formData.events),
        leads: parseInt(formData.leads),
        status: formData.status,
      }

      if (editingCampaign && editingCampaign.campaignId) {
        // Update existing campaign in database
        const success = await updateCampaign(editingCampaign.campaignId, campaignData)
        if (success) {
          toast({
            title: "Success",
            description: "Campaign updated successfully",
          })
          await loadData() // Reload data to reflect changes
        } else {
          toast({
            title: "Error",
            description: "Failed to update campaign",
            variant: "destructive",
          })
        }
      } else {
        // Add new campaign to database
        const success = await addCampaign(campaignData)
        if (success) {
          toast({
            title: "Success",
            description: "Campaign added successfully",
          })
          await loadData() // Reload data to reflect changes
        } else {
          toast({
            title: "Error",
            description: "Failed to add campaign",
            variant: "destructive",
          })
        }
      }
      
      form.reset()
      setEditingCampaign(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving campaign:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving the campaign",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign)
    form.reset({
      name: campaign.campaign,
      price: campaign.price.toString(),
      events: campaign.events.toString(),
      leads: campaign.leads.toString(),
      budget: campaign.budget.toString(),
      status: campaign.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (campaign: any) => {
    if (!campaign.campaignId) {
      toast({
        title: "Error",
        description: "Cannot delete campaign: missing ID",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await deleteCampaign(campaign.campaignId)
      if (success) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
        await loadData() // Reload data to reflect changes
      } else {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the campaign",
        variant: "destructive",
      })
    }
  }

  // Calculate quarterly performance data from actual campaigns
  const performanceData = useMemo(() => {
    const clientMetrics = data.clientMetrics
    const avgCloseRatio = clientMetrics?.avg_close_ratio || 0
    const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = clientMetrics?.avg_aum_size || 0
    const avgClientValue = (avgAnnuitySize + avgAUMSize) / 2

    // Group campaigns by quarter (assuming campaigns are monthly, distribute across quarters)
    const campaignsPerQuarter = Math.ceil(campaigns.length / 4)
    const quarters = ["Q1", "Q2", "Q3", "Q4"]
    
    return quarters.map((quarter, index) => {
      const startIdx = index * campaignsPerQuarter
      const endIdx = Math.min(startIdx + campaignsPerQuarter, campaigns.length)
      const quarterCampaigns = campaigns.slice(startIdx, endIdx)
      
      const budget = quarterCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
      const leads = quarterCampaigns.reduce((sum, c) => sum + (c.leads || 0), 0)
      
      // Calculate ROI: (Revenue - Cost) / Cost * 100
      // Revenue = leads * conversion_rate * avg_client_value
      // For simplicity, assume conversion from leads to clients based on close ratio
      const appointmentAttrition = clientMetrics?.appointment_attrition || 0
      const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0
      const totalEvents = quarterCampaigns.reduce((sum, c) => sum + (c.events || 0), 0)
      const totalAppointments = appointmentsPerCampaign > 0 
        ? totalEvents * appointmentsPerCampaign
        : Math.round(leads * 0.4) // Fallback: 40% of leads become appointments
      const prospects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
      const clients = Math.round(prospects * (avgCloseRatio / 100))
      const revenue = clients * avgClientValue
      const roi = budget > 0 ? ((revenue - budget) / budget) * 100 : 0
      
      return {
        name: quarter,
        budget: Math.round(budget),
        leads,
        roi: Math.round(roi * 10) / 10, // Round to 1 decimal
      }
    })
  }, [campaigns, data.clientMetrics])

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Annual Campaign Goals</h2>
          <p className="text-m8bs-muted">Your Campaign Goals For The Year</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-m8bs-blue to-m8bs-purple hover:from-m8bs-blue-dark hover:to-m8bs-purple text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Campaign Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? "Edit Campaign Goal" : "Add Annual Campaign Goal"}
              </DialogTitle>
              <DialogDescription>
                {editingCampaign ? "Update annual campaign goal details" : "Add a new annual campaign goal for the year"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" className="bg-m8bs-card-alt border-m8bs-border text-white" {...field} />
                      </FormControl>
                      <FormDescription className="text-white/60">Name of your annual campaign goal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="events"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Monthly Events</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" className="bg-m8bs-card-alt border-m8bs-border text-white" {...field} />
                      </FormControl>
                      <FormDescription className="text-white/60">Number of events per month for this campaign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Monthly Leads Generated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" className="bg-m8bs-card-alt border-m8bs-border text-white" {...field} />
                      </FormControl>
                      <FormDescription className="text-white/60">Number of leads generated per month</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Monthly Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" className="bg-m8bs-card-alt border-m8bs-border text-white" {...field} />
                      </FormControl>
                      <FormDescription className="text-white/60">Monthly budget for this campaign (annual = monthly × 12)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-m8bs-card-alt border-m8bs-border text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-m8bs-card border-m8bs-border">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Planned">Planned</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCampaign ? "Update" : "Add"} Campaign
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
        <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight">Annual Campaign Goals</CardTitle>
          <CardDescription className="text-m8bs-muted mt-2">Your Annual Campaign Goals For The Year</CardDescription>
        </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Campaign Goal</TableHead>
                  <TableHead className="text-white">Annual Target</TableHead>
                  <TableHead className="text-white">Monthly Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-white">Total Annual Events</TableCell>
                  <TableCell className="text-white font-semibold">{Math.round(totalEvents).toLocaleString()}</TableCell>
                  <TableCell className="text-white/70">Annual total across all campaigns</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Total Annual Leads</TableCell>
                  <TableCell className="text-white font-semibold">{Math.round(totalLeads).toLocaleString()}</TableCell>
                  <TableCell className="text-white/70">Annual total across all campaigns</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Total Annual Budget</TableCell>
                  <TableCell className="text-white font-semibold">${Math.round(totalBudget).toLocaleString()}</TableCell>
                  <TableCell className="text-white/70">Annual total across all campaigns</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Annual Appointments Goal</TableCell>
                  <TableCell className="text-white font-semibold">
                    {(() => {
                      const clientMetrics = data.clientMetrics
                      const monthlyIdealProspects = clientMetrics?.monthly_ideal_prospects || 0
                      const appointmentsPerCampaign = clientMetrics?.appointments_per_campaign || 0
                      const goalAppointments = monthlyIdealProspects * 3 // Monthly new appointments needed
                      return Math.round(goalAppointments * 12).toLocaleString()
                    })()}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {(() => {
                      const clientMetrics = data.clientMetrics
                      const monthlyIdealProspects = clientMetrics?.monthly_ideal_prospects || 0
                      return Math.round(monthlyIdealProspects * 3).toLocaleString()
                    })()} appointments/month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Individual Campaign Goals */}
        {campaigns.length > 0 && (
          <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
            <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
              <CardTitle className="text-xl font-extrabold text-white tracking-tight">Individual Campaign Goals</CardTitle>
              <CardDescription className="text-m8bs-muted mt-2">Campaign goals that make up your annual targets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Campaign Name</TableHead>
                    <TableHead className="text-white">Frequency</TableHead>
                    <TableHead className="text-white">Events</TableHead>
                    <TableHead className="text-white">Leads</TableHead>
                    <TableHead className="text-white">Budget</TableHead>
                    <TableHead className="text-white">Annual Budget</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((item, index) => {
                    const frequency = item.frequency || "Monthly"
                    const frequencyLabel = getFrequencyLabel(frequency)
                    const multiplier = item.multiplier || getAnnualMultiplier(frequency)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-white">{item.campaign}</TableCell>
                        <TableCell className="text-white">
                          <Badge variant="outline" className="text-white border-m8bs-border">
                            {frequencyLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {item.events} {frequencyLabel.toLowerCase()}
                        </TableCell>
                        <TableCell className="text-white">
                          {item.leads} {frequencyLabel.toLowerCase()}
                        </TableCell>
                        <TableCell className="text-white">
                          ${item.budget.toLocaleString()} {frequencyLabel.toLowerCase()}
                        </TableCell>
                        <TableCell className="text-white">
                          ${(item.budget * multiplier).toLocaleString()} annual
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.status === "Active" ? "default" : "outline"}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="text-white hover:text-white hover:bg-m8bs-card-alt"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="text-white hover:text-white hover:bg-m8bs-card-alt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Annual Campaign Performance</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Quarterly breakdown of annual campaign goals</CardDescription>
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

        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Annual Campaign ROI</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">Return on investment metrics for annual campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Metric</TableHead>
                  <TableHead className="text-white">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-white">Cost Per Lead</TableCell>
                  <TableCell className="text-white">${roiMetrics.costPerLead.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Cost Per Appointment</TableCell>
                  <TableCell className="text-white">${roiMetrics.costPerAppointment.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Cost Per Client</TableCell>
                  <TableCell className="text-white">${roiMetrics.costPerClient.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Lead to Appointment Ratio</TableCell>
                  <TableCell className="text-white">{roiMetrics.leadToAppointmentRatio.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Appointment to Client Ratio</TableCell>
                  <TableCell className="text-white">{roiMetrics.appointmentToClientRatio.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-white">Marketing ROI</TableCell>
                  <TableCell className={roiMetrics.marketingROI >= 0 ? "text-green-500" : "text-red-500"}>
                    {roiMetrics.marketingROI.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
