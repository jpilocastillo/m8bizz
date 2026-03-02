/**
 * Build analytics dashboard data from a list of events (from fetchAllEvents).
 * Used by both the main analytics page (server) and admin view-as analytics (client).
 */
export function buildAnalyticsDataFromEvents(events: any[]) {
  if (!events || events.length === 0) {
    return {
      summary: {
        totalEvents: 0,
        totalAttendees: 0,
        avgAttendees: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        overallROI: 0,
        totalClients: 0,
        overallConversionRate: 0,
        totalAppointmentsSet: 0,
        totalAppointmentsMade: 0,
        totalRegistrants: 0,
        totalPlateLickers: 0,
        totalFirstAppointmentNoShows: 0,
        totalNotQualified: 0,
      },
      events: [],
      monthlyData: [],
      metricsByType: [],
    }
  }

  const summary = {
    totalEvents: events.length,
    totalAttendees: events.reduce((sum, e) => sum + (e.attendance?.attendees || 0), 0),
    avgAttendees: 0,
    totalRevenue: events.reduce((sum, e) => {
      const p = (e.financial_production?.aum_fees || 0) + (e.financial_production?.annuity_commission || 0) + (e.financial_production?.life_insurance_commission || 0) + (e.financial_production?.financial_planning || 0)
      return sum + p
    }, 0),
    totalExpenses: events.reduce((sum, e) => sum + (e.marketing_expenses?.total_cost || 0), 0),
    totalProfit: 0,
    overallROI: 0,
    totalClients: events.reduce((sum, e) => sum + (e.attendance?.clients_from_event || 0), 0),
    overallConversionRate: 0,
    totalAppointmentsSet: events.reduce((sum, e) => sum + (e.event_appointments?.set_at_event || 0) + (e.event_appointments?.set_after_event || 0), 0),
    totalAppointmentsMade: events.reduce((sum, e) => sum + (e.event_appointments?.first_appointment_attended || 0) + (e.event_appointments?.second_appointment_attended || 0), 0),
    totalRegistrants: events.reduce((sum, e) => sum + (e.attendance?.registrant_responses || 0), 0),
    totalPlateLickers: events.reduce((sum, e) => sum + (e.attendance?.plate_lickers != null && typeof e.attendance?.plate_lickers === "number" ? e.attendance.plate_lickers : 0), 0),
    totalFirstAppointmentNoShows: events.reduce((sum, e) => sum + (e.event_appointments?.first_appointment_no_shows || 0), 0),
    totalNotQualified: events.reduce((sum, e) => sum + (e.event_appointments?.not_qualified || 0), 0),
  }
  summary.avgAttendees = summary.totalEvents > 0 ? Math.round(summary.totalAttendees / summary.totalEvents) : 0
  summary.totalProfit = summary.totalRevenue - summary.totalExpenses
  summary.overallROI = summary.totalExpenses > 0 ? Math.round(((summary.totalRevenue - summary.totalExpenses) / summary.totalExpenses) * 100) : summary.totalRevenue > 0 ? 9999 : 0
  summary.overallConversionRate = summary.totalAttendees > 0 ? (summary.totalClients / summary.totalAttendees) * 100 : 0

  const mappedEvents = events.map((event) => {
    const totalProduction = (event.financial_production?.aum_fees || 0) + (event.financial_production?.annuity_commission || 0) + (event.financial_production?.life_insurance_commission || 0) + (event.financial_production?.financial_planning || 0)
    const expenses = event.marketing_expenses?.total_cost || 0
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      dayOfWeek: event.dayOfWeek,
      location: event.location,
      type: event.marketing_type || "Other",
      topic: event.topic || "N/A",
      time: event.time || "N/A",
      revenue: totalProduction,
      expenses,
      profit: totalProduction - expenses,
      attendees: event.attendance?.attendees || 0,
      clients: event.attendance?.clients_from_event || 0,
      registrants: event.attendance?.registrant_responses || 0,
      confirmations: event.attendance?.confirmations || 0,
      plateLickers: event.attendance?.plate_lickers != null && typeof event.attendance?.plate_lickers === "number" ? event.attendance.plate_lickers : 0,
      appointmentsSet: (event.event_appointments?.set_at_event || 0) + (event.event_appointments?.set_after_event || 0),
      appointmentsMade: (event.event_appointments?.first_appointment_attended || 0) + (event.event_appointments?.second_appointment_attended || 0),
      firstAppointmentNoShows: event.event_appointments?.first_appointment_no_shows || 0,
      notQualified: event.event_appointments?.not_qualified || 0,
      roi: { value: expenses > 0 ? Math.round(((totalProduction - expenses) / expenses) * 100) : 0 },
      conversionRate: (event.attendance?.attendees || 0) > 0 ? ((event.attendance?.clients_from_event || 0) / (event.attendance?.attendees || 0)) * 100 : 0,
    }
  })

  const monthlyStats = new Map<string, { month: string; events: number; revenue: number; expenses: number; profit: number; attendees: number; clients: number; roi: number; conversionRate: number }>()
  events.forEach((event) => {
    if (!event.date) return
    const [year, month, day] = event.date.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, { month: monthKey, events: 0, revenue: 0, expenses: 0, profit: 0, attendees: 0, clients: 0, roi: 0, conversionRate: 0 })
    }
    const stats = monthlyStats.get(monthKey)!
    const p = (event.financial_production?.aum_fees || 0) + (event.financial_production?.annuity_commission || 0) + (event.financial_production?.life_insurance_commission || 0) + (event.financial_production?.financial_planning || 0)
    const exp = event.marketing_expenses?.total_cost || 0
    stats.events++
    stats.revenue += p
    stats.expenses += exp
    stats.profit += p - exp
    stats.attendees += event.attendance?.attendees || 0
    stats.clients += event.attendance?.clients_from_event || 0
  })
  monthlyStats.forEach((stats) => {
    stats.roi = stats.expenses > 0 ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 : stats.revenue > 0 ? 9999 : 0
    stats.conversionRate = stats.attendees > 0 ? (stats.clients / stats.attendees) * 100 : 0
  })
  const monthlyData = Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month))

  const typeStats = new Map<string, { type: string; events: number; revenue: number; expenses: number; profit: number; attendees: number; clients: number; roi: number; conversionRate: number }>()
  events.forEach((event) => {
    const type = event.marketing_type || "Other"
    if (!typeStats.has(type)) {
      typeStats.set(type, { type, events: 0, revenue: 0, expenses: 0, profit: 0, attendees: 0, clients: 0, roi: 0, conversionRate: 0 })
    }
    const stats = typeStats.get(type)!
    const p = (event.financial_production?.aum_fees || 0) + (event.financial_production?.annuity_commission || 0) + (event.financial_production?.life_insurance_commission || 0) + (event.financial_production?.financial_planning || 0)
    const exp = event.marketing_expenses?.total_cost || 0
    stats.events++
    stats.revenue += p
    stats.expenses += exp
    stats.profit += p - exp
    stats.attendees += event.attendance?.attendees || 0
    stats.clients += event.attendance?.clients_from_event || 0
  })
  typeStats.forEach((stats) => {
    stats.roi = stats.expenses > 0 ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 : stats.revenue > 0 ? 9999 : 0
    stats.conversionRate = stats.attendees > 0 ? (stats.clients / stats.attendees) * 100 : 0
  })
  const metricsByType = Array.from(typeStats.values())

  return { summary, events: mappedEvents, monthlyData, metricsByType }
}
