"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DatabaseStatus() {
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        // First check if environment variables are defined
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("Missing Supabase environment variables")
          setError("Missing Supabase environment variables")
          setChecking(false)
          return
        }

        const supabase = createClient()

        // Try to make a simple query to check connection
        try {
          const { error: queryError } = await supabase.from("profiles").select("id").limit(1)

          if (queryError) {
            console.error("Database query error:", queryError.message)
            setError(`Database query error: ${queryError.message}`)
          }
        } catch (queryErr) {
          console.error("Database query failed:", queryErr)
          setError("Failed to query database")
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
      <AlertTitle>Database Connection Error</AlertTitle>
      <AlertDescription>{error}. Please check your environment variables and database configuration.</AlertDescription>
    </Alert>
  )
}
