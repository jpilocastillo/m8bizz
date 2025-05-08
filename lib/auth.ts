"use server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
          role: "user",
          approval_status: "pending",
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
              approval_status: "pending",
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
            role: "user",
            approval_status: "pending",
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
