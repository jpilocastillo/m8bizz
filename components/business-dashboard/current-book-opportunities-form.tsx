"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
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

// Form schema
const formSchema = z.object({
  // Financial Book Values
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

interface CurrentBookOpportunitiesFormProps {
  user: User
  onComplete?: () => void
}

export function CurrentBookOpportunitiesForm({ user, onComplete }: CurrentBookOpportunitiesFormProps) {
  const { data, updateFinancialBook, updateFinancialOptions, loadData } = useAdvisorBasecamp(user)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annuityBookValue: "",
      aumBookValue: "",
      qualifiedMoneyValue: "",
      surrenderPercent: "",
      incomeRiderPercent: "",
      freeWithdrawalPercent: "",
      lifeInsurancePercent: "",
      lifeStrategy1Percent: "",
      lifeStrategy2Percent: "",
      iraTo7702Percent: "",
      approvalRatePercent: "",
      surrenderRate: "",
      incomeRiderRate: "",
      freeWithdrawalRate: "",
      lifeInsuranceRate: "",
      lifeStrategy1Rate: "",
      lifeStrategy2Rate: "",
      iraTo7702Rate: "",
    },
  })

  // Load existing data when component mounts or data changes
  useEffect(() => {
    if (data.financialBook) {
      form.setValue("annuityBookValue", data.financialBook.annuity_book_value?.toString() || "", { shouldValidate: false })
      form.setValue("aumBookValue", data.financialBook.aum_book_value?.toString() || "", { shouldValidate: false })
      form.setValue("qualifiedMoneyValue", data.financialBook.qualified_money_value?.toString() || "", { shouldValidate: false })
    }

    if (data.financialOptions) {
      form.setValue("surrenderPercent", data.financialOptions.surrender_percent?.toString() || "", { shouldValidate: false })
      form.setValue("incomeRiderPercent", data.financialOptions.income_rider_percent?.toString() || "", { shouldValidate: false })
      form.setValue("freeWithdrawalPercent", data.financialOptions.free_withdrawal_percent?.toString() || "", { shouldValidate: false })
      form.setValue("lifeInsurancePercent", data.financialOptions.life_insurance_percent?.toString() || "", { shouldValidate: false })
      form.setValue("lifeStrategy1Percent", data.financialOptions.life_strategy1_percent?.toString() || "", { shouldValidate: false })
      form.setValue("lifeStrategy2Percent", data.financialOptions.life_strategy2_percent?.toString() || "", { shouldValidate: false })
      form.setValue("iraTo7702Percent", data.financialOptions.ira_to_7702_percent?.toString() || "", { shouldValidate: false })
      form.setValue("approvalRatePercent", data.financialOptions.approval_rate_percent?.toString() || "", { shouldValidate: false })
      form.setValue("surrenderRate", data.financialOptions.surrender_rate?.toString() || "", { shouldValidate: false })
      form.setValue("incomeRiderRate", data.financialOptions.income_rider_rate?.toString() || "", { shouldValidate: false })
      form.setValue("freeWithdrawalRate", data.financialOptions.free_withdrawal_rate?.toString() || "", { shouldValidate: false })
      form.setValue("lifeInsuranceRate", data.financialOptions.life_insurance_rate?.toString() || "", { shouldValidate: false })
      form.setValue("lifeStrategy1Rate", data.financialOptions.life_strategy1_rate?.toString() || "", { shouldValidate: false })
      form.setValue("lifeStrategy2Rate", data.financialOptions.life_strategy2_rate?.toString() || "", { shouldValidate: false })
      form.setValue("iraTo7702Rate", data.financialOptions.ira_to_7702_rate?.toString() || "", { shouldValidate: false })
    }
  }, [data, form])

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Save Financial Book Values
      const financialBookSuccess = await updateFinancialBook({
        annuity_book_value: Number.parseFloat(values.annuityBookValue),
        aum_book_value: Number.parseFloat(values.aumBookValue),
        qualified_money_value: Number.parseFloat(values.qualifiedMoneyValue),
      })

      // Save Financial Options
      const financialOptionsSuccess = await updateFinancialOptions({
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
      })

      if (financialBookSuccess && financialOptionsSuccess) {
        toast({
          title: "Success",
          description: "Current Book Opportunities data saved successfully.",
        })
        await loadData()
        if (onComplete) {
          onComplete()
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save some data. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving data.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Financial Book Values Section */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Book Values</CardTitle>
            <CardDescription>Your Current Book Values For Financial Planning</CardDescription>
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

        {/* Financial Options Percentages Section */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Options Percentages</CardTitle>
            <CardDescription>Configure Percentages For Different Financial Options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      <FormLabel>% Of Current Annuity Book Out-Of-Surrender</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" step="0.1" placeholder="10" {...field} />
                      </FormControl>
                      <FormDescription>% Of Current Annuity Book For Surrender Opportunities</FormDescription>
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
                      <FormDescription>% Of Current Annuity Book For Income Rider Opportunities</FormDescription>
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
                      <FormDescription>% Of Current Annuity Book For Free Withdrawal Opportunities</FormDescription>
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
                      <FormDescription>% Of Current Annuity Book For Life Insurance Opportunities</FormDescription>
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
                      <FormDescription>Commission Rate For Life Insurance Transactions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Option 2 - AUM Book Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Option 2 - AUM Book Percentages</h3>
              <p className="text-sm text-muted-foreground">Configure Percentages For AUM Book Opportunities</p>
              
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
                      <FormDescription>% Of Current AUM For Life Strategy 1 Opportunities</FormDescription>
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
                      <FormDescription>Commission Rate For Life Strategy 1 Transactions</FormDescription>
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
                      <FormDescription>% Of Current AUM For Life Strategy 2 Opportunities</FormDescription>
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
                      <FormDescription>Commission Rate For Life Strategy 2 Transactions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Option 3 - Qualified Money Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Option 3 - Qualified Money Percentages</h3>
              <p className="text-sm text-muted-foreground">Configure Percentages For Qualified Money Opportunities</p>
              
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
                      <FormDescription>% Of Qualified Money For IRA To 7702 Opportunities</FormDescription>
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
                      <FormDescription>Commission Rate For IRA To 7702 Transactions</FormDescription>
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
                      <FormDescription>% Approval Rate For Qualified Money Opportunities</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}

