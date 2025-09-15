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

export async function createUser(name: string, email: string, password: string, company?: string, role: string = "user") {
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

    // Create user in auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in auth:", authError)
      return { success: false, error: authError.message }
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        auth_id: authData.user.id,
        full_name: name,
        email: email,
        company: company || null,
        role: role,
      })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }

    return { success: true, data: { user: authData.user, profile: { id: authData.user.id, full_name: name, email, company, role } } }
  } catch (error) {
    console.error("Error in createUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteUser(userId: string) {
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

    // Delete user from auth (this will cascade delete the profile due to foreign key constraint)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting user from auth:", authError)
      return { success: false, error: authError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateUser(userId: string, updates: {
  full_name?: string;
  email?: string;
  company?: string;
  role?: string;
}) {
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

    // Update profile
    const { data, error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    // If email is being updated, also update auth
    if (updates.email) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        email: updates.email
      })

      if (authError) {
        console.error("Error updating auth email:", authError)
        return { success: false, error: authError.message }
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in updateUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
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

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error("Error resetting password:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resetUserPassword:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}