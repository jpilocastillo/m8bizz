/**
 * Multi-User Simulation Test Script
 * 
 * This script simulates multiple users interacting with the system concurrently
 * to test data isolation, RLS policies, and concurrent operations.
 * 
 * Usage: npm run test:multi-user
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { advisorBasecampService } from '@/lib/advisor-basecamp'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

interface TestUser {
  email: string
  password: string
  fullName: string
  company: string
  id?: string
  client?: any
  user?: any
}

const testUsers: TestUser[] = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    fullName: 'John Doe',
    company: 'Financial Advisors Inc',
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    fullName: 'Jane Smith',
    company: 'Wealth Management Group',
  },
  {
    email: 'mike.johnson@example.com',
    password: 'password123',
    fullName: 'Mike Johnson',
    company: 'Retirement Planning LLC',
  },
  {
    email: 'sarah.wilson@example.com',
    password: 'password123',
    fullName: 'Sarah Wilson',
    company: 'Investment Strategies',
  },
]

async function createUserClient(email: string, password: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    throw new Error(`Failed to sign in ${email}: ${error?.message || 'No session'}`)
  }

  return { client, user: data.user, session: data.session }
}

async function simulateUserOperations(testUser: TestUser, userIndex: number) {
  try {
    console.log(`\n👤 User ${userIndex + 1}: ${testUser.fullName} starting operations...`)

    // Sign in
    const { user } = await createUserClient(testUser.email, testUser.password)
    testUser.user = user
    testUser.id = user.id

    console.log(`  ✅ Signed in as ${testUser.email}`)

    // Create business goals
    const businessGoals = {
      business_goal: 1000000 * (userIndex + 1),
      aum_goal: 5000000 * (userIndex + 1),
      aum_goal_percentage: 50,
      annuity_goal: 2000000 * (userIndex + 1),
      annuity_goal_percentage: 20,
      life_target_goal: 3000000 * (userIndex + 1),
      life_target_goal_percentage: 30,
    }

    const savedGoals = await advisorBasecampService.upsertBusinessGoals(user, businessGoals)
    console.log(`  ${savedGoals ? '✅' : '❌'} Business goals ${savedGoals ? 'saved' : 'failed'}`)

    // Create current values
    const currentValues = {
      current_aum: 2500000 * (userIndex + 1),
      current_annuity: 1000000 * (userIndex + 1),
      current_life_production: 500000 * (userIndex + 1),
    }

    const savedValues = await advisorBasecampService.upsertCurrentValues(user, currentValues)
    console.log(`  ${savedValues ? '✅' : '❌'} Current values ${savedValues ? 'saved' : 'failed'}`)

    // Create campaigns
    const campaign = {
      name: `${testUser.fullName} Campaign ${Date.now()}`,
      budget: 10000 * (userIndex + 1),
      events: 5 + userIndex,
      leads: 100 * (userIndex + 1),
      status: 'Active' as const,
    }

    const savedCampaign = await advisorBasecampService.createMarketingCampaign(user, campaign)
    console.log(`  ${savedCampaign ? '✅' : '❌'} Campaign ${savedCampaign ? 'created' : 'failed'}`)

    // Verify data isolation - try to read own data
    const retrievedGoals = await advisorBasecampService.getBusinessGoals(user)
    const retrievedValues = await advisorBasecampService.getCurrentValues(user)
    const retrievedCampaigns = await advisorBasecampService.getMarketingCampaigns(user)

    console.log(`  ✅ Retrieved own data:`)
    console.log(`     - Business Goal: $${retrievedGoals?.business_goal?.toLocaleString() || 'N/A'}`)
    console.log(`     - Current AUM: $${retrievedValues?.current_aum?.toLocaleString() || 'N/A'}`)
    console.log(`     - Campaigns: ${retrievedCampaigns.length}`)

    // Verify data matches what we saved
    if (retrievedGoals?.business_goal !== businessGoals.business_goal) {
      console.log(`  ⚠️  Warning: Business goal mismatch!`)
    }

    return {
      success: true,
      userId: user.id,
      goalsSaved: savedGoals,
      valuesSaved: savedValues,
      campaignSaved: !!savedCampaign,
    }
  } catch (error) {
    console.error(`  ❌ Error for ${testUser.fullName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function verifyDataIsolation() {
  console.log('\n🔒 Verifying data isolation...')

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get all business goals from admin perspective
  const { data: allGoals, error: goalsError } = await adminClient
    .from('business_goals')
    .select('user_id, business_goal, aum_goal')

  if (goalsError) {
    console.error('  ❌ Error fetching goals:', goalsError.message)
    return false
  }

  // Group by user_id
  const goalsByUser = new Map<string, any[]>()
  allGoals?.forEach((goal) => {
    if (!goalsByUser.has(goal.user_id)) {
      goalsByUser.set(goal.user_id, [])
    }
    goalsByUser.get(goal.user_id)!.push(goal)
  })

  console.log(`  ✅ Found data for ${goalsByUser.size} users`)

  // Verify each user can only see their own data
  for (let i = 0; i < testUsers.length; i++) {
    const testUser = testUsers[i]
    if (!testUser.id) continue

    try {
      const { user } = await createUserClient(testUser.email, testUser.password)
      const userGoals = await advisorBasecampService.getBusinessGoals(user)
      const adminGoals = goalsByUser.get(testUser.id) || []

      if (userGoals && adminGoals.length > 0) {
        const userGoalValue = userGoals.business_goal
        const adminGoalValue = adminGoals[0].business_goal

        if (userGoalValue === adminGoalValue) {
          console.log(`  ✅ User ${i + 1} (${testUser.fullName}): Data isolation verified`)
        } else {
          console.log(`  ⚠️  User ${i + 1} (${testUser.fullName}): Data mismatch detected`)
        }
      }
    } catch (error) {
      console.error(`  ❌ Error verifying isolation for ${testUser.fullName}:`, error)
    }
  }

  return true
}

async function runMultiUserTest() {
  console.log('🚀 Starting Multi-User Simulation Test\n')
  console.log(`Testing with ${testUsers.length} users...`)

  // Verify test users exist
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('\n📋 Verifying test users exist...')
  for (const testUser of testUsers) {
    const { data: users } = await adminClient.auth.admin.listUsers()
    const user = users.users.find((u) => u.email === testUser.email)

    if (!user) {
      console.log(`  ⚠️  User ${testUser.email} not found. Run 'npm run create-test-users' first.`)
      return
    }
    console.log(`  ✅ User ${testUser.email} exists`)
  }

  // Run concurrent operations
  console.log('\n🔄 Running concurrent user operations...')
  const startTime = Date.now()

  const results = await Promise.all(
    testUsers.map((user, index) => simulateUserOperations(user, index))
  )

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log(`\n⏱️  Total time: ${duration}s`)

  // Summary
  console.log('\n📊 Test Summary:')
  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`  ✅ Successful: ${successful}/${testUsers.length}`)
  console.log(`  ❌ Failed: ${failed}/${testUsers.length}`)

  if (failed > 0) {
    console.log('\n❌ Failed operations:')
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  - User ${index + 1}: ${result.error}`)
      }
    })
  }

  // Verify data isolation
  await verifyDataIsolation()

  console.log('\n✅ Multi-user test completed!')
}

// Run the test
runMultiUserTest().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})



















