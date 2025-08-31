import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkUsers() {
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

  try {
    console.log("Checking users...")

    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error("Error listing auth users:", usersError.message)
      process.exit(1)
    }

    console.log(`\n✅ Found ${users.length} auth users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.id})`)
    })

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")

    if (profilesError) {
      console.error("Error loading profiles:", profilesError.message)
      process.exit(1)
    }

    console.log(`\n✅ Found ${profiles.length} profiles:`)
    profiles.forEach(profile => {
      console.log(`- ${profile.email} (${profile.id}) - Role: ${profile.role}`)
    })

    // Check which auth users don't have profiles
    const authUserIds = users.map(u => u.id)
    const profileUserIds = profiles.map(p => p.id)
    
    const missingProfiles = authUserIds.filter(id => !profileUserIds.includes(id))
    
    if (missingProfiles.length > 0) {
      console.log(`\n❌ Found ${missingProfiles.length} auth users without profiles:`)
      missingProfiles.forEach(id => {
        const user = users.find(u => u.id === id)
        console.log(`- ${user?.email} (${id})`)
      })
    } else {
      console.log("\n✅ All auth users have profiles")
    }

  } catch (error) {
    console.error("Error checking users:", error)
    process.exit(1)
  }
}

checkUsers().catch(console.error) 