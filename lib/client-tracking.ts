"use client"

import { createClient } from "@/lib/supabase/client"
import { advisorBasecampService } from "@/lib/advisor-basecamp"
import type { User } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

export type ClientSource = "new" | "current_book" | "referral"

export interface EventClient {
  id?: string
  event_id: string
  client_name: string
  close_date: string
  annuity_premium: number
  annuity_commission: number
  annuity_commission_percentage: number | null
  life_insurance_premium: number
  life_insurance_commission: number
  life_insurance_commission_percentage: number | null
  aum_amount: number
  aum_fee_percentage: number | null
  aum_fees: number
  financial_planning_fee: number
  notes?: string | null
  client_source?: ClientSource | null
  created_at?: string
  updated_at?: string
}

export interface EventClientInsert {
  event_id: string
  client_name: string
  close_date: string
  annuity_premium?: number
  annuity_commission?: number
  annuity_commission_percentage?: number | null
  life_insurance_premium?: number
  life_insurance_commission?: number
  life_insurance_commission_percentage?: number | null
  aum_amount?: number
  aum_fee_percentage?: number | null
  aum_fees?: number
  financial_planning_fee?: number
  notes?: string | null
  client_source?: ClientSource | null
}

export interface EventClientUpdate {
  client_name?: string
  close_date?: string
  annuity_premium?: number
  annuity_commission?: number
  annuity_commission_percentage?: number | null
  life_insurance_premium?: number
  life_insurance_commission?: number
  life_insurance_commission_percentage?: number | null
  aum_amount?: number
  aum_fee_percentage?: number | null
  aum_fees?: number
  financial_planning_fee?: number
  notes?: string | null
  client_source?: ClientSource | null
}

export interface AggregatedEventData {
  appointments_booked: number
  marketing_expenses: number
  annuity_sales: number
  aum_sales: number
  life_sales: number
  new_clients: number
  current_book_closes: number
  client_names: string[]
}

export interface ClientFilters {
  year?: number
  dateRange?: {
    from?: Date
    to?: Date
  }
  eventType?: string
  productType?: 'annuity' | 'life' | 'aum' | 'financial_planning'
}

/**
 * Get clients for a specific event
 */
export async function getClientsByEvent(eventId: string): Promise<EventClient[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("event_clients")
      .select("*")
      .eq("event_id", eventId)
      .order("close_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error("Error fetching clients by event:", error)
    throw error
  }
}

/**
 * Get all clients for a user, optionally filtered by year and other filters
 */
export async function getClientsByUser(
  userId: string,
  year?: number,
  filters?: ClientFilters
): Promise<EventClient[]> {
  try {
    const supabase = createClient()
    
    // First, get all events for the user
    const { data: events, error: eventsError } = await supabase
      .from("marketing_events")
      .select("id, date, marketing_type")
      .eq("user_id", userId)

    if (eventsError) throw eventsError
    if (!events || events.length === 0) return []

    const eventIds = events.map((e: any) => e.id)

    // Build query for clients
    let query = supabase
      .from("event_clients")
      .select("*")
      .in("event_id", eventIds)

    // Apply year filter
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte("close_date", startDate).lte("close_date", endDate)
    }

    // Apply date range filter
    if (filters?.dateRange?.from) {
      query = query.gte("close_date", filters.dateRange.from.toISOString().split('T')[0])
    }
    if (filters?.dateRange?.to) {
      query = query.lte("close_date", filters.dateRange.to.toISOString().split('T')[0])
    }

    const { data, error } = await query.order("close_date", { ascending: false })

    if (error) throw error

    let clients = data || []

    // Apply event type filter
    if (filters?.eventType) {
      const filteredEventIds = events
        .filter((e: any) => e.marketing_type === filters.eventType)
        .map((e: any) => e.id)
      clients = clients.filter((c: any) => filteredEventIds.includes(c.event_id))
    }

    // Apply product type filter
    if (filters?.productType) {
      clients = clients.filter((c: any) => {
        switch (filters.productType) {
          case 'annuity':
            return c.annuity_premium > 0
          case 'life':
            return c.life_insurance_premium > 0
          case 'aum':
            return c.aum_amount > 0
          case 'financial_planning':
            return c.financial_planning_fee > 0
          default:
            return true
        }
      })
    }

    return clients
  } catch (error) {
    logger.error("Error fetching clients by user:", error)
    throw error
  }
}

/**
 * Add a new client
 */
