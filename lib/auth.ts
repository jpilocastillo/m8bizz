"use server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/supabase"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function registerUser(name: string, email: string, password: string, company?: string) {
  try {
    const supabase = await createClient()

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

export async function updateUserEmail(newEmail: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Use admin client to update profiles table
    const adminClient = await createAdminClient()
    
    // Update the profiles table email
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ email: newEmail })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating profile email:", profileError)
      return { success: false, error: profileError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserEmail:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const supabase = await createClient()

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
    const supabase = await createClient()

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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
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

// User Management Functions for User Managers
export async function createUserByManager(name: string, email: string, password: string, company?: string) {
  try {
    // Use the admin client to create the user
    const adminClient = await createAdminClient()

    // Create the user in auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in auth:", authError)
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      // Create the profile
      const { error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          auth_id: authData.user.id,
          full_name: name,
          email: email,
          company: company || null,
          role: "user"
        })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        return { success: false, error: profileError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in createUserByManager:", error)
    return { success: false, error: "An unexpected error occurred while creating the user." }
  }
}

export async function getUsersForManager() {
  try {
    const adminClient = await createAdminClient()

    // Get all profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error loading profiles:", profilesError)
      return { success: false, error: profilesError.message }
    }

    return { success: true, data: profiles }
  } catch (error) {
    console.error("Error in getUsersForManager:", error)
    return { success: false, error: "An unexpected error occurred while loading users." }
  }
}

export async function deleteUserByManager(userId: string) {
  try {
    const adminClient = await createAdminClient()

    // Delete the user from auth (this will cascade delete the profile due to foreign key)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting user from auth:", authError)
      return { success: false, error: authError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteUserByManager:", error)
    return { success: false, error: "An unexpected error occurred while deleting the user." }
  }
}

export async function checkUserManagerRole(userId: string) {
  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error checking user role:", error)
      return { success: false, error: error.message }
    }

    const isUserManager = profile?.role === "user_manager" || profile?.role === "admin"
    return { success: true, isUserManager }
  } catch (error) {
    console.error("Error in checkUserManagerRole:", error)
    return { success: false, error: "An unexpected error occurred while checking user role." }
  }
}
