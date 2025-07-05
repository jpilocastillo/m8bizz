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

export default async function ProfileLayout({
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
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      redirect("/login")
    }

    user = authUser
    events = await fetchUserEvents(user.id)
  } catch (error) {
    console.error("Error in profile layout:", error)
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-m8bs-bg">
      <AnimatedBackground />
      <DatabaseStatus />
      
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader events={events} />
          
          <main className="flex-1 overflow-y-auto bg-m8bs-bg">
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
} 