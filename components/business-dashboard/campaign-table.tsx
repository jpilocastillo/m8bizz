"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { useAuth } from "@/components/auth-provider"

// Campaign form schema
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  price: z.string().min(1, "Price is required"),
  events: z.string().min(1, "Number of events is required"),
  leads: z.string().min(1, "Number of leads is required"),
  budget: z.string().min(1, "Budget is required"),
  status: z.enum(["Active", "Planned", "Completed", "Paused"]),
})

type CampaignFormData = z.infer<typeof campaignSchema>

export function CampaignTable() {
  const { user } = useAuth()
  const { data } = useAdvisorBasecamp(user)
  
  // Get campaigns from actual data, or empty array if no data
  const actualCampaigns = data.campaigns || []
  
  const [campaigns, setCampaigns] = useState<any[]>([])

  // Update campaigns when actual data changes
  useEffect(() => {
    if (actualCampaigns.length > 0) {
      const mappedCampaigns = actualCampaigns.map((campaign, index) => ({
        id: index + 1,
        campaign: campaign.name,
        price: campaign.budget / campaign.events || 0, // Calculate price per event
        events: campaign.events,
        leads: campaign.leads,
        budget: campaign.budget,
        status: campaign.status as "Active" | "Planned" | "Completed" | "Paused",
      }))
      setCampaigns(mappedCampaigns)
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

  // Calculate totals
  const totalEvents = campaigns.reduce((sum, item) => sum + item.events, 0)
  const totalLeads = campaigns.reduce((sum, item) => sum + item.leads, 0)
  const totalBudget = campaigns.reduce((sum, item) => sum + item.budget, 0)

  const onSubmit = (data: CampaignFormData) => {
    if (editingCampaign) {
      // Update existing campaign
      setCampaigns(campaigns.map(campaign => 
        campaign.id === editingCampaign.id 
          ? {
              ...campaign,
              campaign: data.name,
              price: parseFloat(data.price),
              events: parseInt(data.events),
              leads: parseInt(data.leads),
              budget: parseFloat(data.budget),
              status: data.status,
            }
          : campaign
      ))
    } else {
      // Add new campaign
      const newCampaign = {
        id: Math.max(...campaigns.map(c => c.id)) + 1,
        campaign: data.name,
        price: parseFloat(data.price),
        events: parseInt(data.events),
        leads: parseInt(data.leads),
        budget: parseFloat(data.budget),
        status: data.status,
      }
      setCampaigns([...campaigns, newCampaign])
    }
    
    form.reset()
    setEditingCampaign(null)
    setIsDialogOpen(false)
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

  const handleDelete = (id: number) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id))
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? "Edit Campaign" : "Add New Campaign"}
              </DialogTitle>
              <DialogDescription>
                {editingCampaign ? "Update campaign details" : "Add a new marketing campaign"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Event</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="events"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Events</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leads Generated</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.campaign}</TableCell>
                  <TableCell>${item.price.toLocaleString()}</TableCell>
                  <TableCell>{item.events}</TableCell>
                  <TableCell>{item.leads}</TableCell>
                  <TableCell>${item.budget.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Active" ? "default" : "outline"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
