import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/"
  const expectedType = requestUrl.searchParams.get("expected_type") // From our redirect URL

  // If this is a password recovery callback (either explicit type=recovery or from our redirect)
  if (code && (type === "recovery" || expectedType === "recovery")) {
    const supabase = await createClient()
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data?.session) {
        // Successfully exchanged code, redirect to reset password page
        // Don't include the code in the URL - the session is already established
        const resetUrl = new URL("/reset-password", request.url)
        // Keep the code temporarily so the client can verify
        resetUrl.searchParams.set("code", code)
        resetUrl.searchParams.set("type", "recovery")
        return NextResponse.redirect(resetUrl)
      } else {
        // If exchange failed, still redirect to reset-password with code so it can handle the error
        console.error("Failed to exchange code for session:", error)
        const resetUrl = new URL("/reset-password", request.url)
        resetUrl.searchParams.set("code", code)
        if (type) resetUrl.searchParams.set("type", type)
        return NextResponse.redirect(resetUrl)
      }
    } catch (error) {
      console.error("Error in auth callback:", error)
      // Still redirect to reset-password so it can show an error
      const resetUrl = new URL("/reset-password", request.url)
      if (code) resetUrl.searchParams.set("code", code)
      return NextResponse.redirect(resetUrl)
    }
  }

  // For other auth callbacks, redirect to the specified next URL or home
  return NextResponse.redirect(new URL(next, request.url))
}

