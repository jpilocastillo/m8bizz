import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function removeDuplicateEvents() {
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

  const targetEmail = "mike@theterriogroup.com"

  try {
    console.log(`\n🔍 Finding and removing duplicate events for: ${targetEmail}\n`)

    // Get user ID by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error("Error listing users:", userError.message)
      process.exit(1)
    }

    const targetUser = users.find(u => u.email === targetEmail)
    
    if (!targetUser) {
      console.error(`Target user ${targetEmail} not found`)
      process.exit(1)
    }

    const targetUserId = targetUser.id
    console.log(`✅ Found target user: ${targetUser.email} (${targetUser.id})\n`)

    // Get all events for the target user
    const { data: events, error: eventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true })

    if (eventsError) {
      console.error("Error fetching events:", eventsError.message)
      process.exit(1)
    }

    if (!events || events.length === 0) {
      console.log("No events found")
      return
    }

    console.log(`Found ${events.length} total events\n`)

    // Group events by name and date to find duplicates
    const eventGroups = new Map<string, any[]>()
    
    for (const event of events) {
      const key = `${event.name}|${event.date}`
      if (!eventGroups.has(key)) {
        eventGroups.set(key, [])
      }
      eventGroups.get(key)!.push(event)
    }

    // Find duplicates
    const duplicates: Array<{ keep: any, remove: any[] }> = []
    
    for (const [key, group] of eventGroups.entries()) {
      if (group.length > 1) {
        // Sort by created_at (oldest first) and check which has more complete data
        group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        // Check which event has the most complete data
        let bestEvent = group[0]
        let bestScore = 0
        
        for (const event of group) {
          let score = 0
          
          // Check for expenses
          const { count: expenseCount } = await supabase
            .from('marketing_expenses')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
          score += (expenseCount || 0) * 10
          
          // Check for attendance
          const { count: attendanceCount } = await supabase
            .from('event_attendance')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
          score += (attendanceCount || 0) * 10
          
          // Check for appointments
          const { count: appointmentCount } = await supabase
            .from('event_appointments')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
          score += (appointmentCount || 0) * 10
          
          // Check for production
          const { count: productionCount } = await supabase
            .from('financial_production')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
          score += (productionCount || 0) * 10
          
          if (score > bestScore) {
            bestScore = score
            bestEvent = event
          }
        }
        
        const toRemove = group.filter(e => e.id !== bestEvent.id)
        duplicates.push({ keep: bestEvent, remove: toRemove })
      }
    }

    if (duplicates.length === 0) {
      console.log("✅ No duplicate events found!")
      return
    }

    console.log(`Found ${duplicates.length} sets of duplicate events:\n`)

    let totalRemoved = 0

    for (const { keep, remove } of duplicates) {
      console.log(`📋 "${keep.name}" (${keep.date})`)
      console.log(`   ✅ Keeping: ${keep.id} (created: ${new Date(keep.created_at).toLocaleString()})`)
      
      for (const eventToRemove of remove) {
        console.log(`   🗑️  Removing: ${eventToRemove.id} (created: ${new Date(eventToRemove.created_at).toLocaleString()})`)
        
        // Delete the event (cascade will handle related records)
        const { error: deleteError } = await supabase
          .from('marketing_events')
          .delete()
          .eq('id', eventToRemove.id)
        
        if (deleteError) {
          console.error(`   ❌ Error deleting event ${eventToRemove.id}:`, deleteError.message)
        } else {
          totalRemoved++
          console.log(`   ✅ Deleted event ${eventToRemove.id}`)
        }
      }
      console.log()
    }

    console.log("=".repeat(50))
    console.log(`📊 REMOVAL SUMMARY`)
    console.log("=".repeat(50))
    console.log(`Total duplicate sets: ${duplicates.length}`)
    console.log(`Total events removed: ${totalRemoved}`)
    console.log(`Remaining events: ${events.length - totalRemoved}`)
    console.log("=".repeat(50) + "\n")

    // Verify final count
    const { data: finalEvents, error: finalError } = await supabase
      .from('marketing_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    if (!finalError) {
      console.log(`✅ Final event count: ${finalEvents || 0}`)
    }

  } catch (error) {
    console.error("Error removing duplicate events:", error)
    process.exit(1)
  }
}

removeDuplicateEvents().catch(console.error)









