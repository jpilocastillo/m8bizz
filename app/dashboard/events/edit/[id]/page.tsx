import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "@/components/event-form"
import { fetchDashboardData } from "@/lib/data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch the event data to pre-populate the form
  const eventData = await fetchDashboardData(user.id, eventId)

  if (!eventData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-m8bs-blue-light to-m8bs-blue bg-clip-text text-transparent">
          Edit Marketing Event
        </h2>
      </div>
      <EventForm initialData={eventData} isEditing={true} />
    </div>
  )
}
