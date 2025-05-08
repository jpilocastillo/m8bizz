"use server"
import { createAdminClient } from "@/lib/supabase/admin"

// Improved fetchWithRetry function with better error handling
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()

      // For debugging, log the result structure (not the full data)
      if (process.env.NODE_ENV !== "production") {
        console.log(`Fetch successful, result structure:`, {
          status: (result as any)?.status,
          statusText: (result as any)?.statusText,
          hasData: (result as any)?.data !== undefined,
          hasError: (result as any)?.error !== undefined,
          errorMessage: (result as any)?.error?.message,
        })
      }

      return result
    } catch (error) {
      lastError = error
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log(`Error during fetch attempt ${attempt + 1}/${maxRetries}:`, errorMessage)

      // Check if it's a rate limiting error
      if (errorMessage.includes("Too Many R")) {
        console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network")) {
        // Handle network errors with retry
        console.log(`Network error, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2
      } else {
        // For other errors, log more details but don't retry
        console.error("Error details:", {
          name: error instanceof Error ? error.name : 'Unknown',
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          cause: error instanceof Error ? error.cause : undefined
        })
        break
      }
    }
  }

  throw lastError
}

export type MarketingEvent = {
  id: string
  name: string
  date: string
  location: string
  marketing_type: string // Changed from type to marketing_type
  topic: string
  age_range: string | null
  mile_radius: string | null
  income_assets: string | null
  time: string | null
  status: string
}

export type EventExpenses = {
  advertising_cost: number
  food_venue_cost: number
  other_costs: number
  total_cost: number
}

export type EventAttendance = {
  registrant_responses: number
  confirmations: number
  attendees: number
  clients_from_event: number // Added new field
}

export type EventAppointments = {
  set_at_event: number
  set_after_event: number
  first_appointment_attended: number
  first_appointment_no_shows: number
  second_appointment_attended: number
}

export type EventFinancialProduction = {
  annuity_premium: number // Renamed from fixed_annuity
  life_insurance_premium: number // Renamed from life_insurance
  aum: number
  financial_planning: number
  total: number
  annuities_sold: number
  life_policies_sold: number
  annuity_commission: number // Renamed from annuity_premium
  life_insurance_commission: number // Renamed from life_insurance_premium
  aum_fees?: number
}

// Fetch user events using admin client to bypass RLS
export async function fetchUserEvents(userId: string) {
  try {
    // Use the admin client to bypass RLS policies
    const supabase = await createAdminClient()

    console.log(`Fetching events for user: ${userId}`)

    // First try the marketing_events table (new schema)
    const { data: marketingEvents, error: marketingError } = await supabase
      .from("marketing_events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (marketingError) {
      console.error("Error querying marketing_events:", marketingError)
    } else {
      console.log(`Found ${marketingEvents?.length || 0} events in marketing_events table`)
    }

    if (marketingEvents && marketingEvents.length > 0) {
      return marketingEvents
    }

    // If no marketing_events, try the events table (old schema)
    console.log("No marketing_events found, trying events table")
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (eventsError) {
      console.error("Error fetching events:", eventsError)
      return []
    }

    console.log(`Found ${events?.length || 0} events in events table`)
    return events || []
  } catch (error) {
    console.error("Error in fetchUserEvents:", error)
    return []
  }
}

// Fetch all events with related data
export async function fetchAllEvents(userId: string) {
  if (!userId) {
    console.error("fetchAllEvents called without userId")
    return []
  }

  try {
    const supabase = await createAdminClient()

    // Try to get events from marketing_events table first (new schema)
    const { data: marketingEvents, error: marketingError } = await supabase
      .from("marketing_events")
      .select(`
        id,
        name,
        date,
        location,
        marketing_type, 
        topic,
        status,
        marketing_expenses (total_cost)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (marketingEvents && marketingEvents.length > 0) {
      // Map the data to the expected format
      return marketingEvents.map((event) => ({
        id: event.id,
        date: event.date,
        name: event.name,
        location: event.location,
        type: event.marketing_type || "Unknown", // Map marketing_type to type for backward compatibility
        topic: event.topic || "Unknown",
        budget: event.marketing_expenses?.[0]?.total_cost || 0,
        status: event.status || "active",
      }))
    }

    // If no marketing_events, try the events table (old schema)
    if (marketingError || !marketingEvents || marketingEvents.length === 0) {
      console.log("No marketing_events found, trying events table")
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`
          id,
          name,
          date,
          status,
          user_id,
          event_details (location, type, topic),
          marketing_expenses (total_cost)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })

      if (eventsError) {
        console.error("Error fetching events:", eventsError)
        return []
      }

      if (events && events.length > 0) {
        // Map the data to the expected format
        return events.map((event) => ({
          id: event.id,
          date: event.date,
          name: event.name,
          location: event.event_details?.[0]?.location || "Unknown",
          type: event.event_details?.[0]?.type || "Unknown",
          topic: event.event_details?.[0]?.topic || "Unknown",
          budget: event.marketing_expenses?.[0]?.total_cost || 0,
          status: event.status || "active",
        }))
      }
    }

    return []
  } catch (error) {
    console.error("Error in fetchAllEvents:", error)
    return []
  }
}

// Comprehensive dashboard data fetching that handles both schemas
export async function fetchDashboardData(userId: string, eventId?: string) {
  if (!userId) {
    console.error("fetchDashboardData called without userId")
    return null
  }

  try {
    // Use the admin client to bypass RLS policies
    const supabase = await createAdminClient()

    console.log(`Fetching dashboard data for user ${userId}${eventId ? ` and event ${eventId}` : ""}`)

    // Get the event from marketing_events table
    let eventQuery = supabase
      .from("marketing_events")
      .select(`
        *,
        marketing_expenses (*),
        event_attendance (*),
        event_appointments (*),
        event_financial_production (*)
      `)
      .eq("user_id", userId)

    if (eventId) {
      eventQuery = eventQuery.eq("id", eventId)
    } else {
      eventQuery = eventQuery.order("date", { ascending: false }).limit(1)
    }

    const { data: event, error: eventError } = await eventQuery.maybeSingle()

    if (eventError) {
      console.error("Error fetching event:", eventError)
      return null
    }

    if (!event) {
      console.log("No events found for user")
      return null
    }

    console.log(`Found event: ${event.name} (${event.id})`)

    // Calculate ROI
    const expenses = event.marketing_expenses?.[0]
    const totalExpenses = expenses?.total_cost || 0

    const financial = event.event_financial_production?.[0]
    const totalIncome = financial?.annuity_premium || 0 + 
                       financial?.life_insurance_premium || 0 + 
                       financial?.aum || 0 + 
                       financial?.financial_planning || 0

    const roi = totalExpenses > 0 ? Math.round(((totalIncome - totalExpenses) / totalExpenses) * 100) : 0

    // Get ROI trend (last 6 events)
    const { data: pastEvents } = await supabase
      .from("marketing_events")
      .select(`
        id,
        date,
        marketing_expenses (total_cost),
        event_financial_production (
          annuity_premium,
          life_insurance_premium,
          aum,
          financial_planning
        )
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7)

    const roiTrend = pastEvents?.map(event => {
      const expenses = event.marketing_expenses?.[0]?.total_cost || 1
      const financial = event.event_financial_production?.[0]
      const production = (financial?.annuity_premium || 0) +
                        (financial?.life_insurance_premium || 0) +
                        (financial?.aum || 0) +
                        (financial?.financial_planning || 0)
      return Math.round(((production - expenses) / expenses) * 100)
    }) || [0, 0, 0, 0, 0, 0, roi]

    // Calculate conversion rate
    const attendance = event.event_attendance?.[0]
    const attendeeCount = attendance?.attendees || 0
    const clientCount = attendance?.clients_from_event || 0
    const conversionRate = attendeeCount > 0 ? Math.round((clientCount / attendeeCount) * 1000) / 10 : 0

    // Prepare the dashboard data
    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      roi: {
        value: roi,
        trend: roiTrend,
      },
      writtenBusiness: financial?.annuities_sold || 0,
      income: {
        total: totalIncome,
        breakdown: {
          fixedAnnuity: financial?.annuity_premium || 0,
          life: financial?.life_insurance_premium || 0,
          aum: financial?.aum || 0,
        },
      },
      conversionRate: {
        value: conversionRate,
        attendees: attendeeCount,
        clients: clientCount,
      },
      eventDetails: {
        dayOfWeek: new Date(event.date).toLocaleDateString("en-US", { weekday: "long" }),
        location: event.location,
        time: event.time,
        ageRange: event.age_range,
        mileRadius: event.mile_radius,
        incomeAssets: event.income_assets,
      },
      marketingExpenses: {
        total: totalExpenses,
        advertising: expenses?.advertising_cost || 0,
        foodVenue: expenses?.food_venue_cost || 0,
      },
      topicOfMarketing: event.topic,
      appointments: {
        setAtEvent: event.event_appointments?.[0]?.set_at_event || 0,
        setAfterEvent: event.event_appointments?.[0]?.set_after_event || 0,
        firstAppointmentAttended: event.event_appointments?.[0]?.first_appointment_attended || 0,
        firstAppointmentNoShows: event.event_appointments?.[0]?.first_appointment_no_shows || 0,
        secondAppointmentAttended: event.event_appointments?.[0]?.second_appointment_attended || 0,
      },
      productsSold: {
        annuities: financial?.annuities_sold || 0,
        lifePolicies: financial?.life_policies_sold || 0,
      },
      financialProduction: {
        annuity_premium: financial?.annuity_premium || 0,
        life_insurance_premium: financial?.life_insurance_premium || 0,
        aum: financial?.aum || 0,
        financial_planning: financial?.financial_planning || 0,
        total: totalIncome,
        annuities_sold: financial?.annuities_sold || 0,
        life_policies_sold: financial?.life_policies_sold || 0,
        annuity_commission: financial?.annuity_commission || 0,
        life_insurance_commission: financial?.life_insurance_commission || 0,
        aum_fees: financial?.aum_fees || 0,
      },
    }
  } catch (error) {
    console.error("Error in fetchDashboardData:", error)
    return null
  }
}

