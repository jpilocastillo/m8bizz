"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { useEffect } from "react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  costPerLead: z.string().optional(), // Auto-calculated field
  costPerClient: z.string().optional(), // Auto-calculated field
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
  monthlyIdealProspects: z.string().min(1, "Monthly ideal prospects is required"),
  appointmentsPerCampaign: z.string().min(1, "Appointments per campaign is required"),

  // Campaign Data
  campaigns: z.array(campaignSchema).min(1, "At least one campaign is required"),

  // Commission Percentages
  planningFeeRate: z.string().min(1, "Planning fee rate is required"),
  annuityCommission: z.string().min(1, "Annuity commission percentage is required"),
  aumCommission: z.string().min(1, "AUM commission percentage is required"),
  lifeCommission: z.string().min(1, "Life commission percentage is required"),
  trailIncomePercentage: z.string().min(1, "Trail income percentage is required"),

  // Financial Book
  annuityBookValue: z.string().min(1, "Annuity book value is required"),
  aumBookValue: z.string().min(1, "AUM book value is required"),
  qualifiedMoneyValue: z.string().min(1, "Qualified money value is required"),

  // Financial Options Percentages
  surrenderPercent: z.string().min(1, "Surrender percentage is required"),
  incomeRiderPercent: z.string().min(1, "Income rider percentage is required"),
  freeWithdrawalPercent: z.string().min(1, "Free withdrawal percentage is required"),
  lifeInsurancePercent: z.string().min(1, "Life insurance percentage is required"),
  lifeStrategy1Percent: z.string().min(1, "Life strategy 1 percentage is required"),
  lifeStrategy2Percent: z.string().min(1, "Life strategy 2 percentage is required"),
  iraTo7702Percent: z.string().min(1, "IRA to 7702 percentage is required"),
  approvalRatePercent: z.string().min(1, "Approval rate percentage is required"),

  // Financial Options Rates
  surrenderRate: z.string().min(1, "Surrender rate is required"),
  incomeRiderRate: z.string().min(1, "Income rider rate is required"),
  freeWithdrawalRate: z.string().min(1, "Free withdrawal rate is required"),
  lifeInsuranceRate: z.string().min(1, "Life insurance rate is required"),
  lifeStrategy1Rate: z.string().min(1, "Life strategy 1 rate is required"),
  lifeStrategy2Rate: z.string().min(1, "Life strategy 2 rate is required"),
  iraTo7702Rate: z.string().min(1, "IRA to 7702 rate is required"),
})

interface DataEntryFormV2Props {
  user: User
  onComplete?: () => void
  isEditMode?: boolean
}

