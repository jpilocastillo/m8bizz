import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EventsTable } from "@/components/dashboard/events-table"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { fetchUserEvents } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error in EventsPage:", error)
      redirect("/login")
    }

    if (!data.user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    // Fetch events for the user
    const events = await fetchUserEvents(data.user.id)

    return <EventsTable events={events} />
  } catch (error) {
    console.error("Unhandled error in EventsPage:", error)

    // If this is a redirect, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return <DashboardError error="An error occurred loading the events. Please try again later." />
  }
}
