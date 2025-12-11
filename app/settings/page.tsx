import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { PasswordChangeForm } from "@/components/dashboard/settings/password-change-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error in SettingsPage:", error)
      redirect("/login")
    }

    if (!data.user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    return (
      <div className="py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage Your Account Settings And Preferences</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unhandled error in SettingsPage:", error)

    // If this is a redirect, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return <DashboardError error="An Error Occurred Loading The Settings. Please Try Again Later." />
  }
}
