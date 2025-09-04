import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardError } from "@/components/dashboard/dashboard-error"

export const dynamic = "force-dynamic"

export default async function CampaignsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error in CampaignsPage:", error)
      redirect("/login")
    }

    if (!data.user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Campaigns</h1>
        <p>Campaigns feature coming soon...</p>
      </div>
    )
  } catch (error) {
    console.error("Unhandled error in CampaignsPage:", error)

    // If this is a redirect, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return <DashboardError error="An error occurred loading the campaigns. Please try again later." />
  }
}
