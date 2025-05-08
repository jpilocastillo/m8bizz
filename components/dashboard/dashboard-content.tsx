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
import { format } from "date-fns"
import { DashboardError } from "./dashboard-error"

interface DashboardContentProps {
  initialData: any
  events: any[]
  userId: string
}

export function DashboardContent({ initialData, events, userId }: DashboardContentProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add debug logging
  useEffect(() => {
    try {
      console.log("Dashboard Data:", dashboardData)

      // Check specific fields that might be causing issues
      if (dashboardData) {
        console.log("Financial Production:", dashboardData.financialProduction)
        console.log("Appointments:", dashboardData.appointments)
        console.log("Attendance:", dashboardData.attendance)
        console.log("Event Details:", dashboardData.eventDetails)
      }
    } catch (err) {
      console.error("Error in dashboard data logging:", err)
    }
  }, [dashboardData])

  useEffect(() => {
    async function loadEventData(eventId: string) {
      setLoading(true)
      setError(null)
      try {
        console.log(`Loading data for event: ${eventId}`)
        const data = await fetchDashboardData(userId, eventId)
        console.log("Fetched dashboard data:", data)

        if (!data) {
          setError("Failed to load event data. Please try again.")
          return
        }

        setDashboardData(data)
      } catch (error) {
        console.error("Error loading event data:", error)
        setError("An error occurred while loading event data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (selectedEventId) {
      loadEventData(selectedEventId)
    }
  }, [selectedEventId, userId])

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
  const totalIncome = dashboardData.financialProduction?.total || 0
  const profit = totalIncome - totalExpenses
  const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0

  // Calculate conversion metrics
  const attendees = dashboardData.attendance?.attendees || 0
  const appointments = dashboardData.appointments?.firstAppointmentAttended || 0
  const clients = (dashboardData.productsSold?.annuities || 0) + (dashboardData.productsSold?.lifePolicies || 0)

  const registrationToAttendance =
    (dashboardData.attendance?.registrantResponses || 0) > 0
      ? (attendees / dashboardData.attendance.registrantResponses) * 100
      : 0

  const attendanceToAppointment = attendees > 0 ? (appointments / attendees) * 100 : 0

  const appointmentToClient = appointments > 0 ? (clients / appointments) * 100 : 0

  const overallConversion = attendees > 0 ? (clients / attendees) * 100 : 0

  // Calculate client acquisition costs
  const expensePerBuyingUnit = attendees > 0 ? totalExpenses / attendees : 0

  const expensePerAppointment = appointments > 0 ? totalExpenses / appointments : 0

  const expensePerClient = clients > 0 ? totalExpenses / clients : 0

  // Calculate income breakdown with safe fallbacks
  const lifeInsuranceCommission = dashboardData.financialProduction?.life_insurance_commission || 0
  const annuityCommission = dashboardData.financialProduction?.annuity_commission || 0
  const financialPlanningIncome = dashboardData.financialProduction?.financial_planning || 0
  const aumFees = dashboardData.financialProduction?.aum_fees || 0

  // Format event date
  const eventDate = dashboardData.eventDate ? new Date(dashboardData.eventDate) : null
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
        <EventSelector events={events} onSelect={setSelectedEventId} />
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
            description={`${attendees} attendees → ${clients} clients`}
            color="amber"
          />
        </motion.div>
      </motion.div>

      {/* Event Information Section */}
      <SectionDivider title="Event Information" />

      {/* Event details - Full width */}
      <div className="grid grid-cols-1 gap-6">
        <EventDetailsCard
          dayOfWeek={dashboardData.eventDetails.dayOfWeek}
          location={dashboardData.eventDetails.location}
          time={dashboardData.eventDetails.time}
          ageRange={dashboardData.eventDetails.ageRange}
          mileRadius={dashboardData.eventDetails.mileRadius}
          incomeAssets={dashboardData.eventDetails.incomeAssets}
          topic={dashboardData.topicOfMarketing}
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
          registrationToAttendance={registrationToAttendance}
          attendanceToAppointment={attendanceToAppointment}
          appointmentToClient={appointmentToClient}
          overall={overallConversion}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RegistrantResponseAnalysis
            responses={dashboardData.attendance?.registrantResponses || 0}
            mailers={10000}
            confirmations={dashboardData.attendance?.confirmations || 0}
            attendees={attendees}
          />
        </motion.div>
      </div>

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
            financialPlanning={dashboardData.financialProduction?.financialPlanning || 0}
            annuityPremium={dashboardData.financialProduction?.annuity_premium || 0}
            lifeInsurancePremium={dashboardData.financialProduction?.life_insurance_premium || 0}
          />
        </motion.div>
      </div>

      {/* Products and Costs Section */}
      <SectionDivider title="Products & Costs" />

      {/* Products sold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ProductSoldCard
              title="Annuities Sold"
              count={dashboardData.productsSold?.annuities || 0}
              icon={<Award className="h-5 w-5 text-blue-400" />}
              color="blue"
              details={[
                {
                  label: "Average Premium",
                  value: `${dashboardData.financialProduction?.annuity_premium && dashboardData.productsSold?.annuities ? (dashboardData.financialProduction.annuity_premium / Math.max(1, dashboardData.productsSold?.annuities)).toLocaleString() : "0"}`,
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
              count={dashboardData.productsSold?.lifePolicies || 0}
              icon={<Shield className="h-5 w-5 text-red-400" />}
              color="red"
              details={[
                {
                  label: "Average Coverage",
                  value: `$${dashboardData.financialProduction?.life_insurance_premium && dashboardData.productsSold?.lifePolicies ? (dashboardData.financialProduction.life_insurance_premium / Math.max(1, dashboardData.productsSold?.lifePolicies)).toLocaleString() : "0"}`,
                },
                { label: "Commission Rate", value: "85%" },
                { label: "Total Commission", value: `$${lifeInsuranceCommission.toLocaleString()}` },
              ]}
              benefits={["Death benefit", "Cash value growth", "Living benefits"]}
              chartData={[45, 60, 35, 70, 45, 60, 35]}
            />
          </motion.div>
        </div>

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
            expensePerBuyingUnit={expensePerBuyingUnit}
            expensePerAppointment={expensePerAppointment}
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
            incomeAssets={dashboardData.eventDetails.incomeAssets}
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
          />
        </motion.div>
      </div>
    </div>
  )
}
