"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TestResults = {
  envVars: {
    NEXT_PUBLIC_SUPABASE_URL: boolean
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean
    DATABASE_URL: boolean
    NEXT_PUBLIC_SITE_URL: boolean
  }
  supabaseConnection: boolean
  error?: string
}

export default function EnvTest() {
  const [testResults, setTestResults] = useState<TestResults>({
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: false,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: false,
      DATABASE_URL: false,
      NEXT_PUBLIC_SITE_URL: false,
    },
    supabaseConnection: false,
  })

  useEffect(() => {
    async function runTests() {
      const results: TestResults = {
        envVars: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          DATABASE_URL: !!process.env.DATABASE_URL,
          NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
        },
        supabaseConnection: false,
      }

      try {
        // Test Supabase connection
        const supabase = createClient()
        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        if (error) throw error
        results.supabaseConnection = true
      } catch (error) {
        results.error = error instanceof Error ? error.message : "Unknown error occurred"
      }

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Environment Test Results</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(testResults.envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`} />
                <span className="font-mono">{key}</span>
                <span className="text-gray-500">
                  {value ? "✓ Present" : "✗ Missing"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                testResults.supabaseConnection ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>
              {testResults.supabaseConnection
                ? "✓ Connected successfully"
                : "✗ Connection failed"}
            </span>
          </div>
          {testResults.error && (
            <div className="mt-2 text-red-500">
              <p className="font-semibold">Error:</p>
              <p className="font-mono text-sm">{testResults.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 