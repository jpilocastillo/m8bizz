"use client"

import { useState, useEffect, useMemo } from "react"
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
import { aggregateEventDataByMonth } from "@/lib/client-tracking"
import { RefreshCw, Info } from "lucide-react"
import { Edit, Trash2, Plus, TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, BarChart3, PieChart, LineChart } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Line, LineChart as RechartsLineChart, Bar, BarChart, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ComposedChart } from "recharts"

// Form schema for monthly data entry
const monthlyEntrySchema = z.object({
  month: z.string().min(1, "Month Is Required"),
  year: z.string().min(1, "Year Is Required"),
  new_clients: z.string().min(1, "New Clients Is Required"),
  new_appointments: z.string().min(1, "New Appointments Is Required"),
  new_leads: z.string().min(1, "New Leads Is Required"),
  annuity_sales: z.string().min(1, "Annuity Sales Is Required"),
  aum_sales: z.string().min(1, "AUM Sales Is Required"),
  life_sales: z.string().min(1, "Life Sales Is Required"),
  marketing_expenses: z.string().min(1, "Marketing Expenses Is Required"),
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

interface MonthlyDataEntryComponentProps {
  selectedYear?: string
}

export function MonthlyDataEntryComponent({ selectedYear }: MonthlyDataEntryComponentProps = {}) {
  const { user } = useAuth()
  const year = selectedYear ? Number.parseInt(selectedYear) : new Date().getFullYear()
  const { data, addMonthlyDataEntry, updateMonthlyDataEntry, deleteMonthlyDataEntry, loadData, error: basecampError } = useAdvisorBasecamp(user, year)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MonthlyDataEntry | null>(null)
  const [selectedMonthForComparison, setSelectedMonthForComparison] = useState<string>("")
  const currentYear = selectedYear || new Date().getFullYear().toString()
  const [autoPopulatedData, setAutoPopulatedData] = useState<any>(null)
  const [isLoadingEventData, setIsLoadingEventData] = useState(false)
  const [clientNames, setClientNames] = useState<string[]>([])
  const [eventDataForMonth, setEventDataForMonth] = useState<any>(null)
  const [eventDataForAllMonths, setEventDataForAllMonths] = useState<Record<string, any>>({})

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

  // Filter monthly entries to only show entries from the selected year
  // Memoize to prevent infinite re-renders
  const monthlyEntries = useMemo(() => {
    return (data.monthlyDataEntries || []).filter(entry => 
      entry.month_year.startsWith(year.toString())
    )
  }, [data.monthlyDataEntries, year])

  // Clear selected month when year changes
  useEffect(() => {
    if (selectedMonthForComparison && !selectedMonthForComparison.startsWith(year.toString())) {
      setSelectedMonthForComparison("")
    }
  }, [year, selectedMonthForComparison])

  const handleSubmit = async (values: MonthlyEntryFormData) => {
    console.log("Form submitted with values:", values)
    try {
      if (!values.month || !values.year) {
        console.log("Missing month or year")
        toast({
          title: "Error",
          description: "Please Select Both Month And Year.",
          variant: "destructive",
        })
        return
      }

      const month_year = `${values.year}-${values.month.padStart(2, '0')}`
      console.log("Generated month_year:", month_year)

      // Parse and validate numeric values
      // Handle empty strings and ensure proper parsing
      const new_clients = parseInt(values.new_clients || "0") || 0
      const new_appointments = parseInt(values.new_appointments || "0") || 0
      const new_leads = parseInt(values.new_leads || "0") || 0
      const annuity_sales = parseFloat(parseCurrency(values.annuity_sales || "0")) || 0
      const aum_sales = parseFloat(parseCurrency(values.aum_sales || "0")) || 0
      const life_sales = parseFloat(parseCurrency(values.life_sales || "0")) || 0
      const marketing_expenses = parseFloat(parseCurrency(values.marketing_expenses || "0")) || 0
      
      console.log("Parsed values:", {
        new_clients,
        new_appointments,
        new_leads,
        annuity_sales,
        aum_sales,
        life_sales,
        marketing_expenses
      })

      // Validate that all numeric values are valid numbers
      if (isNaN(new_clients) || new_clients < 0) {
        toast({
          title: "Validation Error",
          description: "New Clients must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(new_appointments) || new_appointments < 0) {
        toast({
          title: "Validation Error",
          description: "New Appointments must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(new_leads) || new_leads < 0) {
        toast({
          title: "Validation Error",
          description: "New Leads must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(annuity_sales) || annuity_sales < 0) {
        toast({
          title: "Validation Error",
          description: "Annuity Sales must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(aum_sales) || aum_sales < 0) {
        toast({
          title: "Validation Error",
          description: "AUM Sales must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(life_sales) || life_sales < 0) {
        toast({
          title: "Validation Error",
          description: "Life Sales must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }
      if (isNaN(marketing_expenses) || marketing_expenses < 0) {
        toast({
          title: "Validation Error",
          description: "Marketing Expenses must be a valid non-negative number.",
          variant: "destructive",
        })
        return
      }

      const entryData = {
        month_year: month_year,
        new_clients: new_clients,
        new_appointments: new_appointments,
        new_leads: new_leads,
        annuity_sales: annuity_sales,
        aum_sales: aum_sales,
        life_sales: life_sales,
        marketing_expenses: marketing_expenses,
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
        // Refresh data after successful save
        await loadData()
        toast({
          title: editingEntry ? "Entry Updated Successfully" : "Entry Added Successfully",
          description: "Your Monthly Data Has Been Saved.",
        })
        handleCloseDialog()
      } else {
        // Show the actual error message from the service
        const errorMessage = basecampError || "Failed To Save Entry. Please Try Again."
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      const errorMessage = error instanceof Error ? error.message : "An Unexpected Error Occurred. Please Try Again."
      toast({
        title: "Error",
        description: errorMessage,
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
    if (confirm("Are You Sure You Want To Delete This Entry?")) {
      const success = await deleteMonthlyDataEntry(id)
      if (success) {
        toast({
          title: "Entry Deleted Successfully",
          description: "The Monthly Data Entry Has Been Removed.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed To Delete Entry. Please Try Again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEntry(null)
    setAutoPopulatedData(null)
    setClientNames([])
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

  const handleOpenDialog = async () => {
    setIsDialogOpen(true)
    // Reset form to defaults when opening
    setEditingEntry(null)
    setAutoPopulatedData(null)
    setClientNames([])
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const currentYear = new Date().getFullYear().toString()
    form.reset({
      month: currentMonth,
      year: currentYear,
      new_clients: "",
      new_appointments: "",
      new_leads: "",
      annuity_sales: "",
      aum_sales: "",
      life_sales: "",
      marketing_expenses: "",
      notes: "",
    })
    // Auto-load event data for current month
    await loadEventData(currentMonth, currentYear)
  }

  // Auto-populate from events when month/year changes
  const loadEventData = async (month: string, year: string) => {
    if (!month || !year || !user?.id) return

    setIsLoadingEventData(true)
    try {
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      const eventData = await aggregateEventDataByMonth(user.id, monthNum, yearNum)
      
      setAutoPopulatedData(eventData)
      setClientNames(eventData.client_names || [])

      // Only auto-populate if there's no existing entry
      const month_year = `${year}-${month.padStart(2, '0')}`
      const existing = monthlyEntries.find(e => e.month_year === month_year)
      
      if (!existing && eventData) {
        // Auto-populate form fields with event data
        // Log for debugging
        console.log('Auto-populating form with event data:', {
          month_year,
          eventData,
          appointments_booked: eventData.appointments_booked || 0,
          marketing_expenses: eventData.marketing_expenses || 0,
          annuity_sales: eventData.annuity_sales || 0,
          aum_sales: eventData.aum_sales || 0,
          life_sales: eventData.life_sales || 0,
          new_clients: eventData.new_clients || 0,
          client_names: eventData.client_names || []
        })
        
        const currentValues = form.getValues()
        // Set numeric values as strings (form will format currency fields for display)
        form.setValue('new_appointments', (eventData.appointments_booked || 0).toString(), { shouldValidate: false })
        form.setValue('marketing_expenses', (eventData.marketing_expenses || 0).toString(), { shouldValidate: false })
        form.setValue('annuity_sales', (eventData.annuity_sales || 0).toString(), { shouldValidate: false })
        form.setValue('aum_sales', (eventData.aum_sales || 0).toString(), { shouldValidate: false })
        form.setValue('life_sales', (eventData.life_sales || 0).toString(), { shouldValidate: false })
        form.setValue('new_clients', (eventData.new_clients || 0).toString(), { shouldValidate: false })
        
        // Add client names to notes if they exist (always add/update, don't duplicate)
        if (eventData.client_names && eventData.client_names.length > 0) {
          const clientNamesText = `Clients from events: ${eventData.client_names.join(', ')}`
          const existingNotes = currentValues.notes || ""
          
          // Remove existing client names line if present, then add new one
          const notesWithoutClientNames = existingNotes.replace(/\n\nClients from events:.*$/i, '').trim()
          const finalNotes = notesWithoutClientNames 
            ? `${notesWithoutClientNames}\n\n${clientNamesText}`
            : clientNamesText
          
          form.setValue('notes', finalNotes, { shouldValidate: false })
        }
      }
    } catch (error) {
      console.error("Error loading event data:", error)
    } finally {
      setIsLoadingEventData(false)
    }
  }

  // Check if entry exists when month/year changes in the form
  const checkExistingEntry = async (month: string, year: string) => {
    if (!month || !year) return
    
    const month_year = `${year}-${month.padStart(2, '0')}`
    const existing = monthlyEntries.find(e => e.month_year === month_year)
    
    if (existing) {
      console.log('Loading existing entry for editing:', { month_year, existing })
      setEditingEntry(existing)
      setAutoPopulatedData(null)
      setClientNames([])
      // Populate form with existing manual data (not event data)
      // The existing entry should only contain manual data after our fix
      form.reset({
        month: month,
        year: year,
        new_clients: existing.new_clients.toString(),
        new_appointments: existing.new_appointments.toString(),
        new_leads: existing.new_leads.toString(),
        annuity_sales: existing.annuity_sales.toString(),
        aum_sales: existing.aum_sales.toString(),
        life_sales: existing.life_sales.toString(),
        marketing_expenses: existing.marketing_expenses.toString(),
        notes: existing.notes || "",
      })
      // Also load event data to show in the "From Events" badges
      await loadEventData(month, year)
    } else {
      setEditingEntry(null)
      // Load event data for auto-population
      await loadEventData(month, year)
    }
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

  // Helper function to calculate true manual value (monthly entry - event data)
  // This prevents double-counting when monthly entries contain event data
  const getManualValue = (monthlyValue: number, eventValue: number): number => {
    // If monthly entry matches event data (within 0.01 tolerance for floating point), treat as 0 manual
    // Otherwise, monthly entry is the total (manual + any previously stored event data)
    // We subtract event data to get the true manual value, clamped to 0
    const difference = monthlyValue - eventValue
    return Math.max(0, difference)
  }

  // Calculate year-to-date totals from monthly entries (including event data)
  // Uses getManualValue to prevent double-counting when monthly entries contain event data
  const calculateYearToDate = () => {
    const yearEntries = monthlyEntries.filter(entry => entry.month_year.startsWith(currentYear))
    
    return yearEntries.reduce((acc, entry) => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const eventAnnuity = eventData.annuity_sales || 0
      const eventAUM = eventData.aum_sales || 0
      const eventLife = eventData.life_sales || 0
      const eventClients = eventData.new_clients || 0
      const eventAppointments = eventData.appointments_booked || 0
      const eventExpenses = eventData.marketing_expenses || 0
      
      // Calculate true manual values (monthly entry - event data)
      const manualAnnuity = getManualValue(entry.annuity_sales, eventAnnuity)
      const manualAUM = getManualValue(entry.aum_sales, eventAUM)
      const manualLife = getManualValue(entry.life_sales, eventLife)
      const manualClients = getManualValue(entry.new_clients, eventClients)
      const manualAppointments = getManualValue(entry.new_appointments, eventAppointments)
      const manualExpenses = getManualValue(entry.marketing_expenses, eventExpenses)
      
      // Total = manual + event
      const totalAnnuity = manualAnnuity + eventAnnuity
      const totalAUM = manualAUM + eventAUM
      const totalLife = manualLife + eventLife
      const totalClients = manualClients + eventClients
      const totalAppointments = manualAppointments + eventAppointments
      const totalExpenses = manualExpenses + eventExpenses
      
      return {
        totalSales: acc.totalSales + totalAnnuity + totalAUM + totalLife,
        totalCommissionIncome: acc.totalCommissionIncome + calculateCommissionIncome(entry) + eventAnnuity + eventAUM + eventLife,
        totalClients: acc.totalClients + totalClients,
        totalAppointments: acc.totalAppointments + totalAppointments,
        totalLeads: acc.totalLeads + entry.new_leads,
        totalMarketingExpenses: acc.totalMarketingExpenses + totalExpenses,
        annuitySales: acc.annuitySales + totalAnnuity,
        aumSales: acc.aumSales + totalAUM,
        lifeSales: acc.lifeSales + totalLife,
      }
    }, {
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

  // Memoize yearToDate calculation to prevent issues with initialization order
  const yearToDate = useMemo(() => calculateYearToDate(), [monthlyEntries, eventDataForAllMonths, currentYear])
  const goals = useMemo(() => getGoals(), [data.businessGoals, data.clientMetrics])

  // Prepare chart data for goal comparison (including event data)
  const prepareGoalComparisonData = () => {
    const yearEntries = monthlyEntries
      .filter(entry => entry.month_year.startsWith(currentYear))
      .sort((a, b) => a.month_year.localeCompare(b.month_year))
    
    return yearEntries.map(entry => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const eventAnnuity = eventData.annuity_sales || 0
      const eventAUM = eventData.aum_sales || 0
      const eventLife = eventData.life_sales || 0
      const eventExpenses = eventData.marketing_expenses || 0
      const eventClients = eventData.new_clients || 0
      const eventAppointments = eventData.appointments_booked || 0
      
      // Calculate true manual values to prevent double-counting
      const manualAnnuity = getManualValue(entry.annuity_sales, eventAnnuity)
      const manualAUM = getManualValue(entry.aum_sales, eventAUM)
      const manualLife = getManualValue(entry.life_sales, eventLife)
      const manualExpenses = getManualValue(entry.marketing_expenses, eventExpenses)
      const manualClients = getManualValue(entry.new_clients, eventClients)
      const manualAppointments = getManualValue(entry.new_appointments, eventAppointments)
      
      // Total = manual + event
      const totalSales = (manualAnnuity + manualAUM + manualLife) + (eventAnnuity + eventAUM + eventLife)
      const totalExpenses = manualExpenses + eventExpenses
      const commissionIncome = calculateCommissionIncome(entry) + eventAnnuity + eventAUM + eventLife
      const roi = totalExpenses > 0 
        ? ((commissionIncome - totalExpenses) / totalExpenses) * 100 
        : commissionIncome > 0 
          ? 9999 // Show high ROI when there's income but no expenses
          : 0
      
      return {
        month: format(parseISO(entry.month_year + "-01"), "MMM"),
        totalSales,
        commissionIncome,
        annuitySales: manualAnnuity + eventAnnuity,
        aumSales: manualAUM + eventAUM,
        lifeSales: manualLife + eventLife,
        newClients: manualClients + eventClients,
        newAppointments: manualAppointments + eventAppointments,
        newLeads: entry.new_leads,
        marketingExpenses: totalExpenses,
        roi,
        monthYear: entry.month_year,
      }
    })
  }

  const prepareGoalProgressData = () => {
    const yearEntries = monthlyEntries.filter(entry => entry.month_year.startsWith(currentYear))
    
    const totalAnnuity = yearEntries.reduce((sum, entry) => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const manualAnnuity = getManualValue(entry.annuity_sales, eventData.annuity_sales || 0)
      return sum + manualAnnuity + (eventData.annuity_sales || 0)
    }, 0)
    const totalAUM = yearEntries.reduce((sum, entry) => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const manualAUM = getManualValue(entry.aum_sales, eventData.aum_sales || 0)
      return sum + manualAUM + (eventData.aum_sales || 0)
    }, 0)
    const totalLife = yearEntries.reduce((sum, entry) => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const manualLife = getManualValue(entry.life_sales, eventData.life_sales || 0)
      return sum + manualLife + (eventData.life_sales || 0)
    }, 0)
    const totalSales = totalAnnuity + totalAUM + totalLife
    
    return [
      { name: 'Annuity Goal', current: totalAnnuity, goal: goals.annuityGoal, color: '#8b5cf6' },
      { name: 'AUM Goal', current: totalAUM, goal: goals.aumGoal, color: '#10b981' },
      { name: 'Life Goal', current: totalLife, goal: goals.lifeGoal, color: '#f97316' },
      { name: 'Business Goal', current: totalSales, goal: goals.businessGoal, color: '#3b82f6' },
    ]
  }



  const prepareMonthlyProgressData = () => {
    const yearEntries = monthlyEntries
      .filter(entry => entry.month_year.startsWith(currentYear))
      .sort((a, b) => a.month_year.localeCompare(b.month_year))
    
    return yearEntries.map((entry, index) => {
      const eventData = eventDataForAllMonths[entry.month_year] || {}
      const eventAnnuity = eventData.annuity_sales || 0
      const eventAUM = eventData.aum_sales || 0
      const eventLife = eventData.life_sales || 0
      
      // Calculate true manual values to prevent double-counting
      const manualAnnuity = getManualValue(entry.annuity_sales, eventAnnuity)
      const manualAUM = getManualValue(entry.aum_sales, eventAUM)
      const manualLife = getManualValue(entry.life_sales, eventLife)
      
      const totalSales = (manualAnnuity + manualAUM + manualLife) + (eventAnnuity + eventAUM + eventLife)
      const cumulativeSales = yearEntries
        .slice(0, index + 1)
        .reduce((sum, e) => {
          const eData = eventDataForAllMonths[e.month_year] || {}
          const mAnnuity = getManualValue(e.annuity_sales, eData.annuity_sales || 0)
          const mAUM = getManualValue(e.aum_sales, eData.aum_sales || 0)
          const mLife = getManualValue(e.life_sales, eData.life_sales || 0)
          return sum + mAnnuity + mAUM + mLife + (eData.annuity_sales || 0) + (eData.aum_sales || 0) + (eData.life_sales || 0)
        }, 0)
      
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

  // Memoize data preparation functions to prevent initialization order issues
  const goalComparisonData = useMemo(() => prepareGoalComparisonData(), [monthlyEntries, eventDataForAllMonths, currentYear])
  const goalProgressData = useMemo(() => prepareGoalProgressData(), [monthlyEntries, eventDataForAllMonths, currentYear, goals])
  const monthlyProgressData = useMemo(() => prepareMonthlyProgressData(), [monthlyEntries, eventDataForAllMonths, currentYear])

  // Get selected month data for comparison
  // Memoize selectedMonthData to prevent unnecessary re-renders
  const selectedMonthData = useMemo(() => {
    return selectedMonthForComparison 
      ? monthlyEntries.find(entry => entry.month_year === selectedMonthForComparison)
      : null
  }, [selectedMonthForComparison, monthlyEntries])

  // Fetch event data for all months when entries or user changes
  useEffect(() => {
    const fetchAllEventData = async () => {
      if (!user || monthlyEntries.length === 0) {
        setEventDataForAllMonths({})
        return
      }
      
      setIsLoadingEventData(true)
      try {
        const eventDataMap: Record<string, any> = {}
        
        // Fetch event data for each month
        for (const entry of monthlyEntries) {
          const [year, month] = entry.month_year.split('-')
          try {
            const eventData = await aggregateEventDataByMonth(user.id, parseInt(month), parseInt(year))
            eventDataMap[entry.month_year] = eventData
          } catch (error) {
            console.error(`Error fetching event data for ${entry.month_year}:`, error)
            eventDataMap[entry.month_year] = null
          }
        }
        
        setEventDataForAllMonths(eventDataMap)
        
        // Set event data for selected month if available
        if (selectedMonthData) {
          setEventDataForMonth(eventDataMap[selectedMonthData.month_year] || null)
        }
      } catch (error) {
        console.error("Error fetching event data:", error)
        setEventDataForAllMonths({})
      } finally {
        setIsLoadingEventData(false)
      }
    }

    fetchAllEventData()
  }, [monthlyEntries, user])

  // Update event data for selected month when selection changes
  useEffect(() => {
    if (selectedMonthData && eventDataForAllMonths[selectedMonthData.month_year]) {
      setEventDataForMonth(eventDataForAllMonths[selectedMonthData.month_year])
    } else {
      setEventDataForMonth(null)
    }
  }, [selectedMonthData, eventDataForAllMonths])

  // Calculate true manual values for the selected month
  const manualValues = useMemo(() => {
    if (!selectedMonthData || !eventDataForMonth) {
      return {
        new_clients: selectedMonthData?.new_clients || 0,
        new_appointments: selectedMonthData?.new_appointments || 0,
        annuity_sales: selectedMonthData?.annuity_sales || 0,
        aum_sales: selectedMonthData?.aum_sales || 0,
        life_sales: selectedMonthData?.life_sales || 0,
        marketing_expenses: selectedMonthData?.marketing_expenses || 0,
      }
    }
    return {
      new_clients: getManualValue(selectedMonthData.new_clients, eventDataForMonth.new_clients || 0),
      new_appointments: getManualValue(selectedMonthData.new_appointments, eventDataForMonth.appointments_booked || 0),
      annuity_sales: getManualValue(selectedMonthData.annuity_sales, eventDataForMonth.annuity_sales || 0),
      aum_sales: getManualValue(selectedMonthData.aum_sales, eventDataForMonth.aum_sales || 0),
      life_sales: getManualValue(selectedMonthData.life_sales, eventDataForMonth.life_sales || 0),
      marketing_expenses: getManualValue(selectedMonthData.marketing_expenses, eventDataForMonth.marketing_expenses || 0),
    }
  }, [selectedMonthData, eventDataForMonth])

  // Debug logging
  console.log('Monthly entries:', monthlyEntries)
  console.log('Goal comparison data:', goalComparisonData)
  console.log('Goal progress data:', goalProgressData)
  console.log('Monthly progress data:', monthlyProgressData)
  console.log('Event data for month:', eventDataForMonth)
  console.log('Manual values:', manualValues)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Monthly Data Entry</h2>
          <p className="text-m8bs-muted mt-2">
            Track Your Monthly Performance And Compare Against Your Annual Goals From The Advisor Basecamp
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            handleCloseDialog()
          } else {
            handleOpenDialog()
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={handleOpenDialog}>
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
                {editingEntry 
                  ? `Update your monthly performance data for ${editingEntry.month_year}.`
                  : "Enter Your Monthly Performance Data For Tracking And Goal Comparison."}
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
                        <FormLabel className="text-white font-medium">Month</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              checkExistingEntry(e.target.value, form.getValues('year'))
                            }}
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
                        <FormLabel className="text-white font-medium">Year</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={async (e) => {
                              field.onChange(e)
                              await checkExistingEntry(form.getValues('month'), e.target.value)
                            }}
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          New Clients
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {autoPopulatedData.new_clients || 0}
                            </Badge>
                          )}
                        </FormLabel>
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          Monthly New Appointments Booked
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {autoPopulatedData.appointments_booked || 0}
                            </Badge>
                          )}
                        </FormLabel>
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
                        <FormLabel className="text-white font-medium">New Leads</FormLabel>
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          Annuity Sales ($)
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {formatCurrency(autoPopulatedData.annuity_sales || 0)}
                            </Badge>
                          )}
                        </FormLabel>
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          AUM Sales ($)
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {formatCurrency(autoPopulatedData.aum_sales || 0)}
                            </Badge>
                          )}
                        </FormLabel>
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          Life Sales ($)
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {formatCurrency(autoPopulatedData.life_sales || 0)}
                            </Badge>
                          )}
                        </FormLabel>
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
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          Marketing Expenses ($)
                          {autoPopulatedData && !editingEntry && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                              From Events: {formatCurrency(autoPopulatedData.marketing_expenses || 0)}
                            </Badge>
                          )}
                        </FormLabel>
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

                {/* Client Names Display */}
                {clientNames.length > 0 && !editingEntry && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-300 mb-2">Clients from Events:</p>
                        <div className="flex flex-wrap gap-2">
                          {clientNames.map((name, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-500/20 text-blue-300">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Notes</FormLabel>
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

                <div className="flex justify-between items-center">
                  {!editingEntry && form.getValues('month') && form.getValues('year') && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await loadEventData(form.getValues('month'), form.getValues('year'))
                      }}
                      disabled={isLoadingEventData}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingEventData ? 'animate-spin' : ''}`} />
                      Refresh from Events
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingEntry ? "Update Entry" : "Add Entry"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Selection for Comparison */}
      {monthlyEntries.length > 0 && (
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">Month Comparison Tool</CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">
              Select A Month To Compare Your Performance Against Your Goals And Review Your Notes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="month-select" className="text-sm font-medium text-white">
                  Select Month to Compare
                </label>
                <select
                  id="month-select"
                  value={selectedMonthForComparison}
                  onChange={(e) => setSelectedMonthForComparison(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-m8bs-border bg-m8bs-card-alt text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
            <CardTitle className="text-xl font-extrabold text-white tracking-tight">
              {format(parseISO(selectedMonthData.month_year + "-01"), "MMMM yyyy")} - Goal Comparison
            </CardTitle>
            <CardDescription className="text-m8bs-muted mt-2">
              Performance Analysis And Notes For The Selected Month
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">New Clients</div>
                <div className="text-2xl font-bold text-white">
                  {(manualValues.new_clients + (eventDataForMonth?.new_clients || 0)).toLocaleString()}
                </div>
                <div className="text-xs text-m8bs-muted">Vs Goal: {goals.newClientsGoal.toLocaleString()}</div>
                {(manualValues.new_clients > 0 || (eventDataForMonth && eventDataForMonth.new_clients > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({manualValues.new_clients} manual + {(eventDataForMonth?.new_clients || 0)} from events)
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Appointments Booked</div>
                <div className="text-2xl font-bold text-white">
                  {(manualValues.new_appointments + (eventDataForMonth?.appointments_booked || 0)).toLocaleString()}
                </div>
                <div className="text-xs text-m8bs-muted">Vs Goal: {goals.newAppointmentsGoal.toLocaleString()}</div>
                {(manualValues.new_appointments > 0 || (eventDataForMonth && eventDataForMonth.appointments_booked > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({manualValues.new_appointments} manual + {(eventDataForMonth?.appointments_booked || 0)} from events)
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">New Leads</div>
                <div className="text-2xl font-bold text-white">{selectedMonthData.new_leads.toLocaleString()}</div>
                <div className="text-xs text-m8bs-muted">Vs Goal: {goals.newLeadsGoal.toLocaleString()}</div>
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Total Sales</div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(
                    (manualValues.annuity_sales + manualValues.aum_sales + manualValues.life_sales) +
                    ((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0))
                  )}
                </div>
                <div className="text-xs text-m8bs-muted">
                  Vs Monthly Goal: {formatCurrency(goals.businessGoal / 12)}
                </div>
                {((manualValues.annuity_sales + manualValues.aum_sales + manualValues.life_sales) > 0 || ((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0)) > 0) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({formatCurrency(manualValues.annuity_sales + manualValues.aum_sales + manualValues.life_sales)} manual + {formatCurrency((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0))} from events)
                  </div>
                )}
              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Annuity Sales</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(manualValues.annuity_sales + (eventDataForMonth?.annuity_sales || 0))}
                </div>
                <div className="text-xs text-m8bs-muted">
                  Vs Goal: {formatCurrency(goals.annuityGoal / 12)}
                </div>
                {(manualValues.annuity_sales > 0 || (eventDataForMonth && eventDataForMonth.annuity_sales > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({formatCurrency(manualValues.annuity_sales)} manual + {formatCurrency(eventDataForMonth?.annuity_sales || 0)} from events)
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">AUM Sales</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(manualValues.aum_sales + (eventDataForMonth?.aum_sales || 0))}
                </div>
                <div className="text-xs text-m8bs-muted">
                  Vs Goal: {formatCurrency(goals.aumGoal / 12)}
                </div>
                {(manualValues.aum_sales > 0 || (eventDataForMonth && eventDataForMonth.aum_sales > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({formatCurrency(manualValues.aum_sales)} manual + {formatCurrency(eventDataForMonth?.aum_sales || 0)} from events)
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Life Sales</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(manualValues.life_sales + (eventDataForMonth?.life_sales || 0))}
                </div>
                <div className="text-xs text-m8bs-muted">
                  Vs Goal: {formatCurrency(goals.lifeTargetGoal / 12)}
                </div>
                {(manualValues.life_sales > 0 || (eventDataForMonth && eventDataForMonth.life_sales > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({formatCurrency(manualValues.life_sales)} manual + {formatCurrency(eventDataForMonth?.life_sales || 0)} from events)
                  </div>
                )}
              </div>
            </div>

            {/* Marketing Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Marketing Expenses</div>
                <div className="text-xl font-semibold text-white">
                  {formatCurrency(manualValues.marketing_expenses + (eventDataForMonth?.marketing_expenses || 0))}
                </div>
                {(manualValues.marketing_expenses > 0 || (eventDataForMonth && eventDataForMonth.marketing_expenses > 0)) && (
                  <div className="text-xs text-blue-400 mt-1">
                    ({formatCurrency(manualValues.marketing_expenses)} manual + {formatCurrency(eventDataForMonth?.marketing_expenses || 0)} from events)
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                <div className="text-sm font-medium text-m8bs-muted">Marketing ROI</div>
                <div className="text-xl font-semibold text-white">
                  {(() => {
                    const totalExpenses = manualValues.marketing_expenses + (eventDataForMonth?.marketing_expenses || 0)
                    const totalIncome = calculateCommissionIncome(selectedMonthData) + 
                      ((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0))
                    return totalExpenses > 0 
                      ? (((totalIncome - totalExpenses) / totalExpenses) * 100).toFixed(0)
                      : totalIncome > 0 
                        ? "9999" // Show high ROI when there's income but no expenses
                        : "0"
                  })()}%
                </div>
              </div>
            </div>

            {/* Event Data Summary */}
            {eventDataForMonth && eventDataForMonth.client_names && eventDataForMonth.client_names.length > 0 && (
              <div className="space-y-2 border-t border-m8bs-border pt-4">
                <div className="text-sm font-medium text-m8bs-muted">Clients from Events</div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm mb-2 text-blue-300 font-medium">
                    <strong>{eventDataForMonth.client_names.length}</strong> clients closed from events this month:
                  </div>
                  <div className="text-xs text-blue-200/90">
                    {eventDataForMonth.client_names.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            {selectedMonthData.notes && (
              <div className="space-y-2 border-t border-m8bs-border pt-4">
                <div className="text-sm font-medium text-m8bs-muted">Notes & Observations</div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap text-purple-200/90">{selectedMonthData.notes}</p>
                </div>
              </div>
            )}

            {/* Goal Progress Summary */}
            <div className="space-y-4 border-t border-m8bs-border pt-4">
              <div className="text-sm font-medium text-m8bs-muted">Goal Progress Summary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                  <div className="text-sm font-medium text-m8bs-muted">Sales Goal Progress</div>
                  <div className="text-2xl font-bold mt-2 text-white">
                    {(() => {
                      const totalSales = (manualValues.annuity_sales + manualValues.aum_sales + manualValues.life_sales) +
                        ((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0))
                      return ((totalSales / (goals.businessGoal / 12)) * 100).toFixed(0)
                    })()}%
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    {(() => {
                      const totalSales = (manualValues.annuity_sales + manualValues.aum_sales + manualValues.life_sales) +
                        ((eventDataForMonth?.annuity_sales || 0) + (eventDataForMonth?.aum_sales || 0) + (eventDataForMonth?.life_sales || 0))
                      return `${formatCurrency(totalSales)} Of ${formatCurrency(goals.businessGoal / 12)}`
                    })()}
                  </div>
                </div>
                <div className="p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                  <div className="text-sm font-medium text-m8bs-muted">Client Acquisition Progress</div>
                  <div className="text-2xl font-bold mt-2 text-white">
                    {(() => {
                      const totalClients = manualValues.new_clients + (eventDataForMonth?.new_clients || 0)
                      return ((totalClients / goals.newClientsGoal) * 100).toFixed(0)
                    })()}%
                  </div>
                  <div className="text-xs text-m8bs-muted mt-1">
                    {(() => {
                      const totalClients = manualValues.new_clients + (eventDataForMonth?.new_clients || 0)
                      return `${totalClients.toLocaleString()} Of ${goals.newClientsGoal.toLocaleString()} Clients`
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {monthlyEntries.length === 0 ? (
        <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">No Monthly Entries Yet</h3>
              <p className="text-m8bs-muted mb-4">
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
            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Business Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-blue-400 mb-1.5 tabular-nums tracking-tight">
                  {calculateProgress(yearToDate.totalSales, goals.businessGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">{formatCurrency(yearToDate.totalSales)}</span>
                  <span>/</span>
                  <span>{formatCurrency(goals.businessGoal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-m8bs-muted font-medium">Progress</span>
                    <span className="text-white font-semibold">{calculateProgress(yearToDate.totalSales, goals.businessGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.totalSales, goals.businessGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AUM Goal Progress */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  AUM Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-green-400 mb-1.5 tabular-nums tracking-tight">
                  {calculateProgress(yearToDate.aumSales, goals.aumGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">{formatCurrency(yearToDate.aumSales)}</span>
                  <span>/</span>
                  <span>{formatCurrency(goals.aumGoal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-m8bs-muted font-medium">Progress</span>
                    <span className="text-white font-semibold">{calculateProgress(yearToDate.aumSales, goals.aumGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.aumSales, goals.aumGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annuity Goal Progress */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Annuity Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-purple-400 mb-1.5 tabular-nums tracking-tight">
                  {calculateProgress(yearToDate.annuitySales, goals.annuityGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">{formatCurrency(yearToDate.annuitySales)}</span>
                  <span>/</span>
                  <span>{formatCurrency(goals.annuityGoal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-m8bs-muted font-medium">Progress</span>
                    <span className="text-white font-semibold">{calculateProgress(yearToDate.annuitySales, goals.annuityGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.annuitySales, goals.annuityGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Life Goal Progress */}
            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Life Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-orange-400 mb-1.5 tabular-nums tracking-tight">
                  {calculateProgress(yearToDate.lifeSales, goals.lifeGoal).toFixed(0)}%
                </div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">{formatCurrency(yearToDate.lifeSales)}</span>
                  <span>/</span>
                  <span>{formatCurrency(goals.lifeGoal)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-m8bs-muted font-medium">Progress</span>
                    <span className="text-white font-semibold">{calculateProgress(yearToDate.lifeSales, goals.lifeGoal).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(calculateProgress(yearToDate.lifeSales, goals.lifeGoal), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Year-to-Date Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  New Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-blue-400 mb-1.5 tabular-nums tracking-tight">{yearToDate.totalClients}</div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">Year to date</span>
                  {(data.clientMetrics?.clients_needed || 0) > 0 && (
                    <>
                      <span>/</span>
                      <span>{data.clientMetrics.clients_needed}</span>
                    </>
                  )}
                </div>
                {(data.clientMetrics?.clients_needed || 0) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-m8bs-muted font-medium">Progress</span>
                      <span className="text-white font-semibold">{calculateProgress(yearToDate.totalClients, data.clientMetrics.clients_needed).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(calculateProgress(yearToDate.totalClients, data.clientMetrics.clients_needed), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-green-400 mb-1.5 tabular-nums tracking-tight">{yearToDate.totalAppointments}</div>
                <div className="flex items-center text-xs text-m8bs-muted mb-3 space-x-1">
                  <span className="font-medium">Year to date</span>
                  {data.clientMetrics?.monthly_ideal_prospects && (
                    <>
                      <span>/</span>
                      <span>{Math.ceil((data.clientMetrics.monthly_ideal_prospects * 3) * 12)}</span>
                    </>
                  )}
                </div>
                {data.clientMetrics?.monthly_ideal_prospects && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-m8bs-muted font-medium">Progress</span>
                      <span className="text-white font-semibold">
                        {Math.min((yearToDate.totalAppointments / ((data.clientMetrics.monthly_ideal_prospects * 3) * 12)) * 100, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-m8bs-border/40 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((yearToDate.totalAppointments / ((data.clientMetrics.monthly_ideal_prospects * 3) * 12)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Leads Generated
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-purple-400 mb-1.5 tabular-nums tracking-tight">{yearToDate.totalLeads}</div>
                <div className="flex items-center text-xs text-m8bs-muted font-medium">
                  <span>Year to date</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-m8bs-card border-m8bs-border rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="bg-m8bs-card px-4 py-3">
                <CardTitle className="text-xs font-semibold text-white">
                  Marketing ROI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 flex-1">
                <div className="text-3xl font-bold text-orange-400 mb-1.5 tabular-nums tracking-tight">
                  {yearToDate.totalMarketingExpenses > 0 
                    ? ((yearToDate.totalCommissionIncome - yearToDate.totalMarketingExpenses) / yearToDate.totalMarketingExpenses * 100).toFixed(0)
                    : yearToDate.totalCommissionIncome > 0 
                      ? "9999" // Show high ROI when there's income but no expenses
                      : "0"}%
                </div>
                <div className="flex items-center text-xs text-m8bs-muted font-medium">
                  <span>Year to date</span>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Charts and Visualizations */}

          {monthlyEntries.length > 0 && (
            <>
              {/* Goal Progress Chart */}
              <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                  <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Progress vs Goals
                  </CardTitle>
                  <CardDescription className="text-m8bs-muted mt-2">
                    Your progress against annual goals from the advisor basecamp
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.95)",
                          borderRadius: "8px",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          color: "#ffffff",
                          padding: "12px 16px",
                          boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                        labelStyle={{
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                          paddingBottom: "6px",
                        }}
                        itemStyle={{
                          color: "#ffffff",
                          fontSize: "13px",
                          padding: "4px 0",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#3b82f6" name="Current Progress" />
                      <Bar dataKey="goal" fill="#ef4444" name="Annual Goal" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Progress Chart */}
              <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                  <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Progress
                  </CardTitle>
                  <CardDescription className="text-m8bs-muted mt-2">
                    Monthly sales vs monthly goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']}
                        labelFormatter={(label) => `${label} ${currentYear}`}
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.95)",
                          borderRadius: "8px",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          color: "#ffffff",
                          padding: "12px 16px",
                          boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                        labelStyle={{
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                          paddingBottom: "6px",
                        }}
                        itemStyle={{
                          color: "#ffffff",
                          fontSize: "13px",
                          padding: "4px 0",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#3b82f6" name="Monthly Sales" />
                      <Bar dataKey="marketingExpenses" fill="#ef4444" name="Marketing Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cumulative Progress Chart */}
              <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                  <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Cumulative Progress
                  </CardTitle>
                  <CardDescription className="text-m8bs-muted mt-2">
                    Cumulative progress against annual business goal
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                        labelFormatter={(label) => `${label} ${currentYear}`}
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.95)",
                          borderRadius: "8px",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          color: "#ffffff",
                          padding: "12px 16px",
                          boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                        labelStyle={{
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                          paddingBottom: "6px",
                        }}
                        itemStyle={{
                          color: "#ffffff",
                          fontSize: "13px",
                          padding: "4px 0",
                        }}
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
                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Marketing ROI Trend
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">
                      Return on marketing investment over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={goalComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'ROI']}
                          labelFormatter={(label) => `${label} ${currentYear}`}
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.95)",
                            borderRadius: "8px",
                            border: "1px solid rgba(59, 130, 246, 0.5)",
                            color: "#ffffff",
                            padding: "12px 16px",
                            boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                          labelStyle={{
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "8px",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                            paddingBottom: "6px",
                          }}
                          itemStyle={{
                            color: "#ffffff",
                            fontSize: "13px",
                            padding: "4px 0",
                          }}
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

                <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
                    <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Marketing Expenses vs Sales
                    </CardTitle>
                    <CardDescription className="text-m8bs-muted mt-2">
                      Marketing spend compared to sales generated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={goalComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                          labelFormatter={(label) => `${label} ${currentYear}`}
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
              <CardTitle>Monthly Entries - {currentYear} YTD</CardTitle>
              <CardDescription>
                Your Monthly Performance Data And Goal Progress For {currentYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-md border border-m8bs-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-m8bs-border bg-m8bs-card-alt">
                      <TableHead className="text-white font-semibold">Month</TableHead>
                      <TableHead className="text-white font-semibold">New Clients</TableHead>
                      <TableHead className="text-white font-semibold">Client Names</TableHead>
                      <TableHead className="text-white font-semibold">Monthly New Appointments Booked</TableHead>
                      <TableHead className="text-white font-semibold">New Leads</TableHead>
                      <TableHead className="text-white font-semibold">Total Sales</TableHead>
                      <TableHead className="text-white font-semibold">Marketing ROI</TableHead>
                      <TableHead className="text-white font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {monthlyEntries
                    .filter(entry => entry.month_year.startsWith(currentYear))
                    .map((entry) => {
                    const eventData = eventDataForAllMonths[entry.month_year] || {}
                    const eventAnnuity = eventData.annuity_sales || 0
                    const eventAUM = eventData.aum_sales || 0
                    const eventLife = eventData.life_sales || 0
                    const eventExpenses = eventData.marketing_expenses || 0
                    const eventClients = eventData.new_clients || 0
                    const eventAppointments = eventData.appointments_booked || 0
                    
                    // Calculate true manual values to prevent double-counting
                    const manualAnnuity = getManualValue(entry.annuity_sales, eventAnnuity)
                    const manualAUM = getManualValue(entry.aum_sales, eventAUM)
                    const manualLife = getManualValue(entry.life_sales, eventLife)
                    const manualExpenses = getManualValue(entry.marketing_expenses, eventExpenses)
                    const manualClients = getManualValue(entry.new_clients, eventClients)
                    const manualAppointments = getManualValue(entry.new_appointments, eventAppointments)
                    
                    // Total = manual + event
                    const totalSales = (manualAnnuity + manualAUM + manualLife) + (eventAnnuity + eventAUM + eventLife)
                    const totalClients = manualClients + eventClients
                    const totalExpenses = manualExpenses + eventExpenses
                    const commissionIncome = calculateCommissionIncome(entry) + eventAnnuity + eventAUM + eventLife
                    const roi = totalExpenses > 0 
                      ? ((commissionIncome - totalExpenses) / totalExpenses) * 100 
                      : commissionIncome > 0 
                        ? 9999 // Show high ROI when there's income but no expenses
                        : 0
                    
                    // Calculate progress against goals (if available)
                    const businessGoal = data.businessGoals?.business_goal || 0
                    const monthlyGoal = businessGoal / 12
                    const salesProgress = calculateProgress(totalSales, monthlyGoal)
                    
                    // Check if this is the selected year
                    const isCurrentYear = entry.month_year.startsWith(currentYear)
                    
                    // Extract client names from notes
                    const extractClientNames = (notes: string | null | undefined): string[] => {
                      if (!notes) return []
                      const match = notes.match(/Clients from events:\s*(.+?)(?:\n\n|$)/i)
                      if (match && match[1]) {
                        return match[1].split(',').map(name => name.trim()).filter(Boolean)
                      }
                      return []
                    }
                    const clientNamesFromNotes = extractClientNames(entry.notes)
                    
                    return (
                      <TableRow key={entry.id} className="border-m8bs-border hover:bg-m8bs-card-alt/50">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            {format(parseISO(entry.month_year + "-01"), "MMMM yyyy")}
                            {isCurrentYear && <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50">Current Year</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            {totalClients}
                            {getProgressIcon(salesProgress)}
                            {eventClients > 0 && (
                              <span className="text-xs text-blue-400">
                                (+{eventClients})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {clientNamesFromNotes.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {clientNamesFromNotes.map((name, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-m8bs-muted text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            {manualAppointments + (eventData.appointments_booked || 0)}
                            {eventData.appointments_booked > 0 && (
                              <span className="text-xs text-blue-400">
                                (+{eventData.appointments_booked})
                              </span>
                            )}
                            {data.clientMetrics?.monthly_ideal_prospects && (
                              <Badge variant="outline" className="text-xs border-m8bs-border text-m8bs-muted">
                                vs {Math.ceil(data.clientMetrics.monthly_ideal_prospects * 3)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{entry.new_leads}</TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            {formatCurrency(totalSales)}
                            {eventAnnuity + eventAUM + eventLife > 0 && (
                              <span className="text-xs text-blue-400">
                                (+{formatCurrency(eventAnnuity + eventAUM + eventLife)})
                              </span>
                            )}
                            <Badge variant="outline" className={`${getProgressColor(salesProgress)} border-m8bs-border`}>
                              {salesProgress.toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <Badge variant={roi > 0 ? "default" : "destructive"} className={roi > 0 ? "bg-green-500/20 text-green-300 border-green-500/50" : ""}>
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
              </div>
            </CardContent>
          </Card>

          {/* Goal Comparison Summary */}
          {data.businessGoals && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress Summary - {currentYear} YTD</CardTitle>
                <CardDescription>
                  How your {currentYear} monthly performance compares to your annual goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {formatCurrency(monthlyEntries
                        .filter(entry => entry.month_year.startsWith(currentYear))
                        .reduce((sum, entry) => {
                          const eventData = eventDataForAllMonths[entry.month_year] || {}
                          const manualAnnuity = getManualValue(entry.annuity_sales, eventData.annuity_sales || 0)
                          return sum + manualAnnuity + (eventData.annuity_sales || 0)
                        }, 0))}
                    </div>
                    <div className="text-sm text-m8bs-muted mt-1">Total Annuity Sales (YTD)</div>
                    <div className="text-xs text-m8bs-muted mt-1">
                      Goal: {formatCurrency(data.businessGoals.annuity_goal)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(monthlyEntries
                        .filter(entry => entry.month_year.startsWith(currentYear))
                        .reduce((sum, entry) => {
                          const eventData = eventDataForAllMonths[entry.month_year] || {}
                          const manualAUM = getManualValue(entry.aum_sales, eventData.aum_sales || 0)
                          return sum + manualAUM + (eventData.aum_sales || 0)
                        }, 0))}
                    </div>
                    <div className="text-sm text-m8bs-muted mt-1">Total AUM Sales (YTD)</div>
                    <div className="text-xs text-m8bs-muted mt-1">
                      Goal: {formatCurrency(data.businessGoals.aum_goal)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-m8bs-card-alt border border-m8bs-border rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {monthlyEntries
                        .filter(entry => entry.month_year.startsWith(currentYear))
                        .reduce((sum, entry) => {
                          const eventData = eventDataForAllMonths[entry.month_year] || {}
                          const manualClients = getManualValue(entry.new_clients, eventData.new_clients || 0)
                          return sum + manualClients + (eventData.new_clients || 0)
                        }, 0)}
                    </div>
                    <div className="text-sm text-m8bs-muted mt-1">Total New Clients (YTD)</div>
                    <div className="text-xs text-m8bs-muted mt-1">
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