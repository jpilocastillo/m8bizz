import { createClient } from '@supabase/supabase-js'
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function enableBasecampAccessForAllUsers() {
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
    console.log("🔍 Checking current basecamp access status...")

    // First, let's check the current state
    const { data: currentUsers, error: selectError } = await supabase
      .from('profiles')
      .select('id, email, full_name, basecamp_access, role, created_at')
      .order('created_at', { ascending: false })

    if (selectError) {
      console.error("Error fetching current users:", selectError.message)
      return
    }

    console.log(`\n📊 Current status:`)
    console.log(`Total users: ${currentUsers.length}`)
    
    const usersWithAccess = currentUsers.filter(u => u.basecamp_access === true)
    const usersWithoutAccess = currentUsers.filter(u => u.basecamp_access === false || u.basecamp_access === null)
    
    console.log(`Users with basecamp access: ${usersWithAccess.length}`)
    console.log(`Users without basecamp access: ${usersWithoutAccess.length}`)

    if (usersWithoutAccess.length === 0) {
      console.log("✅ All users already have basecamp access!")
      return
    }

    console.log(`\n👥 Users without basecamp access:`)
    usersWithoutAccess.forEach(user => {
      console.log(`- ${user.email} (${user.full_name || 'No name'}) - Role: ${user.role}`)
    })

    // Update all users to have basecamp access
    console.log(`\n🔧 Enabling basecamp access for ${usersWithoutAccess.length} users...`)
    
    const { data: updatedUsers, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        basecamp_access: true,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all users
      .select('id, email, full_name, basecamp_access, role, updated_at')

    if (updateError) {
      console.error("❌ Error updating users:", updateError.message)
      return
    }

    console.log(`✅ Successfully updated ${updatedUsers.length} users!`)

    // Verify the update
    console.log(`\n🔍 Verifying the update...`)
    const { data: verifyUsers, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, basecamp_access, role, updated_at')
      .order('updated_at', { ascending: false })

    if (verifyError) {
      console.error("Error verifying update:", verifyError.message)
      return
    }

    const finalUsersWithAccess = verifyUsers.filter(u => u.basecamp_access === true)
    const finalUsersWithoutAccess = verifyUsers.filter(u => u.basecamp_access === false || u.basecamp_access === null)

    console.log(`\n📊 Final status:`)
    console.log(`Total users: ${verifyUsers.length}`)
    console.log(`Users with basecamp access: ${finalUsersWithAccess.length}`)
    console.log(`Users without basecamp access: ${finalUsersWithoutAccess.length}`)

    if (finalUsersWithoutAccess.length === 0) {
      console.log("🎉 All users now have basecamp access!")
    } else {
      console.log("⚠️  Some users still don't have basecamp access:")
      finalUsersWithoutAccess.forEach(user => {
        console.log(`- ${user.email} (${user.full_name || 'No name'})`)
      })
    }

  } catch (error) {
    console.error("❌ Error enabling basecamp access:", error)
    process.exit(1)
  }
}

enableBasecampAccessForAllUsers().catch(console.error)