export function DataEntryFormV2({ user, onComplete, isEditMode = false }: DataEntryFormV2Props) {
  const { data, loading, saveAllData, error } = useAdvisorBasecamp(user)

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
          costPerLead: "",
          costPerClient: "",
          foodCosts: "",
        },
      ],
      planningFeeRate: "",
      annuityCommission: "",
      aumCommission: "",
      lifeCommission: "",
      trailIncomePercentage: "",
      annuityBookValue: "",
      aumBookValue: "",
      qualifiedMoneyValue: "",

      // Financial Options Percentages
      surrenderPercent: "10",
      incomeRiderPercent: "6",
      freeWithdrawalPercent: "10",
      lifeInsurancePercent: "10",
      lifeStrategy1Percent: "1",
      lifeStrategy2Percent: "2",
      iraTo7702Percent: "33",
      approvalRatePercent: "50",

      // Financial Options Rates
      surrenderRate: "6",
      incomeRiderRate: "10",
      freeWithdrawalRate: "6",
      lifeInsuranceRate: "10",
      lifeStrategy1Rate: "10",
      lifeStrategy2Rate: "10",
      iraTo7702Rate: "10",
    },
  })

  // Reset form when data changes
  useEffect(() => {
    if (data && !loading) {
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
          costPerLead: c.cost_per_lead?.toString() || "",
          costPerClient: c.cost_per_client?.toString() || "",
          foodCosts: c.food_costs?.toString() || "",
        })) : [
          {
            name: "",
            budget: "",
            events: "",
            leads: "",
            status: "Active" as const,
            costPerLead: "",
            costPerClient: "",
            foodCosts: "",
          },
        ],
        planningFeeRate: data.commissionRates?.planning_fee_rate?.toString() || "",
        annuityCommission: data.commissionRates?.annuity_commission?.toString() || "",
        aumCommission: data.commissionRates?.aum_commission?.toString() || "",
        lifeCommission: data.commissionRates?.life_commission?.toString() || "",
        trailIncomePercentage: data.commissionRates?.trail_income_percentage?.toString() || "",
        annuityBookValue: data.financialBook?.annuity_book_value?.toString() || "",
        aumBookValue: data.financialBook?.aum_book_value?.toString() || "",
        qualifiedMoneyValue: data.financialBook?.qualified_money_value?.toString() || "",

        // Financial Options Percentages
        surrenderPercent: data.financialOptions?.surrender_percent?.toString() || "10",
        incomeRiderPercent: data.financialOptions?.income_rider_percent?.toString() || "6",
        freeWithdrawalPercent: data.financialOptions?.free_withdrawal_percent?.toString() || "10",
        lifeInsurancePercent: data.financialOptions?.life_insurance_percent?.toString() || "10",
        lifeStrategy1Percent: data.financialOptions?.life_strategy1_percent?.toString() || "1",
        lifeStrategy2Percent: data.financialOptions?.life_strategy2_percent?.toString() || "2",
        iraTo7702Percent: data.financialOptions?.ira_to_7702_percent?.toString() || "33",
        approvalRatePercent: data.financialOptions?.approval_rate_percent?.toString() || "50",

        // Financial Options Rates
        surrenderRate: data.financialOptions?.surrender_rate?.toString() || "6",
        incomeRiderRate: data.financialOptions?.income_rider_rate?.toString() || "10",
        freeWithdrawalRate: data.financialOptions?.free_withdrawal_rate?.toString() || "6",
        lifeInsuranceRate: data.financialOptions?.life_insurance_rate?.toString() || "10",
        lifeStrategy1Rate: data.financialOptions?.life_strategy1_rate?.toString() || "10",
        lifeStrategy2Rate: data.financialOptions?.life_strategy2_rate?.toString() || "10",
        iraTo7702Rate: data.financialOptions?.ira_to_7702_rate?.toString() || "10",
      })
    }
  }, [data, loading, form])

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

  // Update the form fields with calculated values
  useEffect(() => {
    form.setValue("avgNetWorthNeeded", avgNetWorthNeeded.toFixed(2))
    form.setValue("annuityClosed", calculatedAnnuityClosed.toString())
    form.setValue("aumAccounts", calculatedAUMAccounts.toString())
  }, [avgNetWorthNeeded, calculatedAnnuityClosed, calculatedAUMAccounts, form])


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
  const clientsNeeded = Math.round((calculatedAnnuityClosed + calculatedAUMAccounts) / 2)
  const planningFeesValue = Number.parseFloat(watchedValues[8] || "0") * clientsNeeded
  const totalIncome = annuityIncome + aumIncome + lifeIncome + trailIncome + planningFeesValue

  async function handleSubmit(values: z.infer<typeof formSchema>) {
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
          monthly_ideal_prospects: Number.parseFloat(values.monthlyIdealProspects),
          appointments_per_campaign: Number.parseFloat(values.appointmentsPerCampaign),
        },
        campaigns: values.campaigns.map(c => {
          const marketingCosts = Number.parseFloat(c.budget)
          const leads = Number.parseInt(c.leads)
          const foodCosts = Number.parseFloat(c.foodCosts || "0")
          const avgCloseRatio = Number.parseFloat(values.avgCloseRatio)
          
          // Calculate cost per lead and cost per client
          const costPerLead = leads > 0 ? (marketingCosts + foodCosts) / leads : 0
          const closeRatioDecimal = avgCloseRatio / 100
          const costPerClient = closeRatioDecimal > 0 ? costPerLead / closeRatioDecimal : 0
          
          return {
            name: c.name,
            budget: marketingCosts,
            events: Number.parseInt(c.events),
            leads: leads,
            status: c.status,
            cost_per_lead: costPerLead,
            cost_per_client: costPerClient,
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
        financialBook: {
          annuity_book_value: Number.parseFloat(values.annuityBookValue),
          aum_book_value: Number.parseFloat(values.aumBookValue),
          qualified_money_value: Number.parseFloat(values.qualifiedMoneyValue),
        },
        financialOptions: {
          surrender_percent: Number.parseFloat(values.surrenderPercent),
          income_rider_percent: Number.parseFloat(values.incomeRiderPercent),
          free_withdrawal_percent: Number.parseFloat(values.freeWithdrawalPercent),
          life_insurance_percent: Number.parseFloat(values.lifeInsurancePercent),
          life_strategy1_percent: Number.parseFloat(values.lifeStrategy1Percent),
          life_strategy2_percent: Number.parseFloat(values.lifeStrategy2Percent),
          ira_to_7702_percent: Number.parseFloat(values.iraTo7702Percent),
          approval_rate_percent: Number.parseFloat(values.approvalRatePercent),
          surrender_rate: Number.parseFloat(values.surrenderRate),
          income_rider_rate: Number.parseFloat(values.incomeRiderRate),
          free_withdrawal_rate: Number.parseFloat(values.freeWithdrawalRate),
          life_insurance_rate: Number.parseFloat(values.lifeInsuranceRate),
          life_strategy1_rate: Number.parseFloat(values.lifeStrategy1Rate),
          life_strategy2_rate: Number.parseFloat(values.lifeStrategy2Rate),
          ira_to_7702_rate: Number.parseFloat(values.iraTo7702Rate),
        },
      }

      const success = await saveAllData(advisorData)
      
      if (success) {
        toast({
          title: isEditMode ? "Data updated successfully" : "Business data setup complete!",
          description: isEditMode 
            ? "Your advisor basecamp data has been updated."
            : "You can now access your advisor basecamp dashboard.",
        })
        
        if (onComplete) {
          onComplete()
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save data. Please try again.",
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

  const addCampaign = () => {
    append({
      name: "",
      budget: "",
      events: "",
      leads: "",
      status: "Planned",
      costPerLead: "",
      costPerClient: "",
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
            ? "Update your business goals, metrics, and campaign data."
            : "Complete your business profile to access your personalized advisor dashboard."
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="goals" className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="current">Advisor Book</TabsTrigger>
              <TabsTrigger value="clients">Client Metrics</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="income">Income & Book</TabsTrigger>
            </TabsList>

            {/* Goals Tab */}
            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <CardTitle>Business Goals</CardTitle>
                  <CardDescription>Set your business goals for the year</CardDescription>
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
                        <FormDescription>Your overall business goal in dollars</FormDescription>
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
                          <FormDescription>Percentage of business goal for AUM</FormDescription>
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
                          <FormDescription>Percentage of business goal for annuity</FormDescription>
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
                          <FormDescription>Percentage of business goal for life insurance</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <div className="w-full p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Calculated Goals</p>
                        <p className="text-lg font-semibold">AUM: ${aumGoalAmount.toLocaleString()}</p>
                        <p className="text-lg font-semibold">Annuity: ${annuityGoalAmount.toLocaleString()}</p>
                        <p className="text-lg font-semibold">Life: ${lifeTargetGoalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advisor Book Tab */}
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle>Advisor Book</CardTitle>
                  <CardDescription>Your current advisor book metrics</CardDescription>
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
                  <CardDescription>Key performance indicators for your client base</CardDescription>
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
                          <FormDescription>Auto-calculated: Average Annuity Size + Average AUM Size</FormDescription>
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
                      <FormDescription>Auto-calculated: Annuity Goal / Average Annuity Size</FormDescription>
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
                      <FormDescription>Auto-calculated: AUM Goal / Average AUM Size</FormDescription>
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
                  <CardDescription>Track your marketing campaigns and their performance</CardDescription>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    type="number" 
                                    value={costPerLead.toFixed(2)}
                                    readOnly
                                    className="bg-muted"
                                    onChange={() => {}} // Prevent changes
                                    onBlur={() => {}} // Prevent blur events
                                  />
                                </FormControl>
                                <FormDescription>Auto-calculated: (Marketing Costs + Food Costs) ÷ Leads Generated</FormDescription>
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
                                    type="number" 
                                    value={costPerClient.toFixed(2)}
                                    readOnly
                                    className="bg-muted"
                                    onChange={() => {}} // Prevent changes
                                    onBlur={() => {}} // Prevent blur events
                                  />
                                </FormControl>
                                <FormDescription>Auto-calculated: Cost per Lead ÷ Close Ratio</FormDescription>
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
                                <Input type="number" {...field} />
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

            {/* Income & Book Tab */}
            <TabsContent value="income">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Rates</CardTitle>
                    <CardDescription>Set your commission percentages and rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="planningFeeRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Planning Fee Rate ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
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
                        <div>Annuity: ${annuityIncome.toLocaleString()}</div>
                        <div>AUM: ${aumIncome.toLocaleString()}</div>
                        <div>Life: ${lifeIncome.toLocaleString()}</div>
                        <div>Trail: ${trailIncome.toLocaleString()}</div>
                        <div>Planning: ${planningFeesValue.toLocaleString()}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <strong>Total: ${totalIncome.toLocaleString()}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Book Values</CardTitle>
                    <CardDescription>Your current book values for financial planning</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="annuityBookValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annuity Book Value ($)</FormLabel>
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
                        name="aumBookValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AUM Book Value ($)</FormLabel>
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
                        name="qualifiedMoneyValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualified Money Value ($)</FormLabel>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Options Percentages</CardTitle>
                    <CardDescription>Configure percentages for different financial options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Option 1 - Annuity Book Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Option 1 - Annuity Book Percentages</h3>
                      <p className="text-sm text-muted-foreground">Configure percentages for annuity book opportunities</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="surrenderPercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Surrender Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>% of current annuity book for surrender opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="surrenderRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Surrender Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="6" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for surrender transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incomeRiderPercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Income Rider Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="6" {...field} />
                              </FormControl>
                              <FormDescription>% of current annuity book for income rider opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incomeRiderRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Income Rider Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for income rider transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="freeWithdrawalPercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Free Withdrawal Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>% of current annuity book for free withdrawal opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="freeWithdrawalRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Free Withdrawal Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="6" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for free withdrawal transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lifeInsurancePercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Insurance Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>% of current annuity book for life insurance opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lifeInsuranceRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Insurance Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for life insurance transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Option 2 - AUM Book Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Option 2 - AUM Book Percentages</h3>
                      <p className="text-sm text-muted-foreground">Configure percentages for AUM book opportunities</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lifeStrategy1Percent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Strategy 1 Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="1" {...field} />
                              </FormControl>
                              <FormDescription>% of current AUM for life strategy 1 opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lifeStrategy1Rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Strategy 1 Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for life strategy 1 transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lifeStrategy2Percent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Strategy 2 Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="2" {...field} />
                              </FormControl>
                              <FormDescription>% of current AUM for life strategy 2 opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lifeStrategy2Rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Life Strategy 2 Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for life strategy 2 transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Option 3 - Qualified Money Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2">Option 3 - Qualified Money Percentages</h3>
                      <p className="text-sm text-muted-foreground">Configure percentages for qualified money opportunities</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="iraTo7702Percent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IRA to 7702 Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="33" {...field} />
                              </FormControl>
                              <FormDescription>% of qualified money for IRA to 7702 opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="iraTo7702Rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IRA to 7702 Rate (%)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="10" {...field} />
                              </FormControl>
                              <FormDescription>Commission rate for IRA to 7702 transactions</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="approvalRatePercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Rate Percentage (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" step="0.1" placeholder="50" {...field} />
                              </FormControl>
                              <FormDescription>% approval rate for qualified money opportunities</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="submit" size="lg">
              {isEditMode ? "Update Data" : "Complete Setup"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 