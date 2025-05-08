"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function approveUser(userId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("profiles").update({ status: "approved" }).eq("id", userId)

    if (error) throw error

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Error approving user:", error)
    return { success: false, error }
  }
}

export async function rejectUser(userId: string) {
  try {
    const supabase = createAdminClient()

    // First delete the user from auth
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("auth_id")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    if (userData?.auth_id) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userData.auth_id)
      if (deleteAuthError) throw deleteAuthError
    }

    // Then delete from profiles (should cascade due to foreign key)
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) throw error

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Error rejecting user:", error)
    return { success: false, error }
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) throw error

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error }
  }
}
