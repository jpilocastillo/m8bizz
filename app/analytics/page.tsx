import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard"
import { AnalyticsSkeleton } from "@/components/dashboard/analytics/analytics-skeleton"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { fetchAllEvents } from "@/lib/data"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      redirect("/login")
    }

    // Fetch all events with their related data (no year filter - let client-side handle it)
    const events = await fetchAllEvents(user.id)
    
    // DEBUG: Show all fetched events
    const debugEvents = (
      <pre className="bg-gray-900 text-gray-200 p-4 rounded mt-6 overflow-x-auto text-xs">
        {JSON.stringify(events, null, 2)}
      </pre>
    )
    
    if (!events || events.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-500">No Events Found. Start By Creating Your First Event.</p>
        </div>
      )
    }

    console.log('First event:', events[0])

    // Process events data for analytics
    const analyticsData = {
      summary: {
        totalEvents: events.length,
        totalAttendees: events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0),
        avgAttendees: events.length > 0 
          ? Math.round(events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0) / events.length) 
          : 0,
        totalRevenue: events.reduce((sum, event) => {
          const totalProduction = (event.financial_production?.aum_fees || 0) + 
                                (event.financial_production?.annuity_commission || 0) + 
                                (event.financial_production?.life_insurance_commission || 0) + 
                                (event.financial_production?.financial_planning || 0)
          return sum + totalProduction
        }, 0),
        totalExpenses: events.reduce((sum, event) => sum + (event.marketing_expenses?.total_cost || 0), 0),
        totalProfit: events.reduce((sum, event) => {
          const totalProduction = (event.financial_production?.aum_fees || 0) + 
                                (event.financial_production?.annuity_commission || 0) + 
                                (event.financial_production?.life_insurance_commission || 0) + 
                                (event.financial_production?.financial_planning || 0)
          const expenses = event.marketing_expenses?.total_cost || 0
          return sum + (totalProduction - expenses)
        }, 0),
        overallROI: (() => {
          const totalRevenue = events.reduce((sum, event) => {
            const totalProduction = (event.financial_production?.aum_fees || 0) + 
                                  (event.financial_production?.annuity_commission || 0) + 
                                  (event.financial_production?.life_insurance_commission || 0) + 
                                  (event.financial_production?.financial_planning || 0)
            return sum + totalProduction
          }, 0)
          const totalExpenses = events.reduce((sum, event) => sum + (event.marketing_expenses?.total_cost || 0), 0)
          return totalExpenses > 0 
            ? Math.round(((totalRevenue - totalExpenses) / totalExpenses) * 100) 
            : totalRevenue > 0 
              ? 9999 // Show high ROI when there's revenue but no expenses
              : 0
        })(),
        totalClients: events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0),
        overallConversionRate: (() => {
          const totalAttendees = events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0)
          const totalClients = events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0)
          return totalAttendees > 0 ? (totalClients / totalAttendees) * 100 : 0
        })(),
        totalAppointmentsSet: events.reduce((sum, event) => {
          const setAtEvent = event.event_appointments?.set_at_event || 0
          const setAfterEvent = event.event_appointments?.set_after_event || 0
          return sum + setAtEvent + setAfterEvent
        }, 0),
        totalAppointmentsMade: events.reduce((sum, event) => {
          const firstAttended = event.event_appointments?.first_appointment_attended || 0
          const secondAttended = event.event_appointments?.second_appointment_attended || 0
          return sum + firstAttended + secondAttended
        }, 0),
        totalRegistrants: events.reduce((sum, event) => sum + (event.attendance?.registrant_responses || 0), 0),
        totalPlateLickers: events.reduce((sum, event) => {
          // Use the value directly from the form - no validation or transformation
          const plateLickers = event.attendance?.plate_lickers
          return sum + (plateLickers != null && typeof plateLickers === 'number' ? plateLickers : 0)
        }, 0),
        totalFirstAppointmentNoShows: events.reduce((sum, event) => sum + (event.event_appointments?.first_appointment_no_shows || 0), 0),
        totalNotQualified: events.reduce((sum, event) => sum + (event.event_appointments?.not_qualified || 0), 0),
      },
      events: events.map(event => {
        const totalProduction = (event.financial_production?.aum_fees || 0) + 
                              (event.financial_production?.annuity_commission || 0) + 
                              (event.financial_production?.life_insurance_commission || 0) + 
                              (event.financial_production?.financial_planning || 0)
        const expenses = event.marketing_expenses?.total_cost || 0
        
        // Debug logging for dayOfWeek
        if (event.dayOfWeek) {
          console.log('Analytics event dayOfWeek:', {
            eventName: event.name,
            date: event.date,
            dayOfWeek: event.dayOfWeek
          });
        }
        
        return {
          id: event.id,
          name: event.name,
          date: event.date,
          dayOfWeek: event.dayOfWeek, // Use the dayOfWeek already calculated in fetchAllEvents
          location: event.location,
          type: event.marketing_type || 'Other',
          topic: event.topic || 'N/A',
          time: event.time || 'N/A',
          revenue: totalProduction,
          expenses,
          profit: totalProduction - expenses,
          attendees: event.attendance?.attendees || 0,
          clients: event.attendance?.clients_from_event || 0,
          registrants: event.attendance?.registrant_responses || 0,
          confirmations: event.attendance?.confirmations || 0,
          plateLickers: event.attendance?.plate_lickers != null && typeof event.attendance?.plate_lickers === 'number' ? event.attendance.plate_lickers : 0,
          appointmentsSet: (() => {
            const setAtEvent = event.event_appointments?.set_at_event || 0
            const setAfterEvent = event.event_appointments?.set_after_event || 0
            return setAtEvent + setAfterEvent
          })(),
          appointmentsMade: (() => {
            const firstAttended = event.event_appointments?.first_appointment_attended || 0
            const secondAttended = event.event_appointments?.second_appointment_attended || 0
            return firstAttended + secondAttended
          })(),
          firstAppointmentNoShows: event.event_appointments?.first_appointment_no_shows || 0,
          notQualified: event.event_appointments?.not_qualified || 0,
          roi: { value: expenses > 0 ? Math.round(((totalProduction - expenses) / expenses) * 100) : 0 },
          conversionRate: (() => {
            const attendees = event.attendance?.attendees || 0;
            const clients = event.attendance?.clients_from_event || 0;
            return attendees > 0 ? (clients / attendees) * 100 : 0;
          })(),
        };
      }),
      monthlyData: (() => {
        const monthlyStats = new Map()
        
        events.forEach(event => {
          // Parse date manually to avoid timezone issues
          const [year, month, day] = event.date.split('-').map(Number)
          const date = new Date(year, month - 1, day)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyStats.has(monthKey)) {
            monthlyStats.set(monthKey, {
              month: monthKey,
              events: 0,
              revenue: 0,
              expenses: 0,
              profit: 0,
              attendees: 0,
              clients: 0,
              roi: 0,
              conversionRate: 0,
            })
          }
          
          const stats = monthlyStats.get(monthKey)
          const totalProduction = (event.financial_production?.aum_fees || 0) + 
                                (event.financial_production?.annuity_commission || 0) + 
                                (event.financial_production?.life_insurance_commission || 0) + 
                                (event.financial_production?.financial_planning || 0)
          const expenses = event.marketing_expenses?.total_cost || 0
          
          stats.events++
          stats.revenue += totalProduction
          stats.expenses += expenses
          stats.profit += totalProduction - expenses
          stats.attendees += event.attendance?.attendees || 0
          stats.clients += event.attendance?.clients_from_event || 0
        })
        
        // Calculate derived metrics for each month
        monthlyStats.forEach(stats => {
          stats.roi = stats.expenses > 0 
            ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 
            : stats.revenue > 0 
              ? 9999 // Show high ROI when there's revenue but no expenses
              : 0
          stats.conversionRate = stats.attendees > 0 ? (stats.clients / stats.attendees) * 100 : 0
        })
        
        return Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month))
      })(),
      metricsByType: (() => {
        const typeStats = new Map()
        
        events.forEach(event => {
          const type = event.marketing_type || 'Other'
          
          if (!typeStats.has(type)) {
            typeStats.set(type, {
              type,
              events: 0,
              revenue: 0,
              expenses: 0,
              profit: 0,
              attendees: 0,
              clients: 0,
              roi: 0,
              conversionRate: 0,
            })
          }
          
          const stats = typeStats.get(type)
          const totalProduction = (event.financial_production?.aum_fees || 0) + 
                                (event.financial_production?.annuity_commission || 0) + 
                                (event.financial_production?.life_insurance_commission || 0) + 
                                (event.financial_production?.financial_planning || 0)
          const expenses = event.marketing_expenses?.total_cost || 0
          
          stats.events++
          stats.revenue += totalProduction
          stats.expenses += expenses
          stats.profit += totalProduction - expenses
          stats.attendees += event.attendance?.attendees || 0
          stats.clients += event.attendance?.clients_from_event || 0
        })
        
        // Calculate derived metrics for each type
        typeStats.forEach(stats => {
          stats.roi = stats.expenses > 0 
            ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 
            : stats.revenue > 0 
              ? 9999 // Show high ROI when there's revenue but no expenses
              : 0
          stats.conversionRate = stats.attendees > 0 ? (stats.clients / stats.attendees) * 100 : 0
        })
        
        return Array.from(typeStats.values())
      })(),
    }

    // DEBUG: Show analytics summary
    const debugSummary = (
      <pre className="bg-gray-900 text-green-200 p-4 rounded mt-6 overflow-x-auto text-xs">
        {JSON.stringify(analyticsData.summary, null, 2)}
      </pre>
    )

    return (
      <TooltipProvider>
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDashboard analyticsData={analyticsData} />
        </Suspense>
      </TooltipProvider>
    )
  } catch (error) {
    console.error("Error in AnalyticsPage:", error)
    return <DashboardError error="An Error Occurred Loading The Analytics. Please Try Again Later." />
  }
} 