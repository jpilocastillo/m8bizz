import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { logger } from "@/lib/logger"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null

  try {
    const supabase = await createClient()

    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error("Auth error:", userError)
    } else {
      user = userData
    }
  } catch (error) {
    logger.error("Error in business dashboard layout:", error)
  }

  if (user === null) {
    redirect("/login")
  }

  return <DashboardShell>{children}</DashboardShell>
}
