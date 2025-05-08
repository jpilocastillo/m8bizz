"use server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/supabase"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function registerUser(name: string, email: string, password: string, company?: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company: company || null,
          role: "user"
        },
      },
    })

    if (error) {
      console.error("Error during sign up:", error)
      return { success: false, error: error.message }
    }

    if (data.user) {
      try {
        // Use the admin client to bypass RLS policies
        const adminClient = await createAdminClient()

        // Check if a profile already exists for this user
        const { data: existingProfile, error: profileError } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error checking existing profile:", profileError)
          return { success: false, error: profileError.message }
        }

        if (existingProfile) {
          // Update the existing profile
          const { error: updateError } = await adminClient
            .from("profiles")
            .update({
              full_name: name,
              email: email,
              company: company || null,
              role: "user",
              auth_id: data.user.id, // Ensure auth_id is set
            })
            .eq("id", data.user.id)

          if (updateError) {
            console.error("Error updating profile:", updateError)
            return { success: false, error: updateError.message }
          }
        } else {
          // Insert a new profile
          const { error: insertError } = await adminClient.from("profiles").insert({
            id: data.user.id,
            auth_id: data.user.id, // Set auth_id to match user id
            full_name: name,
            email: email,
            company: company || null,
            role: "user"
          })

          if (insertError) {
            console.error("Error creating profile:", insertError)
            return { success: false, error: insertError.message }
          }
        }
      } catch (adminError) {
        console.error("Admin client error:", adminError)
        return { success: false, error: "Error setting up user profile." }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in registerUser:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error during sign in:", error)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error in loginUser:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.user ?? null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Delete a user and all their data safely
export async function deleteUser(userId: string) {
  if (!userId) {
    console.error("deleteUser called without userId")
    return { success: false, error: "User ID is required" }
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createSupabaseClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log("Deleting user:", userId)

    // 1. First, get all events for this user
    const { data: marketingEvents, error: eventsError } = await adminClient
      .from("marketing_events")
      .select("id")
      .eq("user_id", userId)

    if (eventsError) {
      console.error("Error fetching user events:", eventsError)
      return { success: false, error: eventsError.message }
    }

    // 2. Delete all events and their related data
    if (marketingEvents && marketingEvents.length > 0) {
      console.log(`Found ${marketingEvents.length} events to delete`)
      
      for (const event of marketingEvents) {
        // Delete from marketing_events (cascade will handle related records)
        const { error: deleteError } = await adminClient
          .from("marketing_events")
          .delete()
          .eq("id", event.id)

        if (deleteError) {
          console.error(`Error deleting event ${event.id}:`, deleteError)
          return { success: false, error: deleteError.message }
        }
      }
    }

    // 3. Delete user's profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error("Error deleting user profile:", profileError)
      return { success: false, error: profileError.message }
    }

    // 4. Finally, delete the user from auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting user from auth:", authError)
      return { success: false, error: authError.message }
    }

    console.log("User and all related data deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser:", error instanceof Error ? error.message : String(error))
    return { success: false, error: "An unexpected error occurred while deleting the user." }
  }
}
