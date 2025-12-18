import type React from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
  } catch (error) {
    console.error("Error in profile layout:", error)
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <DatabaseStatus />
      
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6 xl:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-black">
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 