export async function addClient(clientData: EventClientInsert): Promise<EventClient> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("event_clients")
      .insert({
        ...clientData,
        annuity_premium: clientData.annuity_premium || 0,
        annuity_commission: clientData.annuity_commission || 0,
        life_insurance_premium: clientData.life_insurance_premium || 0,
        life_insurance_commission: clientData.life_insurance_commission || 0,
        aum_amount: clientData.aum_amount || 0,
        aum_fees: clientData.aum_fees || 0,
        financial_planning_fee: clientData.financial_planning_fee || 0,
        client_source: clientData.client_source ?? "new",
      })
      .select()
      .single()

    if (error) throw error

    // Sync to monthly entry
    try {
      logger.log("Syncing client to monthly entry:", { eventId: clientData.event_id, closeDate: clientData.close_date })
      await syncClientToMonthlyEntry(clientData.event_id, clientData.close_date)
      logger.log("Successfully synced client to monthly entry")
    } catch (syncError) {
      logger.error("Error syncing to monthly entry (non-blocking):", syncError)
    }

    return data
  } catch (error) {
    logger.error("Error adding client:", error)
    throw error
  }
}

/**
 * Update a client
 */
export async function updateClient(
  clientId: string,
  clientData: EventClientUpdate
): Promise<EventClient> {
  try {
    const supabase = createClient()
    
    // Get the current client to get event_id and close_date
    const { data: currentClient } = await supabase
      .from("event_clients")
      .select("event_id, close_date")
      .eq("id", clientId)
      .single()

    const { data, error } = await supabase
      .from("event_clients")
      .update(clientData)
      .eq("id", clientId)
      .select()
      .single()

    if (error) throw error

    // Sync to monthly entry using the updated close_date or original
    const closeDate = clientData.close_date || currentClient?.close_date
    if (currentClient && closeDate) {
      try {
        await syncClientToMonthlyEntry(currentClient.event_id, closeDate)
      } catch (syncError) {
        logger.error("Error syncing to monthly entry (non-blocking):", syncError)
      }
    }

    return data
  } catch (error) {
    logger.error("Error updating client:", error)
    throw error
  }
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string): Promise<void> {
  try {
    const supabase = createClient()
    
    // Get the client data before deleting to sync monthly entry
    const { data: client } = await supabase
      .from("event_clients")
      .select("event_id, close_date")
      .eq("id", clientId)
      .single()

    const { error } = await supabase
      .from("event_clients")
      .delete()
      .eq("id", clientId)

    if (error) throw error

    // Sync to monthly entry to recalculate after deletion
    if (client && client.close_date) {
      try {
        await syncClientToMonthlyEntry(client.event_id, client.close_date)
      } catch (syncError) {
        logger.error("Error syncing to monthly entry (non-blocking):", syncError)
      }
    }
  } catch (error) {
    logger.error("Error deleting client:", error)
    throw error
  }
}

/**
 * Sync client data to monthly entry in advisor basecamp
 * This aggregates all clients for the month and updates the monthly entry
 */
