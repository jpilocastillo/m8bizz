"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Calendar, Target, TrendingDown, TrendingUp, XCircle, AlertCircle, UtensilsCrossed, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"

interface ConversionBreakdownProps {
  registrants: number
  plateLickers?: number
  attendees: number
  appointmentsSet: number
  firstAppointmentNoShows: number
  notQualified: number
  clientsCreated: number
}

export const ConversionBreakdown = memo(function ConversionBreakdown({
  registrants,
  plateLickers = 0,
  attendees,
  appointmentsSet,
  firstAppointmentNoShows,
  notQualified,
  clientsCreated,
}: ConversionBreakdownProps) {
  // Calculate conversion rates
  const registrantsToPlateLickers = registrants > 0 ? (plateLickers / registrants) * 100 : 0
  // Percentage of attendees from registrants
  const registrantsToAttendees = registrants > 0 ? (attendees / registrants) * 100 : 0
  // Appointments set from attendees
  const attendeesToAppointments = attendees > 0 ? (appointmentsSet / attendees) * 100 : 0
  // 1st appointment no shows from appointments set
  const appointmentsToNoShows = appointmentsSet > 0 ? (firstAppointmentNoShows / appointmentsSet) * 100 : 0
  // Not qualified from appointments set
  const appointmentsToNotQualified = appointmentsSet > 0 ? (notQualified / appointmentsSet) * 100 : 0
  // Clients from appointments set
  const appointmentsToClients = appointmentsSet > 0 ? (clientsCreated / appointmentsSet) * 100 : 0
  const overallConversion = registrants > 0 ? (clientsCreated / registrants) * 100 : 0

  // Calculate drop-off rates
  const dropOffRegistrantsToPlateLickers = 100 - registrantsToPlateLickers
  const dropOffRegistrantsToAttendees = 100 - registrantsToAttendees
  const dropOffAttendeesToAppointments = 100 - attendeesToAppointments
  const dropOffAppointmentsToNoShows = appointmentsToNoShows
  const dropOffAppointmentsToNotQualified = appointmentsToNotQualified
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

  // All steps including plate lickers for data display
  const allSteps = [
    {
      label: "Registrants",
      value: registrants,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      progressColor: "bg-blue-500",
      width: 100,
      conversionRate: undefined,
      dropOff: undefined,
    },
    {
      label: "Plate Lickers",
      value: plateLickers,
      icon: UtensilsCrossed,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      progressColor: "bg-purple-500",
      conversionRate: registrantsToPlateLickers,
      width: getFunnelWidth(plateLickers),
      dropOff: dropOffRegistrantsToPlateLickers,
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
      label: "1st Appointment No Shows",
      value: firstAppointmentNoShows,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
      progressColor: "bg-red-500",
      conversionRate: appointmentsToNoShows,
      width: getFunnelWidth(firstAppointmentNoShows),
      dropOff: dropOffAppointmentsToNoShows,
    },
    {
      label: "Not Qualified",
      value: notQualified,
      icon: AlertCircle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      progressColor: "bg-orange-500",
      conversionRate: appointmentsToNotQualified,
      width: getFunnelWidth(notQualified),
      dropOff: dropOffAppointmentsToNotQualified,
    },
    {
      label: "Clients",
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

  // Steps for funnel visualization (excluding plate lickers)
  const steps = allSteps.filter(step => step.label !== "Plate Lickers")

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

  // Calculate funnel visualization data - proportional to actual numbers
  const funnelHeight = 300
  const maxWidth = 300
  const minWidth = 20 // Reduced minimum to allow true proportionality
  const calculateFunnelWidth = (value: number, maxValue: number) => {
    if (maxValue === 0) return minWidth
    const ratio = value / maxValue
    // Calculate proportional width, but ensure it's at least visible
    const proportionalWidth = ratio * maxWidth
    // Only use minWidth if the value is 0, otherwise use proportional width
    return value === 0 ? minWidth : Math.max(minWidth, proportionalWidth)
  }
  
  // Get color details for each step with enhanced styling
  const getColorDetails = (step: typeof steps[0]) => {
    const colorMap: Record<string, { fill: string; stroke: string; gradient: string[]; glow: string; shadow: string }> = {
      'blue': { fill: '#3b82f6', stroke: '#60a5fa', gradient: ['#3b82f6', '#2563eb'], glow: '#3b82f6', shadow: '#1e40af' },
      'purple': { fill: '#a855f7', stroke: '#c084fc', gradient: ['#a855f7', '#9333ea'], glow: '#a855f7', shadow: '#7e22ce' },
      'cyan': { fill: '#06b6d4', stroke: '#22d3ee', gradient: ['#06b6d4', '#0891b2'], glow: '#06b6d4', shadow: '#0e7490' },
      'indigo': { fill: '#6366f1', stroke: '#818cf8', gradient: ['#6366f1', '#4f46e5'], glow: '#6366f1', shadow: '#4338ca' },
      'red': { fill: '#ef4444', stroke: '#f87171', gradient: ['#ef4444', '#dc2626'], glow: '#ef4444', shadow: '#b91c1c' },
      'orange': { fill: '#f97316', stroke: '#fb923c', gradient: ['#f97316', '#ea580c'], glow: '#f97316', shadow: '#c2410c' },
      'amber': { fill: '#f59e0b', stroke: '#fbbf24', gradient: ['#f59e0b', '#d97706'], glow: '#f59e0b', shadow: '#b45309' },
    }
    
    for (const [key, colors] of Object.entries(colorMap)) {
      if (step.progressColor.includes(key)) return colors
    }
    return colorMap.blue
  }

  // Calculate drop-off values between steps
  const getDropOffValue = (currentIndex: number) => {
    if (currentIndex === 0) return 0
    const currentStep = steps[currentIndex]
    const previousStep = steps[currentIndex - 1]
    return previousStep.value - currentStep.value
  }

  // Calculate additional metrics
  const qualifiedAppointments = appointmentsSet - notQualified - firstAppointmentNoShows
  const qualifiedToClientsRate = qualifiedAppointments > 0 ? (clientsCreated / qualifiedAppointments) * 100 : 0
  const plateLickersToAttendeesRate = plateLickers > 0 ? (attendees / plateLickers) * 100 : 0

  // Get background color class for badges
  const getBadgeBgClass = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-500/10',
      'text-purple-400': 'bg-purple-500/10',
      'text-cyan-400': 'bg-cyan-500/10',
      'text-indigo-400': 'bg-indigo-500/10',
      'text-red-400': 'bg-red-500/10',
      'text-orange-400': 'bg-orange-500/10',
      'text-amber-400': 'bg-amber-500/10',
    }
    return colorMap[colorClass] || 'bg-blue-500/10'
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-m8bs-blue" />
          Conversion Funnel
        </CardTitle>
        <p className="text-xs text-m8bs-muted mt-0.5">
          Complete journey from registrants to clients with detailed metrics
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Side-by-side layout: Chart and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          {/* Sleek Modern Funnel Chart */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-full max-w-[350px]">
              {/* Sleek funnel visualization */}
              <svg width="100%" height={funnelHeight} className="overflow-visible">
                <defs>
                  {steps.map((step, index) => {
                    const colors = getColorDetails(step)
                    return (
                      <g key={`defs-${index}`}>
                        {/* Sleek gradient with better depth */}
                        <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.95" />
                          <stop offset="50%" stopColor={colors.gradient[0]} stopOpacity="0.85" />
                          <stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.75" />
                        </linearGradient>
                        {/* Subtle inner glow */}
                        <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </g>
                    )
                  })}
                  {/* Arrow marker for downward flow */}
                  <marker
                    id="arrowDown"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill="#ffffff" opacity="0.9" />
                  </marker>
                </defs>
                
                {steps.map((step, index) => {
                  const width = calculateFunnelWidth(step.value, registrants)
                  const nextWidth = index < steps.length - 1 
                    ? calculateFunnelWidth(steps[index + 1].value, registrants)
                    : Math.max(minWidth, width * 0.95) // Last segment tapers slightly but stays proportional
                  
                  const segmentHeight = funnelHeight / steps.length
                  const y = index * segmentHeight
                  const centerX = maxWidth / 2 + 20
                  const leftX = centerX - width / 2
                  const rightX = centerX + width / 2
                  const nextLeftX = centerX - nextWidth / 2
                  const nextRightX = centerX + nextWidth / 2
                  
                  const colors = getColorDetails(step)
                  
                  return (
                    <g key={step.label}>
                      {/* Sleek funnel segment with smooth edges */}
                      <motion.polygon
                        points={`${leftX},${y} ${rightX},${y} ${nextRightX},${y + segmentHeight} ${nextLeftX},${y + segmentHeight}`}
                        fill={`url(#gradient-${index})`}
                        stroke={colors.stroke}
                        strokeWidth={1.5}
                        opacity={0.9}
                        filter={`url(#glow-${index})`}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 0.9, scaleY: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ transformOrigin: `${centerX}px ${y}px` }}
                      />
                      
                      {/* Sleek label on segment */}
                      <motion.g
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                      >
                        {/* Stage name */}
                        <text
                          x={centerX}
                          y={y + segmentHeight / 2 + 5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-semibold fill-white"
                          style={{ fontSize: '12px', fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,1)' }}
                        >
                          {step.label}
                        </text>
                      </motion.g>
                      
                      {/* Downward arrow between segments */}
                      {index < steps.length - 1 && (
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                        >
                          {/* Arrow line */}
                          <line
                            x1={centerX}
                            y1={y + segmentHeight}
                            x2={centerX}
                            y2={y + segmentHeight + 18}
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            opacity={0.8}
                            markerEnd="url(#arrowDown)"
                          />
                        </motion.g>
                      )}
                      
                      {/* Subtle divider line */}
                      {index < steps.length - 1 && (
                        <motion.line
                          x1={nextLeftX}
                          y1={y + segmentHeight}
                          x2={nextRightX}
                          y2={y + segmentHeight}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={0.5}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                        />
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Sleek Data Breakdown - Next to Chart */}
          <motion.div
            className="space-y-2.5 flex-1"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {allSteps.map((step, index) => {
              const previousStep = index > 0 ? allSteps[index - 1] : null
              const dropOffValue = previousStep ? previousStep.value - step.value : 0
              const percentage = registrants > 0 ? (step.value / registrants) * 100 : 0
              const colors = getColorDetails(step)
              
              return (
                <motion.div
                  key={step.label}
                  variants={item}
                  className="group bg-m8bs-card-alt/30 rounded-lg p-3 border border-m8bs-border/30 hover:border-m8bs-border/60 hover:bg-m8bs-card-alt/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Sleek color bar indicator */}
                    <div 
                      className="w-1 h-full rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: colors.gradient[0] }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Main data row */}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <step.icon className={`h-4 w-4 ${step.color} flex-shrink-0`} />
                          <span className="text-sm font-semibold text-white truncate">
                            {step.label}
                          </span>
                        </div>
                        <span className={`text-lg font-extrabold ${step.color} tabular-nums flex-shrink-0`}>
                          {formatNumber(step.value)}
                        </span>
                      </div>
                      
                      {/* Metrics row - clean and readable */}
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <span className="text-white/70 font-medium">
                          {formatPercent(percentage)} of total
                        </span>
                        {step.conversionRate !== undefined && step.conversionRate > 0 && (
                          <>
                            <span className="text-white/30">•</span>
                            <span className={`${step.color} font-semibold`}>
                              {formatPercent(step.conversionRate)} conversion
                            </span>
                          </>
                        )}
                        {index > 0 && dropOffValue > 0 && (
                          <>
                            <span className="text-white/30">•</span>
                            <span className="text-red-400 font-medium flex items-center gap-1">
                              <ArrowDown className="h-3 w-3" />
                              {formatNumber(dropOffValue)} lost
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

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
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-white/60">
                {formatNumber(clientsCreated)} clients
              </span>
              <span className="text-white/60">
                from {formatNumber(registrants)} registrants
              </span>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="relative w-full h-2 bg-m8bs-card-alt rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallConversion}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-m8bs-blue to-m8bs-purple rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
})

