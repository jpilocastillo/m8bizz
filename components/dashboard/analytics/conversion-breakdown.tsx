"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Calendar, Target, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface ConversionBreakdownProps {
  registrants: number
  attendees: number
  appointmentsSet: number
  clientsCreated: number
}

export const ConversionBreakdown = memo(function ConversionBreakdown({
  registrants,
  attendees,
  appointmentsSet,
  clientsCreated,
}: ConversionBreakdownProps) {
  // Calculate conversion rates
  const registrantsToAttendees = registrants > 0 ? (attendees / registrants) * 100 : 0
  const attendeesToAppointments = attendees > 0 ? (appointmentsSet / attendees) * 100 : 0
  const appointmentsToClients = appointmentsSet > 0 ? (clientsCreated / appointmentsSet) * 100 : 0
  const overallConversion = registrants > 0 ? (clientsCreated / registrants) * 100 : 0

  // Calculate drop-off rates
  const dropOffRegistrantsToAttendees = 100 - registrantsToAttendees
  const dropOffAttendeesToAppointments = 100 - attendeesToAppointments
  const dropOffAppointmentsToClients = 100 - appointmentsToClients

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  // Calculate width percentages for visual funnel (relative to registrants)
  const getFunnelWidth = (value: number) => {
    return registrants > 0 ? (value / registrants) * 100 : 0
  }

  const steps = [
    {
      label: "Registrants",
      value: registrants,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      progressColor: "bg-blue-500",
      width: 100,
    },
    {
      label: "Attendees",
      value: attendees,
      icon: UserCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      progressColor: "bg-cyan-500",
      conversionRate: registrantsToAttendees,
      width: getFunnelWidth(attendees),
      dropOff: dropOffRegistrantsToAttendees,
    },
    {
      label: "Appointments Set",
      value: appointmentsSet,
      icon: Calendar,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      borderColor: "border-indigo-500/30",
      progressColor: "bg-indigo-500",
      conversionRate: attendeesToAppointments,
      width: getFunnelWidth(appointmentsSet),
      dropOff: dropOffAttendeesToAppointments,
    },
    {
      label: "Clients Created",
      value: clientsCreated,
      icon: Target,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      progressColor: "bg-amber-500",
      conversionRate: appointmentsToClients,
      width: getFunnelWidth(clientsCreated),
      dropOff: dropOffAppointmentsToClients,
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-m8bs-blue" />
          Conversion Funnel
        </CardTitle>
        <p className="text-xs text-m8bs-muted mt-1">
          Journey from registrants to clients
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <motion.div
          className="space-y-3 flex-1"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              variants={item}
              className="space-y-2"
            >
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`${step.bgColor} p-2 rounded-lg`}>
                    <step.icon className={`h-4 w-4 ${step.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {step.label}
                    </span>
                    {step.conversionRate !== undefined && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-white/60">
                          {index > 0 ? "Conversion:" : ""}
                        </span>
                        <span className={`text-xs font-bold ${step.color}`}>
                          {formatPercent(step.conversionRate)}
                        </span>
                        {step.dropOff !== undefined && step.dropOff > 0 && (
                          <div className="flex items-center gap-0.5 ml-1">
                            <TrendingDown className="h-3 w-3 text-red-400" />
                            <span className="text-[10px] text-red-400">
                              {formatPercent(step.dropOff)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${step.color}`}>
                    {formatNumber(step.value)}
                  </span>
                </div>
              </div>

              {/* Visual Funnel Bar */}
              <div className="relative w-full h-3 bg-m8bs-card-alt rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${step.width}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className={`h-full ${step.progressColor} rounded-full shadow-lg`}
                  style={{
                    boxShadow: `0 0 10px ${step.progressColor.replace('bg-', '').replace('-500', '')}40`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {step.width > 15 && (
                    <span className="text-[10px] font-bold text-white drop-shadow-md">
                      {formatPercent(step.width)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Overall Conversion Summary */}
          <motion.div
            variants={item}
            className="mt-4 pt-4 border-t border-m8bs-border"
          >
            <div className="bg-m8bs-card-alt rounded-lg p-3 border border-m8bs-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">
                  Overall Conversion Rate
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-m8bs-blue">
                    {formatPercent(overallConversion)}
                  </span>
                  {overallConversion >= 10 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">
                  {formatNumber(clientsCreated)} clients
                </span>
                <span className="text-white/60">
                  from {formatNumber(registrants)} registrants
                </span>
              </div>
              
              {/* Overall Progress Bar */}
              <div className="mt-3 relative w-full h-2 bg-m8bs-card-alt rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallConversion}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-m8bs-card-alt rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
})

