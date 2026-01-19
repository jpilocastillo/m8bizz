import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function verifyMarketingEventsCopy() {
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

  const sourceEmail = "morgan@theterriogroup.com"
  const targetEmail = "mike@theterriogroup.com"

  try {
    console.log(`\n🔍 Verifying data copy: ${sourceEmail} -> ${targetEmail}\n`)

    // Get user IDs by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error("Error listing users:", userError.message)
      process.exit(1)
    }

    const sourceUser = users.find(u => u.email === sourceEmail)
    const targetUser = users.find(u => u.email === targetEmail)
    
    if (!sourceUser) {
      console.error(`Source user ${sourceEmail} not found`)
      process.exit(1)
    }

    if (!targetUser) {
      console.error(`Target user ${targetEmail} not found`)
      process.exit(1)
    }

    const sourceUserId = sourceUser.id
    const targetUserId = targetUser.id

    // Verify marketing events
    console.log("📋 Verifying marketing events...")
    const { data: sourceEvents, error: sourceEventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', sourceUserId)

    const { data: targetEvents, error: targetEventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', targetUserId)

    if (sourceEventsError || targetEventsError) {
      console.error("Error fetching events:", sourceEventsError?.message || targetEventsError?.message)
    } else {
      console.log(`   Source events: ${sourceEvents?.length || 0}`)
      console.log(`   Target events: ${targetEvents?.length || 0}`)
      
      if ((sourceEvents?.length || 0) === (targetEvents?.length || 0)) {
        console.log(`   ✅ Event count matches!`)
      } else {
        console.log(`   ⚠️  Event count mismatch!`)
      }
    }

    // Verify marketing expenses
    console.log("\n📋 Verifying marketing expenses...")
    let sourceExpensesCount = 0
    let targetExpensesCount = 0

    if (sourceEvents && sourceEvents.length > 0) {
      for (const event of sourceEvents) {
        const { count } = await supabase
          .from('marketing_expenses')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        sourceExpensesCount += count || 0
      }
    }

    if (targetEvents && targetEvents.length > 0) {
      for (const event of targetEvents) {
        const { count } = await supabase
          .from('marketing_expenses')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        targetExpensesCount += count || 0
      }
    }

    console.log(`   Source expenses: ${sourceExpensesCount}`)
    console.log(`   Target expenses: ${targetExpensesCount}`)
    if (sourceExpensesCount === targetExpensesCount) {
      console.log(`   ✅ Expense count matches!`)
    } else {
      console.log(`   ⚠️  Expense count mismatch!`)
    }

    // Verify event attendance
    console.log("\n📋 Verifying event attendance...")
    let sourceAttendanceCount = 0
    let targetAttendanceCount = 0

    if (sourceEvents && sourceEvents.length > 0) {
      for (const event of sourceEvents) {
        const { count } = await supabase
          .from('event_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        sourceAttendanceCount += count || 0
      }
    }

    if (targetEvents && targetEvents.length > 0) {
      for (const event of targetEvents) {
        const { count } = await supabase
          .from('event_attendance')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        targetAttendanceCount += count || 0
      }
    }

    console.log(`   Source attendance records: ${sourceAttendanceCount}`)
    console.log(`   Target attendance records: ${targetAttendanceCount}`)
    if (sourceAttendanceCount === targetAttendanceCount) {
      console.log(`   ✅ Attendance count matches!`)
    } else {
      console.log(`   ⚠️  Attendance count mismatch!`)
    }

    // Verify event appointments
    console.log("\n📋 Verifying event appointments...")
    let sourceAppointmentsCount = 0
    let targetAppointmentsCount = 0

    if (sourceEvents && sourceEvents.length > 0) {
      for (const event of sourceEvents) {
        const { count } = await supabase
          .from('event_appointments')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        sourceAppointmentsCount += count || 0
      }
    }

    if (targetEvents && targetEvents.length > 0) {
      for (const event of targetEvents) {
        const { count } = await supabase
          .from('event_appointments')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        targetAppointmentsCount += count || 0
      }
    }

    console.log(`   Source appointment records: ${sourceAppointmentsCount}`)
    console.log(`   Target appointment records: ${targetAppointmentsCount}`)
    if (sourceAppointmentsCount === targetAppointmentsCount) {
      console.log(`   ✅ Appointment count matches!`)
    } else {
      console.log(`   ⚠️  Appointment count mismatch!`)
    }

    // Verify financial production
    console.log("\n📋 Verifying financial production...")
    let sourceProductionCount = 0
    let targetProductionCount = 0

    if (sourceEvents && sourceEvents.length > 0) {
      for (const event of sourceEvents) {
        const { count } = await supabase
          .from('financial_production')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        sourceProductionCount += count || 0
      }
    }

    if (targetEvents && targetEvents.length > 0) {
      for (const event of targetEvents) {
        const { count } = await supabase
          .from('financial_production')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
        targetProductionCount += count || 0
      }
    }

    console.log(`   Source production records: ${sourceProductionCount}`)
    console.log(`   Target production records: ${targetProductionCount}`)
    if (sourceProductionCount === targetProductionCount) {
      console.log(`   ✅ Production count matches!`)
    } else {
      console.log(`   ⚠️  Production count mismatch!`)
    }

    // Summary
    console.log("\n" + "=".repeat(50))
    console.log("📊 VERIFICATION SUMMARY")
    console.log("=".repeat(50))
    const allMatch = 
      (sourceEvents?.length || 0) === (targetEvents?.length || 0) &&
      sourceExpensesCount === targetExpensesCount &&
      sourceAttendanceCount === targetAttendanceCount &&
      sourceAppointmentsCount === targetAppointmentsCount &&
      sourceProductionCount === targetProductionCount

    if (allMatch) {
      console.log("✅ All marketing event data has been successfully copied!")
    } else {
      console.log("⚠️  Some data may be missing. Please review the counts above.")
    }
    console.log("=".repeat(50) + "\n")

  } catch (error) {
    console.error("Error verifying data copy:", error)
    process.exit(1)
  }
}

verifyMarketingEventsCopy().catch(console.error)


