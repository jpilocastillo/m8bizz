"use client"

import { useState, useEffect } from "react"
import { EventDetailsCard } from "@/components/dashboard/event-details-card"
import { EventSelector } from "@/components/dashboard/event-selector"
import { fetchDashboardData } from "@/lib/data"
import { MarketingROICard } from "@/components/dashboard/marketing-roi-card"
import { ConversionEfficiencyCard } from "@/components/dashboard/conversion-efficiency-card"
import { ClientAcquisitionCard } from "@/components/dashboard/client-acquisition-card"
import { TrendingUp, DollarSign, Percent, FileText, Award, ChevronRight, Shield, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { RegistrantResponseAnalysis } from "@/components/dashboard/registrant-response-analysis"
import { ConversionRateIndicator } from "@/components/dashboard/conversion-rate-indicator"
import { AppointmentTrends } from "@/components/dashboard/appointment-trends"
import { ProductSoldCard } from "./product-sold-card"
import { AccumulativeIncomeCard } from "./accumulative-income-card"
import { FinancialProductionCard } from "./financial-production-card"
import { ThreeDMetricCard } from "@/components/dashboard/3d-metric-card"
import { MarketingExpensesCard } from "./marketing-expenses-card"
import { format, parseISO } from "date-fns"
import { DashboardError } from "./dashboard-error"
import { createClient } from "@/lib/supabase/client"
import { PlateLickerCard } from "@/components/dashboard/plate-licker-card"

interface DashboardContentProps {
  initialData: any
  events: any[]
  userId: string
}

interface DashboardData {
  eventId: string;
  eventDetails: {
    name: string;
    date: string;
    dayOfWeek: string;
    location: string;
    marketing_type: string;
    topic: string;
    age_range: string;
    mile_radius: number;
    income_assets: string;
    time: string;
    status: string;
    marketing_audience: number;
  };
  roi: {
    value: number;
    trend: number[];
  };
  writtenBusiness: number;
  income: {
    total: number;
    breakdown: {
      fixedAnnuity: number;
      life: number;
      aum: number;
      financialPlanning: number;
      aumFees: number;
    };
  };
  conversionRate: {
    value: number;
    attendees: number;
    clients: number;
  };
  marketingExpenses: {
    total: number;
    advertising: number;
    foodVenue: number;
    other: number;
  };
  topicOfMarketing: string;
  attendance: {
    registrantResponses: number;
    confirmations: number;
    attendees: number;
    clients_from_event: number;
    plate_lickers: number;
  };
  appointments: {
    setAtEvent: number;
    setAfterEvent: number;
    firstAppointmentAttended: number;
    firstAppointmentNoShows: number;
    secondAppointmentAttended: number;
  };
  financialProduction: {
    annuity_premium: number;
    life_insurance_premium: number;
    aum: number;
    financial_planning: number;
    annuities_sold: number;
    life_policies_sold: number;
    annuity_commission: number;
    life_insurance_commission: number;
    aum_fees: number;
    aum_accounts_opened: number;
  };
}

export function DashboardContent({ initialData, events, userId }: DashboardContentProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialData?.eventId || '')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedEventId) {
      loadEventData(selectedEventId)
    }
  }, [selectedEventId, userId])

  // Add real-time subscription for data updates
  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to changes in all related tables
    const subscriptions = [
      supabase
        .channel('marketing_events_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'marketing_events',
          filter: selectedEventId ? `id=eq.${selectedEventId}` : undefined
        }, () => {
          if (selectedEventId) {
            loadEventData(selectedEventId)
          }
        })
        .subscribe(),
      supabase
        .channel('marketing_expenses_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'marketing_expenses',
          filter: selectedEventId ? `event_id=eq.${selectedEventId}` : undefined
        }, () => {
          if (selectedEventId) {
            loadEventData(selectedEventId)
          }
        })
        .subscribe(),
      supabase
        .channel('event_attendance_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'event_attendance',
          filter: selectedEventId ? `event_id=eq.${selectedEventId}` : undefined
        }, () => {
          if (selectedEventId) {
            loadEventData(selectedEventId)
          }
        })
        .subscribe(),
      supabase
        .channel('event_appointments_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'event_appointments',
          filter: selectedEventId ? `event_id=eq.${selectedEventId}` : undefined
        }, () => {
          if (selectedEventId) {
            loadEventData(selectedEventId)
          }
        })
        .subscribe(),
      supabase
        .channel('financial_production_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'financial_production',
          filter: selectedEventId ? `event_id=eq.${selectedEventId}` : undefined
        }, () => {
          if (selectedEventId) {
            loadEventData(selectedEventId)
          }
        })
        .subscribe()
    ]

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [selectedEventId])

  async function loadEventData(eventId: string) {
    setIsLoading(true)
    setError(null)
    try {
      console.log(`Loading data for event: ${eventId}`)
      const data = await fetchDashboardData(userId, eventId)
      console.log("Fetched dashboard data:", data)

      if (!data || !data.eventDetails || !data.eventDetails.name) {
        setError("Event not found. Please select a valid event.")
        return
      }

      // Ensure all data is properly formatted
      const formattedData: DashboardData = {
        eventId: data.eventId,
        eventDetails: {
          name: data.eventDetails.name,
          date: data.eventDetails.date,
          dayOfWeek: data.eventDetails.dayOfWeek || "N/A",
          location: data.eventDetails.location || "N/A",
          marketing_type: data.eventDetails.marketing_type || "N/A",
          topic: data.eventDetails.topic || "N/A",
          age_range: data.eventDetails.age_range || "N/A",
          mile_radius: data.eventDetails.mile_radius || 0,
          income_assets: data.eventDetails.income_assets || "N/A",
          time: data.eventDetails.time || "N/A",
          status: data.eventDetails.status || "N/A",
          marketing_audience: typeof data.eventDetails.marketing_audience === 'number'
            ? data.eventDetails.marketing_audience
            : 0
        },
        roi: {
          value: data.roi?.value || 0,
          trend: data.roi?.trend || [0]
        },
        writtenBusiness: data.writtenBusiness || 0,
        income: {
          total: data.income?.total || 0,
          breakdown: {
            fixedAnnuity: data.income?.breakdown?.fixedAnnuity || 0,
            life: data.income?.breakdown?.life || 0,
            aum: data.income?.breakdown?.aum || 0,
            financialPlanning: data.income?.breakdown?.financialPlanning || 0,
            aumFees: data.income?.breakdown?.aumFees || 0
          }
        },
        conversionRate: {
          value: data.conversionRate?.value || 0,
          attendees: data.conversionRate?.attendees || 0,
          clients: data.conversionRate?.clients || 0
        },
        marketingExpenses: {
          total: data.marketingExpenses?.total || 0,
          advertising: data.marketingExpenses?.advertising || 0,
          foodVenue: data.marketingExpenses?.foodVenue || 0,
          other: data.marketingExpenses?.other || 0
        },
        topicOfMarketing: data.topicOfMarketing || "N/A",
        attendance: {
          registrantResponses: data.attendance?.registrantResponses || 0,
          confirmations: data.attendance?.confirmations || 0,
          attendees: data.attendance?.attendees || 0,
          clients_from_event: data.attendance?.clients_from_event || 0,
          plate_lickers: data.attendance?.plate_lickers || 0
        },
        appointments: {
          setAtEvent: data.appointments?.setAtEvent || 0,
          setAfterEvent: data.appointments?.setAfterEvent || 0,
          firstAppointmentAttended: data.appointments?.firstAppointmentAttended || 0,
          firstAppointmentNoShows: data.appointments?.firstAppointmentNoShows || 0,
          secondAppointmentAttended: data.appointments?.secondAppointmentAttended || 0
        },
        financialProduction: {
          annuity_premium: data.financialProduction?.annuity_premium || 0,
          life_insurance_premium: data.financialProduction?.life_insurance_premium || 0,
          aum: data.financialProduction?.aum || 0,
          financial_planning: data.financialProduction?.financial_planning || 0,
          annuities_sold: data.financialProduction?.annuities_sold || 0,
          life_policies_sold: data.financialProduction?.life_policies_sold || 0,
          annuity_commission: data.financialProduction?.annuity_commission || 0,
          life_insurance_commission: data.financialProduction?.life_insurance_commission || 0,
          aum_fees: data.financialProduction?.aum_fees || 0,
          aum_accounts_opened: data.financialProduction?.aum_accounts_opened || 0
        }
      }

      setDashboardData(formattedData)
    } catch (error) {
      console.error("Error loading event data:", error)
      setError("An error occurred while loading event data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return <DashboardError error={error} />
  }

  if (!dashboardData) {
    return <DashboardError error="No dashboard data available. Please create an event." />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Calculate derived metrics with safe fallbacks
  const totalExpenses = dashboardData.marketingExpenses?.total || 0
  const totalProduction = dashboardData.financialProduction?.aum_fees + dashboardData.financialProduction?.annuity_commission + dashboardData.financialProduction?.life_insurance_commission + dashboardData.financialProduction?.financial_planning || 0
  const totalIncome = totalProduction // Set total income equal to total production
  const profit = totalProduction - totalExpenses // Calculate profit as total production minus expenses
  const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0

  // Calculate conversion metrics
  const registrants = dashboardData.attendance?.registrantResponses || 0
  const confirmations = dashboardData.attendance?.confirmations || 0
  const attendees = dashboardData.attendance?.attendees || 0
  const clients = dashboardData.attendance?.clients_from_event || 0

  const registrationToConfirmation = registrants > 0 ? (confirmations / registrants) * 100 : 0
  const confirmationToAttendance = confirmations > 0 ? (attendees / confirmations) * 100 : 0
  const attendanceToClient = attendees > 0 ? (clients / attendees) * 100 : 0
  const overallConversion = registrants > 0 ? (clients / registrants) * 100 : 0

  // Calculate client acquisition costs
  const expensePerRegistrant = registrants > 0 ? totalExpenses / registrants : 0
  const expensePerConfirmation = confirmations > 0 ? totalExpenses / confirmations : 0
  const expensePerAttendee = attendees > 0 ? totalExpenses / attendees : 0
  const expensePerClient = clients > 0 ? totalExpenses / clients : 0

  // Calculate income breakdown with safe fallbacks
  const lifeInsuranceCommission = dashboardData.financialProduction?.life_insurance_commission || 0
  const annuityCommission = dashboardData.financialProduction?.annuity_commission || 0
  const financialPlanningIncome = dashboardData.financialProduction?.financial_planning || 0
  const aumFees = dashboardData.financialProduction?.aum_fees || 0

  // Calculate AUM Fee % for the card
  const aum = dashboardData.financialProduction?.aum || 0;
  const aumFeePercentage = aum > 0 ? ((aumFees / aum) * 100).toFixed(2) : '1.5';

  // Format event date
  const eventDate = dashboardData.eventDetails?.date ? parseISO(dashboardData.eventDetails.date) : null
  const formattedDate = eventDate ? format(eventDate, "MMMM d, yyyy") : "Date not available"

  // Section divider component
  const SectionDivider = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 my-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-m8bs-border/50"></div>
      <h2 className="text-lg font-bold text-white/80 flex items-center">
        <ChevronRight className="h-5 w-5 mr-1 text-m8bs-blue" />
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-m8bs-border/50"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-white">
          <Calendar className="h-5 w-5 mr-2 text-m8bs-blue" />
          <span className="font-medium">Event Date:</span>
          <span className="ml-2 font-bold">{formattedDate}</span>
        </div>
        <EventSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelect={setSelectedEventId}
        />
      </div>

      {/* Top metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <ThreeDMetricCard
            title="Return on Investment"
            value={roi}
            format="percent"
            icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
            description="Return on investment from marketing expenses"
            color="blue"
          />
        </motion.div>

        <motion.div variants={item}>
          <ThreeDMetricCard
            title="Written Business"
            value={clients}
            icon={<FileText className="h-5 w-5 text-green-400" />}
            description="Total number of policies written"
            color="green"
          />
        </motion.div>

        <motion.div variants={item}>
          <ThreeDMetricCard
            title="Accumulative Income"
            value={totalIncome}
            format="currency"
            icon={<DollarSign className="h-5 w-5 text-purple-400" />}
            description="Total income generated from all sources"
            color="purple"
          />
        </motion.div>

        <motion.div variants={item}>
          <ThreeDMetricCard
            title="Conversion Rate"
            value={overallConversion}
            format="percent"
            icon={<Percent className="h-5 w-5 text-amber-400" />}
            description={`${registrants} registrants → ${clients} clients`}
            color="amber"
          />
        </motion.div>
      </motion.div>

      {/* Event Information Section */}
      <SectionDivider title="Event Information" />

      {/* Event details - Full width */}
      <div className="grid grid-cols-1 gap-6">
        <EventDetailsCard
          dayOfWeek={dashboardData.eventDetails?.dayOfWeek || "N/A"}
          location={dashboardData.eventDetails?.location || "N/A"}
          time={dashboardData.eventDetails?.time || "N/A"}
          ageRange={dashboardData.eventDetails?.age_range || "N/A"}
          mileRadius={String(dashboardData.eventDetails?.mile_radius || 0)}
          incomeAssets={dashboardData.eventDetails?.income_assets || "N/A"}
          topic={dashboardData.eventDetails?.topic || "N/A"}
          marketingAudienceSize={String(dashboardData.eventDetails?.marketing_audience || 0)}
        />
      </div>

      {/* Performance Metrics Section */}
      <SectionDivider title="Performance Metrics" />

      {/* Marketing ROI Card - Now full width */}
      <div className="grid grid-cols-1 gap-6">
        <MarketingROICard roi={roi} totalIncome={totalIncome} totalCost={totalExpenses} />
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Updated Conversion Efficiency Card */}
        <ConversionEfficiencyCard
          registrationToConfirmation={Number(registrationToConfirmation) || 0}
          confirmationToAttendance={Number(confirmationToAttendance) || 0}
          attendanceToClient={Number(attendanceToClient) || 0}
          overall={Number(overallConversion) || 0}
          registrants={Number(registrants) || 0}
          confirmations={Number(confirmations) || 0}
          attendees={Number(attendees) || 0}
          clients={Number(clients) || 0}
        />
        <motion.div variants={item}>
          <RegistrantResponseAnalysis
            registrants={dashboardData.attendance?.registrantResponses || 0}
            confirmations={dashboardData.attendance?.confirmations || 0}
            attendees={dashboardData.attendance?.attendees || 0}
            marketingAudienceSize={dashboardData.eventDetails?.marketing_audience || 0}
            plateLickers={dashboardData.attendance?.plate_lickers || 0}
          />
        </motion.div>
      </div>

      {/* Plate Lickers Card */}
      {/* <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <PlateLickerCard
            plateLickers={dashboardData.attendance?.plate_lickers || 0}
            attendees={attendees}
          />
        </motion.div>
      </div> */}

      {/* Financial Section */}
      <SectionDivider title="Financial Performance" />

      {/* Accumulative Income Card */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <AccumulativeIncomeCard
          lifeInsuranceCommission={lifeInsuranceCommission}
          annuityCommission={annuityCommission}
          financialPlanning={financialPlanningIncome}
          aumFees={aumFees}
        />
      </div>

      {/* Financial production */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <FinancialProductionCard
            aum={dashboardData.financialProduction?.aum || 0}
            financialPlanning={dashboardData.financialProduction?.financial_planning || 0}
            annuityPremium={dashboardData.financialProduction?.annuity_premium || 0}
            lifeInsurancePremium={dashboardData.financialProduction?.life_insurance_premium || 0}
          />
        </motion.div>
      </div>

      {/* Products and Costs Section */}
      <SectionDivider title="Products & Costs" />

      {/* Products sold */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ProductSoldCard
            title="Annuities Sold"
            count={dashboardData.financialProduction?.annuities_sold || 0}
            icon={<Award className="h-5 w-5 text-blue-400" />}
            color="blue"
            details={[
              {
                label: "Average Premium",
                value: `${dashboardData.financialProduction?.annuity_premium && dashboardData.financialProduction?.annuities_sold ? (dashboardData.financialProduction.annuity_premium / Math.max(1, dashboardData.financialProduction.annuities_sold)).toLocaleString() : "0"}`,
              },
              { label: "Commission Rate", value: "4.5%" },
              { label: "Total Commission", value: `$${annuityCommission.toLocaleString()}` },
            ]}
            benefits={["Tax-deferred growth", "Guaranteed income", "Principal protection"]}
            chartData={[65, 40, 85, 30, 55, 65, 75]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <ProductSoldCard
            title="Life Policies Sold"
            count={dashboardData.financialProduction?.life_policies_sold || 0}
            icon={<Shield className="h-5 w-5 text-red-400" />}
            color="red"
            details={[
              {
                label: "Average Coverage",
                value: `$${dashboardData.financialProduction?.life_insurance_premium && dashboardData.financialProduction?.life_policies_sold ? (dashboardData.financialProduction.life_insurance_premium / Math.max(1, dashboardData.financialProduction.life_policies_sold)).toLocaleString() : "0"}`,
              },
              { label: "Commission Rate", value: "85%" },
              { label: "Total Commission", value: `$${lifeInsuranceCommission.toLocaleString()}` },
            ]}
            benefits={["Death benefit", "Cash value growth", "Living benefits"]}
            chartData={[45, 60, 35, 70, 45, 60, 35]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <ProductSoldCard
            title="AUM Accounts Opened"
            count={dashboardData.financialProduction?.aum_accounts_opened || 0}
            icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
            color="green"
            details={[
              { label: "AUM Fee %", value: `${aumFeePercentage}%` },
              { label: "Annual AUM Fees", value: `$${aumFees.toLocaleString()}` },
            ]}
            benefits={["Scalable Revenue", "Recurring Revenue Stream", "Client Retention"]}
            chartData={[30, 50, 40, 60, 80, 70, 90]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MarketingExpensesCard
            advertising={dashboardData.marketingExpenses?.advertising || 500}
            foodVenue={dashboardData.marketingExpenses?.foodVenue || 1200}
          />
        </motion.div>
      </div>

      {/* Client Acquisition Section */}
      <SectionDivider title="Client Acquisition" />

      {/* Client Acquisition Cost */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ClientAcquisitionCard
            expensePerRegistrant={expensePerRegistrant}
            expensePerConfirmation={expensePerConfirmation}
            expensePerAttendee={expensePerAttendee}
            expensePerClient={expensePerClient}
            totalCost={totalExpenses}
          />
        </motion.div>
      </div>

      {/* Appointment Insights Section */}
      <SectionDivider title="Appointment Insights" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ConversionRateIndicator
            attendees={attendees}
            clients={clients}
            incomeAssets={dashboardData.eventDetails.income_assets}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AppointmentTrends
            setAtEvent={dashboardData.appointments?.setAtEvent || 0}
            setAfterEvent={dashboardData.appointments?.setAfterEvent || 0}
            firstAppointmentAttended={dashboardData.appointments?.firstAppointmentAttended || 0}
            firstAppointmentNoShows={dashboardData.appointments?.firstAppointmentNoShows || 0}
            secondAppointmentAttended={dashboardData.appointments?.secondAppointmentAttended || 0}
            clients={dashboardData.attendance?.clients_from_event || 0}
          />
        </motion.div>
      </div>
    </div>
  )
}
