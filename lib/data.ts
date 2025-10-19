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
  marketing_type: string
  topic: string
  age_range: string | null
  mile_radius: string | null
  income_assets: string | null
  time: string | null
  status: string
  marketing_audience: number | null
  // Top-level fields for summary and dashboard
  revenue?: number
  attendees?: number
  clients?: number
  attendance?: {
    registrant_responses: number
    confirmations: number
    attendees: number
    clients_from_event: number
  }
  marketing_expenses?: {
    advertising_cost: number
    food_venue_cost: number
    other_costs: number
    total_cost: number
  }
  event_appointments?: {
    set_at_event: number
    set_after_event: number
    first_appointment_attended: number
    first_appointment_no_shows: number
    second_appointment_attended: number
    not_qualified: number
  }
  financial_production?: {
    annuity_premium: number
    life_insurance_premium: number
    aum: number
    financial_planning: number
    annuities_sold: number
    life_policies_sold: number
    annuity_commission: number
    life_insurance_commission: number
    aum_fees: number
    aum_accounts_opened: number
    financial_plans_sold: number
    total: number
  }
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
  not_qualified: number
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

// Add type definitions for financial data
type FinancialData = {
  annuity_premium: number;
  life_insurance_premium: number;
  aum: number;
  financial_planning: number;
  annuities_sold: number;
  life_policies_sold: number;
  annuity_commission: number;
  life_insurance_commission: number;
  aum_fees: number;
  total?: number;
  [key: string]: number | undefined; // Add index signature
};

type OldFinancialData = {
  fixed_annuity: number;
  life_insurance: number;
  aum: number;
  financial_planning: number;
  annuities_sold: number;
  life_policies_sold: number;
  annuity_premium: number;
  life_insurance_premium: number;
  total: number;
  aum_fees: number;
  [key: string]: number | undefined; // Add index signature
};

