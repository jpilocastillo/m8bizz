import type React from "react"
import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { fetchUserEvents } from "@/lib/data"
import { AnimatedBackground } from "@/components/dashboard/animated-background"
import { DatabaseStatus } from "@/components/database-status"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Attempt to create the Supabase client
  let user = null
  let events = []

  try {
    const supabase = await createClient()

    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Auth error:", userError)
    } else {
      user = userData
    }

    if (user) {
      // Attempt to fetch events, but don't fail if this errors
      try {
        events = await fetchUserEvents(user.id)
      } catch (eventError) {
        console.error("Error fetching events:", eventError)
        events = []
      }
    }
  } catch (error) {
    console.error("Error in dashboard layout:", error)
  }

  // Only redirect if we're certain the user is not authenticated
  if (user === null) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-m8bs-bg text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <DashboardHeader events={events} />
        <main className="flex-1 overflow-y-auto p-6 bg-m8bs-bg bg-gradient-radial from-m8bs-card-alt/10 to-m8bs-bg">
          {/* Show database status banner at the top */}
          <DatabaseStatus />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
