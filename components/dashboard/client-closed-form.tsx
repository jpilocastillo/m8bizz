"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { EventClient, EventClientInsert, EventClientUpdate } from "@/lib/client-tracking"
import { formatCurrency, parseCurrency } from "@/lib/utils"

const clientFormSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  close_date: z.string().min(1, "Close date is required"),
  annuity_premium: z.string().optional(),
  annuity_commission: z.string().optional(),
  annuity_commission_percentage: z.string().optional(),
  life_insurance_premium: z.string().optional(),
  life_insurance_commission: z.string().optional(),
  life_insurance_commission_percentage: z.string().optional(),
  aum_amount: z.string().optional(),
  aum_fee_percentage: z.string().optional(),
  aum_fees: z.string().optional(),
  financial_planning_fee: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientClosedFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EventClientInsert | EventClientUpdate) => Promise<void>
  eventId: string
  client?: EventClient | null
  mode?: "add" | "edit"
}

export function ClientClosedForm({
  open,
  onOpenChange,
  onSubmit,
  eventId,
  client,
  mode = "add",
}: ClientClosedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      client_name: client?.client_name || "",
      close_date: client?.close_date || new Date().toISOString().split("T")[0],
      annuity_premium: client?.annuity_premium
        ? formatCurrency(client.annuity_premium)
        : "",
      annuity_commission: client?.annuity_commission
        ? formatCurrency(client.annuity_commission)
        : "",
      annuity_commission_percentage: client?.annuity_commission_percentage
        ? String(client.annuity_commission_percentage)
        : "",
      life_insurance_premium: client?.life_insurance_premium
        ? formatCurrency(client.life_insurance_premium)
        : "",
      life_insurance_commission: client?.life_insurance_commission
        ? formatCurrency(client.life_insurance_commission)
        : "",
      life_insurance_commission_percentage: client?.life_insurance_commission_percentage
        ? String(client.life_insurance_commission_percentage)
        : "",
      aum_amount: client?.aum_amount ? formatCurrency(client.aum_amount) : "",
      aum_fee_percentage: client?.aum_fee_percentage
        ? String(client.aum_fee_percentage)
        : "",
      aum_fees: client?.aum_fees ? formatCurrency(client.aum_fees) : "",
      financial_planning_fee: client?.financial_planning_fee
        ? formatCurrency(client.financial_planning_fee)
        : "",
      notes: client?.notes || "",
    },
  })

  // Reset form when client prop changes (for editing)
  useEffect(() => {
    if (client && mode === "edit") {
      form.reset({
        client_name: client.client_name || "",
        close_date: client.close_date || new Date().toISOString().split("T")[0],
        annuity_premium: client.annuity_premium != null && client.annuity_premium !== 0
          ? formatCurrency(client.annuity_premium)
          : "",
        annuity_commission: client.annuity_commission != null && client.annuity_commission !== 0
          ? formatCurrency(client.annuity_commission)
          : "",
        annuity_commission_percentage: client.annuity_commission_percentage != null
          ? String(client.annuity_commission_percentage)
          : "",
        life_insurance_premium: client.life_insurance_premium != null && client.life_insurance_premium !== 0
          ? formatCurrency(client.life_insurance_premium)
          : "",
        life_insurance_commission: client.life_insurance_commission != null && client.life_insurance_commission !== 0
          ? formatCurrency(client.life_insurance_commission)
          : "",
        life_insurance_commission_percentage: client.life_insurance_commission_percentage != null
          ? String(client.life_insurance_commission_percentage)
          : "",
        aum_amount: client.aum_amount != null && client.aum_amount !== 0
          ? formatCurrency(client.aum_amount)
          : "",
        aum_fee_percentage: client.aum_fee_percentage != null
          ? String(client.aum_fee_percentage)
          : "",
        aum_fees: client.aum_fees != null && client.aum_fees !== 0
          ? formatCurrency(client.aum_fees)
          : "",
        financial_planning_fee: client.financial_planning_fee != null && client.financial_planning_fee !== 0
          ? formatCurrency(client.financial_planning_fee)
          : "",
        notes: client.notes || "",
      })
    } else if (mode === "add") {
      // Reset to empty form when adding new
      form.reset({
        client_name: "",
        close_date: new Date().toISOString().split("T")[0],
        annuity_premium: "",
        annuity_commission: "",
        annuity_commission_percentage: "",
        life_insurance_premium: "",
        life_insurance_commission: "",
        life_insurance_commission_percentage: "",
        aum_amount: "",
        aum_fee_percentage: "",
        aum_fees: "",
        financial_planning_fee: "",
        notes: "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, mode, open])

  // Auto-calculate commission when premium and percentage change
  const annuityPremium = form.watch("annuity_premium")
  const annuityCommissionPercentage = form.watch("annuity_commission_percentage")
  const annuityCommission = form.watch("annuity_commission")

  const lifeInsurancePremium = form.watch("life_insurance_premium")
  const lifeInsuranceCommissionPercentage = form.watch("life_insurance_commission_percentage")
  const lifeInsuranceCommission = form.watch("life_insurance_commission")

  const aumAmount = form.watch("aum_amount")
  const aumFeePercentage = form.watch("aum_fee_percentage")
  const aumFees = form.watch("aum_fees")

  // Calculate annuity commission
  const calculateAnnuityCommission = () => {
    if (annuityPremium && annuityCommissionPercentage) {
      const premium = parseFloat(parseCurrency(annuityPremium)) || 0
      const percentage = parseFloat(annuityCommissionPercentage) || 0
      if (premium > 0 && percentage > 0) {
        const calculated = (premium * percentage) / 100
        const currentCommission = parseFloat(parseCurrency(annuityCommission || "0")) || 0
        // Only auto-update if the current commission matches what would be calculated (user hasn't manually overridden)
        if (Math.abs(currentCommission - calculated) < 0.01 || currentCommission === 0) {
          form.setValue("annuity_commission", formatCurrency(calculated))
        }
      }
    }
  }

  // Calculate life insurance commission
  const calculateLifeInsuranceCommission = () => {
    if (lifeInsurancePremium && lifeInsuranceCommissionPercentage) {
      const premium = parseFloat(parseCurrency(lifeInsurancePremium)) || 0
      const percentage = parseFloat(lifeInsuranceCommissionPercentage) || 0
      if (premium > 0 && percentage > 0) {
        const calculated = (premium * percentage) / 100
        const currentCommission = parseFloat(parseCurrency(lifeInsuranceCommission || "0")) || 0
        // Only auto-update if the current commission matches what would be calculated (user hasn't manually overridden)
        if (Math.abs(currentCommission - calculated) < 0.01 || currentCommission === 0) {
          form.setValue("life_insurance_commission", formatCurrency(calculated))
        }
      }
    }
  }

  // Calculate AUM fees
  const calculateAumFees = () => {
    if (aumAmount && aumFeePercentage) {
      const aum = parseFloat(parseCurrency(aumAmount)) || 0
      const percentage = parseFloat(aumFeePercentage) || 0
      if (aum > 0 && percentage > 0) {
        const calculated = (aum * percentage) / 100
        const currentFees = parseFloat(parseCurrency(aumFees || "0")) || 0
        // Only auto-update if the current fees match what would be calculated (user hasn't manually overridden)
        if (Math.abs(currentFees - calculated) < 0.01 || currentFees === 0) {
          form.setValue("aum_fees", formatCurrency(calculated))
        }
      }
    }
  }

  // Watch for changes and auto-calculate
  useEffect(() => {
    calculateAnnuityCommission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annuityPremium, annuityCommissionPercentage])

  useEffect(() => {
    calculateLifeInsuranceCommission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lifeInsurancePremium, lifeInsuranceCommissionPercentage])

  useEffect(() => {
    calculateAumFees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aumAmount, aumFeePercentage])

  const handleSubmit = async (values: ClientFormData) => {
    setIsSubmitting(true)
    try {
      const formData: EventClientInsert | EventClientUpdate = {
        ...(mode === "add" && { event_id: eventId }),
        client_name: values.client_name,
        close_date: values.close_date,
        annuity_premium: values.annuity_premium
          ? parseFloat(parseCurrency(values.annuity_premium))
          : 0,
        annuity_commission: values.annuity_commission
          ? parseFloat(parseCurrency(values.annuity_commission))
          : 0,
        annuity_commission_percentage: values.annuity_commission_percentage
          ? parseFloat(values.annuity_commission_percentage)
          : null,
        life_insurance_premium: values.life_insurance_premium
          ? parseFloat(parseCurrency(values.life_insurance_premium))
          : 0,
        life_insurance_commission: values.life_insurance_commission
          ? parseFloat(parseCurrency(values.life_insurance_commission))
          : 0,
        life_insurance_commission_percentage: values.life_insurance_commission_percentage
          ? parseFloat(values.life_insurance_commission_percentage)
          : null,
        aum_amount: values.aum_amount
          ? parseFloat(parseCurrency(values.aum_amount))
          : 0,
        aum_fee_percentage: values.aum_fee_percentage
          ? parseFloat(values.aum_fee_percentage)
          : null,
        aum_fees: values.aum_fees
          ? parseFloat(parseCurrency(values.aum_fees))
          : 0,
        financial_planning_fee: values.financial_planning_fee
          ? parseFloat(parseCurrency(values.financial_planning_fee))
          : 0,
        notes: values.notes || null,
      }

      await onSubmit(formData)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting client form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-m8bs-card border-m8bs-border">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "add" ? "Add Client Closed Deal" : "Edit Client Closed Deal"}
          </DialogTitle>
          <DialogDescription className="text-m8bs-muted">
            {mode === "add"
              ? "Track a new client and their closed deals from this event."
              : "Update client information and closed deal details."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Client Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter client name"
                      className="bg-m8bs-card-alt border-m8bs-border text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="close_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Close Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-m8bs-card-alt border-m8bs-border text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Annuity Section */}
            <div className="space-y-3 border-b border-m8bs-border pb-4">
              <h3 className="text-sm font-semibold text-white">Annuity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="annuity_premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Annuity Premium</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                            calculateAnnuityCommission()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annuity_commission_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Commission %</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            calculateAnnuityCommission()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annuity_commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Annuity Commission</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Life Insurance Section */}
            <div className="space-y-3 border-b border-m8bs-border pb-4">
              <h3 className="text-sm font-semibold text-white">Life Insurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="life_insurance_premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Life Insurance Premium</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                            calculateLifeInsuranceCommission()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="life_insurance_commission_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Commission %</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            calculateLifeInsuranceCommission()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="life_insurance_commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Life Insurance Commission</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* AUM Section */}
            <div className="space-y-3 border-b border-m8bs-border pb-4">
              <h3 className="text-sm font-semibold text-white">AUM</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="aum_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">AUM Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                            calculateAumFees()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aum_fee_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Fee %</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            calculateAumFees()
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aum_fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Annual AUM Fees</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="$0.00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value)
                            field.onChange(formatted)
                          }}
                          className="bg-m8bs-card-alt border-m8bs-border text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Planning Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Financial Planning</h3>
              <FormField
                control={form.control}
                name="financial_planning_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Financial Planning Fee</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="$0.00"
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value)
                          field.onChange(formatted)
                        }}
                        className="bg-m8bs-card-alt border-m8bs-border text-white"
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
                  <FormLabel className="text-white">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes about this client..."
                      className="bg-m8bs-card-alt border-m8bs-border text-white"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-m8bs-border text-white hover:bg-m8bs-card-alt"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-m8bs-blue hover:bg-m8bs-blue/90 text-white"
              >
                {isSubmitting
                  ? mode === "add"
                    ? "Adding..."
                    : "Saving..."
                  : mode === "add"
                    ? "Add Client"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


