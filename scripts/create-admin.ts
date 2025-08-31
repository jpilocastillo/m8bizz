import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function createAdminUser() {
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

  const adminEmail = process.argv[2]
  const adminPassword = process.argv[3]

  if (!adminEmail || !adminPassword) {
    console.error("Usage: npm run create-admin <email> <password>")
    console.error("Example: npm run create-admin admin@example.com mypassword123")
    process.exit(1)
  }

  try {
    console.log("Creating admin user...")

    // Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in auth:", authError.message)
      process.exit(1)
    }

    console.log("✅ User created in auth:", authData.user.email)

    // Create or update profile with admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name: "Admin User",
        email: adminEmail,
        role: "admin",
        company: "System Admin",
      }, {
        onConflict: "id"
      })

    if (profileError) {
      console.error("Error creating/updating profile:", profileError.message)
      process.exit(1)
    }

    console.log("✅ Admin profile created successfully")
    console.log("✅ Admin user is ready to use!")
    console.log(`Email: ${adminEmail}`)
    console.log("You can now log in at /admin/login")

  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdminUser().catch(console.error) 