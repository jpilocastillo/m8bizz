import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import { logger } from "@/lib/logger"

// Create a new client instance each time to ensure fresh session
// createBrowserClient automatically handles cookies and sessions
export function createClient() {
  // Ensure the environment variables are defined
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("Missing Supabase environment variables in client", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    // Return a mock client to prevent runtime errors
    return {
      from: () => ({
        select: () => ({
          limit: () => ({
            then: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
          single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          maybeSingle: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any
  }

  try {
    // createBrowserClient from @supabase/ssr automatically handles:
    // - Cookie-based session management
    // - Automatic token refresh
    // - Session persistence
    // We create a singleton instance to ensure consistent session handling
    const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    logger.debug("Supabase client created successfully")
    return client
  } catch (error) {
    logger.error("Error creating Supabase client:", error)
    throw error
  }
}

// Add back the getSupabaseClient function
export function getSupabaseClient() {
  return createClient()
}
