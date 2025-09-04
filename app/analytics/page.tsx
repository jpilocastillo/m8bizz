import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { fetchAllEvents } from "@/lib/data"
import { TooltipProvider } from "@/components/ui/tooltip"

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

    // Fetch all events with their related data
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
          <p className="text-lg text-gray-500">No events found. Start by creating your first event.</p>
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
          return totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0
        })(),
        totalClients: events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0),
        overallConversionRate: (() => {
          const totalAttendees = events.reduce((sum, event) => sum + (event.attendance?.attendees || 0), 0)
          const totalClients = events.reduce((sum, event) => sum + (event.attendance?.clients_from_event || 0), 0)
          return totalAttendees > 0 ? (totalClients / totalAttendees) * 100 : 0
        })(),
      },
      events: events.map(event => {
        const totalProduction = (event.financial_production?.aum_fees || 0) + 
                              (event.financial_production?.annuity_commission || 0) + 
                              (event.financial_production?.life_insurance_commission || 0) + 
                              (event.financial_production?.financial_planning || 0)
        const expenses = event.marketing_expenses?.total_cost || 0
        return {
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          type: event.marketing_type || 'Other',
          topic: event.topic || 'N/A',
          revenue: totalProduction,
          expenses,
          profit: totalProduction - expenses,
          attendees: event.attendance?.attendees || 0,
          clients: event.attendance?.clients_from_event || 0,
          registrants: event.attendance?.registrant_responses || 0,
          confirmations: event.attendance?.confirmations || 0,
          roi: { value: expenses > 0 ? ((totalProduction - expenses) / expenses) * 100 : 0 },
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
          const date = new Date(event.date)
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
          stats.roi = stats.expenses > 0 ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 : 0
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
          stats.roi = stats.expenses > 0 ? ((stats.revenue - stats.expenses) / stats.expenses) * 100 : 0
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

    return <>
      <TooltipProvider>
        <AnalyticsDashboard analyticsData={analyticsData} />
      </TooltipProvider>
    </>
  } catch (error) {
    console.error("Error in AnalyticsPage:", error)
    return <DashboardError error="An error occurred loading the analytics. Please try again later." />
  }
} 