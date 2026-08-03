import type { ClientMetrics, CommissionRates } from "@/lib/advisor-basecamp"

/**
 * Estimated income earned from one new client (not production).
 * Uses commission rates on avg annuity/AUM sizes, plus planning fee if set.
 */
export function getAvgCommissionIncomePerClient(
  clientMetrics?: Pick<ClientMetrics, "avg_annuity_size" | "avg_aum_size"> | null,
  commissionRates?: Pick<
    CommissionRates,
    "annuity_commission" | "aum_commission" | "planning_fee_rate"
  > | null,
): number {
  if (!clientMetrics || !commissionRates) return 0

  const annuityIncome =
    ((clientMetrics.avg_annuity_size || 0) * (commissionRates.annuity_commission || 0)) / 100
  const aumIncome =
    ((clientMetrics.avg_aum_size || 0) * (commissionRates.aum_commission || 0)) / 100
  const planningFee = commissionRates.planning_fee_rate || 0

  return annuityIncome + aumIncome + planningFee
}

/**
 * Estimate appointments from campaign goals for ROI.
 *
 * `appointments_per_campaign` is a capacity-planning input (how many campaigns you need),
 * NOT appointments generated per event. Multiplying `events * appointments_per_campaign`
 * overstated appointments by that factor (often ~10x) and inflated Marketing ROI.
 *
 * For ROI we estimate appointments from events (one appointment outcome per event),
 * falling back to campaign count × appointments_per_campaign, then leads × 40%.
 */
export function estimateCampaignAppointments(options: {
  totalEvents: number
  totalLeads: number
  campaignCount: number
  appointmentsPerCampaign: number
}): number {
  const { totalEvents, totalLeads, campaignCount, appointmentsPerCampaign } = options

  if (totalEvents > 0) return totalEvents
  if (appointmentsPerCampaign > 0 && campaignCount > 0) {
    return campaignCount * appointmentsPerCampaign
  }
  return Math.round(totalLeads * 0.4)
}

export function estimateClientsFromAppointments(
  totalAppointments: number,
  appointmentAttrition: number,
  avgCloseRatio: number,
): number {
  const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
  return Math.round(totalProspects * (avgCloseRatio / 100))
}

/**
 * Marketing ROI based on commission/income, not production.
 * ROI = ((income - cost) / cost) * 100
 */
export function calculateMarketingROI(income: number, cost: number): number {
  if (cost > 0) return ((income - cost) / cost) * 100
  if (income > 0) return 9999
  return 0
}
