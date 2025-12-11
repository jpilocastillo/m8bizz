"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { useEffect, useMemo, useState, useRef } from "react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { User } from "@supabase/supabase-js"

// Currency formatting utility functions
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

// Campaign schema
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  budget: z.string().min(1, "Marketing costs is required"),
  events: z.string().min(1, "Number of events is required"),
  leads: z.string().min(1, "Leads generated is required"),
  status: z.enum(["Active", "Planned", "Completed", "Paused"]),
  frequency: z.enum(["Monthly", "Quarterly", "Semi-Annual", "Annual"]).optional(),
  costPerLead: z.string().optional(), // Auto-calculated field
  costPerClient: z.string().optional(), // Auto-calculated field
  totalCostOfEvent: z.string().optional(), // Auto-calculated field
  foodCosts: z.string().optional(),
})

// Form schema for advisor basecamp data
const formSchema = z.object({
  // Business Goals
  businessGoal: z.string().min(1, "Business goal is required"),
  aumGoalPercentage: z.string().min(1, "AUM goal percentage is required"),
  annuityGoalPercentage: z.string().min(1, "Annuity goal percentage is required"),
  lifeTargetGoalPercentage: z.string().min(1, "Life target goal percentage is required"),

  // Current Values
  currentAUM: z.string().min(1, "Current AUM is required"),
  currentAnnuity: z.string().min(1, "Current annuity is required"),
  currentLifeProduction: z.string().min(1, "Life Insurance Cash Value is required"),

  // Client Metrics
  avgAnnuitySize: z.string().min(1, "Average annuity size is required"),
  avgAUMSize: z.string().min(1, "Average AUM size is required"),
  avgNetWorthNeeded: z.string().optional(), // Auto-calculated field
  appointmentAttrition: z.string().min(1, "Appointment attrition is required"),
  avgCloseRatio: z.string().min(1, "Average close ratio is required"),
  annuityClosed: z.string().optional(), // Auto-calculated field
  aumAccounts: z.string().optional(), // Auto-calculated field
  monthlyIdealProspects: z.string().optional(),
  appointmentsPerCampaign: z.string().optional(),

  // Campaign Data
  campaigns: z.array(campaignSchema).min(1, "At least one campaign is required"),

  // Commission Percentages
  planningFeeRate: z.string().min(1, "Average planning fee rate is required"),
  annuityCommission: z.string().min(1, "Annuity commission percentage is required"),
  aumCommission: z.string().min(1, "AUM commission percentage is required"),
  lifeCommission: z.string().min(1, "Life commission percentage is required"),
  trailIncomePercentage: z.string().min(1, "Trail income percentage is required"),
})

interface DataEntryFormV2Props {
  user: User
  onComplete?: () => void
  onCancel?: () => void
  isEditMode?: boolean
}

