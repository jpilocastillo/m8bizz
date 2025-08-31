import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function updateTestUsers() {
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

  const testUsers = [
    {
      email: "john.doe@example.com",
      full_name: "John Doe",
      company: "Financial Advisors Inc",
      role: "user"
    },
    {
      email: "jane.smith@example.com", 
      full_name: "Jane Smith",
      company: "Wealth Management Group",
      role: "user"
    },
    {
      email: "mike.johnson@example.com",
      full_name: "Mike Johnson",
      company: "Retirement Planning LLC",
      role: "user"
    },
    {
      email: "sarah.wilson@example.com",
      full_name: "Sarah Wilson", 
      company: "Investment Strategies",
      role: "user"
    }
  ]

  try {
    console.log("Updating test users...")

    for (const userData of testUsers) {
      console.log(`Updating user: ${userData.email}`)

      // Get user by email
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) {
        console.error("Error listing users:", userError.message)
        continue
      }

      const user = users.find(u => u.email === userData.email)
      
      if (!user) {
        console.error(`User with email ${userData.email} not found`)
        continue
      }

      console.log(`✅ Found user: ${user.email}`)

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          company: userData.company,
        })
        .eq("id", user.id)

      if (profileError) {
        console.error(`Error updating profile for ${userData.email}:`, profileError.message)
        continue
      }

      console.log(`✅ Profile updated for: ${userData.email}`)
    }

    console.log("✅ All test users updated successfully!")
    console.log("You can now test the admin dashboard with multiple users")

  } catch (error) {
    console.error("Error updating test users:", error)
    process.exit(1)
  }
}

updateTestUsers().catch(console.error) 