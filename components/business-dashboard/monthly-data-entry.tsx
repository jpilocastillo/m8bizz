"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { useAuth } from "@/components/auth-provider"
import { MonthlyDataEntry } from "@/lib/advisor-basecamp"
import { format, parseISO } from "date-fns"
import { Edit, Trash2, Plus, TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, BarChart3, PieChart, LineChart } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Line, LineChart as RechartsLineChart, Bar, BarChart, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ComposedChart } from "recharts"

// Form schema for monthly data entry
const monthlyEntrySchema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  new_clients: z.string().min(1, "New clients is required"),
  new_appointments: z.string().min(1, "New appointments is required"),
  new_leads: z.string().min(1, "New leads is required"),
  annuity_sales: z.string().min(1, "Annuity sales is required"),
  aum_sales: z.string().min(1, "AUM sales is required"),
  life_sales: z.string().min(1, "Life sales is required"),
  marketing_expenses: z.string().min(1, "Marketing expenses is required"),
  notes: z.string().optional(),
})

type MonthlyEntryFormData = z.infer<typeof monthlyEntrySchema>

// Currency formatting utility
const formatCurrency = (value: string | number | undefined): string => {
  if (!value) return ""
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value
  if (isNaN(numValue)) return ""
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue)
}

const parseCurrency = (value: string): string => {
  return value.replace(/[$,]/g, '')
}

