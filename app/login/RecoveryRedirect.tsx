"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function RecoveryRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have recovery parameters in the URL
    const code = searchParams?.get("code")
    const type = searchParams?.get("type")
    const hash = typeof window !== "undefined" ? window.location.hash : ""

    // Check hash for recovery tokens
    const hashParams = new URLSearchParams(hash.substring(1))
    const hashType = hashParams.get("type")
    const accessToken = hashParams.get("access_token")

    // If we have recovery parameters, redirect to reset-password
    if ((code && type === "recovery") || (hashType === "recovery" && accessToken)) {
      const resetUrl = new URL("/reset-password", window.location.origin)
      if (code) {
        resetUrl.searchParams.set("code", code)
        resetUrl.searchParams.set("type", type || "recovery")
      }
      if (hash) {
        resetUrl.hash = hash
      }
      router.replace(resetUrl.toString())
      return
    }

    // Also check if we have a recovery session but ended up on login
    const checkRecoverySession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Check if this might be a recovery session
        // Recovery sessions are temporary and used for password reset
        const user = session.user
        // If user exists but we're on login with no other indicators, 
        // check if we should be on reset-password instead
        if (user && window.location.pathname === "/login") {
          // Check URL for any recovery indicators we might have missed
          const fullUrl = window.location.href
          if (fullUrl.includes("recovery") || fullUrl.includes("reset")) {
            router.replace("/reset-password")
          }
        }
      }
    }

    checkRecoverySession()
  }, [router, searchParams])

  return null
}




