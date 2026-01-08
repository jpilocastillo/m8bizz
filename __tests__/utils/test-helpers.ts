import { createClient, User } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for testing')
}

/**
 * Creates an admin client for testing (bypasses RLS)
 */
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Creates a user client for testing (respects RLS)
 */
export async function createUserClient(email: string, password: string) {
  const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
    throw new Error(`Failed to sign in user: ${error?.message || 'No session'}`)
  }

  return { client, user: data.user, session: data.session }
}

/**
 * Creates a test user and returns credentials
 */
export async function createTestUser(
  email: string,
  password: string,
  fullName: string,
  company?: string
) {
  const admin = createAdminClient()

  // Create user in auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`)
  }

  // Create profile
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authData.user.id,
    full_name: fullName,
    email,
    company: company || null,
    role: 'user',
    auth_id: authData.user.id,
  }, {
    onConflict: 'id',
  })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  return {
    id: authData.user.id,
    email,
    password,
    fullName,
    company,
  }
}

/**
 * Deletes a test user and all their data
 */
export async function cleanupTestUser(userId: string) {
  const admin = createAdminClient()

  // Delete user data from all tables
  const tables = [
    'business_goals',
    'current_values',
    'client_metrics',
    'marketing_campaigns',
    'commission_rates',
    'financial_book',
    'financial_options',
    'monthly_data_entries',
  ]

  for (const table of tables) {
    await admin.from(table).delete().eq('user_id', userId)
  }

  // Delete profile
  await admin.from('profiles').delete().eq('id', userId)

  // Delete auth user
  await admin.auth.admin.deleteUser(userId)
}

/**
 * Cleans up all test users
 */
export async function cleanupAllTestUsers() {
  const admin = createAdminClient()
  const testEmails = [
    'test.user1@example.com',
    'test.user2@example.com',
    'test.user3@example.com',
    'test.user4@example.com',
  ]

  for (const email of testEmails) {
    const { data: users } = await admin.auth.admin.listUsers()
    const user = users.users.find((u) => u.email === email)
    if (user) {
      await cleanupTestUser(user.id)
    }
  }
}

/**
 * Waits for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}












