"use client"

import { useState, useEffect } from "react"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { fetchAllEvents } from "@/lib/data"
import { buildAnalyticsDataFromEvents } from "@/lib/analytics-data"
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard"
import { AnalyticsSkeleton } from "@/components/dashboard/analytics/analytics-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Suspense } from "react"

export default function AdminViewAsAnalyticsPage() {
  const { viewAsUserId, profile } = useViewAsUserOrThrow()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const events = await fetchAllEvents(viewAsUserId)
        if (cancelled) return
        if (!events || events.length === 0) {
          setAnalyticsData(buildAnalyticsDataFromEvents([]))
          return
        }
        setAnalyticsData(buildAnalyticsDataFromEvents(events))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load analytics")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewAsUserId])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsSkeleton />
        </Suspense>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <DashboardError error={error} />
      </div>
    )
  }

  const displayName = profile?.full_name || profile?.email || "User"
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <p className="text-m8bs-muted text-sm mb-4">Multi Event Dashboard — view only for {displayName}</p>
      <TooltipProvider>
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDashboard analyticsData={analyticsData} />
        </Suspense>
      </TooltipProvider>
    </div>
  )
}
