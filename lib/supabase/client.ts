import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Ensure the environment variables are defined
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in client")
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
    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

// Add back the getSupabaseClient function
export function getSupabaseClient() {
  return createClient()
}
