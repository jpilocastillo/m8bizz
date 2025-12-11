"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useAdvisorBasecamp } from "@/hooks/use-advisor-basecamp"
import { useAuth } from "@/components/auth-provider"
import { MonthlyDataEntry } from "@/lib/advisor-basecamp"
import { format, parseISO } from "date-fns"
import { Edit, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

export function MonthlyEntriesTable() {
  const { user } = useAuth()
  const { data, addMonthlyDataEntry, updateMonthlyDataEntry } = useAdvisorBasecamp(user)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MonthlyDataEntry | null>(null)

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
    try {
      const entryData = {
        month_year: `${values.year}-${values.month}`,
        new_clients: parseInt(values.new_clients),
        new_appointments: parseInt(values.new_appointments),
        new_leads: parseInt(values.new_leads),
        annuity_sales: parseFloat(parseCurrency(values.annuity_sales)),
        aum_sales: parseFloat(parseCurrency(values.aum_sales)),
        life_sales: parseFloat(parseCurrency(values.life_sales)),
        marketing_expenses: parseFloat(parseCurrency(values.marketing_expenses)),
        notes: values.notes || "",
      }

      let success = false
      if (editingEntry && editingEntry.id) {
        success = await updateMonthlyDataEntry(editingEntry.id, entryData)
      } else {
        success = await addMonthlyDataEntry(entryData)
      }

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

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Entries</CardTitle>
            <CardDescription>
              Track And Edit Your Monthly Performance Data
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingEntry(null)
                  handleCloseDialog()
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Monthly Entry" : "Add Monthly Entry"}
                </DialogTitle>
                <DialogDescription>
                  Enter Your Monthly Performance Data For Tracking.
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
      </CardHeader>
      <CardContent>
        {monthlyEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No Monthly Entries Yet. Click "Add Entry" To Get Started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>New Clients</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>New Leads</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Marketing ROI</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyEntries
                .sort((a, b) => b.month_year.localeCompare(a.month_year))
                .map((entry) => {
                  const totalSales = entry.annuity_sales + entry.aum_sales + entry.life_sales
                  const commissionIncome = 
                    (entry.annuity_sales * 0.045) + 
                    (entry.aum_sales * 0.01) + 
                    (entry.life_sales * 0.85)
                  const roi = entry.marketing_expenses > 0 
                    ? ((commissionIncome - entry.marketing_expenses) / entry.marketing_expenses) * 100 
                    : commissionIncome > 0 
                      ? 9999 
                      : 0
                  
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(entry.month_year + "-01"), "MMMM yyyy")}
                      </TableCell>
                      <TableCell>{entry.new_clients.toLocaleString()}</TableCell>
                      <TableCell>{entry.new_appointments.toLocaleString()}</TableCell>
                      <TableCell>{entry.new_leads.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(totalSales)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roi > 0 ? "default" : "destructive"}>
                          {roi.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

