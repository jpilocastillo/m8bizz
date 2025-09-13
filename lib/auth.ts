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

 
 / /   U s e r   M a n a g e m e n t   F u n c t i o n s   f o r   U s e r   M a n a g e r s 
 e x p o r t   a s y n c   f u n c t i o n   c r e a t e U s e r B y M a n a g e r ( n a m e :   s t r i n g ,   e m a i l :   s t r i n g ,   p a s s w o r d :   s t r i n g ,   c o m p a n y ? :   s t r i n g )   { 
     t r y   { 
         / /   F i r s t   c h e c k   i f   t h e   c u r r e n t   u s e r   i s   a   u s e r   m a n a g e r 
         c o n s t   s u p a b a s e   =   a w a i t   c r e a t e C l i e n t ( ) 
         c o n s t   {   d a t a :   {   s e s s i o n   }   }   =   a w a i t   s u p a b a s e . a u t h . g e t S e s s i o n ( ) 
         
         i f   ( ! s e s s i o n )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " N o t   a u t h e n t i c a t e d "   } 
         } 
 
         c o n s t   r o l e C h e c k   =   a w a i t   c h e c k U s e r M a n a g e r R o l e ( s e s s i o n . u s e r . i d ) 
         i f   ( ! r o l e C h e c k . s u c c e s s   | |   ! r o l e C h e c k . i s U s e r M a n a g e r )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " I n s u f f i c i e n t   p e r m i s s i o n s "   } 
         } 
 
         / /   U s e   a d m i n   c l i e n t   t o   c r e a t e   u s e r 
         c o n s t   a d m i n C l i e n t   =   a w a i t   c r e a t e A d m i n C l i e n t ( ) 
 
         / /   C r e a t e   u s e r   i n   a u t h 
         c o n s t   {   d a t a :   a u t h D a t a ,   e r r o r :   a u t h E r r o r   }   =   a w a i t   a d m i n C l i e n t . a u t h . a d m i n . c r e a t e U s e r ( { 
             e m a i l , 
             p a s s w o r d , 
             e m a i l _ c o n f i r m :   t r u e , 
         } ) 
 
         i f   ( a u t h E r r o r )   { 
             c o n s o l e . e r r o r ( " E r r o r   c r e a t i n g   u s e r   i n   a u t h : " ,   a u t h E r r o r ) 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   a u t h E r r o r . m e s s a g e   } 
         } 
 
         / /   C r e a t e   p r o f i l e 
         c o n s t   {   e r r o r :   p r o f i l e E r r o r   }   =   a w a i t   a d m i n C l i e n t 
             . f r o m ( " p r o f i l e s " ) 
             . i n s e r t ( { 
                 i d :   a u t h D a t a . u s e r . i d , 
                 a u t h _ i d :   a u t h D a t a . u s e r . i d , 
                 f u l l _ n a m e :   n a m e , 
                 e m a i l :   e m a i l , 
                 c o m p a n y :   c o m p a n y   | |   n u l l , 
                 r o l e :   " u s e r " 
             } ) 
 
         i f   ( p r o f i l e E r r o r )   { 
             c o n s o l e . e r r o r ( " E r r o r   c r e a t i n g   p r o f i l e : " ,   p r o f i l e E r r o r ) 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   p r o f i l e E r r o r . m e s s a g e   } 
         } 
 
         r e t u r n   {   s u c c e s s :   t r u e ,   u s e r :   a u t h D a t a . u s e r   } 
     }   c a t c h   ( e r r o r )   { 
         c o n s o l e . e r r o r ( " E r r o r   i n   c r e a t e U s e r B y M a n a g e r : " ,   e r r o r ) 
         r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " A n   u n e x p e c t e d   e r r o r   o c c u r r e d . "   } 
     } 
 } 
 
 e x p o r t   a s y n c   f u n c t i o n   d e l e t e U s e r B y M a n a g e r ( u s e r I d :   s t r i n g )   { 
     t r y   { 
         / /   F i r s t   c h e c k   i f   t h e   c u r r e n t   u s e r   i s   a   u s e r   m a n a g e r 
         c o n s t   s u p a b a s e   =   a w a i t   c r e a t e C l i e n t ( ) 
         c o n s t   {   d a t a :   {   s e s s i o n   }   }   =   a w a i t   s u p a b a s e . a u t h . g e t S e s s i o n ( ) 
         
         i f   ( ! s e s s i o n )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " N o t   a u t h e n t i c a t e d "   } 
         } 
 
         c o n s t   r o l e C h e c k   =   a w a i t   c h e c k U s e r M a n a g e r R o l e ( s e s s i o n . u s e r . i d ) 
         i f   ( ! r o l e C h e c k . s u c c e s s   | |   ! r o l e C h e c k . i s U s e r M a n a g e r )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " I n s u f f i c i e n t   p e r m i s s i o n s "   } 
         } 
 
         / /   P r e v e n t   u s e r   m a n a g e r s   f r o m   d e l e t i n g   t h e m s e l v e s   o r   o t h e r   u s e r   m a n a g e r s / a d m i n s 
         i f   ( s e s s i o n . u s e r . i d   = = =   u s e r I d )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " C a n n o t   d e l e t e   y o u r   o w n   a c c o u n t "   } 
         } 
 
         / /   C h e c k   i f   t a r g e t   u s e r   i s   a d m i n   o r   u s e r _ m a n a g e r 
         c o n s t   {   d a t a :   t a r g e t P r o f i l e   }   =   a w a i t   s u p a b a s e 
             . f r o m ( " p r o f i l e s " ) 
             . s e l e c t ( " r o l e " ) 
             . e q ( " i d " ,   u s e r I d ) 
             . s i n g l e ( ) 
 
         i f   ( t a r g e t P r o f i l e ? . r o l e   = = =   " a d m i n "   | |   t a r g e t P r o f i l e ? . r o l e   = = =   " u s e r _ m a n a g e r " )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " C a n n o t   d e l e t e   a d m i n   o r   u s e r   m a n a g e r   a c c o u n t s "   } 
         } 
 
         / /   U s e   a d m i n   c l i e n t   t o   d e l e t e   u s e r 
         c o n s t   a d m i n C l i e n t   =   a w a i t   c r e a t e A d m i n C l i e n t ( ) 
 
         / /   D e l e t e   u s e r   f r o m   a u t h   ( t h i s   w i l l   c a s c a d e   d e l e t e   t h e   p r o f i l e   d u e   t o   f o r e i g n   k e y ) 
         c o n s t   {   e r r o r :   d e l e t e E r r o r   }   =   a w a i t   a d m i n C l i e n t . a u t h . a d m i n . d e l e t e U s e r ( u s e r I d ) 
 
         i f   ( d e l e t e E r r o r )   { 
             c o n s o l e . e r r o r ( " E r r o r   d e l e t i n g   u s e r : " ,   d e l e t e E r r o r ) 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   d e l e t e E r r o r . m e s s a g e   } 
         } 
 
         r e t u r n   {   s u c c e s s :   t r u e   } 
     }   c a t c h   ( e r r o r )   { 
         c o n s o l e . e r r o r ( " E r r o r   i n   d e l e t e U s e r B y M a n a g e r : " ,   e r r o r ) 
         r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " A n   u n e x p e c t e d   e r r o r   o c c u r r e d . "   } 
     } 
 } 
 
 e x p o r t   a s y n c   f u n c t i o n   g e t A l l U s e r s F o r M a n a g e r ( )   { 
     t r y   { 
         / /   F i r s t   c h e c k   i f   t h e   c u r r e n t   u s e r   i s   a   u s e r   m a n a g e r 
         c o n s t   s u p a b a s e   =   a w a i t   c r e a t e C l i e n t ( ) 
         c o n s t   {   d a t a :   {   s e s s i o n   }   }   =   a w a i t   s u p a b a s e . a u t h . g e t S e s s i o n ( ) 
         
         i f   ( ! s e s s i o n )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " N o t   a u t h e n t i c a t e d "   } 
         } 
 
         c o n s t   r o l e C h e c k   =   a w a i t   c h e c k U s e r M a n a g e r R o l e ( s e s s i o n . u s e r . i d ) 
         i f   ( ! r o l e C h e c k . s u c c e s s   | |   ! r o l e C h e c k . i s U s e r M a n a g e r )   { 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " I n s u f f i c i e n t   p e r m i s s i o n s "   } 
         } 
 
         / /   U s e   a d m i n   c l i e n t   t o   g e t   a l l   u s e r s 
         c o n s t   a d m i n C l i e n t   =   a w a i t   c r e a t e A d m i n C l i e n t ( ) 
 
         c o n s t   {   d a t a :   p r o f i l e s ,   e r r o r   }   =   a w a i t   a d m i n C l i e n t 
             . f r o m ( " p r o f i l e s " ) 
             . s e l e c t ( " * " ) 
             . o r d e r ( " c r e a t e d _ a t " ,   {   a s c e n d i n g :   f a l s e   } ) 
 
         i f   ( e r r o r )   { 
             c o n s o l e . e r r o r ( " E r r o r   l o a d i n g   u s e r s : " ,   e r r o r ) 
             r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   e r r o r . m e s s a g e   } 
         } 
 
         r e t u r n   {   s u c c e s s :   t r u e ,   u s e r s :   p r o f i l e s   } 
     }   c a t c h   ( e r r o r )   { 
         c o n s o l e . e r r o r ( " E r r o r   i n   g e t A l l U s e r s F o r M a n a g e r : " ,   e r r o r ) 
         r e t u r n   {   s u c c e s s :   f a l s e ,   e r r o r :   " A n   u n e x p e c t e d   e r r o r   o c c u r r e d . "   } 
     } 
 }  
 