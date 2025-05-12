import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EventsTable } from "@/components/dashboard/events-table"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { fetchAllEvents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error in EventsPage:", error)
      redirect("/")
    }

    if (!data.user) {
      console.log("No user found, redirecting to login")
      redirect("/")
    }

    // Fetch events for the user with all related data
    const events = await fetchAllEvents(data.user.id)

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Marketing Events</h1>
            <p className="text-muted-foreground">Manage and track your marketing events</p>
          </div>
          <Link href="/dashboard/events/new">
            <Button className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>
        <EventsTable events={events} />
      </div>
    )
  } catch (error) {
    console.error("Unhandled error in EventsPage:", error)

    // If this is a redirect, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return <DashboardError error="An error occurred loading the events. Please try again later." />
  }
}
