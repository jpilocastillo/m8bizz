import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "@/components/event-form"
import { fetchDashboardData } from "@/lib/data"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id
  const cookieStore = cookies()
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch the event data to pre-populate the form
  const eventData = await fetchDashboardData(user.id, eventId)

  if (!eventData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <EventForm initialData={eventData} isEditing={true} userId={user.id} />
    </div>
  )
}
