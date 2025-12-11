"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { useAuth } from "@/components/auth-provider"
import { advisorBasecampService } from "@/lib/advisor-basecamp"

// Campaign schema
const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  budget: z.string().min(1, "Marketing costs is required"),
  events: z.string().min(1, "Number of events is required"),
  leads: z.string().min(1, "Leads generated is required"),
  status: z.enum(["Active", "Planned", "Completed", "Paused"]),
  costPerLead: z.string().optional(),
  costPerClient: z.string().optional(),
  foodCosts: z.string().optional(),
})

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

// Update the form schema to remove notes field
const formSchema = z.object({
  // Business Goals
  businessGoal: z.string().min(1, "Business goal is required"),
  aumGoal: z.string().min(1, "AUM goal is required"),
  aumGoalPercentage: z.string().min(1, "AUM goal percentage is required"),
  annuityGoal: z.string().min(1, "Annuity goal is required"),
  annuityGoalPercentage: z.string().min(1, "Annuity goal percentage is required"),
  lifeTargetGoal: z.string().min(1, "Life target goal is required"),
  lifeTargetGoalPercentage: z.string().min(1, "Life target goal percentage is required"),

  // Current Values
  currentAUM: z.string().min(1, "Current AUM is required"),
  currentAnnuity: z.string().min(1, "Current annuity is required"),
  currentLifeProduction: z.string().min(1, "Life Insurance Cash Value is required"),
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

  // Client Metrics
  avgAnnuitySize: z.string().min(1, "Average annuity size is required"),
  avgAUMSize: z.string().min(1, "Average AUM size is required"),
  appointmentAttrition: z.string().min(1, "Appointment attrition is required"),
  avgCloseRatio: z.string().min(1, "Average close ratio is required"),
  appointmentsPerCampaign: z.string().min(1, "Appointments per campaign is required"),

  // Campaign Data - Now an array
  campaigns: z.array(campaignSchema).min(1, "At least one campaign is required"),

  // Commission Percentages
  planningFeeRate: z.string().min(1, "Average planning fee rate is required"),
  annuityCommission: z.string().min(1, "Annuity commission percentage is required"),
  aumCommission: z.string().min(1, "AUM commission percentage is required"),
  lifeCommission: z.string().min(1, "Life commission percentage is required"),
  trailIncomePercentage: z.string().min(1, "Trail income percentage is required"),
})

