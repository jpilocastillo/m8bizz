const { config } = require('dotenv')
const { resolve } = require('path')

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  process.exit(1)
}

console.log('✅ All required environment variables are set:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const maskedValue = value ? `${value.slice(0, 4)}...${value.slice(-4)}` : 'undefined'
  console.log(`   - ${varName}: ${maskedValue}`)
}) 