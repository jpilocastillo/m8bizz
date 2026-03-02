import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/login-form"
import { RecoveryRedirect } from "./RecoveryRedirect"

export default async function LoginPage() {
  const supabase = await createClient()
  console.log("Supabase client:", supabase)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only redirect authenticated users if it's NOT a recovery session
  // Recovery sessions should stay on login so the client component can handle the redirect
  if (session) {
    // Don't redirect recovery sessions - let the client component handle it
    // Regular authenticated sessions should go home
    const user = session.user
    // Check if this might be a recovery session by checking session age
    // Recovery sessions are typically very new
    const sessionAge = Date.now() / 1000 - (session.expires_at || 0)
    const isNewSession = sessionAge < 300 // Less than 5 minutes old
    
    // If it's a new session and we're on login, it might be a recovery session
    // Let the client component check and redirect appropriately
    if (!isNewSession) {
      redirect("/")
    }
  }

  return (
    <>
      <RecoveryRedirect />
      <LoginForm />
    </>
  )
}
