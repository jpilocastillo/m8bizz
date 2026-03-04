"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Handshake, DollarSign, FileText } from "lucide-react"

const CULTIVATION_TYPE = "Current Clients / Cultivation"
const REFERRAL_TYPE = "Referrals"

interface EventItem {
  type: string
  revenue?: number
  expenses?: number
  cultivationClientTouches?: number
  cultivationActivityType?: string
  cultivationNotes?: string
}

interface CultivationReferralCardProps {
  events: EventItem[]
}

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${Math.round(value)}`
}

function safeNum(value: unknown): number {
  if (value == null) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const CultivationReferralCard = memo(function CultivationReferralCard({
  events,
}: CultivationReferralCardProps) {
  const stats = useMemo(() => {
    // Include events with canonical type OR with cultivation data (fallback if marketing_type was lost)
    const hasCultivationData = (e: EventItem) =>
      e.cultivationActivityType?.trim() ||
      (e.cultivationClientTouches != null && Number.isFinite(Number(e.cultivationClientTouches))) ||
      e.cultivationNotes?.trim()
    const cultivation = events.filter(
      (e) =>
        e.type === CULTIVATION_TYPE ||
        (e.type === "Other" && hasCultivationData(e))
    )
    const referral = events.filter((e) => e.type === REFERRAL_TYPE)
    const all = [...cultivation, ...referral]
    const totalRevenue = all.reduce((s, e) => s + safeNum(e.revenue), 0)
    const totalExpenses = all.reduce((s, e) => s + safeNum(e.expenses), 0)
    const cultivationRevenue = cultivation.reduce((s, e) => s + safeNum(e.revenue), 0)
    const referralRevenue = referral.reduce((s, e) => s + safeNum(e.revenue), 0)
    const totalTouches = cultivation.reduce(
      (s, e) => s + safeNum(e.cultivationClientTouches),
      0
    )
    const eventsWithNotes = cultivation.filter(
      (e) => e.cultivationNotes != null && String(e.cultivationNotes).trim() !== ""
    ).length
    const roi =
      totalExpenses > 0
        ? Math.round(((totalRevenue - totalExpenses) / totalExpenses) * 100)
        : totalRevenue > 0
          ? 9999
          : 0
    const activityCounts = cultivation.reduce(
      (acc, e) => {
        const t = e.cultivationActivityType?.trim() || "Other"
        acc[t] = (acc[t] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    return {
      cultivationCount: cultivation.length,
      referralCount: referral.length,
      totalRevenue,
      totalExpenses,
      cultivationRevenue,
      referralRevenue,
      totalTouches,
      avgTouchesPerCultivation:
        cultivation.length > 0 ? totalTouches / cultivation.length : 0,
      eventsWithNotes,
      roi,
      activityCounts: Object.entries(activityCounts).sort((a, b) => b[1] - a[1]),
    }
  }, [events])

  if (stats.cultivationCount === 0 && stats.referralCount === 0) {
    return null
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Handshake className="h-5 w-5 text-m8bs-blue" />
          Cultivation & Referral Activity
        </CardTitle>
        <p className="text-xs text-m8bs-muted mt-0.5">
          Client touch and referral event metrics (excludes seminar/workshop funnel)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-m8bs-card-alt/50 rounded-lg p-3 border border-m8bs-border/50">
            <div className="flex items-center gap-1.5 text-m8bs-muted text-xs font-medium">
              <Users className="h-3.5 w-3.5" />
              Cultivation events
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {stats.cultivationCount}
            </div>
          </div>
          <div className="bg-m8bs-card-alt/50 rounded-lg p-3 border border-m8bs-border/50">
            <div className="flex items-center gap-1.5 text-m8bs-muted text-xs font-medium">
              <Handshake className="h-3.5 w-3.5" />
              Referral events
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {stats.referralCount}
            </div>
          </div>
          <div className="bg-m8bs-card-alt/50 rounded-lg p-3 border border-m8bs-border/50">
            <div className="flex items-center gap-1.5 text-m8bs-muted text-xs font-medium">
              <Users className="h-3.5 w-3.5" />
              Client touches
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {stats.totalTouches}
            </div>
            {stats.cultivationCount > 0 && stats.totalTouches > 0 && (
              <div className="text-[10px] text-m8bs-muted mt-0.5">
                ~{Math.round(stats.avgTouchesPerCultivation)} per event
              </div>
            )}
          </div>
          <div className="bg-m8bs-card-alt/50 rounded-lg p-3 border border-m8bs-border/50">
            <div className="flex items-center gap-1.5 text-m8bs-muted text-xs font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              Revenue
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-m8bs-muted">
            <span>Expenses:</span>
            <span className="text-white font-medium">
              {formatCurrency(stats.totalExpenses)}
            </span>
          </div>
          {(stats.cultivationRevenue > 0 || stats.referralRevenue > 0) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-m8bs-muted">
              {stats.cultivationRevenue > 0 && (
                <span>
                  Cultivation:{" "}
                  <span className="text-white font-medium">
                    {formatCurrency(stats.cultivationRevenue)}
                  </span>
                </span>
              )}
              {stats.referralRevenue > 0 && (
                <span>
                  Referral:{" "}
                  <span className="text-white font-medium">
                    {formatCurrency(stats.referralRevenue)}
                  </span>
                </span>
              )}
            </div>
          )}
          {stats.eventsWithNotes > 0 && (
            <div className="flex items-center gap-1.5 text-m8bs-muted">
              <FileText className="h-3.5 w-3.5" />
              <span>
                {stats.eventsWithNotes} cultivation event
                {stats.eventsWithNotes !== 1 ? "s" : ""} with notes
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-m8bs-muted">ROI (cultivation + referral):</span>
          <span
            className={
              stats.roi > 0
                ? "text-green-400 font-semibold"
                : stats.roi < 0
                  ? "text-red-400 font-semibold"
                  : "text-white font-semibold"
            }
          >
            {stats.roi === 9999 ? "999%+" : `${stats.roi}%`}
          </span>
        </div>
        {stats.activityCounts.length > 0 && (
          <div className="pt-2 border-t border-m8bs-border/50">
            <h4 className="text-xs font-semibold text-m8bs-muted mb-2">
              Cultivation by activity type
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.activityCounts.map(([label, count]) => (
                <span
                  key={label}
                  className="px-2 py-1 rounded-md bg-m8bs-blue/20 text-m8bs-blue text-xs font-medium"
                >
                  {label}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
