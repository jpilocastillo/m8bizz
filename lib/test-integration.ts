import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testIntegration() {
  console.log('Starting integration tests...')
  
  // Initialize Supabase client with environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')
  console.log('Service Role Key:', serviceRoleKey ? 'Present' : 'Missing')

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }

  // Create both regular and admin clients
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    // 1. Test Authentication
    console.log('\n1. Testing Authentication...')
    const testEmail = 'test.user@example.com'
    const testPassword = 'Test123!@#'

    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // If sign in fails, create a new user
      console.log('User does not exist, creating new user...')
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      })
      
      if (authError) {
        console.error('❌ User creation failed:', authError.message)
        return
      } else {
        console.log('✅ User created successfully:', authData.user.email)
      }

      // Sign in with the new user
      const { error: newSignInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (newSignInError) {
        console.error('❌ Sign in failed:', newSignInError.message)
        return
      }
    } else if (signInError) {
      console.error('❌ Sign in failed:', signInError.message)
      return
    }

    console.log('✅ Authentication test passed')

    // 2. Test Event Creation
    console.log('\n2. Testing Event Creation...')
    const testEvent = {
      name: 'Test Marketing Event',
      date: new Date().toISOString().split('T')[0],
      location: 'Test Location',
      marketing_type: 'Seminar',
      topic: 'Test Topic',
      time: '14:00',
      age_range: '30-50',
      mile_radius: '25',
      income_assets: '100k+',
      user_id: (await supabase.auth.getUser()).data.user?.id
    }

    const { data: eventData, error: eventError } = await supabase
      .from('marketing_events')
      .insert(testEvent)
      .select()
      .single()

    if (eventError) {
      console.error('❌ Event creation test failed:', eventError.message)
    } else {
      console.log('✅ Event creation test passed')
      console.log('Event created:', eventData)

      // 3. Test Related Data Creation
      console.log('\n3. Testing Related Data Creation...')
      
      // Test Marketing Expenses
      const { error: expensesError } = await supabase
        .from('marketing_expenses')
        .insert({
          event_id: eventData.id,
          advertising_cost: 1000,
          food_venue_cost: 500,
          other_costs: 200
        })

      if (expensesError) {
        console.error('❌ Marketing expenses creation failed:', expensesError.message)
      } else {
        console.log('✅ Marketing expenses created successfully')
      }

      // Test Event Attendance
      const { error: attendanceError } = await supabase
        .from('event_attendance')
        .insert({
          event_id: eventData.id,
          registrant_responses: 50,
          confirmations: 40,
          attendees: 35,
          clients_from_event: 10
        })

      if (attendanceError) {
        console.error('❌ Event attendance creation failed:', attendanceError.message)
      } else {
        console.log('✅ Event attendance created successfully')
      }

      // Test Event Appointments
      const { error: appointmentsError } = await supabase
        .from('event_appointments')
        .insert({
          event_id: eventData.id,
          set_at_event: 15,
          set_after_event: 10,
          first_appointment_attended: 20,
          first_appointment_no_shows: 5,
          second_appointment_attended: 15
        })

      if (appointmentsError) {
        console.error('❌ Event appointments creation failed:', appointmentsError.message)
      } else {
        console.log('✅ Event appointments created successfully')
      }

      // Test Financial Production
      const { error: financialError } = await supabase
        .from('event_financial_production')
        .insert({
          event_id: eventData.id,
          annuity_premium: 50000,
          life_insurance_premium: 25000,
          aum: 100000,
          financial_planning: 5000,
          annuities_sold: 5
        })

      if (financialError) {
        console.error('❌ Financial production creation failed:', financialError.message)
      } else {
        console.log('✅ Financial production created successfully')
      }

      // 4. Test Data Retrieval
      console.log('\n4. Testing Data Retrieval...')
      
      const { data: retrievedEvent, error: retrieveError } = await supabase
        .from('marketing_events')
        .select(`
          *,
          marketing_expenses (*),
          event_attendance (*),
          event_appointments (*),
          event_financial_production (*)
        `)
        .eq('id', eventData.id)
        .single()

      if (retrieveError) {
        console.error('❌ Data retrieval test failed:', retrieveError.message)
      } else {
        console.log('✅ Data retrieval test passed')
        console.log('Retrieved event with all related data:', retrievedEvent)
      }

      // 5. Test Data Update
      console.log('\n5. Testing Data Update...')
      
      const { error: updateError } = await supabase
        .from('marketing_events')
        .update({ name: 'Updated Test Event' })
        .eq('id', eventData.id)

      if (updateError) {
        console.error('❌ Data update test failed:', updateError.message)
      } else {
        console.log('✅ Data update test passed')
      }

      // 6. Test Data Deletion
      console.log('\n6. Testing Data Deletion...')
      
      const { error: deleteError } = await supabase
        .from('marketing_events')
        .delete()
        .eq('id', eventData.id)

      if (deleteError) {
        console.error('❌ Data deletion test failed:', deleteError.message)
      } else {
        console.log('✅ Data deletion test passed')
      }
    }

  } catch (error) {
    console.error('❌ Integration test failed with error:', error)
  }
}

// Run the tests
testIntegration().then(() => {
  console.log('\nIntegration tests completed!')
}) 