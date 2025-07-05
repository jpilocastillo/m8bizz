"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClearAuthPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [message, setMessage] = useState("")

  const clearAuth = async () => {
    setIsClearing(true)
    setMessage("Clearing authentication tokens...")
    
    try {
      const supabase = createClient()
      
      // Sign out to clear all auth tokens
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setMessage(`Error clearing auth: ${error.message}`)
      } else {
        setMessage("Authentication tokens cleared successfully! Redirecting to login...")
        
        // Clear any remaining cookies manually
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Clear Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This will clear all authentication tokens and redirect you to the login page.
            Use this if you're experiencing authentication issues.
          </p>
          
          <Button 
            onClick={clearAuth} 
            disabled={isClearing}
            className="w-full"
          >
            {isClearing ? "Clearing..." : "Clear Auth & Go to Login"}
          </Button>
          
          {message && (
            <p className="text-sm text-blue-600 mt-2">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 