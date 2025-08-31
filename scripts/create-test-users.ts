import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function createTestUsers() {
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
      password: "password123",
      full_name: "John Doe",
      company: "Financial Advisors Inc",
      role: "user"
    },
    {
      email: "jane.smith@example.com", 
      password: "password123",
      full_name: "Jane Smith",
      company: "Wealth Management Group",
      role: "user"
    },
    {
      email: "mike.johnson@example.com",
      password: "password123", 
      full_name: "Mike Johnson",
      company: "Retirement Planning LLC",
      role: "user"
    },
    {
      email: "sarah.wilson@example.com",
      password: "password123",
      full_name: "Sarah Wilson", 
      company: "Investment Strategies",
      role: "user"
    }
  ]

  try {
    console.log("Creating test users...")

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email}`)

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (authError) {
        console.error(`Error creating user ${userData.email}:`, authError.message)
        continue
      }

      console.log(`✅ User created in auth: ${authData.user.email}`)

      // Create or update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          company: userData.company,
        }, {
          onConflict: "id"
        })

      if (profileError) {
        console.error(`Error creating profile for ${userData.email}:`, profileError.message)
        continue
      }

      console.log(`✅ Profile created for: ${userData.email}`)
    }

    console.log("✅ All test users created successfully!")
    console.log("You can now test the admin dashboard with multiple users")

  } catch (error) {
    console.error("Error creating test users:", error)
    process.exit(1)
  }
}

createTestUsers().catch(console.error) 