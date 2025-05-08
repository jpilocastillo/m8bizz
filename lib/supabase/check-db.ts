import { createClient } from "./server"

export async function isDatabaseAccessible() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)

    if (error) {
      console.error("Database access check failed:", error.message)
      return false
    }

    return true
  } catch (err) {
    console.error("Error checking database access:", err)
    return false
  }
}

export async function getEnvironmentStatus() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  return {
    hasAllEnvVars: Object.values(envVars).every(Boolean),
    envVars,
    dbAccessible: await isDatabaseAccessible(),
  }
}
