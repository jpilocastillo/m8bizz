import { createClient } from "@supabase/supabase-js"

async function seedMockData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const userId = '20e1cf0f-486d-413f-9463-f9da583a84d8'

  // Insert marketing events
  const events = [
    {
      user_id: userId,
      name: 'Q2 MBI Mailer Campaign',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Downtown Area',
      marketing_type: 'MBI Mailer',
      topic: 'Retirement Planning',
      time: '10:00 AM',
      age_range: '50-65',
      mile_radius: '25',
      income_assets: '$500k-$1M',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'Wealth Management Seminar',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Grand Hotel Conference Center',
      marketing_type: 'Seminar',
      topic: 'Wealth Management',
      time: '2:00 PM',
      age_range: '45-65',
      mile_radius: '30',
      income_assets: '$1M+',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'LinkedIn Lead Generation',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Online',
      marketing_type: 'LinkedIn Ads',
      topic: 'Business Development',
      time: '9:00 AM',
      age_range: '35-55',
      mile_radius: '50',
      income_assets: '$500k-$1M',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'Financial Wellness Fair',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Community Center',
      marketing_type: 'Community Event',
      topic: 'Financial Education',
      time: '10:00 AM',
      age_range: 'All Ages',
      mile_radius: '30',
      income_assets: 'All Levels',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'Investment Strategies Workshop',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Financial Center',
      marketing_type: 'Workshop',
      topic: 'Investment Planning',
      time: '1:00 PM',
      age_range: '40-65',
      mile_radius: '25',
      income_assets: '$500k-$1M',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'High-Net-Worth Direct Mail',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Upscale Neighborhoods',
      marketing_type: 'Direct Mail',
      topic: 'Wealth Management',
      time: '11:00 AM',
      age_range: '45-65',
      mile_radius: '15',
      income_assets: '$1M+',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'Digital Lead Generation',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Online',
      marketing_type: 'Google Ads',
      topic: 'Financial Planning',
      time: '8:00 AM',
      age_range: '30-50',
      mile_radius: '100',
      income_assets: '$250k-$500k',
      status: 'active'
    },
    {
      user_id: userId,
      name: 'Client Referral Initiative',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'All Locations',
      marketing_type: 'Referral Program',
      topic: 'Client Acquisition',
      time: '9:00 AM',
      age_range: 'All Ages',
      mile_radius: 'Unlimited',
      income_assets: 'All Levels',
      status: 'active'
    }
  ]

  // Insert events and get their IDs
  const { data: insertedEvents, error: eventsError } = await supabase
    .from('marketing_events')
    .insert(events)
    .select()

  if (eventsError) {
    console.error('Error inserting events:', eventsError)
    return
  }

  // Insert related data for each event
  for (const event of insertedEvents) {
    // Marketing expenses
    const { error: expensesError } = await supabase
      .from('marketing_expenses')
      .insert({
        event_id: event.id,
        advertising_cost: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 5000 : 
                         event.marketing_type.includes('Ads') ? 2000 :
                         event.marketing_type === 'Community Event' ? 4000 :
                         event.marketing_type === 'Workshop' || event.marketing_type === 'Seminar' ? 3000 : 1000,
        food_venue_cost: ['Seminar', 'Workshop', 'Community Event'].includes(event.marketing_type) ? 2000 : 0,
        other_costs: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 1000 :
                    ['Seminar', 'Workshop'].includes(event.marketing_type) ? 500 : 0
      })

    if (expensesError) {
      console.error(`Error inserting expenses for event ${event.id}:`, expensesError)
    }

    // Event attendance
    const { error: attendanceError } = await supabase
      .from('event_attendance')
      .insert({
        event_id: event.id,
        registrant_responses: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 150 :
                            event.marketing_type.includes('Ads') ? 75 :
                            event.marketing_type === 'Community Event' ? 200 :
                            ['Seminar', 'Workshop'].includes(event.marketing_type) ? 45 : 30,
        confirmations: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 120 :
                      event.marketing_type.includes('Ads') ? 50 :
                      event.marketing_type === 'Community Event' ? 150 :
                      ['Seminar', 'Workshop'].includes(event.marketing_type) ? 35 : 20,
        attendees: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 100 :
                  event.marketing_type.includes('Ads') ? 40 :
                  event.marketing_type === 'Community Event' ? 120 :
                  ['Seminar', 'Workshop'].includes(event.marketing_type) ? 30 : 15,
        clients_from_event: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 15 :
                          event.marketing_type.includes('Ads') ? 8 :
                          event.marketing_type === 'Community Event' ? 20 :
                          ['Seminar', 'Workshop'].includes(event.marketing_type) ? 12 : 5
      })

    if (attendanceError) {
      console.error(`Error inserting attendance for event ${event.id}:`, attendanceError)
    }

    // Event appointments
    const { error: appointmentsError } = await supabase
      .from('event_appointments')
      .insert({
        event_id: event.id,
        set_at_event: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 10 :
                     event.marketing_type.includes('Ads') ? 5 :
                     event.marketing_type === 'Community Event' ? 15 :
                     ['Seminar', 'Workshop'].includes(event.marketing_type) ? 8 : 3,
        set_after_event: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 8 :
                        event.marketing_type.includes('Ads') ? 4 :
                        event.marketing_type === 'Community Event' ? 12 :
                        ['Seminar', 'Workshop'].includes(event.marketing_type) ? 6 : 2,
        first_appointment_attended: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 7 :
                                  event.marketing_type.includes('Ads') ? 3 :
                                  event.marketing_type === 'Community Event' ? 10 :
                                  ['Seminar', 'Workshop'].includes(event.marketing_type) ? 5 : 2,
        first_appointment_no_shows: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 3 :
                                  event.marketing_type.includes('Ads') ? 2 :
                                  event.marketing_type === 'Community Event' ? 5 :
                                  ['Seminar', 'Workshop'].includes(event.marketing_type) ? 3 : 1,
        second_appointment_attended: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 5 :
                                   event.marketing_type.includes('Ads') ? 2 :
                                   event.marketing_type === 'Community Event' ? 8 :
                                   ['Seminar', 'Workshop'].includes(event.marketing_type) ? 4 : 1
      })

    if (appointmentsError) {
      console.error(`Error inserting appointments for event ${event.id}:`, appointmentsError)
    }

    // Financial production
    const { error: financialError } = await supabase
      .from('financial_production')
      .insert({
        event_id: event.id,
        annuity_premium: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 250000 :
                        event.marketing_type.includes('Ads') ? 150000 :
                        event.marketing_type === 'Community Event' ? 200000 :
                        ['Seminar', 'Workshop'].includes(event.marketing_type) ? 350000 : 100000,
        life_insurance_premium: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 100000 :
                              event.marketing_type.includes('Ads') ? 75000 :
                              event.marketing_type === 'Community Event' ? 80000 :
                              ['Seminar', 'Workshop'].includes(event.marketing_type) ? 150000 : 50000,
        aum: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 5000000 :
             event.marketing_type.includes('Ads') ? 3000000 :
             event.marketing_type === 'Community Event' ? 4000000 :
             ['Seminar', 'Workshop'].includes(event.marketing_type) ? 7500000 : 2000000,
        financial_planning: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 50000 :
                          event.marketing_type.includes('Ads') ? 30000 :
                          event.marketing_type === 'Community Event' ? 40000 :
                          ['Seminar', 'Workshop'].includes(event.marketing_type) ? 75000 : 20000,
        annuities_sold: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 5 :
                       event.marketing_type.includes('Ads') ? 3 :
                       event.marketing_type === 'Community Event' ? 4 :
                       ['Seminar', 'Workshop'].includes(event.marketing_type) ? 8 : 2,
        life_policies_sold: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 3 :
                          event.marketing_type.includes('Ads') ? 2 :
                          event.marketing_type === 'Community Event' ? 2 :
                          ['Seminar', 'Workshop'].includes(event.marketing_type) ? 4 : 1,
        annuity_commission: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 25000 :
                          event.marketing_type.includes('Ads') ? 15000 :
                          event.marketing_type === 'Community Event' ? 20000 :
                          ['Seminar', 'Workshop'].includes(event.marketing_type) ? 35000 : 10000,
        life_insurance_commission: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 10000 :
                                event.marketing_type.includes('Ads') ? 7500 :
                                event.marketing_type === 'Community Event' ? 8000 :
                                ['Seminar', 'Workshop'].includes(event.marketing_type) ? 15000 : 5000,
        aum_fees: event.marketing_type.includes('Mailer') || event.marketing_type === 'Direct Mail' ? 50000 :
                 event.marketing_type.includes('Ads') ? 30000 :
                 event.marketing_type === 'Community Event' ? 40000 :
                 ['Seminar', 'Workshop'].includes(event.marketing_type) ? 75000 : 20000
      })

    if (financialError) {
      console.error(`Error inserting financial data for event ${event.id}:`, financialError)
    }
  }

  console.log('Mock data seeding completed')
}

// Run the seeding function
seedMockData().catch(console.error) 