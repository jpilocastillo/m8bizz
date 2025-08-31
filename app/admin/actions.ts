"use server"

import { createClient } from "@supabase/supabase-js"

export async function getAdminUsers() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all profiles using admin client
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error loading profiles:", profilesError)
      throw profilesError
    }

    // Add basic stats for each user
    const usersWithData = profiles.map((profile: any) => ({
      profile,
      events_count: 0, // Will be implemented later
      total_revenue: 0, // Will be implemented later
      total_clients: 0, // Will be implemented later
    }))

    return { success: true, data: usersWithData }
  } catch (error) {
    console.error("Error in getAdminUsers:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getUserDetails(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get advisor basecamp data - handle errors gracefully
    const { data: advisorData, error: advisorError } = await adminClient
      .from("business_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: currentValues, error: currentError } = await adminClient
      .from("current_values")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: clientMetrics, error: metricsError } = await adminClient
      .from("client_metrics")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: campaigns, error: campaignsError } = await adminClient
      .from("marketing_campaigns")
      .select("*")
      .eq("user_id", userId)

    const { data: commissionRates, error: ratesError } = await adminClient
      .from("commission_rates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: financialBook, error: bookError } = await adminClient
      .from("financial_book")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    return {
      success: true,
      data: {
        advisorData,
        currentValues,
        clientMetrics,
        campaigns: campaigns || [],
        commissionRates,
        financialBook,
      }
    }
  } catch (error) {
    console.error("Error in getUserDetails:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
} 