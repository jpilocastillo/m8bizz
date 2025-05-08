"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SupabaseInitCheck() {
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        const supabase = createClient()

        // Simple query to check connection
        const { error } = await supabase.from("profiles").select("id").limit(1)

        if (error) {
          console.error("Supabase connection error:", error)
          setError(`Database connection error: ${error.message}`)
        }
      } catch (err) {
        console.error("Supabase client error:", err)
        setError("Failed to initialize Supabase client")
      } finally {
        setChecking(false)
      }
    }

    checkConnection()
  }, [])

  if (!error || checking) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Supabase Connection Error</AlertTitle>
      <AlertDescription>{error}. Please check your environment variables and database configuration.</AlertDescription>
    </Alert>
  )
}
