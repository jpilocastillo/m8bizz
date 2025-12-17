/**
 * Quick Multi-User Test
 * 
 * A simplified version that can be run quickly to verify basic multi-user functionality
 * 
 * Usage: ts-node scripts/quick-test-multi-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function quickTest() {
  console.log('🚀 Quick Multi-User Test\n')

  // Test with existing test users
  const testUsers = [
    { email: 'john.doe@example.com', password: 'password123' },
    { email: 'jane.smith@example.com', password: 'password123' },
  ]

  for (const user of testUsers) {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      const { data, error } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (error) {
        console.log(`❌ ${user.email}: ${error.message}`)
        continue
      }

      console.log(`✅ ${user.email}: Signed in successfully`)
      console.log(`   User ID: ${data.user.id}`)

      // Try to read business goals
      const { data: goals, error: goalsError } = await client
        .from('business_goals')
        .select('*')
        .maybeSingle()

      if (goalsError) {
        console.log(`   ⚠️  Error reading goals: ${goalsError.message}`)
      } else if (goals) {
        console.log(`   ✅ Can read own data (business_goal: $${goals.business_goal?.toLocaleString() || 'N/A'})`)
      } else {
        console.log(`   ℹ️  No data found (this is OK for new users)`)
      }
    } catch (error) {
      console.error(`❌ Error testing ${user.email}:`, error)
    }
  }

  console.log('\n✅ Quick test completed!')
  console.log('💡 For comprehensive testing, run: npm run test:multi-user')
}

quickTest().catch(console.error)



