"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SessionWarning() {
  const { session } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!session) return

    const checkSessionExpiry = () => {
      const expiresAt = session.expires_at
      if (!expiresAt) return

      const expiresIn = expiresAt * 1000 - Date.now()
      const fiveMinutes = 5 * 60 * 1000
      const oneMinute = 60 * 1000

      // Show warning if session expires in less than 5 minutes
      if (expiresIn < fiveMinutes && expiresIn > 0) {
        setShowWarning(true)
        setTimeRemaining(Math.floor(expiresIn / 1000))
      } else {
        setShowWarning(false)
        setTimeRemaining(null)
      }
    }

    // Check immediately
    checkSessionExpiry()

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000)

    // Update time remaining every second when warning is shown
    const timeInterval = setInterval(() => {
      if (showWarning && session?.expires_at) {
        const expiresIn = session.expires_at * 1000 - Date.now()
        if (expiresIn > 0) {
          setTimeRemaining(Math.floor(expiresIn / 1000))
        } else {
          setShowWarning(false)
          setTimeRemaining(null)
        }
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [session, showWarning])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
      } else {
        setShowWarning(false)
        setTimeRemaining(null)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showWarning || !timeRemaining) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
      <Alert className="bg-yellow-900/20 border-yellow-500/50">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">Session Expiring Soon</AlertTitle>
        <AlertDescription className="text-white mt-2">
          Your session will expire in {formatTime(timeRemaining)}. Please refresh your session to continue working.
        </AlertDescription>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
          </Button>
        </div>
      </Alert>
    </div>
  )
}