// Create a new marketing event with all related data
export async function createEvent(userId: string, eventData: any) {
  if (!userId) {
    console.error("createEvent called without userId")
    return { success: false, error: "User ID is required" }
  }

  try {
    const supabase = await createAdminClient()
    console.log('Supabase admin client created')

    // Start a transaction
    const { data: event, error: eventError } = await supabase
      .from("marketing_events")
      .insert({
        user_id: userId,
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        marketing_type: eventData.marketing_type,
        topic: eventData.topic,
        time: eventData.time,
        age_range: eventData.age_range,
        mile_radius: eventData.mile_radius,
        income_assets: eventData.income_assets,
        status: "active"
      })
      .select()
      .single()

    if (eventError) {
      console.error("Error creating event:", eventError)
      return { success: false, error: eventError.message }
    }

    console.log('Event created successfully:', event)

    // Create related records sequentially
    try {
      // Create marketing expenses
      const { error: expensesError } = await supabase
        .from("marketing_expenses")
        .insert({
          event_id: event.id,
          advertising_cost: eventData.advertising_cost,
          food_venue_cost: eventData.food_venue_cost,
          other_costs: eventData.other_costs,
          total_cost: eventData.advertising_cost + eventData.food_venue_cost + eventData.other_costs
        })

      if (expensesError) {
        throw new Error(`Failed to create expenses: ${expensesError.message}`)
      }

      // Create event attendance
      const { error: attendanceError } = await supabase
        .from("event_attendance")
        .insert({
          event_id: event.id,
          registrant_responses: eventData.registrant_responses,
          confirmations: eventData.confirmations,
          attendees: eventData.attendees,
          clients_from_event: eventData.clients_from_event
        })

      if (attendanceError) {
        throw new Error(`Failed to create attendance: ${attendanceError.message}`)
      }

      // Create event appointments
      const { error: appointmentsError } = await supabase
        .from("event_appointments")
        .insert({
          event_id: event.id,
          set_at_event: eventData.set_at_event,
          set_after_event: eventData.set_after_event,
          first_appointment_attended: eventData.first_appointment_attended,
          first_appointment_no_shows: eventData.first_appointment_no_shows,
          second_appointment_attended: eventData.second_appointment_attended
        })

      if (appointmentsError) {
        throw new Error(`Failed to create appointments: ${appointmentsError.message}`)
      }

      // Create financial production
      const { error: financialError } = await supabase
        .from("event_financial_production")
        .insert({
          event_id: event.id,
          annuity_premium: eventData.annuity_premium,
          life_insurance_premium: eventData.life_insurance_premium,
          aum: eventData.aum,
          financial_planning: eventData.financial_planning,
          annuities_sold: eventData.annuities_sold,
          life_policies_sold: eventData.life_policies_sold,
          annuity_commission: eventData.annuity_commission,
          life_insurance_commission: eventData.life_insurance_commission,
          aum_fees: eventData.aum_fees
        })

      if (financialError) {
        throw new Error(`Failed to create financial production: ${financialError.message}`)
      }

      console.log('All related records created successfully')
      return { success: true, eventId: event.id }
    } catch (error) {
      // If any related record creation fails, delete the main event
      console.error("Error creating related records:", error)
      await supabase.from("marketing_events").delete().eq("id", event.id)
      return { success: false, error: error instanceof Error ? error.message : "Failed to create related records" }
    }
  } catch (error) {
    console.error("Error in createEvent:", error)
    return { success: false, error: "An unexpected error occurred while creating the event." }
  }
}

