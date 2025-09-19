import { createClient } from '@/lib/supabase/client'

async function debugDatabaseConnection() {
  console.log('🔍 Debugging database connection and RLS policies...')
  
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    console.error('❌ Authentication error:', authError)
    return
  }
  
  if (!user) {
    console.error('❌ No authenticated user found')
    return
  }
  
  console.log('✅ User authenticated:', {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  })
  
  // Test each table individually
  const tables = [
    'business_goals',
    'current_values', 
    'client_metrics',
    'marketing_campaigns',
    'commission_rates',
    'financial_book'
  ]
  
  for (const table of tables) {
    console.log(`\n🔍 Testing table: ${table}`)
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      
      if (error) {
        console.error(`❌ Error querying ${table}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      } else {
        console.log(`✅ Successfully queried ${table}:`, data?.length || 0, 'records found')
      }
    } catch (err) {
      console.error(`❌ Exception querying ${table}:`, err)
    }
  }
  
  // Test inserting a test record (we'll delete it immediately)
  console.log('\n🔍 Testing insert permissions...')
  
  try {
    const testData = {
      user_id: user.id,
      business_goal: 1000000,
      aum_goal: 600000,
      aum_goal_percentage: 60,
      annuity_goal: 400000,
      annuity_goal_percentage: 40,
      life_target_goal: 10000,
      life_target_goal_percentage: 1
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('business_goals')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
    } else {
      console.log('✅ Insert test successful:', insertData)
      
      // Clean up the test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('business_goals')
          .delete()
          .eq('id', insertData[0].id)
        
        if (deleteError) {
          console.error('❌ Failed to clean up test record:', deleteError)
        } else {
          console.log('✅ Test record cleaned up successfully')
        }
      }
    }
  } catch (err) {
    console.error('❌ Insert test exception:', err)
  }
  
  console.log('\n🏁 Database connection debug complete')
}

// Run the debug function
debugDatabaseConnection().catch(console.error)
