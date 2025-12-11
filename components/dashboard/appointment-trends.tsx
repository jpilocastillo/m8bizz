"use client"

import { useState, useEffect } from "react"
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, ArrowRight, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AppointmentTrendsProps {
  setAtEvent?: number
  setAfterEvent?: number
  firstAppointmentAttended?: number
  firstAppointmentNoShows?: number
  secondAppointmentAttended?: number
  notQualified?: number
  clients?: number
}

export function AppointmentTrends({
  setAtEvent = 4,
  setAfterEvent = 2,
  firstAppointmentAttended = 4,
  firstAppointmentNoShows = 2,
  secondAppointmentAttended = 4,
  notQualified = 0,
  clients = 0,
}: AppointmentTrendsProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [hoveredInsight, setHoveredInsight] = useState<number | null>(null)

  // Calculate the maximum value for scaling
  const maxValue = Math.max(
    setAtEvent,
    setAfterEvent,
    firstAppointmentAttended,
    firstAppointmentNoShows,
    secondAppointmentAttended,
  )

  // Calculate conversion rates
  const firstAppointmentRate = Math.round((firstAppointmentAttended / (setAtEvent + setAfterEvent)) * 100)
  const secondAppointmentRate = Math.round((secondAppointmentAttended / firstAppointmentAttended) * 100)
  const overallConversionRate = Math.round((secondAppointmentAttended / (setAtEvent + setAfterEvent)) * 100)
  const closingRate = secondAppointmentAttended > 0 ? Math.round((clients / secondAppointmentAttended) * 100) : 0

  // Helper function to get icon color from bg color
  const getIconColor = (bgColor: string) => {
    const colorMap: { [key: string]: string } = {
      "bg-gray-500": "text-gray-500",
      "bg-rose-500": "text-rose-500",
      "bg-cyan-400": "text-cyan-500",
      "bg-emerald-500": "text-emerald-500",
      "bg-slate-400": "text-slate-400",
      "bg-red-500": "text-red-500",
      "bg-amber-400": "text-amber-500",
    }
    return colorMap[bgColor] || "text-white/60"
  }

  // Helper function to get border color from bg color
  const getBorderColor = (bgColor: string) => {
    const colorMap: { [key: string]: string } = {
      "bg-gray-500": "border-gray-500/60",
      "bg-rose-500": "border-rose-500/60",
      "bg-cyan-400": "border-cyan-500/60",
      "bg-emerald-500": "border-emerald-500/60",
      "bg-slate-400": "border-slate-400/60",
      "bg-red-500": "border-red-500/60",
      "bg-amber-400": "border-amber-500/60",
    }
    return colorMap[bgColor] || "border-m8bs-border/40"
  }

  // Helper function to get bg color for icon container
  const getIconBgColor = (bgColor: string) => {
    const colorMap: { [key: string]: string } = {
      "bg-gray-500": "bg-gray-500/20",
      "bg-rose-500": "bg-rose-500/20",
      "bg-cyan-400": "bg-cyan-500/20",
      "bg-emerald-500": "bg-emerald-500/20",
      "bg-slate-400": "bg-slate-400/20",
      "bg-red-500": "bg-red-500/20",
      "bg-amber-400": "bg-amber-500/20",
    }
    return colorMap[bgColor] || "bg-black/30"
  }

  // Data for the journey steps
  const journeySteps = [
    {
      label: "Set at Event",
      value: setAtEvent,
      icon: Calendar,
      color: "bg-gray-500",
      gradient: "from-blue-600 to-blue-400",
      description: "Appointments scheduled during the event",
    },
    {
      label: "Set After Event",
      value: setAfterEvent,
      icon: TrendingUp,
      color: "bg-rose-500",
      gradient: "from-rose-600 to-rose-400",
      description: "Appointments scheduled after follow-up",
    },
    {
      label: "1st Appt. Attended",
      value: firstAppointmentAttended,
      icon: CheckCircle,
      color: "bg-cyan-400",
      gradient: "from-cyan-500 to-cyan-300",
      description: `${firstAppointmentRate}% attendance rate`,
    },
    {
      label: "1st Appt. No Shows",
      value: firstAppointmentNoShows,
      icon: XCircle,
      color: "bg-emerald-500",
      gradient: "from-emerald-600 to-emerald-400",
      description: `${100 - firstAppointmentRate}% no-show rate`,
    },
    {
      label: "2nd Appt. Attended",
      value: secondAppointmentAttended,
      icon: Users,
      color: "bg-slate-400",
      gradient: "from-slate-500 to-slate-300",
      description: `${secondAppointmentRate}% return rate`,
    },
    {
      label: "Not Qualified",
      value: notQualified,
      icon: XCircle,
      color: "bg-red-500",
      gradient: "from-red-600 to-red-400",
      description: "Prospects not qualified for appointments",
    },
    {
      label: "Clients",
      value: clients,
      icon: TrendingUp,
      color: "bg-amber-400",
      gradient: "from-amber-500 to-amber-300",
      description: `${closingRate}% closing rate`,
    },
  ]

  // Journey insights with hover effects
  const journeyInsights = [
    {
      text: `${firstAppointmentRate}% of prospects attend their first appointment`,
      color: "text-amber-400",
      hoverBg: "bg-gray-500/20",
      hoverBorder: "border-gray-500/50",
      icon: CheckCircle,
    },
    {
      text: `${secondAppointmentRate}% of first appointments convert to second appointments`,
      color: "text-amber-400",
      hoverBg: "bg-cyan-500/20",
      hoverBorder: "border-cyan-500/50",
      icon: Users,
    },
    {
      text: `Overall journey efficiency: ${overallConversionRate}%`,
      color: "text-amber-400",
      hoverBg: "bg-amber-500/20",
      hoverBorder: "border-amber-500/50",
      icon: TrendingUp,
    },
  ]

  // Trigger animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Add closing rate to journey insights
  journeyInsights.push({
    text: `Closing rate: ${closingRate}% of 2nd appointments become clients`,
    color: "text-amber-400",
    hoverBg: "bg-amber-500/20",
    hoverBorder: "border-amber-500/50",
    icon: TrendingUp,
  })

  return (
    <Card
      className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveStep(null)
        setHoveredInsight(null)
      }}
    >
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
            <Calendar className="mr-3 h-6 w-6 text-m8bs-muted" />
            Appointment Trends
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 relative">
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-black/50 hover:border-amber-500/60 hover:shadow-md">
          <div className="flex items-center">
            <div className="bg-amber-500/20 p-2 rounded-lg mr-3">
              <Info className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="text-sm text-white font-medium tracking-wide">
                Overall conversion: {" "}
                <span className="text-xl font-extrabold text-white">{overallConversionRate}%</span> from
                initial contact to second appointment
              </span>
            </div>
          </div>
        </div>

        {/* Journey Path Visualization */}
        <div className="mb-8 relative z-10">
          {/* Icons Row */}
          <div className="grid grid-cols-7 gap-4 items-end text-center mb-1">
            {journeySteps.map((step, index) => (
              <div key={step.label} className="flex items-center justify-center w-full">
                <div
                  className={`rounded-lg p-2 transition-all duration-300 ${
                    activeStep === index 
                      ? `${getIconBgColor(step.color)} border-2 ${getBorderColor(step.color)} scale-110 shadow-md` 
                      : "bg-black/30 border border-m8bs-border/40"
                  }`}
                >
                  <step.icon className={`h-4 w-4 ${getIconColor(step.color)}`} />
                </div>
              </div>
            ))}
          </div>
          {/* Labels Row */}
          <div className="grid grid-cols-7 gap-4 items-end text-center mb-1">
            {journeySteps.map((step, index) => (
              <div key={step.label} className="flex items-center justify-center w-full">
                <p className="text-xs font-medium text-white tracking-wide">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
          {/* Values Row */}
          <div className="grid grid-cols-7 gap-4 items-end text-center">
            {journeySteps.map((step, index) => (
              <div key={step.label} className="flex items-center justify-center w-full">
                <div className="text-xl font-extrabold tracking-tight text-white min-h-[2.5rem] flex items-end justify-center">{step.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Arrows */}
        <div className="flex justify-between items-center px-10 mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <ArrowRight
              key={`arrow-${index}`}
              className={`h-5 w-5 text-white transition-all duration-300 ${
                activeStep === index || activeStep === index + 1 ? "scale-125" : ""
              }`}
            />
          ))}
        </div>

        {/* Journey Insights */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-amber-500/60 hover:shadow-md">
          <h4 className="text-sm font-semibold text-white tracking-wide mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-amber-400" />
            Journey Insights
          </h4>
          <div className="space-y-3">
            {journeyInsights.map((insight, index) => (
              <div
                key={`insight-${index}`}
                className="p-2 rounded-md transition-all duration-300"
                onMouseEnter={() => setHoveredInsight(index)}
                onMouseLeave={() => setHoveredInsight(null)}
              >
                <p className="flex items-center text-sm font-medium">
                  <insight.icon
                    className={`h-4 w-4 mr-2 ${insight.color}`}
                  />
                  <span className="text-white">
                    {insight.text.split(/([\d.]+%)/).map((part, i) =>
                      /[\d.]+%/.test(part) ? (
                        <span key={i} className="text-white font-extrabold">
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}