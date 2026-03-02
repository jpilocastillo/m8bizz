"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { fetchAllEvents } from "@/lib/data"
import { EventsTable } from "@/components/dashboard/events-table"
import { DashboardError } from "@/components/dashboard/dashboard-error"

export default function AdminViewAsEventsPage() {
  const params = useParams()
  const userId = params.userId as string
  const { viewAsUserId, profile } = useViewAsUserOrThrow()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAllEvents(viewAsUserId)
        if (cancelled) return
        setEvents(data || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load events")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewAsUserId])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-m8bs-blue/20 border-t-m8bs-blue" />
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
  const basePath = `/admin/users/${userId}`

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Marketing Events</h1>
        <p className="text-m8bs-muted">View only — {displayName}</p>
      </div>
      {events.length === 0 ? (
        <p className="text-m8bs-muted">No events found.</p>
      ) : (
        <EventsTable
          events={events}
          readOnly
          viewHrefPrefix={`${basePath}/single-event`}
        />
      )}
    </div>
  )
}
