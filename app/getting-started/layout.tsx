import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { logger } from "@/lib/logger"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { isBrandNewUser } from "@/lib/onboarding-eligibility"

export default async function GettingStartedLayout({
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
    logger.error("Error in getting-started layout:", error)
  }

  if (user === null) {
    redirect("/login")
  }

  if (!isBrandNewUser(user)) {
    redirect("/")
  }

  return <DashboardShell>{children}</DashboardShell>
}
