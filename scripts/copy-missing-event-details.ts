import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function copyMissingEventDetails() {
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
    console.log(`\n🔍 Copying missing event details: ${sourceEmail} -> ${targetEmail}\n`)

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

    // Get all source events
    const { data: sourceEvents, error: sourceEventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', sourceUserId)
      .order('name', { ascending: true })

    if (sourceEventsError) {
      console.error("Error fetching source events:", sourceEventsError.message)
      process.exit(1)
    }

    // Get all target events
    const { data: targetEvents, error: targetEventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', targetUserId)
      .order('name', { ascending: true })

    if (targetEventsError) {
      console.error("Error fetching target events:", targetEventsError.message)
      process.exit(1)
    }

    console.log(`Found ${sourceEvents?.length || 0} source events`)
    console.log(`Found ${targetEvents?.length || 0} target events\n`)

    if (!sourceEvents || sourceEvents.length === 0) {
      console.log("No source events to process")
      return
    }

    let totalExpensesCopied = 0
    let totalExpensesFailed = 0
    let totalAttendanceCopied = 0
    let totalAttendanceFailed = 0
    let totalAppointmentsCopied = 0
    let totalAppointmentsFailed = 0
    let totalProductionCopied = 0
    let totalProductionFailed = 0

    // Match events by name and date
    for (const sourceEvent of sourceEvents) {
      // Find matching target event by name and date
      const matchingTargetEvent = targetEvents?.find(
        te => te.name === sourceEvent.name && te.date === sourceEvent.date
      )

      if (!matchingTargetEvent) {
        console.log(`⚠️  No matching target event found for: "${sourceEvent.name}" (${sourceEvent.date})`)
        continue
      }

      console.log(`\n📋 Processing: "${sourceEvent.name}"`)
      console.log(`   Source ID: ${sourceEvent.id}`)
      console.log(`   Target ID: ${matchingTargetEvent.id}`)

      // Copy expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('marketing_expenses')
        .select('*')
        .eq('event_id', sourceEvent.id)

      // Check if target already has expenses
      const { data: existingExpenses, error: existingExpensesError } = await supabase
        .from('marketing_expenses')
        .select('*')
        .eq('event_id', matchingTargetEvent.id)

      if (expensesError) {
        console.error(`   ❌ Error fetching expenses:`, expensesError.message)
      } else if (expenses && expenses.length > 0) {
        if (existingExpenses && existingExpenses.length > 0) {
          console.log(`   ℹ️  Expenses already exist (${existingExpenses.length} record(s))`)
        } else {
          for (const expense of expenses) {
            const expenseCopy = { ...expense }
            delete expenseCopy.id
            delete expenseCopy.total_cost // Generated column - will be calculated automatically
            expenseCopy.event_id = matchingTargetEvent.id
            expenseCopy.created_at = new Date().toISOString()
            expenseCopy.updated_at = new Date().toISOString()
            const { error: insertError } = await supabase.from('marketing_expenses').insert(expenseCopy)
            if (insertError) {
              console.error(`   ❌ Error copying expense:`, insertError.message)
              totalExpensesFailed++
            } else {
              totalExpensesCopied++
            }
          }
          if (totalExpensesCopied > 0) {
            console.log(`   ✅ Copied ${expenses.length} expense record(s)`)
          }
        }
      }

      // Copy attendance
      const { data: attendance, error: attendanceError } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', sourceEvent.id)

      const { data: existingAttendance, error: existingAttendanceError } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', matchingTargetEvent.id)

      if (attendanceError) {
        console.error(`   ❌ Error fetching attendance:`, attendanceError.message)
      } else if (attendance && attendance.length > 0) {
        if (existingAttendance && existingAttendance.length > 0) {
          console.log(`   ℹ️  Attendance already exists (${existingAttendance.length} record(s))`)
        } else {
          for (const att of attendance) {
            const attCopy = { ...att }
            delete attCopy.id
            attCopy.event_id = matchingTargetEvent.id
            attCopy.created_at = new Date().toISOString()
            attCopy.updated_at = new Date().toISOString()
            const { error: insertError } = await supabase.from('event_attendance').insert(attCopy)
            if (insertError) {
              console.error(`   ❌ Error copying attendance:`, insertError.message)
              totalAttendanceFailed++
            } else {
              totalAttendanceCopied++
            }
          }
          if (attendance.length > 0) {
            console.log(`   ✅ Copied ${attendance.length} attendance record(s)`)
          }
        }
      }

      // Copy appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('event_appointments')
        .select('*')
        .eq('event_id', sourceEvent.id)

      const { data: existingAppointments, error: existingAppointmentsError } = await supabase
        .from('event_appointments')
        .select('*')
        .eq('event_id', matchingTargetEvent.id)

      if (appointmentsError) {
        console.error(`   ❌ Error fetching appointments:`, appointmentsError.message)
      } else if (appointments && appointments.length > 0) {
        if (existingAppointments && existingAppointments.length > 0) {
          console.log(`   ℹ️  Appointments already exist (${existingAppointments.length} record(s))`)
        } else {
          for (const appt of appointments) {
            const apptCopy = { ...appt }
            delete apptCopy.id
            apptCopy.event_id = matchingTargetEvent.id
            apptCopy.created_at = new Date().toISOString()
            apptCopy.updated_at = new Date().toISOString()
            const { error: insertError } = await supabase.from('event_appointments').insert(apptCopy)
            if (insertError) {
              console.error(`   ❌ Error copying appointment:`, insertError.message)
              totalAppointmentsFailed++
            } else {
              totalAppointmentsCopied++
            }
          }
          if (appointments.length > 0) {
            console.log(`   ✅ Copied ${appointments.length} appointment record(s)`)
          }
        }
      }

      // Copy production
      const { data: production, error: productionError } = await supabase
        .from('financial_production')
        .select('*')
        .eq('event_id', sourceEvent.id)

      const { data: existingProduction, error: existingProductionError } = await supabase
        .from('financial_production')
        .select('*')
        .eq('event_id', matchingTargetEvent.id)

      if (productionError) {
        console.error(`   ❌ Error fetching production:`, productionError.message)
      } else if (production && production.length > 0) {
        if (existingProduction && existingProduction.length > 0) {
          console.log(`   ℹ️  Production already exists (${existingProduction.length} record(s))`)
        } else {
          for (const prod of production) {
            const prodCopy = { ...prod }
            delete prodCopy.id
            delete prodCopy.total // Generated column - will be calculated automatically
            prodCopy.event_id = matchingTargetEvent.id
            prodCopy.created_at = new Date().toISOString()
            prodCopy.updated_at = new Date().toISOString()
            const { error: insertError } = await supabase.from('financial_production').insert(prodCopy)
            if (insertError) {
              console.error(`   ❌ Error copying production:`, insertError.message)
              totalProductionFailed++
            } else {
              totalProductionCopied++
            }
          }
          if (production.length > 0) {
            console.log(`   ✅ Copied ${production.length} production record(s)`)
          }
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50))
    console.log("📊 COPY SUMMARY")
    console.log("=".repeat(50))
    console.log(`Expenses: ${totalExpensesCopied} copied, ${totalExpensesFailed} failed`)
    console.log(`Attendance: ${totalAttendanceCopied} copied, ${totalAttendanceFailed} failed`)
    console.log(`Appointments: ${totalAppointmentsCopied} copied, ${totalAppointmentsFailed} failed`)
    console.log(`Production: ${totalProductionCopied} copied, ${totalProductionFailed} failed`)
    console.log("=".repeat(50) + "\n")

  } catch (error) {
    console.error("Error copying missing event details:", error)
    process.exit(1)
  }
}

copyMissingEventDetails().catch(console.error)