export function DataEntryFormV2({ user, onComplete, onCancel, isEditMode = false }: DataEntryFormV2Props) {
  const { data, loading, saveAllData, error } = useAdvisorBasecamp(user)
  const [activeTab, setActiveTab] = useState("goals")
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)
  const hasInitializedRef = useRef(false)
  const dataInitializedRef = useRef(false)
  
  const tabs = ["goals", "current", "clients", "campaigns", "income"]
  const currentTabIndex = tabs.indexOf(activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1

  // Storage key based on user ID
  const storageKey = user ? `advisor-basecamp-form-${user.id}` : null

  const handleNext = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1])
    }
  }

  // Load form data from localStorage
  const loadFormDataFromStorage = (): Partial<z.infer<typeof formSchema>> | null => {
    if (!storageKey || typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error)
    }
    return null
  }

  // Save form data to localStorage
  const saveFormDataToStorage = (formData: z.infer<typeof formSchema>) => {
    if (!storageKey || typeof window === 'undefined') return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData))
    } catch (error) {
      console.error('Error saving form data to localStorage:', error)
    }
  }

  // Clear form data from localStorage
  const clearFormDataFromStorage = () => {
    if (!storageKey || typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing form data from localStorage:', error)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessGoal: "",
      aumGoalPercentage: "",
      annuityGoalPercentage: "",
      lifeTargetGoalPercentage: "",
      currentAUM: "",
      currentAnnuity: "",
      currentLifeProduction: "",
      avgAnnuitySize: "",
      avgAUMSize: "",
      avgNetWorthNeeded: "",
      appointmentAttrition: "",
      avgCloseRatio: "",
      annuityClosed: "",
      aumAccounts: "",
      monthlyIdealProspects: "",
      appointmentsPerCampaign: "",
      campaigns: [
        {
          name: "",
          budget: "",
          events: "",
          leads: "",
          status: "Active" as const,
          frequency: "Monthly" as const,
          costPerLead: "",
          costPerClient: "",
          totalCostOfEvent: "",
          foodCosts: "",
        },
      ],
      planningFeeRate: "",
      annuityCommission: "",
      aumCommission: "",
      lifeCommission: "",
      trailIncomePercentage: "",
    },
  })

  // Load from localStorage on mount (prioritize localStorage over database)
  useEffect(() => {
    if (!loading && !hasLoadedFromStorage) {
      const storedData = loadFormDataFromStorage()
      
      // Check if stored data has any meaningful values (not all empty)
      const hasStoredData = storedData && Object.values(storedData).some(value => {
        if (Array.isArray(value)) {
          return value.some((item: any) => 
            item && typeof item === 'object' && Object.values(item).some(v => v && v.toString().trim() !== '')
          )
        }
        return value && value.toString().trim() !== ''
      })
      
      // Always prioritize localStorage if it has data (user has unsaved changes)
      if (hasStoredData) {
        form.reset(storedData as z.infer<typeof formSchema>)
        setHasLoadedFromStorage(true)
        hasInitializedRef.current = true
        return
      }
      
      // If no localStorage data, load from database (only on initial load)
      if (data && isEditMode && !hasInitializedRef.current) {
        // Will be handled by the next useEffect
        hasInitializedRef.current = true
      }
      
      setHasLoadedFromStorage(true)
    }
  }, [loading, hasLoadedFromStorage, data, isEditMode, form])

  // Reset form when data changes (from database) - only on initial load, not on subsequent data changes
  useEffect(() => {
    // Only reset from database if:
    // 1. We have data and it's loaded
    // 2. We haven't initialized yet
    // 3. We're in edit mode
    // 4. There's no unsaved localStorage data
    if (data && !loading && hasLoadedFromStorage && isEditMode && !dataInitializedRef.current) {
      const storedData = loadFormDataFromStorage()
      const hasStoredData = storedData && Object.values(storedData).some(value => {
        if (Array.isArray(value)) {
          return value.some((item: any) => 
            item && typeof item === 'object' && Object.values(item).some(v => v && v.toString().trim() !== '')
          )
        }
        return value && value.toString().trim() !== ''
      })
      
      // Only load from database if there's no unsaved localStorage data
      if (!hasStoredData) {
        form.reset({
        businessGoal: data.businessGoals?.business_goal?.toString() || "",
        aumGoalPercentage: data.businessGoals?.aum_goal_percentage?.toString() || "",
        annuityGoalPercentage: data.businessGoals?.annuity_goal_percentage?.toString() || "",
        lifeTargetGoalPercentage: data.businessGoals?.life_target_goal_percentage?.toString() || "",
        currentAUM: data.currentValues?.current_aum?.toString() || "",
        currentAnnuity: data.currentValues?.current_annuity?.toString() || "",
        currentLifeProduction: data.currentValues?.current_life_production?.toString() || "",
        avgAnnuitySize: data.clientMetrics?.avg_annuity_size?.toString() || "",
        avgAUMSize: data.clientMetrics?.avg_aum_size?.toString() || "",
        avgNetWorthNeeded: data.clientMetrics?.avg_net_worth_needed?.toString() || "",
        appointmentAttrition: data.clientMetrics?.appointment_attrition?.toString() || "",
        avgCloseRatio: data.clientMetrics?.avg_close_ratio?.toString() || "",
        annuityClosed: data.clientMetrics?.annuity_closed?.toString() || "",
        aumAccounts: data.clientMetrics?.aum_accounts?.toString() || "",
        monthlyIdealProspects: data.clientMetrics?.monthly_ideal_prospects?.toString() || "",
        appointmentsPerCampaign: data.clientMetrics?.appointments_per_campaign?.toString() || "",
        campaigns: data.campaigns.length > 0 ? data.campaigns.map(c => ({
          name: c.name,
          budget: c.budget.toString(),
          events: c.events.toString(),
          leads: c.leads.toString(),
          status: c.status,
          frequency: (c as any).frequency || "Monthly",
          costPerLead: c.cost_per_lead?.toString() || "",
          costPerClient: c.cost_per_client?.toString() || "",
          totalCostOfEvent: (c as any).total_cost_of_event?.toString() || "",
          foodCosts: c.food_costs?.toString() || "",
        })) : [
          {
            name: "",
            budget: "",
            events: "",
            leads: "",
            status: "Active" as const,
            frequency: "Monthly" as const,
            costPerLead: "",
            costPerClient: "",
            totalCostOfEvent: "",
            foodCosts: "",
          },
        ],
        planningFeeRate: data.commissionRates?.planning_fee_rate?.toString() || "",
        annuityCommission: data.commissionRates?.annuity_commission?.toString() || "",
        aumCommission: data.commissionRates?.aum_commission?.toString() || "",
        lifeCommission: data.commissionRates?.life_commission?.toString() || "",
        trailIncomePercentage: data.commissionRates?.trail_income_percentage?.toString() || "",
        })
        // Clear storage when loading from database (only on initial load)
        clearFormDataFromStorage()
        dataInitializedRef.current = true
      }
    }
  }, [data, loading, form, hasLoadedFromStorage, isEditMode])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "campaigns",
  })

  // Watch values for calculations
  const watchedValues = form.watch([
    "businessGoal",
    "aumGoalPercentage",
    "annuityGoalPercentage",
    "lifeTargetGoalPercentage",
    "annuityCommission",
    "aumCommission",
    "lifeCommission",
    "trailIncomePercentage",
    "planningFeeRate",
  ])

  // Watch client metrics for auto-calculation
  const avgAnnuitySize = Number.parseFloat(form.watch("avgAnnuitySize") || "0")
  const avgAUMSize = Number.parseFloat(form.watch("avgAUMSize") || "0")
  const avgNetWorthNeeded = avgAnnuitySize + avgAUMSize

  // Calculate goal amounts for auto-calculation
  const businessGoalAmount = Number.parseFloat(form.watch("businessGoal") || "0")
  const aumGoalPercentage = Number.parseFloat(form.watch("aumGoalPercentage") || "0")
  const annuityGoalPercentage = Number.parseFloat(form.watch("annuityGoalPercentage") || "0")
  
  const aumGoalAmount = (businessGoalAmount * aumGoalPercentage) / 100
  const annuityGoalAmount = (businessGoalAmount * annuityGoalPercentage) / 100
  
  // Auto-calculate annuity closed and AUM accounts using formulas
  const calculatedAnnuityClosed = avgAnnuitySize > 0 ? Math.round(annuityGoalAmount / avgAnnuitySize) : 0
  const calculatedAUMAccounts = avgAUMSize > 0 ? Math.round(aumGoalAmount / avgAUMSize) : 0

  // Calculate clients needed
  const clientsNeeded = Math.round((calculatedAnnuityClosed + calculatedAUMAccounts) / 2)

  // Get additional metrics for proper calculations
  const appointmentAttrition = Number.parseFloat(form.watch("appointmentAttrition") || "0")
  const avgCloseRatio = Number.parseFloat(form.watch("avgCloseRatio") || "0")

  // Calculate proper formulas for the three key metrics
  // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
  const annualIdealClosingProspects = avgCloseRatio > 0 
    ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
    : 0

  // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
  const monthlyIdealProspects = annualIdealClosingProspects / 12

  // Monthly New Appointments Needed = Monthly Ideal Prospects * 3
  const monthlyNewAppointments = monthlyIdealProspects * 3

  // Annual Total Prospects Necessary = Monthly New Appointments * 12
  const annualTotalProspects = monthlyNewAppointments * 12

  // Update the form fields with calculated values
  useEffect(() => {
    form.setValue("avgNetWorthNeeded", avgNetWorthNeeded.toString())
    form.setValue("annuityClosed", calculatedAnnuityClosed.toString())
    form.setValue("aumAccounts", calculatedAUMAccounts.toString())
    form.setValue("monthlyIdealProspects", monthlyIdealProspects.toFixed(2))
  }, [avgNetWorthNeeded, calculatedAnnuityClosed, calculatedAUMAccounts, monthlyIdealProspects, form])

  // Calculate form completion progress
  const watchedProgressFields = form.watch([
    'businessGoal',
    'aumGoalPercentage',
    'annuityGoalPercentage',
    'lifeTargetGoalPercentage',
    'currentAUM',
    'currentAnnuity',
    'currentLifeProduction',
    'avgAnnuitySize',
    'avgAUMSize',
    'appointmentAttrition',
    'avgCloseRatio',
    'campaigns',
    'planningFeeRate',
    'annuityCommission',
    'aumCommission',
    'lifeCommission',
    'trailIncomePercentage',
    'annuityBookValue',
    'aumBookValue',
    'qualifiedMoneyValue',
    'surrenderPercent',
    'incomeRiderPercent',
    'freeWithdrawalPercent',
    'lifeInsurancePercent',
    'lifeStrategy1Percent',
    'lifeStrategy2Percent',
    'iraTo7702Percent',
    'approvalRatePercent',
    'surrenderRate',
    'incomeRiderRate',
    'freeWithdrawalRate',
    'lifeInsuranceRate',
    'lifeStrategy1Rate',
    'lifeStrategy2Rate',
    'iraTo7702Rate',
  ])
  
  const formProgress = useMemo(() => {
    const [
      businessGoal,
      aumGoalPercentage,
      annuityGoalPercentage,
      lifeTargetGoalPercentage,
      currentAUM,
      currentAnnuity,
      currentLifeProduction,
      avgAnnuitySize,
      avgAUMSize,
      appointmentAttrition,
      avgCloseRatio,
      campaigns,
      planningFeeRate,
      annuityCommission,
      aumCommission,
      lifeCommission,
      trailIncomePercentage,
      annuityBookValue,
      aumBookValue,
      qualifiedMoneyValue,
      surrenderPercent,
      incomeRiderPercent,
      freeWithdrawalPercent,
      lifeInsurancePercent,
      lifeStrategy1Percent,
      lifeStrategy2Percent,
      iraTo7702Percent,
      approvalRatePercent,
      surrenderRate,
      incomeRiderRate,
      freeWithdrawalRate,
      lifeInsuranceRate,
      lifeStrategy1Rate,
      lifeStrategy2Rate,
      iraTo7702Rate,
    ] = watchedProgressFields

    const requiredFields = [
      // Business Goals
      { key: 'businessGoal', value: businessGoal },
      { key: 'aumGoalPercentage', value: aumGoalPercentage },
      { key: 'annuityGoalPercentage', value: annuityGoalPercentage },
      { key: 'lifeTargetGoalPercentage', value: lifeTargetGoalPercentage },
      
      // Current Values
      { key: 'currentAUM', value: currentAUM },
      { key: 'currentAnnuity', value: currentAnnuity },
      { key: 'currentLifeProduction', value: currentLifeProduction },
      
      // Client Metrics
      { key: 'avgAnnuitySize', value: avgAnnuitySize },
      { key: 'avgAUMSize', value: avgAUMSize },
      { key: 'appointmentAttrition', value: appointmentAttrition },
      { key: 'avgCloseRatio', value: avgCloseRatio },
      
      // Campaigns (at least one campaign with all required fields and non-zero values)
      { key: 'campaigns', value: campaigns && campaigns.length > 0 && campaigns.some((c: any) => {
        if (!c.name || !c.budget || !c.events || !c.leads) return false
        // Check that budget, events, and leads are not zero
        const budget = Number.parseFloat(c.budget.toString().replace(/[$,]/g, ''))
        const events = Number.parseInt(c.events.toString())
        const leads = Number.parseInt(c.leads.toString())
        return !isNaN(budget) && budget !== 0 && !isNaN(events) && events !== 0 && !isNaN(leads) && leads !== 0
      }) },
      
      // Commission Rates
      { key: 'planningFeeRate', value: planningFeeRate },
      { key: 'annuityCommission', value: annuityCommission },
      { key: 'aumCommission', value: aumCommission },
      { key: 'lifeCommission', value: lifeCommission },
      { key: 'trailIncomePercentage', value: trailIncomePercentage },
      
      // Financial Book
      { key: 'annuityBookValue', value: annuityBookValue },
      { key: 'aumBookValue', value: aumBookValue },
      { key: 'qualifiedMoneyValue', value: qualifiedMoneyValue },
      
      // Financial Options Percentages
      { key: 'surrenderPercent', value: surrenderPercent },
      { key: 'incomeRiderPercent', value: incomeRiderPercent },
      { key: 'freeWithdrawalPercent', value: freeWithdrawalPercent },
      { key: 'lifeInsurancePercent', value: lifeInsurancePercent },
      { key: 'lifeStrategy1Percent', value: lifeStrategy1Percent },
      { key: 'lifeStrategy2Percent', value: lifeStrategy2Percent },
      { key: 'iraTo7702Percent', value: iraTo7702Percent },
      { key: 'approvalRatePercent', value: approvalRatePercent },
      
      // Financial Options Rates
      { key: 'surrenderRate', value: surrenderRate },
      { key: 'incomeRiderRate', value: incomeRiderRate },
      { key: 'freeWithdrawalRate', value: freeWithdrawalRate },
      { key: 'lifeInsuranceRate', value: lifeInsuranceRate },
      { key: 'lifeStrategy1Rate', value: lifeStrategy1Rate },
      { key: 'lifeStrategy2Rate', value: lifeStrategy2Rate },
      { key: 'iraTo7702Rate', value: iraTo7702Rate },
    ]
    
    const completedFields = requiredFields.filter(field => {
      if (field.key === 'campaigns') {
        return field.value === true
      }
      // Check if field has a value and it's not empty
      if (!field.value || field.value.toString().trim().length === 0) {
        return false
      }
      // Parse the value and check if it's zero (treat zero as incomplete)
      const numValue = Number.parseFloat(field.value.toString().replace(/[$,]/g, ''))
      return !isNaN(numValue) && numValue !== 0
    }).length
    
    return Math.round((completedFields / requiredFields.length) * 100)
  }, [watchedProgressFields])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedFromStorage || !storageKey) return
    
    let timeoutId: NodeJS.Timeout | null = null
    
    const subscription = form.watch((formData) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // Debounce the save to avoid too many writes
      timeoutId = setTimeout(() => {
        saveFormDataToStorage(formData as z.infer<typeof formSchema>)
      }, 500) // Save 500ms after user stops typing
    })
    
    return () => {
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [form, hasLoadedFromStorage, storageKey])

  // Handle page visibility - restore form from localStorage when user comes back
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      // When page becomes visible again, check if we should restore from localStorage
      if (!document.hidden && hasLoadedFromStorage && storageKey) {
        const storedData = loadFormDataFromStorage()
        const hasStoredData = storedData && Object.values(storedData).some(value => {
          if (Array.isArray(value)) {
            return value.some((item: any) => 
              item && typeof item === 'object' && Object.values(item).some(v => v && v.toString().trim() !== '')
            )
          }
          return value && value.toString().trim() !== ''
        })
        
        // If there's unsaved data, restore it (don't let database overwrite it)
        if (hasStoredData && dataInitializedRef.current) {
          form.reset(storedData as z.infer<typeof formSchema>)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hasLoadedFromStorage, storageKey, form])

  // Calculate life target goal amount
  const lifeTargetGoalAmount = (businessGoalAmount * Number.parseFloat(watchedValues[3] || "0")) / 100

  // Get current AUM for trail income calculation
  const currentAUM = Number.parseFloat(form.watch("currentAUM") || "0")

  // Calculate income values using the calculated goal amounts
  const annuityIncome = (annuityGoalAmount * Number.parseFloat(watchedValues[4] || "0")) / 100
  const aumIncome = (aumGoalAmount * Number.parseFloat(watchedValues[5] || "0")) / 100
  const lifeIncome = (lifeTargetGoalAmount * Number.parseFloat(watchedValues[6] || "0")) / 100
  const trailIncome = (currentAUM * Number.parseFloat(watchedValues[7] || "0")) / 100
  // Calculate planning fees count as clients needed using calculated values
  const planningFeesValue = Number.parseFloat(watchedValues[8] || "0") * clientsNeeded
  const totalIncome = annuityIncome + aumIncome + lifeIncome + trailIncome + planningFeesValue

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log('🚀 Form submission started!')
    console.log('Form values:', values)
    console.log('Form errors:', form.formState.errors)
    
    try {
      // Transform form data to database format
      const advisorData = {
        businessGoals: {
          business_goal: Number.parseFloat(values.businessGoal),
          aum_goal: aumGoalAmount,
          aum_goal_percentage: Number.parseFloat(values.aumGoalPercentage),
          annuity_goal: annuityGoalAmount,
          annuity_goal_percentage: Number.parseFloat(values.annuityGoalPercentage),
          life_target_goal: lifeTargetGoalAmount,
          life_target_goal_percentage: Number.parseFloat(values.lifeTargetGoalPercentage),
        },
        currentValues: {
          current_aum: Number.parseFloat(values.currentAUM),
          current_annuity: Number.parseFloat(values.currentAnnuity),
          current_life_production: Number.parseFloat(values.currentLifeProduction),
        },
        clientMetrics: {
          avg_annuity_size: Number.parseFloat(values.avgAnnuitySize),
          avg_aum_size: Number.parseFloat(values.avgAUMSize),
          avg_net_worth_needed: avgNetWorthNeeded, // Use calculated value
          appointment_attrition: Number.parseFloat(values.appointmentAttrition),
          avg_close_ratio: Number.parseFloat(values.avgCloseRatio),
          annuity_closed: calculatedAnnuityClosed, // Use calculated value
          aum_accounts: calculatedAUMAccounts, // Use calculated value
          clients_needed: clientsNeeded, // Use calculated value
          monthly_ideal_prospects: monthlyIdealProspects, // Use calculated value
          appointments_per_campaign: Number.parseFloat(values.appointmentsPerCampaign || "0"),
        },
        campaigns: values.campaigns.map(c => {
          const marketingCosts = Number.parseFloat(c.budget)
          const events = Number.parseInt(c.events)
          const leads = Number.parseInt(c.leads)
          const foodCosts = Number.parseFloat(c.foodCosts || "0")
          const avgCloseRatio = Number.parseFloat(values.avgCloseRatio)
          
          // Calculate cost per lead and cost per client
          const costPerLead = leads > 0 ? (marketingCosts + foodCosts) / leads : 0
          const closeRatioDecimal = avgCloseRatio / 100
          const costPerClient = closeRatioDecimal > 0 ? costPerLead / closeRatioDecimal : 0
          
          // Calculate total cost of event: (Marketing Costs + Food Costs) / Number of Events
          const totalCostOfEvent = events > 0 ? (marketingCosts + foodCosts) / events : 0
          
          return {
            name: c.name,
            budget: marketingCosts,
            events: events,
            leads: leads,
            status: c.status,
            frequency: c.frequency || "Monthly",
            cost_per_lead: costPerLead,
            cost_per_client: costPerClient,
            total_cost_of_event: totalCostOfEvent,
            food_costs: foodCosts,
          }
        }),
        commissionRates: {
          planning_fee_rate: Number.parseFloat(values.planningFeeRate),
          planning_fees_count: clientsNeeded, // Automatically calculated from clients needed
          annuity_commission: Number.parseFloat(values.annuityCommission),
          aum_commission: Number.parseFloat(values.aumCommission),
          life_commission: Number.parseFloat(values.lifeCommission),
          trail_income_percentage: Number.parseFloat(values.trailIncomePercentage),
        },
      }

      console.log('Submitting advisor data:', advisorData)
      const success = await saveAllData(advisorData)
      console.log('Save result:', success)
      
      if (success) {
        console.log('Form submission successful, calling onComplete...')
        
        // Clear localStorage after successful submission
        clearFormDataFromStorage()
        
        // Reset refs so form can properly initialize on next load
        hasInitializedRef.current = false
        dataInitializedRef.current = false
        
        toast({
          title: isEditMode ? "Data updated successfully" : "Business data setup complete!",
          description: isEditMode 
            ? "Your advisor basecamp data has been updated."
            : "You can now access your advisor basecamp dashboard.",
        })
        
        if (onComplete) {
          console.log('Calling onComplete callback')
          onComplete()
        } else {
          console.log('No onComplete callback provided')
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save data. Please check the console for details and try again.",
          variant: "destructive",
        })
        console.error('Failed to save advisor data')
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

  const addCampaign = () => {
    append({
      name: "",
      budget: "",
      events: "",
      leads: "",
      status: "Planned",
      frequency: "Monthly",
      costPerLead: "",
      costPerClient: "",
      totalCostOfEvent: "",
      foodCosts: "",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {isEditMode ? "Edit Business Data" : "Setup Your Advisor Basecamp"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode 
            ? "Update Your Business Goals, Metrics, And Campaign Data."
            : "Complete Your Business Profile To Access Your Personalized Advisor Dashboard."
          }
        </p>
        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>New User Setup:</strong> Fill Out All 5 Tabs Completely, Then Click "Submit Data" At The Bottom. 
              Once Submitted, You'll Automatically See Your Personalized Advisor Basecamp Dashboard With Charts, Metrics, And Insights.
              All Currency Fields Will Be Automatically Formatted With Commas And Decimals.
            </p>
          </div>
        )}
        
        {/* Data Completeness Progress Bar */}
        <Card className="mt-4 bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Data Completeness</span>
                <Badge variant="secondary" className="bg-m8bs-blue/20 text-m8bs-blue border-m8bs-blue/50">
                  {formProgress}%
                </Badge>
              </div>
              <Progress value={formProgress} className="h-2 bg-m8bs-border" />
              {formProgress === 100 && (
                <div className="flex items-center gap-2 mt-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Ready To Submit!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="current">Current Advisor Book</TabsTrigger>
              <TabsTrigger value="clients">Client Metrics</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="income">Revenue</TabsTrigger>
            </TabsList>

            {/* Goals Tab */}
            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <CardTitle>Business Goals</CardTitle>
                  <CardDescription>Set Your Business Goals For The Year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Goal ($)</FormLabel>
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
                        <FormDescription>Your Overall Business Goal In Dollars</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aumGoalPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AUM Goal Percentage (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormDescription>Percentage Of Business Goal For AUM</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annuityGoalPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annuity Goal Percentage (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormDescription>Percentage Of Business Goal For Annuity</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lifeTargetGoalPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Life Target Goal Percentage (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormDescription>Percentage Of Business Goal For Life Insurance</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <div className="w-full p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Calculated Goals</p>
                        <p className="text-lg font-semibold">AUM: {formatCurrency(aumGoalAmount)}</p>
                        <p className="text-lg font-semibold">Annuity: {formatCurrency(annuityGoalAmount)}</p>
                        <p className="text-lg font-semibold">Life: {formatCurrency(lifeTargetGoalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Current Advisor Book Tab */}
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle>Current Advisor Book</CardTitle>
                  <CardDescription>Your Current Advisor Book Metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="currentAUM"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current AUM ($)</FormLabel>
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
                      name="currentAnnuity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Annuity ($)</FormLabel>
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
                      name="currentLifeProduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Life Insurance Cash Value ($)</FormLabel>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Metrics Tab */}
            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Client Metrics</CardTitle>
                  <CardDescription>Key Performance Indicators For Your Client Base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="avgAnnuitySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Annuity Size ($)</FormLabel>
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
                      name="avgAUMSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average AUM Size ($)</FormLabel>
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
                      name="avgNetWorthNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Net Worth Needed ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text"
                              placeholder="$0"
                              {...field}
                              value={formatCurrency(field.value)}
                              readOnly
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>Auto-Calculated: Average Annuity Size + Average AUM Size</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentAttrition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment Attrition (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="avgCloseRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Close Ratio (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Annuities Closed (#)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={calculatedAnnuityClosed}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>Auto-Calculated: Annuity Goal / Average Annuity Size</FormDescription>
                    </FormItem>

                    <FormItem>
                      <FormLabel>AUM Accounts (#)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={calculatedAUMAccounts}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>Auto-Calculated: AUM Goal / Average AUM Size</FormDescription>
                    </FormItem>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Campaigns</CardTitle>
                  <CardDescription>Track Your Marketing Campaigns And Their Performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Campaign {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.status`}
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

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || "Monthly"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                                  <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                                  <SelectItem value="Annual">Annual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.budget`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marketing Costs ($)</FormLabel>
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
                          name={`campaigns.${index}.events`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Events (#)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.leads`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Leads Generated (#)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.totalCostOfEvent`}
                          render={({ field }) => {
                            const marketingCosts = Number.parseFloat(form.watch(`campaigns.${index}.budget`) || "0")
                            const events = Number.parseFloat(form.watch(`campaigns.${index}.events`) || "0")
                            const foodCosts = Number.parseFloat(form.watch(`campaigns.${index}.foodCosts`) || "0")
                            const totalCostOfEvent = events > 0 ? (marketingCosts + foodCosts) / events : 0
                            
                            return (
                              <FormItem>
                                <FormLabel>Total Cost of Event ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="text" 
                                    value={formatCurrency(totalCostOfEvent)}
                                    readOnly
                                    className="bg-muted"
                                    onChange={() => {}} // Prevent changes
                                    onBlur={() => {}} // Prevent blur events
                                  />
                                </FormControl>
                                <FormDescription>Auto-Calculated: (Marketing Costs + Food Costs) ÷ Events</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.costPerLead`}
                          render={({ field }) => {
                            const marketingCosts = Number.parseFloat(form.watch(`campaigns.${index}.budget`) || "0")
                            const leads = Number.parseFloat(form.watch(`campaigns.${index}.leads`) || "0")
                            const foodCosts = Number.parseFloat(form.watch(`campaigns.${index}.foodCosts`) || "0")
                            const costPerLead = leads > 0 ? (marketingCosts + foodCosts) / leads : 0
                            
                            return (
                              <FormItem>
                                <FormLabel>Cost per Lead ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="text" 
                                    value={formatCurrency(costPerLead)}
                                    readOnly
                                    className="bg-muted"
                                    onChange={() => {}} // Prevent changes
                                    onBlur={() => {}} // Prevent blur events
                                  />
                                </FormControl>
                                <FormDescription>Auto-Calculated: (Marketing Costs + Food Costs) ÷ Leads Generated</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.costPerClient`}
                          render={({ field }) => {
                            const marketingCosts = Number.parseFloat(form.watch(`campaigns.${index}.budget`) || "0")
                            const leads = Number.parseFloat(form.watch(`campaigns.${index}.leads`) || "0")
                            const foodCosts = Number.parseFloat(form.watch(`campaigns.${index}.foodCosts`) || "0")
                            const avgCloseRatio = Number.parseFloat(form.watch("avgCloseRatio") || "0")
                            
                            const costPerLead = leads > 0 ? (marketingCosts + foodCosts) / leads : 0
                            const closeRatioDecimal = avgCloseRatio / 100
                            const costPerClient = closeRatioDecimal > 0 ? costPerLead / closeRatioDecimal : 0
                            
                            return (
                              <FormItem>
                                <FormLabel>Cost per Client ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="text" 
                                    value={formatCurrency(costPerClient)}
                                    readOnly
                                    className="bg-muted"
                                    onChange={() => {}} // Prevent changes
                                    onBlur={() => {}} // Prevent blur events
                                  />
                                </FormControl>
                                <FormDescription>Auto-Calculated: Cost Per Lead ÷ Close Ratio</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )
                          }}
                        />

                        <FormField
                          control={form.control}
                          name={`campaigns.${index}.foodCosts`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Food Costs ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="$0"
                                  {...field}
                                  value={formatCurrency(field.value || "")}
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
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addCampaign}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Campaign
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="income">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Rates</CardTitle>
                    <CardDescription>Set Your Commission Percentages And Rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="planningFeeRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Planning Fee Rate ($)</FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="annuityCommission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annuity Commission (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="aumCommission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AUM Commission (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lifeCommission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Life Commission (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="trailIncomePercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trail Income Percentage (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Calculated Income</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div>Annuity: {formatCurrency(annuityIncome)}</div>
                        <div>AUM: {formatCurrency(aumIncome)}</div>
                        <div>Life: {formatCurrency(lifeIncome)}</div>
                        <div>Trail: {formatCurrency(trailIncome)}</div>
                        <div>Planning: {formatCurrency(planningFeesValue)}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <strong>Total: {formatCurrency(totalIncome)}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center space-x-4 pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstTab}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNext}
                disabled={isLastTab}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  size="lg"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                size="lg"
                onClick={async () => {
                  console.log('🔘 Submit button clicked!')
                  console.log('Form is valid:', form.formState.isValid)
                  console.log('Form errors:', form.formState.errors)
                  console.log('Form values:', form.getValues())
                  
                  // Force validation check
                  console.log('🔍 Triggering validation...')
                  const isValid = await form.trigger()
                  console.log('🔍 Validation result:', isValid)
                  console.log('🔍 Form errors after trigger:', form.formState.errors)
                  
                  // Check if form is valid before submission
                  if (!isValid) {
                    console.log('❌ Form is not valid, preventing submission')
                    console.log('❌ Validation errors:', JSON.stringify(form.formState.errors, null, 2))
                    
                    // Show specific field errors
                    Object.keys(form.formState.errors).forEach(field => {
                      console.log(`❌ Field "${field}":`, form.formState.errors[field])
                    })
                    
                    return
                  }
                  console.log('✅ Form is valid, proceeding with submission')
                }}
              >
                {isEditMode ? "Update Data" : "Complete Setup"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
} 