export function DataEntryForm({ onSubmit, onCancel }: { onSubmit: () => void; onCancel?: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessGoal: "20000000",
      aumGoal: "12000000",
      aumGoalPercentage: "60",
      annuityGoal: "8000000",
      annuityGoalPercentage: "40",
      lifeTargetGoal: "200000",
      lifeTargetGoalPercentage: "1",
      currentAUM: "62000000",
      currentAnnuity: "180000000",
      currentLifeProduction: "0",
      qualifiedMoneyValue: "1000000",
      
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
      
      avgAnnuitySize: "225000",
      avgAUMSize: "500000",
      appointmentAttrition: "10",
      avgCloseRatio: "70",
      appointmentsPerCampaign: "12",
      campaigns: [
        {
          name: "Facebook Seminars",
          budget: "5198",
          events: "2",
          leads: "20",
          status: "Active",
          costPerLead: "259.90",
          costPerClient: "1732.67",
          foodCosts: "800",
        },
      ],
      planningFeeRate: "1000",
      annuityCommission: "6.50",
      aumCommission: "1.00",
      lifeCommission: "1.0",
      trailIncomePercentage: "1.00",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "campaigns",
  })

  // Add this after the useFieldArray hook:
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

  // Watch values needed for auto-calculations
  const watchedClientMetrics = form.watch([
    "currentAnnuity",
    "currentAUM",
    "avgAnnuitySize",
    "avgAUMSize",
    "appointmentAttrition",
    "avgCloseRatio",
  ])

  // Calculate goal amounts based on business goal and percentages
  const businessGoalAmount = Number.parseFloat(watchedValues[0] || "0")
  const aumGoalAmount = (businessGoalAmount * Number.parseFloat(watchedValues[1] || "0")) / 100
  const annuityGoalAmount = (businessGoalAmount * Number.parseFloat(watchedValues[2] || "0")) / 100
  const lifeTargetGoalAmount = (businessGoalAmount * Number.parseFloat(watchedValues[3] || "0")) / 100

  // Get current AUM for trail income calculation
  const currentAUM = Number.parseFloat(form.watch("currentAUM") || "0")

  // Calculate income values using the calculated goal amounts
  const annuityIncome = (annuityGoalAmount * Number.parseFloat(watchedValues[4] || "0")) / 100
  const aumIncome = (aumGoalAmount * Number.parseFloat(watchedValues[5] || "0")) / 100
  const lifeIncome = (lifeTargetGoalAmount * Number.parseFloat(watchedValues[6] || "0")) / 100
  const trailIncome = (currentAUM * Number.parseFloat(watchedValues[7] || "0")) / 100
  // Calculate planning fees count as clients needed
  const clientsNeeded = Math.round((annuitiesClosed + aumAccountsCount) / 2)
  const planningFeesValue = Number.parseFloat(watchedValues[8] || "0") * clientsNeeded
  const totalIncome = annuityIncome + aumIncome + lifeIncome + trailIncome + planningFeesValue

  // Auto-calculated client metrics
  const currentAnnuityValue = Number.parseFloat(watchedClientMetrics[0] || "0")
  const currentAUMValue = Number.parseFloat(watchedClientMetrics[1] || "0")
  const avgAnnuitySizeValue = Number.parseFloat(watchedClientMetrics[2] || "0")
  const avgAUMSizeValue = Number.parseFloat(watchedClientMetrics[3] || "0")
  const appointmentAttritionValue = Number.parseFloat(watchedClientMetrics[4] || "0")
  const avgCloseRatioValue = Number.parseFloat(watchedClientMetrics[5] || "0")

  // Calculate auto-calculated fields using GOAL values instead of current values
  const annuitiesClosed = avgAnnuitySizeValue > 0 ? Math.round(annuityGoalAmount / avgAnnuitySizeValue) : 0
  const aumAccountsCount = avgAUMSizeValue > 0 ? Math.round(aumGoalAmount / avgAUMSizeValue) : 0
  const avgNetWorthNeeded = avgAnnuitySizeValue + avgAUMSizeValue
  
  // Calculate prospects and appointments using proper formulas
  const clientsNeeded = annuitiesClosed + aumAccountsCount
  
  // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
  const annualIdealClosingProspects = avgCloseRatioValue > 0 
    ? (clientsNeeded / (avgCloseRatioValue / 100)) * (1 + appointmentAttritionValue / 100) 
    : 0
  
  // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
  const monthlyIdealProspects = annualIdealClosingProspects / 12
  
  // Monthly New Appointments Needed = Monthly Ideal Prospects * 3
  const totalNewMonthlyAppointments = monthlyIdealProspects * 3
  
  // Annual Total Prospects Necessary = Monthly New Appointments * 12
  const annualTotalProspectsNecessary = totalNewMonthlyAppointments * 12

  const { user } = useAuth()

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values)
    if (!user) {
      console.log("No user found")
      toast({
        title: "Error",
        description: "No user found. Please log in again.",
        variant: "destructive",
      })
      return
    }
    
    console.log("User ID:", user.id)
    
    // Transform form data to database format
    const advisorData = {
      businessGoals: {
        business_goal: Number.parseFloat(values.businessGoal),
        aum_goal: Number.parseFloat(values.aumGoal),
        aum_goal_percentage: Number.parseFloat(values.aumGoalPercentage),
        annuity_goal: Number.parseFloat(values.annuityGoal),
        annuity_goal_percentage: Number.parseFloat(values.annuityGoalPercentage),
        life_target_goal: Number.parseFloat(values.lifeTargetGoal),
        life_target_goal_percentage: Number.parseFloat(values.lifeTargetGoalPercentage),
      },
      currentValues: {
        current_aum: Number.parseFloat(values.currentAUM),
        current_annuity: Number.parseFloat(values.currentAnnuity),
        current_life_production: Number.parseFloat(values.currentLifeProduction),
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
      clientMetrics: {
        avg_annuity_size: Number.parseFloat(values.avgAnnuitySize),
        avg_aum_size: Number.parseFloat(values.avgAUMSize),
        avg_net_worth_needed: avgNetWorthNeeded, // Use calculated value
        appointment_attrition: Number.parseFloat(values.appointmentAttrition),
        avg_close_ratio: Number.parseFloat(values.avgCloseRatio),
        annuity_closed: annuitiesClosed, // Use calculated value
        aum_accounts: aumAccountsCount, // Use calculated value
        clients_needed: Math.round((annuitiesClosed + aumAccountsCount) / 2), // Use calculated value
        monthly_ideal_prospects: monthlyIdealProspects, // Use calculated value
        appointments_per_campaign: Number.parseFloat(values.appointmentsPerCampaign),
      },
      campaigns: values.campaigns.map(c => ({
        name: c.name,
        budget: Number.parseFloat(c.budget),
        events: Number.parseInt(c.events),
        leads: Number.parseInt(c.leads),
        status: c.status,
        cost_per_lead: c.costPerLead ? Number.parseFloat(c.costPerLead) : undefined,
        cost_per_client: c.costPerClient ? Number.parseFloat(c.costPerClient) : undefined,
        food_costs: c.foodCosts ? Number.parseFloat(c.foodCosts) : undefined,
      })),
      commissionRates: {
        planning_fee_rate: Number.parseFloat(values.planningFeeRate),
        planning_fees_count: clientsNeeded, // Automatically calculated from clients needed
        annuity_commission: Number.parseFloat(values.annuityCommission),
        aum_commission: Number.parseFloat(values.aumCommission),
        life_commission: Number.parseFloat(values.lifeCommission),
        trail_income_percentage: Number.parseFloat(values.trailIncomePercentage),
      },
      financialBook: {
        annuity_book_value: 0, // You can add a field for this if needed
        aum_book_value: 0,     // You can add a field for this if needed
        qualified_money_value: Number.parseFloat(values.qualifiedMoneyValue),
      },
    }
    console.log("Saving advisor data:", advisorData)
    console.log("Calling advisorBasecampService.saveAllAdvisorBasecampData...")
    
    try {
      const result = await advisorBasecampService.saveAllAdvisorBasecampData(user, advisorData)
      console.log("Save result:", result)
      
      if (result) {
        console.log("Data saved successfully")
        toast({
          title: "Data submitted successfully",
          description: "Your dashboard will now update with the new data.",
        })
        onSubmit()
      } else {
        console.error("Save returned false")
        toast({
          title: "Error",
          description: "Failed to save data. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.error("Form validation errors:", errors)
        toast({
          title: "Validation Error",
          description: "Please check all required fields and try again.",
          variant: "destructive",
        })
      })} className="space-y-6">
        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="current">Current Advisor Book</TabsTrigger>
            <TabsTrigger value="clients">Client Metrics</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
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
                      <FormLabel>Business Goal</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="$20,000,000"
                          {...field}
                          value={formatCurrency(field.value)}
                          onChange={(e) => {
                            const rawValue = parseCurrency(e.target.value)
                            field.onChange(rawValue)
                          }}
                        />
                      </FormControl>
                      <FormDescription>Your Total Business Goal For The Year</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aumGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AUM Goal ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$12,000,000"
                            {...field}
                            value={formatCurrency(aumGoalAmount)}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>Auto-Calculated Based On Business Goal And Percentage</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aumGoalPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AUM Goal Percentage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="0.1" placeholder="60" {...field} />
                        </FormControl>
                        <FormDescription>Percentage Of Business Goal For AUM</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="annuityGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annuity Goal ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$8,000,000"
                            {...field}
                            value={formatCurrency(annuityGoalAmount)}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>Auto-Calculated Based On Business Goal And Percentage</FormDescription>
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
                          <Input type="number" min="0" max="100" step="0.1" placeholder="40" {...field} />
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
                    name="lifeTargetGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Life Target Goal ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="$200,000"
                            {...field}
                            value={formatCurrency(lifeTargetGoalAmount)}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>Auto-Calculated Based On Business Goal And Percentage</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lifeTargetGoalPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Life Target Goal Percentage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="0.1" placeholder="1" {...field} />
                        </FormControl>
                        <FormDescription>Percentage Of Business Goal For Life Target</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Advisor Book Tab */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Current Advisor Book</CardTitle>
                <CardDescription>Enter Your Current Advisor Book Values And Financial Options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Values Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Current Book Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentAUM"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current AUM ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="$62,000,000"
                              {...field}
                              value={formatCurrency(field.value)}
                              onChange={(e) => {
                                const rawValue = parseCurrency(e.target.value)
                                field.onChange(rawValue)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Your Current Assets Under Management</FormDescription>
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
                              placeholder="$180,000,000"
                              {...field}
                              value={formatCurrency(field.value)}
                              onChange={(e) => {
                                const rawValue = parseCurrency(e.target.value)
                                field.onChange(rawValue)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Your Current Annuity Value</FormDescription>
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
                          <FormDescription>Your Life Insurance Cash Value</FormDescription>
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
                              placeholder="$1,000,000"
                              {...field}
                              value={formatCurrency(field.value)}
                              onChange={(e) => {
                                const rawValue = parseCurrency(e.target.value)
                                field.onChange(rawValue)
                              }}
                            />
                          </FormControl>
                          <FormDescription>Your Qualified Money Value</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Option 1 - Annuity Book Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Option 1 - Annuity Book Percentages</h3>
                  <p className="text-sm text-muted-foreground">Configure Percentages For Annuity Book Opportunities</p>
                  
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
                          <FormDescription>% Of Current Annuity For Surrender Opportunities</FormDescription>
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
                          <FormDescription>Commission Rate For Surrender Transactions</FormDescription>
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
                          <FormDescription>% Of Current Annuity For Income Rider Opportunities</FormDescription>
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
                          <FormDescription>Commission Rate For Income Rider Transactions</FormDescription>
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
                          <FormDescription>% Of Current Annuity For Free Withdrawal Opportunities</FormDescription>
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
                          <FormDescription>Commission Rate For Free Withdrawal Transactions</FormDescription>
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
                          <FormDescription>% of current annuity for life insurance opportunities</FormDescription>
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
                          <FormDescription>% of new business that gets approved</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Metrics Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Metrics</CardTitle>
                <CardDescription>Key client performance indicators</CardDescription>
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
                            placeholder="$225,000"
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
                            placeholder="$500,000"
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
                    name="appointmentAttrition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Attrition (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avgCloseRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Close Ratio (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Average Net Worth Needed ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="$725,000" 
                        value={formatCurrency(avgNetWorthNeeded)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: Average Annuity Size + Average AUM Size</FormDescription>
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Number of Annuities Closed</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="36" 
                        value={annuitiesClosed}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: Annuity Goal / Average Annuity Size</FormDescription>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Number of AUM Accounts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="24" 
                        value={aumAccountsCount}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: AUM Goal / Average AUM Size</FormDescription>
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentsPerCampaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointments Per Campaign</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Monthly Ideal Prospects</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        value={monthlyIdealProspects.toFixed(1)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: Annual Ideal Closing Prospects / 12</FormDescription>
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Total New Monthly Appointments Needed</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        value={totalNewMonthlyAppointments.toFixed(1)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: Monthly Ideal Prospects × 3</FormDescription>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Annual Ideal Closing Prospects Needed</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        value={annualIdealClosingProspects.toFixed(1)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: (Annual Total Prospects Necessary / Close Ratio) × (1 + Attrition)</FormDescription>
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Annual Total Prospects Necessary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        value={annualTotalProspectsNecessary.toFixed(1)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Auto-calculated: Total New Monthly Appointments × 12</FormDescription>
                  </FormItem>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab - Updated with food costs */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Campaigns</CardTitle>
                <CardDescription>Add and manage your marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">Campaign {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
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
                              <Input placeholder="e.g., Facebook Seminars" {...field} />
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
                                placeholder="$5,198"
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
                            <FormLabel>Number of Events</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
                                placeholder="$800"
                                {...field}
                                value={formatCurrency(field.value || "")}
                                onChange={(e) => {
                                  const rawValue = parseCurrency(e.target.value)
                                  field.onChange(rawValue)
                                }}
                              />
                            </FormControl>
                            <FormDescription>Cost of food/catering for events</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`campaigns.${index}.leads`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Leads Generated</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="20" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`campaigns.${index}.costPerLead`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Per Lead ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="$259.90"
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

                      <FormField
                        control={form.control}
                        name={`campaigns.${index}.costPerClient`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Per Client ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="$1,732.67"
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCampaign}
                  className="w-full border-dashed border-2 hover:bg-accent bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Campaign
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income Details</CardTitle>
                <CardDescription>Breakdown of income from different business parts</CardDescription>
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
                                  placeholder="$1,000"
                                  {...field}
                                  value={formatCurrency(field.value)}
                                  onChange={(e) => {
                                    const rawValue = parseCurrency(e.target.value)
                                    field.onChange(rawValue)
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Rate per planning fee</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Commission Percentages</h3>

                    <FormField
                      control={form.control}
                      name="annuityCommission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annuity Commission (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="6.50" {...field} />
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
                            <Input type="number" step="0.01" placeholder="1.00" {...field} />
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
                          <FormLabel>Life Insurance Commission (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trailIncomePercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trail Income (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="1.00" {...field} />
                          </FormControl>
                          <FormDescription>Percentage of current AUM</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Calculated Income</h3>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span>
                          Average Planning Fees (${Number.parseFloat(watchedValues[8] || "0").toLocaleString()} × $
                          {clientsNeeded} clients):
                        </span>
                        <span className="font-medium">${planningFeesValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annuity Income:</span>
                        <span className="font-medium">${annuityIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AUM Income:</span>
                        <span className="font-medium">${aumIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Life Production Income:</span>
                        <span className="font-medium">${lifeIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trail Income ({Number.parseFloat(watchedValues[7] || "0")}% of Current AUM):</span>
                        <span className="font-medium">${trailIncome.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total Annual Income:</span>
                        <span className="text-green-600">${totalIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Update Dashboard
          </Button>
        </div>
      </form>
    </Form>
  )
}
