import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/login-form"

export default async function Home() {
  const supabase = await createClient()

  // Get the session without try/catch since redirect handles this specially
  const { data } = await supabase.auth.getSession()

  // If user is authenticated, redirect to dashboard
  if (data.session) {
    redirect("/dashboard")
  }

  // If not authenticated, render the login form directly
  return <LoginForm />
}