// Update an existing marketing event
export async function updateEvent(eventId: string, eventData: any) {
  try {
    // Use the admin client to bypass RLS policies
    const supabase = await createAdminClient()

    if (!eventId) {
      console.error("updateEvent called without eventId")
      return { success: false, error: "Event ID is required" }
    }

    console.log("Updating event:", eventId)

    // First check if the event exists in marketing_events
    const { data: marketingEvent, error: marketingEventError } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle()

    // If not found in marketing_events, check events table
    const { data: oldEvent, error: oldEventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle()

    const isMarketingEvent = !!marketingEvent
    const isOldEvent = !!oldEvent

    if (!isMarketingEvent && !isOldEvent) {
      console.error("Event not found in either table")
      return { success: false, error: "Event not found" }
    }

    // Update event core data
    if (
      Object.keys(eventData).some(
        (key) => !["expenses", "attendance", "appointments", "financialProduction"].includes(key),
      )
    ) {
      // Map type to marketing_type if provided
      const marketingEventData = {
        ...eventData,
        marketing_type: eventData.type, // Map type to marketing_type
      }

      // Remove type from the data to avoid conflicts
      if (marketingEventData.type) {
        delete marketingEventData.type
      }

      if (isMarketingEvent) {
        const { error: eventError } = await supabase
          .from("marketing_events")
          .update(marketingEventData)
          .eq("id", eventId)

        if (eventError) {
          console.error("Error updating marketing_events:", eventError)
          return { success: false, error: eventError.message }
        }

        // Also update event_details if it exists
        const { error: detailsError } = await supabase
          .from("event_details")
          .update({
            location: eventData.location,
            type: eventData.marketing_type || eventData.type, // Use marketing_type or fall back to type
            topic: eventData.topic,
            time: eventData.time,
            age_range: eventData.age_range,
            mile_radius: eventData.mile_radius,
            income_assets: eventData.income_assets,
          })
          .eq("event_id", eventId)

        if (detailsError) {
          console.error("Error updating event details:", detailsError)
          // Continue anyway - this is not critical
        }
      } else if (isOldEvent) {
        // Update the old events table
        const { error: eventError } = await supabase
          .from("events")
          .update({
            name: eventData.name,
            date: eventData.date,
            status: eventData.status,
          })
          .eq("id", eventId)

        if (eventError) {
          console.error("Error updating events:", eventError)
          return { success: false, error: eventError.message }
        }

        // Update event_details for old schema
        const { error: detailsError } = await supabase
          .from("event_details")
          .update({
            location: eventData.location,
            type: eventData.type,
            topic: eventData.topic,
            time: eventData.time,
            age_range: eventData.age_range,
            mile_radius: eventData.mile_radius,
            income_assets: eventData.income_assets,
          })
          .eq("event_id", eventId)

        if (detailsError) {
          console.error("Error updating event details for old schema:", detailsError)
          // Continue anyway - this is not critical
        }
      }
    }

    // Update expenses
    if (eventData.expenses) {
      const { error: expensesError } = await supabase
        .from("marketing_expenses")
        .update(eventData.expenses)
        .eq("event_id", eventId)

      if (expensesError) {
        console.error("Error updating expenses:", expensesError)
        return { success: false, error: expensesError.message }
      }
    }

    // Update attendance
    if (eventData.attendance) {
      const { error: attendanceError } = await supabase
        .from("event_attendance")
        .update(eventData.attendance)
        .eq("event_id", eventId)

      if (attendanceError) {
        console.error("Error updating attendance:", attendanceError)
        return { success: false, error: attendanceError.message }
      }
    }

    // Update appointments in both tables
    if (eventData.appointments) {
      // Try new schema first
      const { error: newAppointmentsError } = await supabase
        .from("event_appointments")
        .update(eventData.appointments)
        .eq("event_id", eventId)

      if (newAppointmentsError) {
        console.error("Error updating appointments in new schema:", newAppointmentsError)
        // Continue anyway - we'll try the old schema
      }

      // Then try old schema
      const { error: oldAppointmentsError } = await supabase
        .from("appointments")
        .update(eventData.appointments)
        .eq("event_id", eventId)

      if (oldAppointmentsError) {
        console.error("Error updating appointments in old schema:", oldAppointmentsError)
        // Only return error if both failed
        if (newAppointmentsError) {
          return { success: false, error: "Failed to update appointments" }
        }
      }
    }

    // Update financial data in both tables
    if (eventData.financialProduction) {
      // Map the fields to the new names for financial_results
      const newFinancialData = {
        annuity_premium: eventData.financialProduction.fixed_annuity || eventData.financialProduction.annuity_premium,
        life_insurance_premium:
          eventData.financialProduction.life_insurance || eventData.financialProduction.life_insurance_premium,
        aum: eventData.financialProduction.aum,
        financial_planning: eventData.financialProduction.financial_planning,
        annuities_sold: eventData.financialProduction.annuities_sold,
        life_policies_sold: eventData.financialProduction.life_policies_sold,
        annuity_commission:
          eventData.financialProduction.annuity_commission || eventData.financialProduction.annuity_premium,
        life_insurance_commission:
          eventData.financialProduction.life_insurance_commission ||
          eventData.financialProduction.life_insurance_premium,
        aum_fees: eventData.financialProduction.aum_fees,
      }

      // Remove undefined values
      Object.keys(newFinancialData).forEach((key) => {
        if (newFinancialData[key] === undefined) {
          delete newFinancialData[key]
        }
      })

      // Calculate total if we have all the necessary fields
      if (
        newFinancialData.annuity_premium !== undefined &&
        newFinancialData.life_insurance_premium !== undefined &&
        newFinancialData.aum !== undefined &&
        newFinancialData.financial_planning !== undefined
      ) {
        newFinancialData.total =
          (newFinancialData.annuity_premium || 0) +
          (newFinancialData.life_insurance_premium || 0) +
          (newFinancialData.aum || 0) +
          (newFinancialData.financial_planning || 0)
      }

      // Try new schema first
      const { error: newFinancialError } = await supabase
        .from("financial_results")
        .update(newFinancialData)
        .eq("event_id", eventId)

      if (newFinancialError) {
        console.error("Error updating financial results in new schema:", newFinancialError)
        // Continue anyway - we'll try the old schema
      }

      // Map the fields to the old names for financial_production
      const oldFinancialData = {
        fixed_annuity: newFinancialData.annuity_premium,
        life_insurance: newFinancialData.life_insurance_premium,
        aum: newFinancialData.aum,
        financial_planning: newFinancialData.financial_planning,
        annuities_sold: newFinancialData.annuities_sold,
        life_policies_sold: newFinancialData.life_policies_sold,
        annuity_premium: newFinancialData.annuity_commission,
        life_insurance_premium: newFinancialData.life_insurance_commission,
        total: newFinancialData.total,
        aum_fees: newFinancialData.aum_fees,
      }

      // Remove undefined values
      Object.keys(oldFinancialData).forEach((key) => {
        if (oldFinancialData[key] === undefined) {
          delete oldFinancialData[key]
        }
      })

      // Then try old schema
      const { error: oldFinancialError } = await supabase
        .from("financial_production")
        .update(oldFinancialData)
        .eq("event_id", eventId)

      if (oldFinancialError) {
        console.error("Error updating financial production in old schema:", oldFinancialError)
        // Only return error if both failed
        if (newFinancialError) {
          return { success: false, error: "Failed to update financial data" }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, error: "Failed to update event" }
  }
}

// Delete a marketing event and all related data
export async function deleteEvent(eventId: string) {
  if (!eventId) {
    console.error("deleteEvent called without eventId")
    return { success: false, error: "Event ID is required" }
  }

  try {
    const supabase = await createAdminClient()

    console.log("Deleting event:", eventId)

    // First check if the event exists in marketing_events
    const { data: marketingEvent } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle()

    // If not found in marketing_events, check events table
    const { data: oldEvent } = await supabase.from("events").select("id").eq("id", eventId).maybeSingle()

    if (marketingEvent) {
      // Delete from marketing_events (cascade will handle related records)
      const { error } = await supabase.from("marketing_events").delete().eq("id", eventId)

      if (error) {
        console.error("Error deleting from marketing_events:", error)
        return { success: false, error: error.message }
      }
    } else if (oldEvent) {
      // Delete from events (cascade will handle related records)
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) {
        console.error("Error deleting from events:", error)
        return { success: false, error: error.message }
      }
    } else {
      return { success: false, error: "Event not found" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteEvent:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createEventExpenses(data: {
  event_id: string
  advertising_cost: number
  food_venue_cost: number
  other_costs: number
}) {
  try {
    const supabase = await createAdminClient()
    const { data: result, error } = await supabase
      .from("marketing_expenses")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating event expenses:", error)
    return { success: false, error: "Failed to create event expenses" }
  }
}

export async function createEventAttendance(data: {
  event_id: string
  registrant_responses: number
  confirmations: number
  attendees: number
  clients_from_event: number
}) {
  try {
    const supabase = await createAdminClient()
    const { data: result, error } = await supabase
      .from("event_attendance")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating event attendance:", error)
    return { success: false, error: "Failed to create event attendance" }
  }
}

export async function createEventAppointments(data: {
  event_id: string
  set_at_event: number
  set_after_event: number
  first_appointment_attended: number
  first_appointment_no_shows: number
  second_appointment_attended: number
}) {
  try {
    const supabase = await createAdminClient()
    const { data: result, error } = await supabase
      .from("event_appointments")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating event appointments:", error)
    return { success: false, error: "Failed to create event appointments" }
  }
}

export async function createEventFinancialProduction(data: {
  event_id: string
  annuity_premium: number
  life_insurance_premium: number
  aum: number
  financial_planning: number
  annuities_sold: number
  life_policies_sold: number
  annuity_commission: number
  life_insurance_commission: number
  aum_fees: number
}) {
  try {
    const supabase = await createAdminClient()
    const { data: result, error } = await supabase
      .from("event_financial_production")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating event financial production:", error)
    return { success: false, error: "Failed to create event financial production" }
  }
}
