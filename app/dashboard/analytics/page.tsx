import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { fetchAllEvents } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error in AnalyticsPage:", error)
      redirect("/login")
    }

    if (!data.user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    // Fetch all events with their related data
    const events = await fetchAllEvents(data.user.id)
    console.log('Fetched events for analytics:', events)

    // Calculate analytics data
    const analyticsData = {
      summary: {
        totalEvents: events.length,
        totalAttendees: events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0),
        avgAttendees: events.length > 0 ? events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0) / events.length : 0,
        totalRevenue: events.reduce((sum, event) => sum + (event.financial_production?.total || 0), 0),
        totalExpenses: events.reduce((sum, event) => sum + (event.marketing_expenses?.total_cost || 0), 0),
        totalProfit: events.reduce((sum, event) => {
          const revenue = event.financial_production?.total || 0
          const expenses = event.marketing_expenses?.total_cost || 0
          return sum + (revenue - expenses)
        }, 0),
        overallROI: events.length > 0 ? events.reduce((sum, event) => {
          const revenue = event.financial_production?.total || 0
          const expenses = event.marketing_expenses?.total_cost || 0
          return sum + (expenses > 0 ? ((revenue - expenses) / expenses) * 100 : 0)
        }, 0) / events.length : 0,
        totalClients: events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0),
        totalRegistrants: events.reduce((sum, event) => sum + (event.attendance?.registrant_responses || 0), 0),
        totalConfirmations: events.reduce((sum, event) => sum + (event.attendance?.confirmations || 0), 0),
        overallConversionRate: events.length > 0 ? events.reduce((sum, event) => {
          const attendees = event.attendance?.attendees || 0
          const clients = event.attendance?.clients_from_event || 0
          return sum + (attendees > 0 ? (clients / attendees) * 100 : 0)
        }, 0) / events.length : 0,
        registrationRate: events.length > 0 ? events.reduce((sum, event) => {
          const registrants = event.attendance?.registrant_responses || 0
          const confirmations = event.attendance?.confirmations || 0
          return sum + (registrants > 0 ? (confirmations / registrants) * 100 : 0)
        }, 0) / events.length : 0,
        appointmentConversionRate: events.length > 0 ? events.reduce((sum, event) => {
          const setAtEvent = event.event_appointments?.set_at_event || 0
          const attended = event.event_appointments?.first_appointment_attended || 0
          return sum + (setAtEvent > 0 ? (attended / setAtEvent) * 100 : 0)
        }, 0) / events.length : 0,
        avgAppointments: events.length > 0 ? events.reduce((sum, event) => {
          const setAtEvent = event.event_appointments?.set_at_event || 0
          const setAfterEvent = event.event_appointments?.set_after_event || 0
          return sum + setAtEvent + setAfterEvent
        }, 0) / events.length : 0,
        avgClients: events.length > 0 ? events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0) / events.length : 0,
      },
      events: events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        type: event.marketing_type,
        location: event.location,
        attendees: event.attendance?.attendees || 0,
        clients: event.attendance?.clients_from_event || 0,
        registrants: event.attendance?.registrant_responses || 0,
        confirmations: event.attendance?.confirmations || 0,
        revenue: event.financial_production?.total || 0,
        expenses: event.marketing_expenses?.total_cost || 0,
        roi: event.marketing_expenses?.total_cost > 0 
          ? ((event.financial_production?.total || 0) - event.marketing_expenses?.total_cost) / event.marketing_expenses?.total_cost * 100 
          : 0,
        appointments: {
          setAtEvent: event.event_appointments?.set_at_event || 0,
          setAfterEvent: event.event_appointments?.set_after_event || 0,
          firstAppointmentAttended: event.event_appointments?.first_appointment_attended || 0,
          firstAppointmentNoShows: event.event_appointments?.first_appointment_no_shows || 0,
          secondAppointmentAttended: event.event_appointments?.second_appointment_attended || 0,
        },
        financial: event.financial_production || {},
        attendance: event.attendance || {},
      })),
      monthlyData: [], // TODO: Implement monthly data aggregation
      metricsByType: [], // TODO: Implement metrics by type aggregation
    }

    console.log('Analytics data prepared:', analyticsData)
    return <AnalyticsDashboard analyticsData={analyticsData} />
  } catch (error) {
    console.error("Unhandled error in AnalyticsPage:", error)

    // If this is a redirect, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return <DashboardError error="An error occurred loading the analytics. Please try again later." />
  }
}
