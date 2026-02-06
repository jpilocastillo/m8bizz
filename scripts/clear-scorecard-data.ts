import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function clearScorecardData() {
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

  const targetEmail = 'jazminpilo@gmail.com'

  try {
    console.log(`Clearing business behavior scorecard data for ${targetEmail}...`)

    // Find the user by email
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error("Error listing users:", usersError.message)
      process.exit(1)
    }

    const user = users.find(u => u.email === targetEmail)
    
    if (!user) {
      console.error(`User with email ${targetEmail} not found`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)

    // Delete company summaries
    const { error: companyError } = await supabase
      .from('company_summaries')
      .delete()
      .eq('user_id', user.id)

    if (companyError) {
      console.error("Error deleting company summaries:", companyError.message)
      process.exit(1)
    }

    console.log('✅ Deleted company summaries')

    // Delete scorecard roles (this will cascade delete all related data)
    const { error: rolesError } = await supabase
      .from('scorecard_roles')
      .delete()
      .eq('user_id', user.id)

    if (rolesError) {
      console.error("Error deleting scorecard roles:", rolesError.message)
      process.exit(1)
    }

    console.log('✅ Deleted scorecard roles and all related data (cascaded)')
    console.log(`\n✅ Successfully cleared all business behavior scorecard data for ${targetEmail}`)

  } catch (error) {
    console.error("Error clearing scorecard data:", error)
    process.exit(1)
  }
}

clearScorecardData().catch(console.error)

























