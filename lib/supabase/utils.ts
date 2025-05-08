/**
 * Utility function to check if Supabase environment variables are properly configured
 */
export function checkSupabaseConfig() {
  const missingVars = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  if (process.env.NODE_ENV === "development" && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingVars.push("SUPABASE_SERVICE_ROLE_KEY")
  }

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing Supabase environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}