export async function syncClientToMonthlyEntry(
  eventId: string,
  clientCloseDate: string
): Promise<void> {
  try {
    const supabase = createClient()
    
    // Get the event to get user_id
    const { data: event, error: eventError } = await supabase
      .from("marketing_events")
      .select("user_id")
      .eq("id", eventId)
      .single()

    if (eventError || !event) {
      logger.error("Error fetching event:", eventError)
      return
    }

    const userId = event.user_id

    // Get the current user to pass to advisorBasecampService
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      logger.error("User mismatch or not authenticated")
      return
    }

    // Parse the close_date to get month_year (YYYY-MM format)
    // Handle both YYYY-MM-DD and other date formats
    let closeDate: Date
    if (clientCloseDate.includes('-')) {
      const [yearStr, monthStr] = clientCloseDate.split('-')
      closeDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
    } else {
      closeDate = new Date(clientCloseDate)
    }
    
    if (isNaN(closeDate.getTime())) {
      logger.error("Invalid close_date format:", clientCloseDate)
      return
    }
    
    const year = closeDate.getFullYear()
    const month = String(closeDate.getMonth() + 1).padStart(2, '0')
    const month_year = `${year}-${month}`
    
    console.log("Parsed month_year:", { clientCloseDate, month_year, year, month })

    // Get all clients for this month for this user
    const startDate = `${year}-${month}-01`
    const lastDay = new Date(year, parseInt(month), 0).getDate()
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

    // First get all event IDs for this user
    const { data: userEvents, error: eventsError } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("user_id", userId)

    if (eventsError || !userEvents) {
      logger.error("Error fetching user events:", eventsError)
      return
    }

    const eventIds = userEvents.map((e: any) => e.id)

    // Get all clients for this month from these events
    const { data: allClients, error: clientsError } = await supabase
      .from("event_clients")
      .select(`
        id,
        client_name,
        close_date,
        annuity_premium,
        annuity_commission,
        life_insurance_premium,
        life_insurance_commission,
        aum_amount,
        aum_fees,
        financial_planning_fee,
        notes,
        event_id,
        client_source
      `)
      .gte("close_date", startDate)
      .lte("close_date", endDate)
      .in("event_id", eventIds)

    if (clientsError) {
      logger.error("Error fetching clients for month:", clientsError)
      return
    }

    const clientList = allClients || []
    const newCount = clientList.filter((c: any) => (c.client_source || "new").toString().toLowerCase() !== "current_book").length
    const currentBookCount = clientList.filter((c: any) => (c.client_source || "").toString().toLowerCase() === "current_book").length

    // Aggregate the data
    const aggregated = {
      new_clients: newCount,
      current_book_closes: currentBookCount,
      annuity_sales: clientList.reduce((sum: number, c: any) => sum + (c.annuity_premium || 0), 0) || 0,
      aum_sales: clientList.reduce((sum: number, c: any) => sum + (c.aum_amount || 0), 0) || 0,
      life_sales: clientList.reduce((sum: number, c: any) => sum + (c.life_insurance_premium || 0), 0) || 0,
    }

    // Build client names and notes list
    const clientEntries = clientList.map((c: any) => {
      const parts = [c.client_name]
      if (c.notes) {
        parts.push(`(${c.notes})`)
      }
      return parts.join(' ')
    }) || []

    const clientNamesText = clientEntries.length > 0 
      ? `Clients from events: ${clientEntries.join(', ')}`
      : ''

    // Get existing monthly entry to preserve other fields
    const { data: existingEntry, error: entryError } = await supabase
      .from("monthly_data_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", month_year)
      .maybeSingle()

    // Handle notes - append client info to existing notes if they exist
    let notesText = clientNamesText
    if (existingEntry?.notes && clientNamesText) {
      // Append to existing notes, avoiding duplicates
      const existingNotes = existingEntry.notes
      if (!existingNotes.includes("Clients from events:")) {
        notesText = existingNotes + "\n\n" + clientNamesText
      } else {
        // Update the clients list in existing notes
        notesText = existingNotes.replace(/Clients from events:.*/, clientNamesText)
      }
    } else if (existingEntry?.notes && !clientNamesText) {
      notesText = existingEntry.notes
    }

    // Prepare the entry data
    // Use aggregated event data if entry doesn't exist or if existing values are 0 (meaning no manual entry)
    // This prevents overwriting manual entries with event data, but populates from events when appropriate
    // Convert existing values to numbers to handle string "0" cases
    const existingNewClients = Number(existingEntry?.new_clients || 0)
    const existingCurrentBookCloses = Number((existingEntry as any)?.current_book_closes ?? 0)
    const existingAnnuitySales = parseFloat(String(existingEntry?.annuity_sales || 0)) || 0
    const existingAumSales = parseFloat(String(existingEntry?.aum_sales || 0)) || 0
    const existingLifeSales = parseFloat(String(existingEntry?.life_sales || 0)) || 0

    const entryData = {
      month_year,
      new_clients: (existingEntry && existingNewClients > 0)
        ? existingNewClients
        : aggregated.new_clients,
      current_book_closes: (existingEntry && existingCurrentBookCloses > 0)
        ? existingCurrentBookCloses
        : aggregated.current_book_closes,
      new_appointments: Number(existingEntry?.new_appointments || 0) || 0,
      new_leads: Number(existingEntry?.new_leads || 0) || 0,
      annuity_sales: (existingEntry && existingAnnuitySales > 0)
        ? existingAnnuitySales
        : aggregated.annuity_sales,
      aum_sales: (existingEntry && existingAumSales > 0)
        ? existingAumSales
        : aggregated.aum_sales,
      life_sales: (existingEntry && existingLifeSales > 0)
        ? existingLifeSales
        : aggregated.life_sales,
      marketing_expenses: parseFloat(String(existingEntry?.marketing_expenses || 0)) || 0,
      notes: notesText || undefined
    }

    console.log("Syncing monthly entry:", { month_year, entryData, clientCount: aggregated.new_clients })

    // Create or update the monthly entry
    console.log("Calling advisorBasecampService.createMonthlyDataEntry with:", { user: user.id, entryData })
    const result = await advisorBasecampService.createMonthlyDataEntry(user as User, entryData)
    
    if (result.error) {
      logger.error("Error syncing to monthly entry:", result.error)
      // Don't throw - this is non-blocking
    } else {
      logger.log("Successfully synced client data to monthly entry:", result.data)
    }
  } catch (error) {
    logger.error("Error in syncClientToMonthlyEntry:", error)
    // Don't throw - this is non-blocking, errors are logged
  }
}

