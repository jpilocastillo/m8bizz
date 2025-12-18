"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DollarSign, Users, Target, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"

interface DashboardMetricsProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function DashboardMetrics({ businessGoals, currentValues, clientMetrics }: DashboardMetricsProps) {
  // Debug logging to track data updates
  console.log('DashboardMetrics received data:', {
    businessGoals,
    currentValues,
    clientMetrics
  })

  // Show loading state if data is not available
  if (!businessGoals || !currentValues || !clientMetrics) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full max-w-full">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="border-none shadow-lg overflow-hidden h-full flex flex-col animate-pulse">
            <div className="h-1 w-full bg-gray-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4">
              <div className="flex-1 pr-2">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              </div>
              <div className="rounded-full p-2 bg-gray-600 w-8 h-8"></div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center px-4 pb-4">
              <div className="h-8 bg-gray-600 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate metrics from real data using correct formulas
  const currentAUM = currentValues?.current_aum || 0
  const currentAnnuity = currentValues?.current_annuity || 0
  const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
  const avgAUMSize = clientMetrics?.avg_aum_size || 0
  const annuityClosed = clientMetrics?.annuity_closed || 0
  const monthlyIdealProspects = clientMetrics?.monthly_ideal_prospects || 0

  console.log('Calculated metrics:', {
    currentAUM,
    currentAnnuity,
    avgAnnuitySize,
    avgAUMSize,
    annuityClosed,
    monthlyIdealProspects
  })

  // Calculate clients needed using correct formula: (E11 + E10) / 2
  const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
  const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
  const calculatedClientsNeeded = Math.ceil((E11 + E10) / 2)
  
  // Use the stored clients_needed value from the database, fallback to calculated value
  const clientsNeeded = clientMetrics?.clients_needed || calculatedClientsNeeded

  // Get additional metrics needed for proper calculations
  const appointmentAttrition = clientMetrics?.appointment_attrition || 0
  const avgCloseRatio = clientMetrics?.avg_close_ratio || 0

  // Calculate proper formulas based on business logic
  // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
  const annualClosingProspects = avgCloseRatio > 0 
    ? Math.ceil((clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100))
    : Math.ceil(monthlyIdealProspects * 12) // Fallback to stored value

  // Monthly Ideal Prospects = Annual Closing Prospects / 12
  const calculatedMonthlyIdealProspects = annualClosingProspects / 12

  // Monthly New Appointments = Monthly Ideal Prospects * 3
  const newAppointments = Math.ceil(calculatedMonthlyIdealProspects * 3)
  
  // Total new monthly appointments needed
  const totalNewMonthlyAppointments = Math.ceil(calculatedMonthlyIdealProspects * 3)

  // Total advisor book: current AUM + current annuity (in millions)
  const totalBooked = (currentAUM + currentAnnuity) / 1000000



  const metrics = [
    {
      title: "Clients Needed",
      value: clientsNeeded.toString(),
      description: "Target clients needed",
      icon: Users,
      color: "red",
      tooltip: "Number of clients needed: (# of AUM accounts + # of annuity closed) / 2",
      shortDescription: "How many clients you need based on your AUM and annuity metrics.",
    },
    {
      title: "Monthly New Appointments Needed",
      value: newAppointments.toString(),
      description: "Monthly target",
      icon: Calendar,
      color: "blue",
      tooltip: "Number of monthly new appointments needed",
      shortDescription: "How many monthly new appointments you need to reach your goal.",
    },
    {
      title: "Annual Ideal Closing Prospects Needed",
      value: annualClosingProspects.toString(),
      description: "Prospects needed",
      icon: Target,
      color: "green",
      tooltip: "Number of prospects needed to close to reach annual goal",
      shortDescription: "How many prospects you need to close to reach your annual goal.",
    },
    {
      title: "Annual Total Prospects Necessary",
      value: (totalNewMonthlyAppointments * 12).toString(),
      description: "Annual prospects needed",
      icon: Target,
      color: "purple",
      tooltip: "Number of annual total prospects necessary to reach annual goal",
      shortDescription: "How many annual total prospects you need to reach your annual goal.",
    },
    {
      title: "Total Advisor Book",
      value: `$${totalBooked.toFixed(1)}M`,
      description: "Current book value",
      icon: DollarSign,
      color: "yellow",
      tooltip: "Total value of all advisor book business",
      shortDescription: "How much your advisor book value is.",
    },
  ]

  const getColorConfig = (color: string) => {
    const colorMap = {
      red: {
        bgColor: "bg-red-500/20",
        iconColor: "text-red-500",
      },
      purple: {
        bgColor: "bg-purple-500/20",
        iconColor: "text-purple-500",
      },
      blue: {
        bgColor: "bg-m8bs-card-alt",
        iconColor: "text-m8bs-blue",
      },
      yellow: {
        bgColor: "bg-yellow-500/20",
        iconColor: "text-yellow-500",
      },
      green: {
        bgColor: "bg-green-500/20",
        iconColor: "text-green-500",
      },
    }
    return colorMap[color as keyof typeof colorMap] || {
      bgColor: "bg-gray-500/20",
      iconColor: "text-gray-500",
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {metrics.map((metric, index) => {
          const colorConfig = getColorConfig(metric.color)
          return (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                className="bg-m8bs-card text-white shadow-sm h-full"
                role="article"
                aria-label={`${metric.title}: ${metric.value}`}
              >
                <CardContent className="p-3 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80 font-medium tracking-wide">{metric.title}</span>
                    <div className={`${colorConfig.bgColor} p-2 rounded-lg`} aria-hidden="true">
                      <metric.icon className={`h-4 w-4 ${colorConfig.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-xl font-extrabold tracking-tight text-white mb-1" aria-label={`Value: ${metric.value}`}>
                    {metric.value}
                  </div>
                  <div className="text-xs text-white/60 mt-auto font-medium" aria-label={`Additional info: ${metric.description}`}>
                    {metric.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
