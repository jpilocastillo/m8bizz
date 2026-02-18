"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

/**
 * Hook to refresh session before critical operations
 * This ensures the session stays alive during long data entry sessions
 */
export function useSessionRefresh() {
  const { session } = useAuth()
  const supabase = createClient()

  const refreshIfNeeded = useCallback(async () => {
    if (!session) return false

    try {
      const expiresAt = session.expires_at
      if (!expiresAt) return true

      const expiresIn = expiresAt * 1000 - Date.now()
      const tenMinutes = 10 * 60 * 1000

      // Refresh if session expires in less than 10 minutes
      if (expiresIn < tenMinutes && expiresIn > 0) {
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          console.error("Error refreshing session:", error)
          return false
        }
        return true
      }
      return true
    } catch (error) {
      console.error("Error checking session:", error)
      return false
    }
  }, [session, supabase])

  return { refreshIfNeeded }
}















