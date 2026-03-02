"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { fetchUserEvents, fetchDashboardData } from "@/lib/data"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

function SingleEventContent() {
  const searchParams = useSearchParams()
  const { viewAsUserId, profile } = useViewAsUserOrThrow()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const userEvents = await fetchUserEvents(viewAsUserId)
        if (cancelled) return
        setEvents(userEvents || [])
        if (userEvents?.length === 0) {
          setLoading(false)
          return
        }
        const eventId = searchParams?.get("event") || (userEvents?.[0]?.id)
        const data = await fetchDashboardData(viewAsUserId, eventId)
        if (cancelled) return
        setDashboardData(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewAsUserId, searchParams?.get("event")])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardSkeleton />
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

  if (!dashboardData && events.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-m8bs-muted">No events found for this user.</p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-gradient-to-b from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-xl shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="bg-m8bs-blue/20 p-4 rounded-full mb-4">
              <BarChart3 className="h-12 w-12 text-m8bs-blue" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No dashboard data</h3>
            <p className="text-m8bs-muted">Unable to load single event dashboard for {displayName}.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Single Event</h1>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-m8bs-blue-light to-m8bs-blue bg-clip-text text-transparent">
          Marketing Dashboard
        </h2>
        <p className="text-m8bs-muted mt-1">View only — {displayName}</p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent initialData={dashboardData} events={events} userId={viewAsUserId} />
      </Suspense>
    </div>
  )
}

export default function AdminViewAsSingleEventPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SingleEventContent />
    </Suspense>
  )
}