// Add this function before fetchAllEvents
async function ensureAttendanceRecords(supabase: any, events: any[]) {
  for (const event of events) {
    if (!event.event_attendance || event.event_attendance.length === 0) {
      console.log('Creating missing attendance record for event:', event.id)
      const { error: attendanceError } = await supabase
        .from('event_attendance')
        .insert([{
          event_id: event.id,
          registrant_responses: 0,
          confirmations: 0,
          attendees: 0,
          clients_from_event: 0
        }])

      if (attendanceError) {
        console.error("Error creating attendance record:", attendanceError)
      }
    }
  }
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

// Update the return type of fetchAllEvents
export type EventWithRelations = {
  id: string;
  date: string;
  name: string;
  location: string;
  type: string;
  topic: string;
  budget: number;
  status: string;
  marketing_type: string;
  attendance?: {
    attendees: number;
    clients_from_event: number;
    registrant_responses: number;
    confirmations: number;
  };
  financial_production?: {
    total: number;
  };
  marketing_expenses?: {
    total_cost: number;
  };
  event_appointments?: {
    set_at_event: number;
    set_after_event: number;
    first_appointment_attended: number;
    first_appointment_no_shows: number;
    second_appointment_attended: number;
    not_qualified: number;
  };
}

// Update the function signature
export async function fetchAllEvents(userId: string): Promise<MarketingEvent[]> {
  try {
    console.log("[fetchAllEvents] Starting fetch for user:", userId);
    const supabase = await createAdminClient();
    console.log("[fetchAllEvents] Admin client created");

    console.log("[fetchAllEvents] Querying marketing_events table");
    const { data: events, error } = await supabase
      .from('marketing_events')
      .select(`
        id,
        name,
        date,
        location,
        marketing_type,
        topic,
        status,
        time,
        age_range,
        mile_radius,
        income_assets,
        marketing_audience,
        created_at,
        updated_at,
        marketing_expenses (
          id,
          advertising_cost,
          food_venue_cost,
          other_costs,
          total_cost
        ),
        event_attendance (
          id,
          registrant_responses,
          confirmations,
          attendees,
          clients_from_event
        ),
        event_appointments (
          id,
          set_at_event,
          set_after_event,
          first_appointment_attended,
          first_appointment_no_shows,
          second_appointment_attended,
          not_qualified
        ),
        financial_production (
          id,
          annuity_premium,
          life_insurance_premium,
          aum,
          financial_planning,
          annuities_sold,
          life_policies_sold,
          annuity_commission,
          life_insurance_commission,
          aum_fees,
          aum_accounts_opened,
          financial_plans_sold,
          total
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('[fetchAllEvents] Error fetching events:', error);
      return [];
    }

    console.log('[fetchAllEvents] Raw events fetched:', events?.length || 0);

    // Ensure all events have attendance records
    console.log('[fetchAllEvents] Ensuring attendance records');
    await ensureAttendanceRecords(supabase, events);

    return events.map(event => {
      // Helper to get latest record by date
      function getLatest(records: any[]) {
        if (!Array.isArray(records) || records.length === 0) return {};
        return [...records].sort((a, b) => {
          const aDate = a.updated_at ? Number(new Date(a.updated_at)) : (a.created_at ? Number(new Date(a.created_at)) : 0);
          const bDate = b.updated_at ? Number(new Date(b.updated_at)) : (b.created_at ? Number(new Date(b.created_at)) : 0);
          return bDate - aDate;
        })[0];
      }

      // Flatten related arrays to single objects
      const latestAttendance = Array.isArray(event.event_attendance) ? event.event_attendance[0] : event.event_attendance;
      const latestFinancial = Array.isArray(event.financial_production) ? event.financial_production[0] : event.financial_production;
      const latestExpenses = Array.isArray(event.marketing_expenses) ? event.marketing_expenses[0] : event.marketing_expenses;
      const latestAppointments = Array.isArray(event.event_appointments) ? event.event_appointments[0] : event.event_appointments;

      // Calculate revenue from commissions and fees (not premiums)
      const annuityCommission = typeof latestFinancial?.annuity_commission === 'number' ? latestFinancial.annuity_commission : 0
      const lifeInsuranceCommission = typeof latestFinancial?.life_insurance_commission === 'number' ? latestFinancial.life_insurance_commission : 0
      const aumFees = typeof latestFinancial?.aum_fees === 'number' ? latestFinancial.aum_fees : 0
      const financialPlanning = typeof latestFinancial?.financial_planning === 'number' ? latestFinancial.financial_planning : 0
      
      const total = annuityCommission + lifeInsuranceCommission + aumFees + financialPlanning
      


      // Calculate day of week from event.date
      const eventDateObj = event.date ? (() => {
        try {
          const [year, month, day] = event.date.split('-').map(Number)
          return new Date(year, month - 1, day)
        } catch {
          return null
        }
      })() : null;
      const dayOfWeek = eventDateObj && !isNaN(eventDateObj.getTime())
        ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" })
        : "N/A";
      
      // Debug logging for date parsing
      if (event.date) {
        console.log('Date parsing debug:', {
          originalDate: event.date,
          parsedDate: eventDateObj,
          isValid: eventDateObj && !isNaN(eventDateObj.getTime()),
          dayOfWeek
        });
      }

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        dayOfWeek,
        location: event.location,
        marketing_type: event.marketing_type,
        topic: event.topic,
        status: event.status,
        time: event.time,
        age_range: event.age_range,
        mile_radius: event.mile_radius,
        income_assets: event.income_assets,
        created_at: event.created_at,
        updated_at: event.updated_at,
        clients: typeof latestAttendance?.clients_from_event === 'number' ? latestAttendance.clients_from_event : 0,
        attendees: typeof latestAttendance?.attendees === 'number' ? latestAttendance.attendees : 0,
        revenue: total,
        attendance: latestAttendance,
        financial_production: latestFinancial ? { ...latestFinancial, total } : undefined,
        marketing_expenses: latestExpenses,
        event_appointments: latestAppointments,
        marketing_audience: event.marketing_audience
      };
    });
  } catch (error) {
    console.error('Error in fetchAllEvents:', error);
    return [];
  }
}

// Comprehensive dashboard data fetching that handles both schemas
export async function fetchDashboardData(userId: string, eventId?: string) {
  if (!userId) {
    console.error("fetchDashboardData called without userId")
    return null
  }

  try {
    const supabase = await createAdminClient()

    console.log(`Fetching dashboard data for user ${userId}${eventId ? ` and event ${eventId}` : ""}`)

    // Get the event with all related data in a single query
    let eventQuery = supabase
      .from("marketing_events")
      .select(`
        id,
        name,
        date,
        location,
        marketing_type,
        topic,
        status,
        time,
        age_range,
        mile_radius,
        income_assets,
        marketing_audience,
        marketing_expenses (
          id,
          advertising_cost,
          food_venue_cost,
          other_costs,
          total_cost
        ),
        event_attendance (
          id,
          registrant_responses,
          confirmations,
          attendees,
          clients_from_event,
          plate_lickers
        ),
        event_appointments (
          id,
          set_at_event,
          set_after_event,
          first_appointment_attended,
          first_appointment_no_shows,
          second_appointment_attended,
          not_qualified
        ),
        financial_production (
          id,
          annuity_premium,
          life_insurance_premium,
          aum,
          financial_planning,
          annuities_sold,
          life_policies_sold,
          annuity_commission,
          life_insurance_commission,
          aum_fees
        )
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
      console.log("No event found")
      return null
    }

    // Ensure all related records exist
    const [expenses, attendance, appointments, financial] = await Promise.all([
      ensureRecord(supabase, 'marketing_expenses', event.id, {
        advertising_cost: 0,
        food_venue_cost: 0,
        other_costs: 0,
        total_cost: 0
      }),
      ensureRecord(supabase, 'event_attendance', event.id, {
        registrant_responses: 0,
        confirmations: 0,
        attendees: 0,
        clients_from_event: 0,
        plate_lickers: 0
      }),
      ensureRecord(supabase, 'event_appointments', event.id, {
        set_at_event: 0,
        set_after_event: 0,
        first_appointment_attended: 0,
        first_appointment_no_shows: 0,
        second_appointment_attended: 0,
        not_qualified: 0
      }),
      ensureRecord(supabase, 'financial_production', event.id, {
        annuity_premium: 0,
        life_insurance_premium: 0,
        aum: 0,
        financial_planning: 0,
        annuities_sold: 0,
        life_policies_sold: 0,
        annuity_commission: 0,
        life_insurance_commission: 0,
        aum_fees: 0,
        aum_accounts_opened: 0,
        financial_plans_sold: 0
      })
    ])

    // Log plate licker data
    console.log('Plate Licker Data:', { plateLickers: attendance.plate_lickers, attendees: attendance.attendees });

    // Calculate totals and metrics
    const totalExpenses = expenses.total_cost || 0
    
    // Calculate revenue from commissions and fees (not premiums)
    const totalIncome = (financial.annuity_commission || 0) + 
                       (financial.life_insurance_commission || 0) + 
                       (financial.aum_fees || 0) + 
                       (financial.financial_planning || 0)

    const roi = totalExpenses > 0 
      ? Math.round(((totalIncome - totalExpenses) / totalExpenses) * 100) 
      : totalIncome > 0 
        ? 9999 // Show high ROI when there's income but no expenses
        : 0

    // Calculate day of week from event.date
    const eventDateObj = event.date ? (() => {
      try {
        const [year, month, day] = event.date.split('-').map(Number)
        return new Date(year, month - 1, day)
      } catch {
        return null
      }
    })() : null
    const dayOfWeek = eventDateObj
      ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" })
      : "N/A"

    // Prepare consistent dashboard data structure
    const dashboardData = {
      eventId: event.id,
      eventDetails: {
        name: event.name,
        date: event.date,
        dayOfWeek,
        location: event.location,
        marketing_type: event.marketing_type,
        topic: event.topic,
        age_range: event.age_range,
        mile_radius: Number(event.mile_radius),
        income_assets: event.income_assets,
        time: event.time,
        status: event.status,
        marketing_audience: event.marketing_audience
      },
      roi: {
        value: roi,
        trend: [roi]
      },
      writtenBusiness: totalIncome,
      income: {
        total: totalIncome,
        breakdown: {
          annuityCommission: financial.annuity_commission || 0,
          lifeInsuranceCommission: financial.life_insurance_commission || 0,
          aumFees: financial.aum_fees || 0,
          financialPlanning: financial.financial_planning || 0
        }
      },
      conversionRate: {
        value: attendance.attendees > 0 ? Math.round((attendance.clients_from_event / attendance.attendees) * 100) : 0,
        attendees: attendance.attendees,
        clients: attendance.clients_from_event
      },
      marketingExpenses: {
        total: totalExpenses,
        advertising: expenses.advertising_cost || 0,
        foodVenue: expenses.food_venue_cost || 0,
        other: expenses.other_costs || 0
      },
      topicOfMarketing: event.topic,
      attendance: {
        registrantResponses: attendance.registrant_responses,
        confirmations: attendance.confirmations,
        attendees: attendance.attendees,
        responseRate: attendance.registrant_responses > 0 ? Math.round((attendance.confirmations / attendance.registrant_responses) * 100) : 0,
        clients_from_event: attendance.clients_from_event,
        plate_lickers: attendance.plate_lickers
      },
      clientAcquisition: {
        expensePerRegistrant: attendance.registrant_responses > 0 ? totalExpenses / attendance.registrant_responses : 0,
        expensePerConfirmation: attendance.confirmations > 0 ? totalExpenses / attendance.confirmations : 0,
        expensePerAttendee: attendance.attendees > 0 ? totalExpenses / attendance.attendees : 0,
        totalCost: totalExpenses
      },
      conversionEfficiency: {
        registrationToAttendance: attendance.registrant_responses > 0 ? Math.round((attendance.attendees / attendance.registrant_responses) * 100) : 0,
        attendanceToClient: (() => {
          console.log('Debug attendance to client conversion:', {
            attendees: attendance.attendees,
            clients_from_event: attendance.clients_from_event,
            calculation: attendance.attendees > 0 ? Math.round((attendance.clients_from_event / attendance.attendees) * 100) : 0
          });
          return attendance.attendees > 0 ? Math.round((attendance.clients_from_event / attendance.attendees) * 100) : 0;
        })(),
        overall: attendance.registrant_responses > 0 ? Math.round((attendance.clients_from_event / attendance.registrant_responses) * 100) : 0
      },
      appointments: {
        setAtEvent: appointments.set_at_event,
        setAfterEvent: appointments.set_after_event,
        firstAppointmentAttended: appointments.first_appointment_attended,
        firstAppointmentNoShows: appointments.first_appointment_no_shows,
        secondAppointmentAttended: appointments.second_appointment_attended,
        notQualified: appointments.not_qualified
      },
      productsSold: {
        annuities: financial.annuities_sold || 0,
        lifePolicies: financial.life_policies_sold || 0
      },
      financialProduction: {
        annuity_premium: financial.annuity_premium || 0,
        life_insurance_premium: financial.life_insurance_premium || 0,
        aum: financial.aum || 0,
        financial_planning: financial.financial_planning || 0,
        total: totalIncome,
        annuities_sold: financial.annuities_sold || 0,
        life_policies_sold: financial.life_policies_sold || 0,
        annuity_commission: financial.annuity_commission || 0,
        life_insurance_commission: financial.life_insurance_commission || 0,
        aum_fees: financial.aum_fees || 0,
        aum_accounts_opened: financial.aum_accounts_opened || 0,
        financial_plans_sold: financial.financial_plans_sold || 0
      }
    }

    console.log('Dashboard data prepared:', dashboardData)
    return dashboardData
  } catch (error) {
    console.error("Error in fetchDashboardData:", error)
    return null
  }
}

// Helper function to ensure a record exists
async function ensureRecord(supabase: any, table: string, eventId: string, defaultData: any) {
  const { data: existing } = await supabase
    .from(table)
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle()

  if (existing) {
    return existing
  }

  const { data: newRecord, error } = await supabase
    .from(table)
    .insert([{ event_id: eventId, ...defaultData }])
    .select()
    .single()

  if (error) {
    console.error(`Error creating ${table} record:`, error)
    return defaultData
  }

  console.log('Inserted event:', newRecord);
  return newRecord
}

// Create a new marketing event with all related data
export async function createEvent(userId: string, eventData: any) {
  try {
    console.log('Creating event with data:', { userId, eventData })
    
    if (!userId) {
      console.error("No user ID provided")
      return { success: false, error: "User ID is required" }
    }

    const supabase = await createAdminClient()
    console.log('Supabase admin client created')

    // Destructure relatedData from eventData
    const { relatedData, ...eventFields } = eventData

    // Ensure marketing_audience is a number
    if (typeof eventFields.marketing_audience === "string") {
      eventFields.marketing_audience = parseInt(eventFields.marketing_audience, 10);
    }

    // 1. Create the event (only event fields, not relatedData)
    console.log('Saving eventFields:', eventFields);
    const { data: event, error: eventError } = await supabase
      .from('marketing_events')
      .insert([{ user_id: userId, ...eventFields }])
      .select()
      .single()

    if (eventError || !event) {
      console.error("Error creating event:", eventError)
      return { success: false, error: eventError?.message || "Failed to create event" }
    }

    console.log('Event created successfully:', event)

    // 2. Create related records (attendance, expenses, appointments, financials)
    const { attendance, expenses, appointments, financialProduction } = relatedData || {}

    // Create all related records in parallel
    const [attendanceResult, expensesResult, appointmentsResult, financialResult] = await Promise.all([
      // Attendance
      attendance ? (async () => {
        try {
          const { error } = await supabase
            .from('event_attendance')
            .insert([{ event_id: event.id, ...attendance }])
          return { success: !error, error }
        } catch (error) {
          return { success: false, error }
        }
      })() : Promise.resolve({ success: true, error: null }),

      // Expenses
      expenses ? (async () => {
        try {
          const { error } = await supabase
            .from('marketing_expenses')
            .insert([{ event_id: event.id, ...expenses }])
          return { success: !error, error }
        } catch (error) {
          return { success: false, error }
        }
      })() : Promise.resolve({ success: true, error: null }),

      // Appointments
      appointments ? (async () => {
        try {
          const { error } = await supabase
            .from('event_appointments')
            .insert([{ event_id: event.id, ...appointments }])
          return { success: !error, error }
        } catch (error) {
          return { success: false, error }
        }
      })() : Promise.resolve({ success: true, error: null }),

      // Financial Production
      financialProduction ? (async () => {
        try {
          const { error } = await supabase
            .from('financial_production')
            .insert([{ event_id: event.id, ...financialProduction }])
          return { success: !error, error }
        } catch (error) {
          return { success: false, error }
        }
      })() : Promise.resolve({ success: true, error: null })
    ])

    // Check if any of the related records failed to create
    if (!attendanceResult.success || !expensesResult.success || !appointmentsResult.success || !financialResult.success) {
      console.error("Error creating related records:", {
        attendance: attendanceResult.error,
        expenses: expensesResult.error,
        appointments: appointmentsResult.error,
        financial: financialResult.error
      })
      return { success: false, error: "Failed to create some event details" }
    }

    return { success: true, eventId: event.id }
  } catch (error) {
    console.error("Error in createEvent:", error)
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

    // Check if the event exists in marketing_events
    const { data: marketingEvent, error: marketingEventError } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle()

    if (marketingEventError) {
      console.error("Error checking marketing_events:", marketingEventError)
      return { success: false, error: marketingEventError.message }
    }

    if (!marketingEvent) {
      console.error("Event not found in marketing_events table")
      return { success: false, error: "Event not found" }
    }

    // Extract related data
    const { relatedData, ...coreEventData } = eventData

    // Update event core data
    if (Object.keys(coreEventData).length > 0) {
      // Map type to marketing_type if provided
      const marketingEventData = {
        ...coreEventData,
        marketing_type: coreEventData.type, // Map type to marketing_type
      }

      // Remove type from the data to avoid conflicts
      if (marketingEventData.type) {
        delete marketingEventData.type
      }

      // Ensure marketing_audience is a number
      if (typeof marketingEventData.marketing_audience === "string") {
        marketingEventData.marketing_audience = parseInt(marketingEventData.marketing_audience, 10);
      }

      console.log('Saving marketingEventData:', marketingEventData);
      const { error: eventError } = await supabase
        .from("marketing_events")
        .update(marketingEventData)
        .eq("id", eventId)

      if (eventError) {
        console.error("Error updating marketing_events:", eventError)
        return { success: false, error: eventError.message }
      }
    }

    // Update related data if present
    if (relatedData) {
      // Update expenses
      if (relatedData.expenses) {
        // First check if expenses record exists
        const { data: existingExpenses } = await supabase
          .from("marketing_expenses")
          .select("id")
          .eq("event_id", eventId)
          .maybeSingle()

        if (existingExpenses) {
          // Update existing record
          const { error: expensesError } = await supabase
            .from("marketing_expenses")
            .update(relatedData.expenses)
            .eq("event_id", eventId)

          if (expensesError) {
            console.error("Error updating expenses:", expensesError)
            return { success: false, error: expensesError.message }
          }
        } else {
          // Insert new record
          const { error: expensesError } = await supabase
            .from("marketing_expenses")
            .insert([{ event_id: eventId, ...relatedData.expenses }])

          if (expensesError) {
            console.error("Error inserting expenses:", expensesError)
            return { success: false, error: expensesError.message }
          }
        }
      }

      // Update attendance
      if (relatedData.attendance) {
        // First check if attendance record exists
        const { data: existingAttendance } = await supabase
          .from("event_attendance")
          .select("id")
          .eq("event_id", eventId)
          .maybeSingle()

        if (existingAttendance) {
          // Update existing record
          console.log('Updating existing attendance record with data:', {
            event_id: eventId,
            ...relatedData.attendance,
            plate_lickers: relatedData.attendance.plate_lickers
          });
          const { error: attendanceError } = await supabase
            .from("event_attendance")
            .update({
              ...relatedData.attendance,
              plate_lickers: relatedData.attendance.plate_lickers
            })
            .eq("event_id", eventId)

          if (attendanceError) {
            console.error("Error updating attendance:", attendanceError)
            return { success: false, error: attendanceError.message }
          }
        } else {
          // Insert new record
          console.log('Inserting new attendance record with data:', {
            event_id: eventId,
            ...relatedData.attendance,
            plate_lickers: relatedData.attendance.plate_lickers
          });
          const { error: attendanceError } = await supabase
            .from("event_attendance")
            .insert([{
              event_id: eventId,
              ...relatedData.attendance,
              plate_lickers: relatedData.attendance.plate_lickers
            }])

          if (attendanceError) {
            console.error("Error inserting attendance:", attendanceError)
            return { success: false, error: attendanceError.message }
          }
        }
      }

      // Update appointments
      if (relatedData.appointments) {
        // First check if appointments record exists
        const { data: existingAppointments } = await supabase
          .from("event_appointments")
          .select("id")
          .eq("event_id", eventId)
          .maybeSingle()

        if (existingAppointments) {
          // Update existing record
          const { error: appointmentsError } = await supabase
            .from("event_appointments")
            .update(relatedData.appointments)
            .eq("event_id", eventId)

          if (appointmentsError) {
            console.error("Error updating appointments:", appointmentsError)
            return { success: false, error: appointmentsError.message }
          }
        } else {
          // Insert new record
          const { error: appointmentsError } = await supabase
            .from("event_appointments")
            .insert([{ event_id: eventId, ...relatedData.appointments }])

          if (appointmentsError) {
            console.error("Error inserting appointments:", appointmentsError)
            return { success: false, error: appointmentsError.message }
          }
        }
      }

      // Update financial production
      if (relatedData.financialProduction) {
        // First check if financial production record exists
        const { data: existingFinancial } = await supabase
          .from("financial_production")
          .select("id")
          .eq("event_id", eventId)
          .maybeSingle()

        if (existingFinancial) {
          // Update existing record
          const { error: financialError } = await supabase
            .from("financial_production")
            .update(relatedData.financialProduction)
            .eq("event_id", eventId)

          if (financialError) {
            console.error("Error updating financial production:", financialError)
            return { success: false, error: financialError.message }
          }
        } else {
          // Insert new record
          const { error: financialError } = await supabase
            .from("financial_production")
            .insert([{ event_id: eventId, ...relatedData.financialProduction }])

          if (financialError) {
            console.error("Error inserting financial production:", financialError)
            return { success: false, error: financialError.message }
          }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateEvent:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
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
  plate_lickers: number
}) {
  try {
    const supabase = await createAdminClient()
    console.log('Saving event attendance data:', data);
    const { data: result, error } = await supabase
      .from("event_attendance")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    console.log('Event attendance saved successfully:', result);
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
  not_qualified: number
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
      .from("financial_production")
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
