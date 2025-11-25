#!/usr/bin/env ts-node

/**
 * Admin Setup Script
 * 
 * This script helps you set up the admin functionality for the M8BS Dashboard.
 * Run this script to create an admin user and verify your configuration.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface SetupOptions {
  email: string
  password: string
  name: string
  company?: string
}

async function checkEnvironmentVariables(): Promise<boolean> {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName]
    return !value || value.includes('your_supabase_project_url_here')
  })

  if (missingVars.length > 0) {
    console.log('❌ Missing or invalid environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('\n📝 Please create a .env.local file with your Supabase configuration.')
    console.log('   Get these values from: Supabase Dashboard → Settings → API\n')
    return false
  }

  console.log('✅ Environment variables are configured')
  return true
}

async function createAdminUser(options: SetupOptions): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('🔄 Creating admin user...')

    // Create user in auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: options.email,
      password: options.password,
      email_confirm: true,
    })

    if (authError) {
      console.log('❌ Error creating user in auth:', authError.message)
      return false
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        auth_id: authData.user.id,
        full_name: options.name,
        email: options.email,
        company: options.company || null,
        role: 'admin',
      })

    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message)
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return false
    }

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${options.email}`)
    console.log(`   Name: ${options.name}`)
    console.log(`   Role: admin`)
    return true

  } catch (error) {
    console.log('❌ Error creating admin user:', error)
    return false
  }
}

async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('🔄 Verifying database connection...')

    // Test connection by querying profiles table
    const { data, error } = await adminClient
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.log('❌ Database connection failed:', error.message)
      return false
    }

    console.log('✅ Database connection successful')
    return true

  } catch (error) {
    console.log('❌ Database connection error:', error)
    return false
  }
}

function createEnvTemplate(): void {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envPath)) {
    console.log('📄 .env.local file already exists')
    return
  }

  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional: Site URL for production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`

  fs.writeFileSync(envPath, envTemplate)
  console.log('📄 Created .env.local template file')
  console.log('   Please update it with your actual Supabase credentials')
}

async function main() {
  console.log('🚀 M8BS Dashboard Admin Setup\n')

  // Check if .env.local exists, if not create template
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env.local template...')
    createEnvTemplate()
    console.log('\n❌ Please update .env.local with your Supabase credentials and run this script again.\n')
    return
  }

  // Check environment variables
  const envOk = await checkEnvironmentVariables()
  if (!envOk) {
    console.log('\n❌ Setup incomplete. Please fix environment variables and try again.\n')
    return
  }

  // Verify database connection
  const dbOk = await verifyDatabaseConnection()
  if (!dbOk) {
    console.log('\n❌ Setup incomplete. Please check your database connection and try again.\n')
    return
  }

  // Get admin user details from command line arguments or prompt
  const args = process.argv.slice(2)
  let options: SetupOptions

  if (args.length >= 2) {
    options = {
      email: args[0],
      password: args[1],
      name: args[2] || 'Admin User',
      company: args[3]
    }
  } else {
    console.log('\n📝 Admin User Setup:')
    console.log('   Usage: npm run setup-admin <email> <password> [name] [company]')
    console.log('   Example: npm run setup-admin admin@example.com mypassword123 "John Admin" "My Company"\n')
    return
  }

  // Create admin user
  const success = await createAdminUser(options)
  
  if (success) {
    console.log('\n🎉 Admin setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Start your development server: npm run dev')
    console.log('   2. Visit: http://localhost:3000/admin/login')
    console.log(`   3. Login with: ${options.email}`)
    console.log('   4. You can now manage users and view system data')
  } else {
    console.log('\n❌ Admin setup failed. Please check the errors above and try again.')
  }

  console.log('')
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error)
}

export { main as setupAdmin }





















