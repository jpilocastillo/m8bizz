import type React from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnimatedBackground } from "@/components/dashboard/animated-background"
import { DatabaseStatus } from "@/components/database-status"

export default async function CampaignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Attempt to create the Supabase client
  let user = null

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
  } catch (error) {
    console.error("Error in campaigns layout:", error)
  }

  // Only redirect if we're certain the user is not authenticated
  if (user === null) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 xl:px-12 pt-12 sm:pt-16 pb-8 sm:pb-10 bg-black">
          {/* Show database status banner at the top */}
          <DatabaseStatus />
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </div>
        </main>
      </div>
    </div>
  )
} 