/**
 * Recalculate and update a monthly entry from event clients
 * This is useful when a monthly entry exists but has 0 values even though clients exist
 */
export async function recalculateMonthlyEntryFromEvents(
  userId: string,
  monthYear: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return { success: false, error: 'User mismatch or not authenticated' }
    }
    
    // Parse month_year to get year and month
    const [yearStr, monthStr] = monthYear.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    
    if (isNaN(year) || isNaN(month)) {
      return { success: false, error: 'Invalid month_year format' }
    }
    
    // Get aggregated data from events
    const eventData = await aggregateEventDataByMonth(userId, month, year)
    
    // Get existing entry
    const { data: existingEntry, error: entryError } = await supabase
      .from("monthly_data_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", monthYear)
      .maybeSingle()
    
    if (entryError) {
      logger.error("Error fetching existing entry:", entryError)
      return { success: false, error: entryError.message }
    }
    
    if (!existingEntry) {
      return { success: false, error: 'Monthly entry not found' }
    }
    
    // Convert existing values to numbers
    const existingNewClients = Number(existingEntry.new_clients || 0)
    const existingAnnuitySales = parseFloat(String(existingEntry.annuity_sales || 0)) || 0
    const existingAumSales = parseFloat(String(existingEntry.aum_sales || 0)) || 0
    const existingLifeSales = parseFloat(String(existingEntry.life_sales || 0)) || 0
    
    // Only update if existing values are 0 (preserve manual entries)
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    const existingCurrentBookCloses = Number((existingEntry as any)?.current_book_closes ?? 0)
    if (existingNewClients === 0 && eventData.new_clients > 0) {
      updateData.new_clients = eventData.new_clients
    }
    if (existingCurrentBookCloses === 0 && eventData.current_book_closes > 0) {
      updateData.current_book_closes = eventData.current_book_closes
    }
    if (existingAnnuitySales === 0 && eventData.annuity_sales > 0) {
      updateData.annuity_sales = eventData.annuity_sales
    }
    if (existingAumSales === 0 && eventData.aum_sales > 0) {
      updateData.aum_sales = eventData.aum_sales
    }
    if (existingLifeSales === 0 && eventData.life_sales > 0) {
      updateData.life_sales = eventData.life_sales
    }
    if (Number(existingEntry.new_appointments || 0) === 0 && eventData.appointments_booked > 0) {
      updateData.new_appointments = eventData.appointments_booked
    }
    if (parseFloat(String(existingEntry.marketing_expenses || 0)) === 0 && eventData.marketing_expenses > 0) {
      updateData.marketing_expenses = eventData.marketing_expenses
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 1) {
      const { error: updateError } = await supabase
        .from("monthly_data_entries")
        .update(updateData)
        .eq("id", existingEntry.id)
        .eq("user_id", userId)
      
      if (updateError) {
        logger.error("Error updating monthly entry:", updateError)
        return { success: false, error: updateError.message }
      }
      
      return { success: true }
    }
    
    return { success: true }
  } catch (error) {
    logger.error("Error recalculating monthly entry:", error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Aggregate all event data (appointments, expenses, clients) for a specific month.
 * - Appointments and marketing_expenses: tied to events that occurred in this month.
 * - Client sales/commissions (annuity_sales, aum_sales, life_sales, new_clients): tied to close_date,
 *   so they appear in the month the client was closed in the basecamp monthly data tab.
 */
export async function aggregateEventDataByMonth(
  userId: string,
  month: number,
  year: number
): Promise<AggregatedEventData> {
  try {
    const supabase = createClient()
    
    // Calculate month start and end dates
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

    // Get all events for the user (for client-by-close-date aggregation)
    const { data: allUserEvents, error: allEventsError } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("user_id", userId)

    if (allEventsError) throw allEventsError
    const allEventIds = (allUserEvents || []).map((e: any) => e.id)

    // Get events that occurred in this month (for appointments and expenses only)
    const { data: eventsThisMonth, error: eventsError } = await supabase
      .from("marketing_events")
      .select("id")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEnd)

    if (eventsError) throw eventsError
    const eventIdsThisMonth = (eventsThisMonth || []).map((e: any) => e.id)

    // Appointments and expenses: only from events that occurred in this month
    let appointments_booked = 0
    let marketing_expenses = 0
    if (eventIdsThisMonth.length > 0) {
      const { data: appointments } = await supabase
        .from("event_appointments")
        .select("set_at_event, set_after_event")
        .in("event_id", eventIdsThisMonth)
      appointments_booked = (appointments || []).reduce((sum: number, apt: any) => {
        return sum + (apt.set_at_event || 0) + (apt.set_after_event || 0)
      }, 0)

      const { data: expenses } = await supabase
        .from("marketing_expenses")
        .select("total_cost")
        .in("event_id", eventIdsThisMonth)
      marketing_expenses = (expenses || []).reduce((sum: number, exp: any) => {
        return sum + (exp.total_cost || 0)
      }, 0)
    }

    // Client data (sales/commissions): by close_date so they go to the month closed in basecamp monthly tab
    // Split by client_source: new = new clients, current_book = business from current book (existing clients)
    let annuity_sales = 0
    let aum_sales = 0
    let life_sales = 0
    let new_clients = 0
    let current_book_closes = 0
    let client_names: string[] = []
    if (allEventIds.length > 0) {
      const { data: clients, error: clientsError } = await supabase
        .from("event_clients")
        .select("client_name, annuity_premium, life_insurance_premium, aum_amount, client_source")
        .in("event_id", allEventIds)
        .gte("close_date", monthStart)
        .lte("close_date", monthEnd)

      if (clientsError) throw clientsError
      const clientList = clients || []
      annuity_sales = clientList.reduce((sum: number, c: any) => sum + (c.annuity_premium || 0), 0)
      aum_sales = clientList.reduce((sum: number, c: any) => sum + (c.aum_amount || 0), 0)
      life_sales = clientList.reduce((sum: number, c: any) => sum + (c.life_insurance_premium || 0), 0)
      client_names = Array.from(new Set(clientList.map((c: any) => c.client_name).filter(Boolean))) as string[]
      clientList.forEach((c: any) => {
        const source = (c.client_source || "new").toLowerCase()
        if (source === "current_book") current_book_closes += 1
        else new_clients += 1
      })
    }

    return {
      appointments_booked,
      marketing_expenses,
      annuity_sales,
      aum_sales,
      life_sales,
      new_clients,
      current_book_closes,
      client_names
    }
  } catch (error) {
    logger.error("Error aggregating event data by month:", error)
    throw error
  }
}

/**
 * Get YTD (Year-to-Date) summary for a user
 */
export async function getYTDSummary(userId: string, year: number): Promise<{
  total_clients: number
  total_annuity: number
  total_life: number
  total_aum: number
  total_financial_planning: number
  total_value: number
  average_deal_size: number
  monthly_breakdown: Array<{
    month: number
    clients: number
    value: number
  }>
}> {
  try {
    const clients = await getClientsByUser(userId, year)
    
    const total_clients = clients.length
    const total_annuity = clients.reduce((sum, c) => sum + (c.annuity_premium || 0), 0)
    const total_life = clients.reduce((sum, c) => sum + (c.life_insurance_premium || 0), 0)
    const total_aum = clients.reduce((sum, c) => sum + (c.aum_amount || 0), 0)
    const total_financial_planning = clients.reduce((sum, c) => sum + (c.financial_planning_fee || 0), 0)
    const total_annuity_commission = clients.reduce((sum, c) => sum + (c.annuity_commission || 0), 0)
    const total_life_commission = clients.reduce((sum, c) => sum + (c.life_insurance_commission || 0), 0)
    const total_value = total_annuity + total_life + total_aum + total_financial_planning
    const average_deal_size = total_clients > 0 ? total_value / total_clients : 0

    // Monthly breakdown
    const monthlyData = new Map<number, { clients: number; value: number }>()
    for (let month = 1; month <= 12; month++) {
      monthlyData.set(month, { clients: 0, value: 0 })
    }

    clients.forEach(client => {
      const closeDate = new Date(client.close_date)
      const month = closeDate.getMonth() + 1
      if (closeDate.getFullYear() === year) {
        const current = monthlyData.get(month) || { clients: 0, value: 0 }
        monthlyData.set(month, {
          clients: current.clients + 1,
          value: current.value + (client.annuity_premium || 0) + (client.life_insurance_premium || 0) + 
                 (client.aum_amount || 0) + (client.financial_planning_fee || 0)
        })
      }
    })

    const monthly_breakdown = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data
    }))

    return {
      total_clients,
      total_annuity,
      total_life,
      total_aum,
      total_financial_planning,
      total_value,
      average_deal_size,
      monthly_breakdown
    }
  } catch (error) {
    logger.error("Error getting YTD summary:", error)
    throw error
  }
}