export function MonthlyDataEntryComponent() {
  const { user } = useAuth()
  const { data, addMonthlyDataEntry, updateMonthlyDataEntry, deleteMonthlyDataEntry } = useAdvisorBasecamp(user)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MonthlyDataEntry | null>(null)
  const [selectedMonthForComparison, setSelectedMonthForComparison] = useState<string>("")

  const form = useForm<MonthlyEntryFormData>({
    resolver: zodResolver(monthlyEntrySchema),
    defaultValues: {
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      year: new Date().getFullYear().toString(),
      new_clients: "",
      new_appointments: "",
      new_leads: "",
      annuity_sales: "",
      aum_sales: "",
      life_sales: "",
      marketing_expenses: "",
      notes: "",
    },
  })

  const monthlyEntries = data.monthlyDataEntries || []

  const handleSubmit = async (values: MonthlyEntryFormData) => {
    console.log("Form submitted with values:", values)
    try {
      if (!values.month || !values.year) {
        console.log("Missing month or year")
        toast({
          title: "Error",
          description: "Please select both month and year.",
          variant: "destructive",
        })
        return
      }

      const month_year = `${values.year}-${values.month.padStart(2, '0')}`
      console.log("Generated month_year:", month_year)

      const entryData = {
        month_year: month_year,
        new_clients: parseInt(values.new_clients),
        new_appointments: parseInt(values.new_appointments),
        new_leads: parseInt(values.new_leads),
        annuity_sales: parseFloat(parseCurrency(values.annuity_sales)),
        aum_sales: parseFloat(parseCurrency(values.aum_sales)),
        life_sales: parseFloat(parseCurrency(values.life_sales)),
        marketing_expenses: parseFloat(parseCurrency(values.marketing_expenses)),
        notes: values.notes || "",
      }

      console.log("Entry data to save:", entryData)

      let success = false
      if (editingEntry) {
        console.log("Updating existing entry")
        success = await updateMonthlyDataEntry(editingEntry.id!, entryData)
      } else {
        console.log("Adding new entry")
        success = await addMonthlyDataEntry(entryData)
      }

      console.log("Save operation result:", success)

      if (success) {
        toast({
          title: editingEntry ? "Entry updated successfully" : "Entry added successfully",
          description: "Your monthly data has been saved.",
        })
        handleCloseDialog()
      } else {
        toast({
          title: "Error",
          description: "Failed to save entry. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (entry: MonthlyDataEntry) => {
    setEditingEntry(entry)
    // Parse month_year (format: "YYYY-MM") into separate month and year
    const [year, month] = entry.month_year.split('-')
    form.reset({
      month: month,
      year: year,
      new_clients: entry.new_clients.toString(),
      new_appointments: entry.new_appointments.toString(),
      new_leads: entry.new_leads.toString(),
      annuity_sales: entry.annuity_sales.toString(),
      aum_sales: entry.aum_sales.toString(),
      life_sales: entry.life_sales.toString(),
      marketing_expenses: entry.marketing_expenses.toString(),
      notes: entry.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      const success = await deleteMonthlyDataEntry(id)
      if (success) {
        toast({
          title: "Entry deleted successfully",
          description: "The monthly data entry has been removed.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete entry. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEntry(null)
    form.reset({
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      year: new Date().getFullYear().toString(),
      new_clients: "",
      new_appointments: "",
      new_leads: "",
      annuity_sales: "",
      aum_sales: "",
      life_sales: "",
      marketing_expenses: "",
      notes: "",
    })
  }

  const calculateProgress = (current: number, goal: number) => {
    if (goal === 0) return 0
    return Math.min((current / goal) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-500"
    if (progress >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (progress >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  // Calculate year-to-date totals from monthly entries
  const calculateYearToDate = () => {
    const currentYear = new Date().getFullYear().toString()
    const yearEntries = monthlyEntries.filter(entry => entry.month_year.startsWith(currentYear))
    
    return yearEntries.reduce((acc, entry) => ({
      totalSales: acc.totalSales + entry.annuity_sales + entry.aum_sales + entry.life_sales,
      totalCommissionIncome: acc.totalCommissionIncome + calculateCommissionIncome(entry),
      totalClients: acc.totalClients + entry.new_clients,
      totalAppointments: acc.totalAppointments + entry.new_appointments,
      totalLeads: acc.totalLeads + entry.new_leads,
      totalMarketingExpenses: acc.totalMarketingExpenses + entry.marketing_expenses,
      annuitySales: acc.annuitySales + entry.annuity_sales,
      aumSales: acc.aumSales + entry.aum_sales,
      lifeSales: acc.lifeSales + entry.life_sales,
    }), {
      totalSales: 0,
      totalCommissionIncome: 0,
      totalClients: 0,
      totalAppointments: 0,
      totalLeads: 0,
      totalMarketingExpenses: 0,
      annuitySales: 0,
      aumSales: 0,
      lifeSales: 0,
    })
  }



  // Get goals from basecamp
  const getGoals = () => {
    return {
      businessGoal: data.businessGoals?.business_goal || 0,
      aumGoal: data.businessGoals?.aum_goal || 0,
      annuityGoal: data.businessGoals?.annuity_goal || 0,
      lifeGoal: data.businessGoals?.life_target_goal || 0,
      lifeTargetGoal: data.businessGoals?.life_target_goal || 0,
      newClientsGoal: (() => {
        // Calculate proper formula for monthly new appointments
        const clientsNeeded = data.clientMetrics?.clients_needed || 0
        const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
        const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
        
        // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
        const annualIdealClosingProspects = avgCloseRatio > 0 
          ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
          : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
        
        // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
        const monthlyIdealProspects = annualIdealClosingProspects / 12
        
        // Monthly New Appointments = Monthly Ideal Prospects * 3
        return Math.ceil(monthlyIdealProspects * 3)
      })(),
      newAppointmentsGoal: (() => {
        // Calculate proper formula for monthly new appointments
        const clientsNeeded = data.clientMetrics?.clients_needed || 0
        const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
        const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
        
        // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
        const annualIdealClosingProspects = avgCloseRatio > 0 
          ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
          : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
        
        // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
        const monthlyIdealProspects = annualIdealClosingProspects / 12
        
        // Monthly New Appointments = Monthly Ideal Prospects * 3
        return Math.ceil(monthlyIdealProspects * 3)
      })(),
      newLeadsGoal: (() => {
        // Calculate proper formula for monthly new appointments
        const clientsNeeded = data.clientMetrics?.clients_needed || 0
        const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
        const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
        
        // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
        const annualIdealClosingProspects = avgCloseRatio > 0 
          ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
          : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
        
        // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
        const monthlyIdealProspects = annualIdealClosingProspects / 12
        
        // Monthly New Appointments = Monthly Ideal Prospects * 3
        return Math.ceil(monthlyIdealProspects * 3)
      })(),
    }
  }

  // Calculate commission income for a given entry
  const calculateCommissionIncome = (entry: MonthlyDataEntry) => {
    const commissionRates = data.commissionRates
    if (!commissionRates) return 0
    
    const annuityCommission = (entry.annuity_sales * commissionRates.annuity_commission) / 100
    const aumCommission = (entry.aum_sales * commissionRates.aum_commission) / 100
    const lifeCommission = (entry.life_sales * commissionRates.life_commission) / 100
    
    return annuityCommission + aumCommission + lifeCommission
  }

  const yearToDate = calculateYearToDate()
  const goals = getGoals()

  // Prepare chart data for goal comparison
  const prepareGoalComparisonData = () => {
    const currentYear = new Date().getFullYear().toString()
    const yearEntries = monthlyEntries
      .filter(entry => entry.month_year.startsWith(currentYear))
      .sort((a, b) => a.month_year.localeCompare(b.month_year))
    
    return yearEntries.map(entry => {
      const totalSales = entry.annuity_sales + entry.aum_sales + entry.life_sales
      const commissionIncome = calculateCommissionIncome(entry)
      const roi = entry.marketing_expenses > 0 
        ? ((commissionIncome - entry.marketing_expenses) / entry.marketing_expenses) * 100 
        : commissionIncome > 0 
          ? 9999 // Show high ROI when there's income but no expenses
          : 0
      
      return {
        month: format(parseISO(entry.month_year + "-01"), "MMM"),
        totalSales,
        commissionIncome,
        annuitySales: entry.annuity_sales,
        aumSales: entry.aum_sales,
        lifeSales: entry.life_sales,
        newClients: entry.new_clients,
        newAppointments: entry.new_appointments,
        newLeads: entry.new_leads,
        marketingExpenses: entry.marketing_expenses,
        roi,
        monthYear: entry.month_year,
      }
    })
  }

  const prepareGoalProgressData = () => {
    const currentYear = new Date().getFullYear().toString()
    const yearEntries = monthlyEntries.filter(entry => entry.month_year.startsWith(currentYear))
    
    const totalAnnuity = yearEntries.reduce((sum, entry) => sum + entry.annuity_sales, 0)
    const totalAUM = yearEntries.reduce((sum, entry) => sum + entry.aum_sales, 0)
    const totalLife = yearEntries.reduce((sum, entry) => sum + entry.life_sales, 0)
    const totalSales = totalAnnuity + totalAUM + totalLife
    
    return [
      { name: 'Annuity Goal', current: totalAnnuity, goal: goals.annuityGoal, color: '#8b5cf6' },
      { name: 'AUM Goal', current: totalAUM, goal: goals.aumGoal, color: '#10b981' },
      { name: 'Life Goal', current: totalLife, goal: goals.lifeGoal, color: '#f97316' },
      { name: 'Business Goal', current: totalSales, goal: goals.businessGoal, color: '#3b82f6' },
    ]
  }



  const prepareMonthlyProgressData = () => {
    const currentYear = new Date().getFullYear().toString()
    const yearEntries = monthlyEntries
      .filter(entry => entry.month_year.startsWith(currentYear))
      .sort((a, b) => a.month_year.localeCompare(b.month_year))
    
    return yearEntries.map((entry, index) => {
      const totalSales = entry.annuity_sales + entry.aum_sales + entry.life_sales
      const cumulativeSales = yearEntries
        .slice(0, index + 1)
        .reduce((sum, e) => sum + e.annuity_sales + e.aum_sales + e.life_sales, 0)
      
      return {
        month: format(parseISO(entry.month_year + "-01"), "MMM"),
        monthlySales: totalSales,
        cumulativeSales,
        monthlyGoal: goals.businessGoal / 12, // Monthly goal
        cumulativeGoal: (goals.businessGoal / 12) * (index + 1),
        progress: (cumulativeSales / goals.businessGoal) * 100,
      }
    })
  }

  const goalComparisonData = prepareGoalComparisonData()
  const goalProgressData = prepareGoalProgressData()
  const monthlyProgressData = prepareMonthlyProgressData()

  // Get selected month data for comparison
  const selectedMonthData = selectedMonthForComparison 
    ? monthlyEntries.find(entry => entry.month_year === selectedMonthForComparison)
    : null

  // Debug logging
  console.log('Monthly entries:', monthlyEntries)
  console.log('Goal comparison data:', goalComparisonData)
  console.log('Goal progress data:', goalProgressData)
  console.log('Monthly progress data:', monthlyProgressData)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monthly Data Entry</h2>
          <p className="text-muted-foreground">
            Track Your Monthly Performance And Compare Against Your Annual Goals From The Advisor Basecamp
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Monthly Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit Monthly Entry" : "Add Monthly Entry"}
              </DialogTitle>
              <DialogDescription>
                Enter Your Monthly Performance Data For Tracking And Goal Comparison.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select month</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select year</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() - i
                              return (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              )
                            })}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="new_clients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Clients</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="new_appointments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly New Appointments Booked</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="new_leads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Leads</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="annuity_sales"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annuity Sales ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            {...field}
                            value={formatCurrency(field.value)}
                            onChange={(e) => {
                              const rawValue = parseCurrency(e.target.value)
                              field.onChange(rawValue)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aum_sales"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AUM Sales ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            {...field}
                            value={formatCurrency(field.value)}
                            onChange={(e) => {
                              const rawValue = parseCurrency(e.target.value)
                              field.onChange(rawValue)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="life_sales"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Life Sales ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            {...field}
                            value={formatCurrency(field.value)}
                            onChange={(e) => {
                              const rawValue = parseCurrency(e.target.value)
                              field.onChange(rawValue)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marketing_expenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marketing Expenses ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$0"
                            {...field}
                            value={formatCurrency(field.value)}
                            onChange={(e) => {
                              const rawValue = parseCurrency(e.target.value)
                              field.onChange(rawValue)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about this month's performance..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEntry ? "Update Entry" : "Add Entry"}
                  </Button>

                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Selection for Comparison */}
      {monthlyEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Month Comparison Tool</CardTitle>
            <CardDescription>
              Select A Month To Compare Your Performance Against Your Goals And Review Your Notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="month-select" className="text-sm font-medium">
                  Select Month to Compare
                </label>
                <select
                  id="month-select"
                  value={selectedMonthForComparison}
                  onChange={(e) => setSelectedMonthForComparison(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Choose a month...</option>
                  {monthlyEntries
                    .sort((a, b) => b.month_year.localeCompare(a.month_year))
                    .map((entry) => (
                      <option key={entry.id} value={entry.month_year}>
                        {format(parseISO(entry.month_year + "-01"), "MMMM yyyy")}
                      </option>
                    ))}
                </select>
              </div>
              {selectedMonthForComparison && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedMonthForComparison("")}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month Comparison View */}
      {selectedMonthData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(parseISO(selectedMonthData.month_year + "-01"), "MMMM yyyy")} - Goal Comparison
            </CardTitle>
            <CardDescription>
              Performance Analysis And Notes For The Selected Month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">New Clients</div>
                <div className="text-2xl font-bold">{selectedMonthData.new_clients}</div>
                <div className="text-xs text-muted-foreground">Vs Goal: {goals.newClientsGoal}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Appointments Booked</div>
                <div className="text-2xl font-bold">{selectedMonthData.new_appointments}</div>
                <div className="text-xs text-muted-foreground">Vs Goal: {goals.newAppointmentsGoal}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">New Leads</div>
                <div className="text-2xl font-bold">{selectedMonthData.new_leads}</div>
                <div className="text-xs text-muted-foreground">Vs Goal: {goals.newLeadsGoal}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(selectedMonthData.annuity_sales + selectedMonthData.aum_sales + selectedMonthData.life_sales)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Vs Monthly Goal: {formatCurrency(goals.businessGoal / 12)}
                </div>
              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Annuity Sales</div>
                <div className="text-xl font-semibold">{formatCurrency(selectedMonthData.annuity_sales)}</div>
                <div className="text-xs text-muted-foreground">
                  Vs Goal: {formatCurrency(goals.annuityGoal / 12)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">AUM Sales</div>
                <div className="text-xl font-semibold">{formatCurrency(selectedMonthData.aum_sales)}</div>
                <div className="text-xs text-muted-foreground">
                  Vs Goal: {formatCurrency(goals.aumGoal / 12)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Life Sales</div>
                <div className="text-xl font-semibold">{formatCurrency(selectedMonthData.life_sales)}</div>
                <div className="text-xs text-muted-foreground">
                  Vs Goal: {formatCurrency(goals.lifeTargetGoal / 12)}
                </div>
              </div>
            </div>

            {/* Marketing Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Marketing Expenses</div>
                <div className="text-xl font-semibold">{formatCurrency(selectedMonthData.marketing_expenses)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Marketing ROI</div>
                <div className="text-xl font-semibold">
                  {selectedMonthData.marketing_expenses > 0 
                    ? (((calculateCommissionIncome(selectedMonthData) - selectedMonthData.marketing_expenses) / selectedMonthData.marketing_expenses) * 100).toFixed(0)
                    : calculateCommissionIncome(selectedMonthData) > 0 
                      ? "9999" // Show high ROI when there's income but no expenses
                      : "0"}%
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {selectedMonthData.notes && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Notes & Observations</div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMonthData.notes}</p>
                </div>
              </div>
            )}

            {/* Goal Progress Summary */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground">Goal Progress Summary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium">Sales Goal Progress</div>
                  <div className="text-2xl font-bold mt-2">
                    {((selectedMonthData.annuity_sales + selectedMonthData.aum_sales + selectedMonthData.life_sales) / (goals.businessGoal / 12) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(selectedMonthData.annuity_sales + selectedMonthData.aum_sales + selectedMonthData.life_sales)} Of {formatCurrency(goals.businessGoal / 12)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium">Client Acquisition Progress</div>
                  <div className="text-2xl font-bold mt-2">
                    {((selectedMonthData.new_clients / goals.newClientsGoal) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedMonthData.new_clients} Of {goals.newClientsGoal} Clients
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {monthlyEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Monthly Entries Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your monthly performance by adding your first entry.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Year-to-Date Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Business Goal Progress */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-blue-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Business Goal
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Progress against annual business goal
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-blue-500/10">
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {calculateProgress(yearToDate.totalSales, goals.businessGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(yearToDate.totalSales)} / {formatCurrency(goals.businessGoal)}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(yearToDate.totalSales, goals.businessGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.totalSales, goals.businessGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AUM Goal Progress */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-green-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AUM Goal
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Progress against annual AUM goal
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-green-500/10">
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {calculateProgress(yearToDate.aumSales, goals.aumGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(yearToDate.aumSales)} / {formatCurrency(goals.aumGoal)}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(yearToDate.aumSales, goals.aumGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.aumSales, goals.aumGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annuity Goal Progress */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-purple-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Annuity Goal
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Progress against annual annuity goal
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-purple-500/10">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">
                  {calculateProgress(yearToDate.annuitySales, goals.annuityGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(yearToDate.annuitySales)} / {formatCurrency(goals.annuityGoal)}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(yearToDate.annuitySales, goals.annuityGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.annuitySales, goals.annuityGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Life Goal Progress */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-orange-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Life Goal
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Progress against annual life goal
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-orange-500/10">
                  <Users className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {calculateProgress(yearToDate.lifeSales, goals.lifeGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(yearToDate.lifeSales)} / {formatCurrency(goals.lifeGoal)}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(yearToDate.lifeSales, goals.lifeGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.lifeSales, goals.lifeGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Year-to-Date Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-blue-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Clients
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Total new clients this year
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{yearToDate.totalClients}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Year to date</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-green-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Total appointments this year vs target
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-green-500/10">
                  <Calendar className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{yearToDate.totalAppointments}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Year to date</span>
                  {data.clientMetrics?.monthly_ideal_prospects && (
                    <span className="ml-2 text-xs">
                      vs Target: {Math.ceil((data.clientMetrics.monthly_ideal_prospects * 3) * 12)}
                    </span>
                  )}
                </div>
                {data.clientMetrics?.monthly_ideal_prospects && (
                  <div className="mt-2">
                    <Progress 
                      value={Math.min((yearToDate.totalAppointments / ((data.clientMetrics.monthly_ideal_prospects * 3) * 12)) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-purple-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Leads Generated
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Total leads this year
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-purple-500/10">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{yearToDate.totalLeads}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Year to date</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-orange-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Marketing ROI
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Return on marketing investment
                  </CardDescription>
                </CardTitle>
                <div className="rounded-full p-2 bg-orange-500/10">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {yearToDate.totalMarketingExpenses > 0 
                    ? ((yearToDate.totalCommissionIncome - yearToDate.totalMarketingExpenses) / yearToDate.totalMarketingExpenses * 100).toFixed(0)
                    : 0}%
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Year to date</span>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Charts and Visualizations */}

          {monthlyEntries.length > 0 && (
            <>
              {/* Goal Progress Chart */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progress vs Goals
                  </CardTitle>
                  <CardDescription>
                    Your progress against annual goals from the advisor basecamp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current Progress" />
                      <Bar dataKey="goal" fill="#ef4444" name="Annual Goal" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Progress Chart */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Progress
                  </CardTitle>
                  <CardDescription>
                    Monthly sales vs monthly goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']}
                        labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                      />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#3b82f6" name="Monthly Sales" />
                      <Bar dataKey="marketingExpenses" fill="#ef4444" name="Marketing Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cumulative Progress Chart */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Cumulative Progress
                  </CardTitle>
                  <CardDescription>
                    Cumulative progress against annual business goal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                        labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeSales" 
                        fill="#3b82f6" 
                        stroke="#3b82f6"
                        fillOpacity={0.3}
                        name="Cumulative Sales"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeGoal" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Annual Goal"
                      />
                      <Bar dataKey="monthlySales" fill="#10b981" name="Monthly Sales" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ROI and Marketing Performance */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Marketing ROI Trend
                    </CardTitle>
                    <CardDescription>
                      Return on marketing investment over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={goalComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'ROI']}
                          labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="roi" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          name="Marketing ROI"
                          dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Marketing Expenses vs Sales
                    </CardTitle>
                    <CardDescription>
                      Marketing spend compared to sales generated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={goalComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                          labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                        />
                        <Legend />
                        <Bar dataKey="totalSales" fill="#10b981" name="Total Sales" />
                        <Bar dataKey="marketingExpenses" fill="#ef4444" name="Marketing Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Monthly Entries</CardTitle>
              <CardDescription>
                Your Monthly Performance Data And Goal Progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>New Clients</TableHead>
                    <TableHead>Monthly New Appointments Booked</TableHead>
                    <TableHead>New Leads</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Marketing ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyEntries.map((entry) => {
                    const totalSales = entry.annuity_sales + entry.aum_sales + entry.life_sales
                    const commissionIncome = calculateCommissionIncome(entry)
                    const roi = entry.marketing_expenses > 0 
                      ? ((commissionIncome - entry.marketing_expenses) / entry.marketing_expenses) * 100 
                      : commissionIncome > 0 
                        ? 9999 // Show high ROI when there's income but no expenses
                        : 0
                    
                    // Calculate progress against goals (if available)
                    const businessGoal = data.businessGoals?.business_goal || 0
                    const monthlyGoal = businessGoal / 12
                    const salesProgress = calculateProgress(totalSales, monthlyGoal)
                    
                    // Check if this is the current year
                    const isCurrentYear = entry.month_year.startsWith(new Date().getFullYear().toString())
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {format(parseISO(entry.month_year + "-01"), "MMMM yyyy")}
                            {isCurrentYear && <Badge variant="secondary" className="text-xs">Current Year</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.new_clients}
                            {getProgressIcon(salesProgress)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.new_appointments}
                            {data.clientMetrics?.monthly_ideal_prospects && (
                              <Badge variant="outline" className="text-xs">
                                vs {Math.ceil(data.clientMetrics.monthly_ideal_prospects * 3)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{entry.new_leads}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatCurrency(totalSales)}
                            <Badge variant="outline" className={getProgressColor(salesProgress)}>
                              {salesProgress.toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roi > 0 ? "default" : "destructive"}>
                            {roi.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id!)}
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

          {/* Goal Comparison Summary */}
          {data.businessGoals && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress Summary</CardTitle>
                <CardDescription>
                  How your monthly performance compares to your annual goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(monthlyEntries.reduce((sum, entry) => sum + entry.annuity_sales, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Annuity Sales</div>
                    <div className="text-xs text-muted-foreground">
                      Goal: {formatCurrency(data.businessGoals.annuity_goal)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(monthlyEntries.reduce((sum, entry) => sum + entry.aum_sales, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total AUM Sales</div>
                    <div className="text-xs text-muted-foreground">
                      Goal: {formatCurrency(data.businessGoals.aum_goal)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {monthlyEntries.reduce((sum, entry) => sum + entry.new_clients, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total New Clients</div>
                    <div className="text-xs text-muted-foreground">
                      Goal: {data.businessGoals.business_goal}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 