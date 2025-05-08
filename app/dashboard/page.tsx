import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { fetchDashboardData, fetchUserEvents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { BarChart3, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardError } from "@/components/dashboard/dashboard-error"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  try {
    const supabase = await createClient()
    let dashboardData = null
    let events = []
    let error = null
    let user = null

    // Get the current user
    const { data, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error getting user:", userError)
      return <DashboardError error="Authentication error. Please try logging in again." />
    }

    user = data.user

    // If no user is found, we'll let the middleware handle the redirect
    if (!user) {
      console.warn("No user found in session")
      return <DashboardError error="Please log in to access the dashboard." />
    }

    // Fetch all events for the user
    try {
      events = await fetchUserEvents(user.id)
      console.log(`Fetched ${events.length} events for user ${user.id}`)
    } catch (e) {
      console.error("Error fetching user events:", e)
      error = e.message || "Failed to load events"
    }

    // Fetch dashboard data for the most recent event (default)
    if (!error) {
      try {
        if (events.length > 0) {
          dashboardData = await fetchDashboardData(user.id)
          // If dashboardData is null but we have events, there might be an issue with data fetching
          if (!dashboardData) {
            console.warn("Dashboard data is null despite having events")
            error = "Unable to load dashboard data. Please try again later."
          }
        } else {
          console.log("No events found, skipping dashboard data fetch")
          // No events to show, dashboardData remains null
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e)
        error = e.message || "Failed to load dashboard data"
      }
    }

    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome to Your</h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-m8bs-blue-light to-m8bs-blue bg-clip-text text-transparent">
              M8BS Marketing Dashboard
            </h2>
          </div>
          <div className="flex gap-2">
            <Button className="btn-blue-gradient">
              <Link href="/dashboard/events/new" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Event
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <DashboardError error={error} />
        ) : (
          <Suspense fallback={<DashboardSkeleton />}>
            {dashboardData ? (
              <DashboardContent initialData={dashboardData} events={events} userId={user.id} />
            ) : (
              <Card className="bg-gradient-to-b from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-xl shadow-xl">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <div className="bg-m8bs-blue/20 p-4 rounded-full mb-4">
                    <BarChart3 className="h-12 w-12 text-m8bs-blue" />
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2 text-white">No marketing events found</h3>
                    <p className="text-m8bs-muted max-w-md">
                      Create your first marketing event to see your dashboard with comprehensive analytics and insights.
                    </p>
                  </div>
                  <Button className="btn-blue-gradient">
                    <Link href="/dashboard/events/new" className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create First Event
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </Suspense>
        )}
      </div>
    )
  } catch (e) {
    console.error("Unhandled error in Dashboard:", e)
    // If this is a redirect error, we don't want to show an error message
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
      throw e // Let Next.js handle the redirect
    }
    return <DashboardError error="An unexpected error occurred. Please try refreshing the page." />
  }
}
