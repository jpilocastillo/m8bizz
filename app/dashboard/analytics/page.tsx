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
    const events = await fetchAllEvents(data.user.id) as Array<any>
    console.log('Fetched events for analytics:', events)
    // Debug: Log each event's key fields to check for missing data
    events.forEach((event, idx) => {
      console.log(`Event[${idx}]: id=${event.id}, attendees=${event.attendees}, clients=${event.clients}, revenue=${event.revenue}, roi=${JSON.stringify(event.roi)}, attendance=${JSON.stringify(event.attendance)}, financialProduction=${JSON.stringify(event.financialProduction)}`);
    });

    console.log(
      "Event for analytics (expenses):",
      events.find(e => e.id === "529eb418-9b02-4099-a3aa-3ab6574c4225")
    );

    // Calculate analytics data using the same structure as single event dashboard
    const analyticsData = {
      summary: {
        totalEvents: events.length,
        totalAttendees: events.reduce((sum, event) => sum + (event.attendees || 0), 0),
        avgAttendees: events.length > 0 ? events.reduce((sum, event) => sum + (event.attendees || 0), 0) / events.length : 0,
        totalRevenue: events.reduce((sum, event) => sum + (event.revenue || 0), 0),
        totalExpenses: events.reduce((sum, event) => sum + (event.marketing_expenses?.total_cost || 0), 0),
        totalProfit: events.reduce((sum, event) => {
          const revenue = event.revenue || 0;
          const expenses = event.marketing_expenses?.total_cost || 0;
          return sum + (revenue - expenses);
        }, 0),
        overallROI: (() => {
          const totalRevenue = events.reduce((sum, event) => sum + (event.revenue || 0), 0);
          const totalExpenses = events.reduce((sum, event) => sum + (event.marketing_expenses?.total_cost || 0), 0);
          return totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;
        })(),
        totalClients: events.reduce((sum, event) => sum + (event.clients || 0), 0),
        totalRegistrants: events.reduce((sum, event) => sum + (event.attendance?.registrant_responses || 0), 0),
        totalConfirmations: events.reduce((sum, event) => sum + (event.attendance?.confirmations || 0), 0),
        overallConversionRate: (() => {
          const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);
          const totalClients = events.reduce((sum, event) => sum + (event.clients || 0), 0);
          return totalAttendees > 0 ? (totalClients / totalAttendees) * 100 : 0;
        })(),
        avgRegistrants: events.length > 0 ? events.reduce((sum, event) => sum + (event.attendance?.registrant_responses || 0), 0) / events.length : 0,
      },
      events: events.map(event => {
        const totalExpenses = event.marketing_expenses?.total_cost || 0;
        const totalRevenue = event.revenue || 0;
        const totalClients = event.clients || 0;
        const totalAttendees = event.attendees || 0;
        const profit = totalRevenue - totalExpenses;
        const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;
        // Map other expected fields as needed
        return {
          ...event,
          revenue: totalRevenue,
          attendees: totalAttendees,
          clients: totalClients,
          expenses: totalExpenses,
          profit,
          roi,
          // ...existing mapped fields...
        };
      }),
      monthlyData: [], // TODO: Implement monthly data aggregation
      metricsByType: [], // TODO: Implement metrics by type aggregation
    }

    console.log('Analytics data prepared:', analyticsData)
    console.log(
      "Mapped event for analytics:",
      analyticsData.events.find(e => e.id === "529eb418-9b02-4099-a3aa-3ab6574c4225")
    );
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
