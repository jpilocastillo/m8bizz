import { createClient } from '@supabase/supabase-js'
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function checkUserData() {
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
    console.log("🔍 Checking user data and RLS policies...")

    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error("Error listing auth users:", usersError.message)
      return
    }

    console.log(`\n👥 Found ${users.length} auth users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.id}) - Created: ${user.created_at}`)
    })

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")

    if (profilesError) {
      console.error("Error loading profiles:", profilesError.message)
      return
    }

    console.log(`\n👤 Found ${profiles.length} profiles:`)
    profiles.forEach(profile => {
      console.log(`- ${profile.email} (${profile.id}) - Role: ${profile.role}`)
    })

    // Check advisor basecamp data for each user
    const tables = [
      'business_goals',
      'current_values', 
      'client_metrics',
      'marketing_campaigns',
      'commission_rates',
      'financial_book'
    ]

    for (const user of users) {
      console.log(`\n📊 Checking data for user: ${user.email} (${user.id})`)
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id)
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`)
        } else {
          console.log(`  ✅ ${table}: ${data?.length || 0} records`)
          if (data && data.length > 0) {
            console.log(`     Sample: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`)
          }
        }
      }
    }

    // Test RLS policies by trying to access data as a regular user
    console.log(`\n🔐 Testing RLS policies...`)
    
    if (users.length > 0) {
      const testUser = users[0]
      console.log(`Testing with user: ${testUser.email}`)
      
      // Create a client with the user's session (this won't work in server context, but let's try)
      const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      
      // Try to get user session (this will fail in server context, but shows the approach)
      console.log("Note: RLS testing requires browser context with authenticated user session")
    }

    console.log("\n🎉 User data check complete!")

  } catch (error) {
    console.error("❌ Error checking user data:", error)
    process.exit(1)
  }
}

checkUserData().catch(console.error)
