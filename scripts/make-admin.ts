import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function makeAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const userEmail = process.argv[2]

  if (!userEmail) {
    console.error("Usage: npm run make-admin <email>")
    console.error("Example: npm run make-admin admin@m8bs.com")
    process.exit(1)
  }

  try {
    console.log("Looking up user...")

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error("Error listing users:", userError.message)
      process.exit(1)
    }

    const user = users.find(u => u.email === userEmail)
    
    if (!user) {
      console.error(`User with email ${userEmail} not found`)
      process.exit(1)
    }

    console.log("✅ Found user:", user.email)

    // Update profile to admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating profile:", profileError.message)
      process.exit(1)
    }

    console.log("✅ User role updated to admin successfully!")
    console.log(`Email: ${userEmail}`)
    console.log("You can now log in at /admin/login")

  } catch (error) {
    console.error("Error making user admin:", error)
    process.exit(1)
  }
}

makeAdmin().catch(console.error) 