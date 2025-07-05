import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  try {
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If user is authenticated, redirect to dashboard
    if (user && !error) {
      redirect("/dashboard")
    }
    
    // If no user or any error, redirect to login
    redirect("/login")
  } catch (error) {
    console.error("Error in homepage:", error)
    // If there's an error (like missing env vars), redirect to login instead of test page
    redirect("/login")
  }
} 