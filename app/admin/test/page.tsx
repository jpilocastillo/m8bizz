"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminTestPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Check current user
      console.log("Current user:", user)
      results.currentUser = user

      // Test 2: Check user profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        console.log("User profile:", profile)
        console.log("Profile error:", profileError)
        results.userProfile = { data: profile, error: profileError }
      }

      // Test 3: Try to get all profiles
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("All profiles:", allProfiles)
      console.log("All profiles error:", allProfilesError)
      results.allProfiles = { data: allProfiles, error: allProfilesError }

      // Test 4: Check if we can count profiles
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      console.log("Profile count:", count)
      console.log("Count error:", countError)
      results.profileCount = { count, error: countError }

    } catch (error) {
      console.error("Test error:", error)
      results.error = error
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Debug Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={loading}>
              {loading ? "Running Tests..." : "Run Tests"}
            </Button>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                
                {testResults.currentUser && (
                  <div>
                    <h4 className="font-medium">Current User:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(testResults.currentUser, null, 2)}
                    </pre>
                  </div>
                )}

                {testResults.userProfile && (
                  <div>
                    <h4 className="font-medium">User Profile:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(testResults.userProfile, null, 2)}
                    </pre>
                  </div>
                )}

                {testResults.allProfiles && (
                  <div>
                    <h4 className="font-medium">All Profiles:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(testResults.allProfiles, null, 2)}
                    </pre>
                  </div>
                )}

                {testResults.profileCount && (
                  <div>
                    <h4 className="font-medium">Profile Count:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(testResults.profileCount, null, 2)}
                    </pre>
                  </div>
                )}

                {testResults.error && (
                  <div>
                    <h4 className="font-medium text-red-600">Error:</h4>
                    <pre className="bg-red-100 p-2 rounded text-sm text-red-800">
                      {JSON.stringify(testResults.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 