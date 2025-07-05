const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAvatarsStorage() {
  try {
    console.log('Setting up avatars storage bucket...')

    // Create the storage bucket
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Avatars bucket already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('Avatars bucket created successfully')
    }

    console.log('Storage setup complete!')
    console.log('You can now upload avatars in your application.')
    
  } catch (error) {
    console.error('Error setting up storage:', error)
    process.exit(1)
  }
}

setupAvatarsStorage() 