"use server"
import { createAdminClient } from "@/lib/supabase/admin"

// Improved fetchWithRetry function with better error handling
async function fetchWithRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn()

      // For debugging, log the result structure (not the full data)
      if (process.env.NODE_ENV !== "production") {
        console.log(`Fetch successful, result structure:`, {
          status: result?.status,
          statusText: result?.statusText,
          hasData: result?.data !== undefined,
          hasError: result?.error !== undefined,
          errorMessage: result?.error?.message,
        })
      }

      return result
    } catch (error) {
      lastError = error
      console.log(`Error during fetch attempt ${attempt + 1}/${maxRetries}:`, error.message)

      // Check if it's a rate limiting error
      if (error.message && error.message.includes("Too Many R")) {
        console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2
      } else if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("network"))) {
        // Handle network errors with retry
        console.log(`Network error, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2
      } else {
        // For other errors, log more details but don't retry
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        })
        break
      }
    }
  }

  // If we've exhausted all retries, throw a more descriptive error
  if (lastError) {
    console.error("All fetch retry attempts failed:", lastError)
    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`)
  }

  throw new Error("Unknown error in fetchWithRetry")
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

    // First try to get the event from marketing_events table
    let eventQuery = supabase.from("marketing_events").select("*").eq("user_id", userId)

    if (eventId) {
      eventQuery = eventQuery.eq("id", eventId)
    } else {
      eventQuery = eventQuery.order("date", { ascending: false }).limit(1)
    }

    const { data: marketingEvent, error: marketingEventError } = await fetchWithRetry(() => eventQuery.maybeSingle())

    let event = marketingEvent

    // If no marketing_event found, try the events table
    if (!event) {
      console.log("No marketing_event found, trying events table")
      let eventsQuery = supabase.from("events").select("*").eq("user_id", userId)

      if (eventId) {
        eventsQuery = eventsQuery.eq("id", eventId)
      } else {
        eventsQuery = eventsQuery.order("date", { ascending: false }).limit(1)
      }

      const { data: oldEvent, error: oldEventError } = await fetchWithRetry(() => eventsQuery.maybeSingle())

      if (oldEventError) {
        console.error("Error fetching event from events table:", oldEventError)
      } else {
        event = oldEvent
      }
    }

    if (!event) {
      console.log("No events found for user")
      return null
    }

    console.log(`Found event: ${event.name} (${event.id})`)

    // Initialize data containers
    let expenses = null
    let attendance = null
    let appointments = null
    let financialProduction = null
    let eventDetails = null

    // STEP 1: Try to get data from the new schema first

    // Get event details (new schema)
    const { data: detailsData } = await supabase
      .from("event_details")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle()

    if (detailsData) {
      console.log("Found event details in new schema")
      eventDetails = detailsData
    }

    // Get event expenses
    const { data: expensesData } = await supabase
      .from("marketing_expenses")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle()

    if (expensesData) {
      console.log("Found expenses data")
      expenses = expensesData
    }

    // Get event attendance (new schema)
    const { data: attendanceData } = await supabase
      .from("event_attendance")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle()

    if (attendanceData) {
      console.log("Found attendance data in new schema")
      attendance = attendanceData
    }

    // Try event_appointments first (new schema)
    const { data: newAppointmentsData } = await supabase
      .from("event_appointments")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle()

    if (newAppointmentsData) {
      console.log("Found appointments data in new schema")
      appointments = newAppointmentsData
    } else {
      // Fall back to appointments (old schema)
      const { data: oldAppointmentsData } = await supabase
        .from("appointments")
        .select("*")
        .eq("event_id", event.id)
        .maybeSingle()

      if (oldAppointmentsData) {
        console.log("Found appointments data in old schema")
        appointments = oldAppointmentsData
      }
    }

    // Try financial_results first (new schema)
    const { data: newFinancialData } = await supabase
      .from("financial_results")
      .select("*")
      .eq("event_id", event.id)
      .maybeSingle()

    if (newFinancialData) {
      console.log("Found financial data in new schema")
      financialProduction = newFinancialData
    } else {
      // Fall back to financial_production (old schema)
      const { data: oldFinancialData } = await supabase
        .from("financial_production")
        .select("*")
        .eq("event_id", event.id)
        .maybeSingle()

      if (oldFinancialData) {
        console.log("Found financial data in old schema")
        financialProduction = oldFinancialData
      }
    }

    // Calculate ROI
    const totalExpenses =
      expenses?.total_cost ||
      (expenses?.advertising_cost || 0) + (expenses?.food_venue_cost || 0) + (expenses?.other_costs || 0)

    // Map old field names to new ones if needed
    const annuityPremium = financialProduction?.annuity_premium || financialProduction?.fixed_annuity || 0
    const lifeInsurancePremium = financialProduction?.life_insurance_premium || financialProduction?.life_insurance || 0
    const annuityCommission = financialProduction?.annuity_commission || 0
    const lifeInsuranceCommission = financialProduction?.life_insurance_commission || 0

    const totalIncome =
      financialProduction?.total ||
      annuityPremium +
        lifeInsurancePremium +
        (financialProduction?.aum || 0) +
        (financialProduction?.financial_planning || 0)

    const roi = totalExpenses > 0 ? Math.round(((totalIncome - totalExpenses) / totalExpenses) * 100) : 0

    // Get ROI trend (last 6 events)
    let roiTrend = [0, 0, 0, 0, 0, 0, roi] // Default fallback data with current ROI as last value

    try {
      // First try marketing_events table
      const { data: pastMarketingEvents } = await supabase
        .from("marketing_events")
        .select(`
          id,
          date,
          marketing_expenses (total_cost),
          financial_production (total)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(7)

      if (pastMarketingEvents && pastMarketingEvents.length > 0) {
        // Process the trend data
        roiTrend = pastMarketingEvents.map((pastEvent) => {
          const eventExpenses = pastEvent.marketing_expenses?.[0]?.total_cost || 1
          const eventProduction = pastEvent.financial_production?.[0]?.total || 0
          return Math.round(((eventProduction - eventExpenses) / eventExpenses) * 100)
        })
      } else {
        // Try events table
        const { data: pastEvents } = await supabase
          .from("events")
          .select(`
            id,
            date,
            marketing_expenses (total_cost),
            financial_production (total)
          `)
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(7)

        if (pastEvents && pastEvents.length > 0) {
          // Process the trend data
          roiTrend = pastEvents.map((pastEvent) => {
            const eventExpenses = pastEvent.marketing_expenses?.[0]?.total_cost || 1
            const eventProduction = pastEvent.financial_production?.[0]?.total || 0
            return Math.round(((eventProduction - eventExpenses) / eventExpenses) * 100)
          })
        }
      }
    } catch (error) {
      console.error("Error calculating ROI trend:", error)
      // Keep using the default roiTrend
    }

    // Calculate conversion rate
    const attendeeCount = attendance?.attendees || 0
    const clientCount = attendance?.clients_from_event || financialProduction?.annuities_sold || 0
    const conversionRate = attendeeCount > 0 ? Math.round((clientCount / attendeeCount) * 1000) / 10 : 0

    // Prepare the dashboard data in the format expected by the UI
    return {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date, // Add the event date to the returned data
      roi: {
        value: roi,
        trend: roiTrend,
      },
      writtenBusiness: financialProduction?.annuities_sold || 0,
      income: {
        total: totalIncome,
        breakdown: {
          fixedAnnuity: annuityPremium, // Map to old field name for UI compatibility
          life: lifeInsurancePremium, // Map to old field name for UI compatibility
          aum: financialProduction?.aum || 0,
        },
      },
      conversionRate: {
        value: conversionRate,
        attendees: attendeeCount,
        clients: clientCount,
      },
      eventDetails: {
        dayOfWeek: new Date(event.date).toLocaleDateString("en-US", { weekday: "long" }),
        location: eventDetails?.location || event.location || "N/A",
        time: eventDetails?.time || event.time || "N/A",
        ageRange: eventDetails?.age_range || event.age_range || "N/A",
        mileRadius: eventDetails?.mile_radius || event.mile_radius || "N/A",
        incomeAssets: eventDetails?.income_assets || event.income_assets || "N/A",
      },
      marketingExpenses: {
        total: totalExpenses,
        advertising: expenses?.advertising_cost || 0,
        foodVenue: expenses?.food_venue_cost || 0,
      },
      topicOfMarketing: eventDetails?.topic || event.topic || "",
      attendance: {
        registrantResponses: attendance?.registrant_responses || 0,
        confirmations: attendance?.confirmations || 0,
        attendees: attendeeCount,
        clientsFromEvent: attendance?.clients_from_event || 0, // New field
        responseRate:
          attendance?.registrant_responses && attendance.registrant_responses > 0
            ? attendance.attendees / attendance.registrant_responses
            : 0,
      },
      clientAcquisition: {
        expensePerBuyingUnit: attendeeCount > 0 ? Math.round((totalExpenses / attendeeCount) * 100) / 100 : 0,
        expensePerAppointment:
          (appointments?.first_appointment_attended || 0) > 0
            ? Math.round((totalExpenses / appointments.first_appointment_attended) * 100) / 100
            : 0,
        expensePerClient: clientCount > 0 ? Math.round((totalExpenses / clientCount) * 100) / 100 : 0,
        totalCost: totalExpenses,
      },
      conversionEfficiency: {
        registrationToAttendance:
          attendance?.registrant_responses && attendance.registrant_responses > 0
            ? Math.round((attendance.attendees / attendance.registrant_responses) * 1000) / 10
            : 0,
        attendanceToAppointment:
          attendeeCount > 0 && appointments?.first_appointment_attended
            ? Math.round((appointments.first_appointment_attended / attendeeCount) * 1000) / 10
            : 0,
        appointmentToClient:
          (appointments?.first_appointment_attended || 0) > 0 && clientCount > 0
            ? Math.round((clientCount / appointments.first_appointment_attended) * 1000) / 10
            : 0,
        overall: attendeeCount > 0 && clientCount > 0 ? Math.round((clientCount / attendeeCount) * 1000) / 10 : 0,
      },
      appointments: {
        setAtEvent: appointments?.set_at_event || 0,
        setAfterEvent: appointments?.set_after_event || 0,
        firstAppointmentAttended: appointments?.first_appointment_attended || 0,
        firstAppointmentNoShows: appointments?.first_appointment_no_shows || 0,
        secondAppointmentAttended: appointments?.second_appointment_attended || 0,
      },
      productsSold: {
        annuities: financialProduction?.annuities_sold || 0,
        lifePolicies: financialProduction?.life_policies_sold || 0,
      },
      financialProduction: {
        annuity_premium: annuityPremium,
        life_insurance_premium: lifeInsurancePremium,
        aum: financialProduction?.aum || 0,
        financial_planning: financialProduction?.financial_planning || 0,
        total: totalIncome,
        annuities_sold: financialProduction?.annuities_sold || 0,
        life_policies_sold: financialProduction?.life_policies_sold || 0,
        annuity_commission: annuityCommission,
        life_insurance_commission: lifeInsuranceCommission,
        aum_fees: financialProduction?.aum_fees || 0,
      },
    }
  } catch (error) {
    console.error("Error in fetchDashboardData:", error)
    return null
  }
}

// Create a new marketing event with all related data
export async function createEvent(userId: string, eventData: any) {
  try {
    // Use the admin client to bypass RLS policies
    const supabase = await createAdminClient()

    if (!userId) {
      console.error("createEvent called without userId")
      return { success: false, error: "User ID is required" }
    }

    console.log("Creating new event with data:", {
      ...eventData,
      userId,
    })

    // Validate required fields
    if (!eventData.name || !eventData.date || !eventData.location || !eventData.type || !eventData.topic) {
      return {
        success: false,
        error: "Missing required fields: name, date, location, type, and topic are required",
      }
    }

    // STEP 1: Create the marketing event
    const { data: event, error: eventError } = await supabase
      .from("marketing_events")
      .insert({
        user_id: userId,
        name: eventData.name,
        date: eventData.date,
        location: eventData.location,
        marketing_type: eventData.type, // Map type to marketing_type
        topic: eventData.topic,
        age_range: eventData.age_range,
        mile_radius: eventData.mile_radius,
        income_assets: eventData.income_assets,
        time: eventData.time,
        status: "active",
      })
      .select()
      .single()

    if (eventError || !event) {
      console.error("Error creating event:", eventError)
      return { success: false, error: eventError?.message || "Failed to create event" }
    }

    console.log("Created event:", event.id)

    // STEP 2: Create event details (new schema)
    const { error: detailsError } = await supabase.from("event_details").insert({
      event_id: event.id,
      location: eventData.location,
      type: eventData.type,
      topic: eventData.topic,
      time: eventData.time,
      age_range: eventData.age_range,
      mile_radius: eventData.mile_radius,
      income_assets: eventData.income_assets,
    })

    if (detailsError) {
      console.error("Error creating event details:", detailsError)
      // Continue anyway - this is not critical
    }

    // STEP 3: Create expenses
    const { error: expensesError } = await supabase.from("marketing_expenses").insert({
      event_id: event.id,
      advertising_cost: eventData.expenses.advertising_cost,
      food_venue_cost: eventData.expenses.food_venue_cost,
      other_costs: eventData.expenses.other_costs,
      total_cost: eventData.expenses.total_cost,
    })

    if (expensesError) {
      console.error("Error creating expenses:", expensesError)
      return { success: false, error: expensesError.message }
    }

    // STEP 4: Create attendance with new clients_from_event field
    const { error: attendanceError } = await supabase.from("event_attendance").insert({
      event_id: event.id,
      registrant_responses: eventData.attendance.registrant_responses,
      confirmations: eventData.attendance.confirmations,
      attendees: eventData.attendance.attendees,
      clients_from_event: eventData.attendance.clients_from_event || 0, // Add new field
    })

    if (attendanceError) {
      console.error("Error creating attendance:", attendanceError)
      return { success: false, error: attendanceError.message }
    }

    // STEP 5: Create appointments in both tables for compatibility
    // First in event_appointments (new schema)
    const { error: newAppointmentsError } = await supabase.from("event_appointments").insert({
      event_id: event.id,
      set_at_event: eventData.appointments.set_at_event,
      set_after_event: eventData.appointments.set_after_event,
      first_appointment_attended: eventData.appointments.first_appointment_attended,
      first_appointment_no_shows: eventData.appointments.first_appointment_no_shows,
      second_appointment_attended: eventData.appointments.second_appointment_attended,
    })

    if (newAppointmentsError) {
      console.error("Error creating appointments in new schema:", newAppointmentsError)
      // Continue anyway - we'll try the old schema
    }

    // STEP 6: Create financial data with updated field names
    // Map the fields to the new names
    const financialData = {
      event_id: event.id,
      annuity_premium:
        eventData.financialProduction.fixed_annuity || eventData.financialProduction.annuity_premium || 0,
      life_insurance_premium:
        eventData.financialProduction.life_insurance || eventData.financialProduction.life_insurance_premium || 0,
      aum: eventData.financialProduction.aum || 0,
      financial_planning: eventData.financialProduction.financial_planning || 0,
      annuities_sold: eventData.financialProduction.annuities_sold || 0,
      life_policies_sold: eventData.financialProduction.life_policies_sold || 0,
      annuity_commission:
        eventData.financialProduction.annuity_commission || eventData.financialProduction.annuity_premium || 0,
      life_insurance_commission:
        eventData.financialProduction.life_insurance_commission ||
        eventData.financialProduction.life_insurance_premium ||
        0,
      aum_fees: eventData.financialProduction.aum_fees || 0,
    }

    // Calculate total
    const total =
      financialData.annuity_premium +
      financialData.life_insurance_premium +
      financialData.aum +
      financialData.financial_planning

    // First check if financial_results table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "financial_results")
      .maybeSingle()

    // Only try to insert into financial_results if the table exists
    if (tableInfo && tableInfo.table_name === "financial_results") {
      // First in financial_results (new schema)
      const { error: newFinancialError } = await supabase.from("financial_results").insert({
        ...financialData,
        total: total,
      })

      if (newFinancialError) {
        console.error("Error creating financial results in new schema:", newFinancialError)
        // Continue anyway - we'll try the old schema
      }
    } else {
      console.log("financial_results table does not exist, skipping insert")
    }

    // Then in financial_production (old schema with mapped fields)
    const { error: oldFinancialError } = await supabase.from("financial_production").insert({
      event_id: event.id,
      fixed_annuity: financialData.annuity_premium, // Map to old field name
      life_insurance: financialData.life_insurance_premium, // Map to old field name
      aum: financialData.aum,
      financial_planning: financialData.financial_planning,
      total: total,
      annuities_sold: financialData.annuities_sold,
      life_policies_sold: financialData.life_policies_sold,
      annuity_premium: financialData.annuity_commission, // Map to old field name
      life_insurance_premium: financialData.life_insurance_commission, // Map to old field name
      aum_fees: financialData.aum_fees,
    })

    if (oldFinancialError) {
      console.error("Error creating financial production in old schema:", oldFinancialError)
      // Continue anyway since we've already created the event
    }

    return { success: true, eventId: event.id }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
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
