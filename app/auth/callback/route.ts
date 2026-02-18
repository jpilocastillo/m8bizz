import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/"

  // If this is a password recovery callback, redirect to reset-password
  if (code && type === "recovery") {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully exchanged code, redirect to reset password page with the code
      const resetUrl = new URL("/reset-password", request.url)
      resetUrl.searchParams.set("code", code)
      resetUrl.searchParams.set("type", "recovery")
      return NextResponse.redirect(resetUrl)
    }
  }

  // For other auth callbacks, redirect to the specified next URL or home
  return NextResponse.redirect(new URL(next, request.url))
}

