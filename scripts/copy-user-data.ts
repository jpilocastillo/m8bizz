import * as dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function copyUserData() {
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
    console.log(`Finding users: ${sourceEmail} -> ${targetEmail}`)

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

    console.log(`✅ Found source user: ${sourceUser.email} (${sourceUser.id})`)
    console.log(`✅ Found target user: ${targetUser.email} (${targetUser.id})`)

    const sourceUserId = sourceUser.id
    const targetUserId = targetUser.id

    // 1. Copy marketing_events and related data
    console.log("\n📋 Copying marketing events...")
    const { data: sourceEvents, error: eventsError } = await supabase
      .from('marketing_events')
      .select('*')
      .eq('user_id', sourceUserId)

    if (eventsError) {
      console.error("Error fetching events:", eventsError.message)
    } else if (sourceEvents && sourceEvents.length > 0) {
      console.log(`   Found ${sourceEvents.length} events to copy`)

      for (const event of sourceEvents) {
        const originalEventId = event.id
        delete event.id // Remove ID so new one is generated
        event.user_id = targetUserId
        event.created_at = new Date().toISOString()
        event.updated_at = new Date().toISOString()

        // Insert the event
        const { data: newEvent, error: insertError } = await supabase
          .from('marketing_events')
          .insert(event)
          .select()
          .single()

        if (insertError) {
          console.error(`   ❌ Error copying event "${event.name}":`, insertError.message)
          continue
        }

        console.log(`   ✅ Copied event: "${event.name}" (${originalEventId} -> ${newEvent.id})`)

        // Copy marketing_expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('marketing_expenses')
          .select('*')
          .eq('event_id', originalEventId)

        if (!expensesError && expenses && expenses.length > 0) {
          for (const expense of expenses) {
            delete expense.id
            expense.event_id = newEvent.id
            expense.created_at = new Date().toISOString()
            expense.updated_at = new Date().toISOString()
            await supabase.from('marketing_expenses').insert(expense)
          }
        }

        // Copy event_attendance
        const { data: attendance, error: attendanceError } = await supabase
          .from('event_attendance')
          .select('*')
          .eq('event_id', originalEventId)

        if (!attendanceError && attendance && attendance.length > 0) {
          for (const att of attendance) {
            delete att.id
            att.event_id = newEvent.id
            att.created_at = new Date().toISOString()
            att.updated_at = new Date().toISOString()
            await supabase.from('event_attendance').insert(att)
          }
        }

        // Copy event_appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from('event_appointments')
          .select('*')
          .eq('event_id', originalEventId)

        if (!appointmentsError && appointments && appointments.length > 0) {
          for (const appt of appointments) {
            delete appt.id
            appt.event_id = newEvent.id
            appt.created_at = new Date().toISOString()
            appt.updated_at = new Date().toISOString()
            await supabase.from('event_appointments').insert(appt)
          }
        }

        // Copy financial_production
        const { data: production, error: productionError } = await supabase
          .from('financial_production')
          .select('*')
          .eq('event_id', originalEventId)

        if (!productionError && production && production.length > 0) {
          for (const prod of production) {
            delete prod.id
            prod.event_id = newEvent.id
            prod.created_at = new Date().toISOString()
            prod.updated_at = new Date().toISOString()
            await supabase.from('financial_production').insert(prod)
          }
        }
      }
    } else {
      console.log("   No events to copy")
    }

    // 2. Copy business_goals (handle unique constraint on user_id + year)
    console.log("\n📋 Copying business goals...")
    const { data: businessGoals, error: goalsError } = await supabase
      .from('business_goals')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!goalsError && businessGoals && businessGoals.length > 0) {
      // Delete existing goals for target user to avoid unique constraint violations
      await supabase.from('business_goals').delete().eq('user_id', targetUserId)
      
      for (const goal of businessGoals) {
        delete goal.id
        goal.user_id = targetUserId
        goal.created_at = new Date().toISOString()
        goal.updated_at = new Date().toISOString()
        await supabase.from('business_goals').insert(goal)
      }
      console.log(`   ✅ Copied ${businessGoals.length} business goals`)
    } else {
      console.log("   No business goals to copy")
    }

    // 3. Copy current_values (handle unique constraint on user_id + year)
    console.log("\n📋 Copying current values...")
    const { data: currentValues, error: valuesError } = await supabase
      .from('current_values')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!valuesError && currentValues && currentValues.length > 0) {
      // Delete existing values for target user to avoid unique constraint violations
      await supabase.from('current_values').delete().eq('user_id', targetUserId)
      
      for (const value of currentValues) {
        delete value.id
        value.user_id = targetUserId
        value.created_at = new Date().toISOString()
        value.updated_at = new Date().toISOString()
        await supabase.from('current_values').insert(value)
      }
      console.log(`   ✅ Copied ${currentValues.length} current values`)
    } else {
      console.log("   No current values to copy")
    }

    // 4. Copy client_metrics (handle unique constraint on user_id + year)
    console.log("\n📋 Copying client metrics...")
    const { data: clientMetrics, error: metricsError } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!metricsError && clientMetrics && clientMetrics.length > 0) {
      // Delete existing metrics for target user to avoid unique constraint violations
      await supabase.from('client_metrics').delete().eq('user_id', targetUserId)
      
      for (const metric of clientMetrics) {
        delete metric.id
        metric.user_id = targetUserId
        metric.created_at = new Date().toISOString()
        metric.updated_at = new Date().toISOString()
        await supabase.from('client_metrics').insert(metric)
      }
      console.log(`   ✅ Copied ${clientMetrics.length} client metrics`)
    } else {
      console.log("   No client metrics to copy")
    }

    // 5. Copy commission_rates (handle unique constraint on user_id + year)
    console.log("\n📋 Copying commission rates...")
    const { data: commissionRates, error: ratesError } = await supabase
      .from('commission_rates')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!ratesError && commissionRates && commissionRates.length > 0) {
      // Delete existing rates for target user to avoid unique constraint violations
      await supabase.from('commission_rates').delete().eq('user_id', targetUserId)
      
      for (const rate of commissionRates) {
        delete rate.id
        rate.user_id = targetUserId
        rate.created_at = new Date().toISOString()
        rate.updated_at = new Date().toISOString()
        await supabase.from('commission_rates').insert(rate)
      }
      console.log(`   ✅ Copied ${commissionRates.length} commission rates`)
    } else {
      console.log("   No commission rates to copy")
    }

    // 6. Copy financial_book (handle unique constraint on user_id + year)
    console.log("\n📋 Copying financial book...")
    const { data: financialBook, error: bookError } = await supabase
      .from('financial_book')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!bookError && financialBook && financialBook.length > 0) {
      // Delete existing book entries for target user to avoid unique constraint violations
      await supabase.from('financial_book').delete().eq('user_id', targetUserId)
      
      for (const book of financialBook) {
        delete book.id
        book.user_id = targetUserId
        book.created_at = new Date().toISOString()
        book.updated_at = new Date().toISOString()
        await supabase.from('financial_book').insert(book)
      }
      console.log(`   ✅ Copied ${financialBook.length} financial book entries`)
    } else {
      console.log("   No financial book entries to copy")
    }

    // 7. Copy monthly_data_entries
    console.log("\n📋 Copying monthly data entries...")
    const { data: monthlyEntries, error: monthlyError } = await supabase
      .from('monthly_data_entries')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!monthlyError && monthlyEntries && monthlyEntries.length > 0) {
      for (const entry of monthlyEntries) {
        delete entry.id
        entry.user_id = targetUserId
        entry.created_at = new Date().toISOString()
        entry.updated_at = new Date().toISOString()
        await supabase.from('monthly_data_entries').insert(entry)
      }
      console.log(`   ✅ Copied ${monthlyEntries.length} monthly data entries`)
    } else {
      console.log("   No monthly data entries to copy")
    }

    // 8. Copy marketing_campaigns
    console.log("\n📋 Copying marketing campaigns...")
    const { data: campaigns, error: campaignsError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!campaignsError && campaigns && campaigns.length > 0) {
      for (const campaign of campaigns) {
        delete campaign.id
        campaign.user_id = targetUserId
        campaign.created_at = new Date().toISOString()
        campaign.updated_at = new Date().toISOString()
        await supabase.from('marketing_campaigns').insert(campaign)
      }
      console.log(`   ✅ Copied ${campaigns.length} marketing campaigns`)
    } else {
      console.log("   No marketing campaigns to copy")
    }

    // 9. Copy financial_options (handle unique constraint on user_id + year)
    console.log("\n📋 Copying financial options...")
    const { data: financialOptions, error: optionsError } = await supabase
      .from('financial_options')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!optionsError && financialOptions && financialOptions.length > 0) {
      // Delete existing options for target user to avoid unique constraint violations
      await supabase.from('financial_options').delete().eq('user_id', targetUserId)
      
      for (const option of financialOptions) {
        delete option.id
        option.user_id = targetUserId
        option.created_at = new Date().toISOString()
        option.updated_at = new Date().toISOString()
        await supabase.from('financial_options').insert(option)
      }
      console.log(`   ✅ Copied ${financialOptions.length} financial options`)
    } else {
      console.log("   No financial options to copy")
    }

    // 10. Copy missing_money_reports (handle unique constraint on user_id)
    console.log("\n📋 Copying missing money reports...")
    const { data: moneyReports, error: reportsError } = await supabase
      .from('missing_money_reports')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!reportsError && moneyReports && moneyReports.length > 0) {
      // Delete existing reports for target user to avoid unique constraint violations
      await supabase.from('missing_money_reports').delete().eq('user_id', targetUserId)
      
      for (const report of moneyReports) {
        delete report.id
        report.user_id = targetUserId
        report.created_at = new Date().toISOString()
        report.updated_at = new Date().toISOString()
        await supabase.from('missing_money_reports').insert(report)
      }
      console.log(`   ✅ Copied ${moneyReports.length} missing money reports`)
    } else {
      console.log("   No missing money reports to copy")
    }

    // 11. Copy client_plans
    console.log("\n📋 Copying client plans...")
    const { data: clientPlans, error: plansError } = await supabase
      .from('client_plans')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!plansError && clientPlans && clientPlans.length > 0) {
      for (const plan of clientPlans) {
        delete plan.id
        plan.user_id = targetUserId
        plan.created_at = new Date().toISOString()
        plan.updated_at = new Date().toISOString()
        await supabase.from('client_plans').insert(plan)
      }
      console.log(`   ✅ Copied ${clientPlans.length} client plans`)
    } else {
      console.log("   No client plans to copy")
    }

    // 12. Copy scorecard_roles and related data
    console.log("\n📋 Copying scorecard data...")
    const { data: scorecardRoles, error: rolesError } = await supabase
      .from('scorecard_roles')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!rolesError && scorecardRoles && scorecardRoles.length > 0) {
      for (const role of scorecardRoles) {
        const originalRoleId = role.id
        delete role.id
        role.user_id = targetUserId
        role.created_at = new Date().toISOString()
        role.updated_at = new Date().toISOString()

        const { data: newRole, error: insertRoleError } = await supabase
          .from('scorecard_roles')
          .insert(role)
          .select()
          .single()

        if (!insertRoleError && newRole) {
          // Copy scorecard_metrics
          const { data: metrics, error: metricsError } = await supabase
            .from('scorecard_metrics')
            .select('*')
            .eq('role_id', originalRoleId)

          if (!metricsError && metrics && metrics.length > 0) {
            for (const metric of metrics) {
              delete metric.id
              metric.role_id = newRole.id
              metric.created_at = new Date().toISOString()
              metric.updated_at = new Date().toISOString()
              await supabase.from('scorecard_metrics').insert(metric)
            }
          }

          // Copy scorecard_weekly_data
          const { data: weeklyData, error: weeklyError } = await supabase
            .from('scorecard_weekly_data')
            .select('*')
            .eq('role_id', originalRoleId)

          if (!weeklyError && weeklyData && weeklyData.length > 0) {
            for (const weekly of weeklyData) {
              delete weekly.id
              weekly.role_id = newRole.id
              weekly.created_at = new Date().toISOString()
              weekly.updated_at = new Date().toISOString()
              await supabase.from('scorecard_weekly_data').insert(weekly)
            }
          }
        }
      }
      console.log(`   ✅ Copied ${scorecardRoles.length} scorecard roles and related data`)
    } else {
      console.log("   No scorecard roles to copy")
    }

    // 13. Copy scorecard_monthly_summaries
    console.log("\n📋 Copying scorecard monthly summaries...")
    const { data: summaries, error: summariesError } = await supabase
      .from('scorecard_monthly_summaries')
      .select('*')
      .eq('user_id', sourceUserId)

    if (!summariesError && summaries && summaries.length > 0) {
      for (const summary of summaries) {
        delete summary.id
        summary.user_id = targetUserId
        summary.created_at = new Date().toISOString()
        summary.updated_at = new Date().toISOString()
        await supabase.from('scorecard_monthly_summaries').insert(summary)
      }
      console.log(`   ✅ Copied ${summaries.length} scorecard monthly summaries`)
    } else {
      console.log("   No scorecard monthly summaries to copy")
    }

    console.log("\n✅ Data copy completed successfully!")
    console.log(`\nAll data from ${sourceEmail} has been copied to ${targetEmail}`)

  } catch (error) {
    console.error("Error copying user data:", error)
    process.exit(1)
  }
}

copyUserData().catch(console.error)

