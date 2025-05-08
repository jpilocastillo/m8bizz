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
}

export function AppointmentTrends({
  setAtEvent = 4,
  setAfterEvent = 2,
  firstAppointmentAttended = 4,
  firstAppointmentNoShows = 2,
  secondAppointmentAttended = 4,
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

  // Data for the journey steps
  const journeySteps = [
    {
      label: "Set at Event",
      value: setAtEvent,
      icon: Calendar,
      color: "bg-blue-500",
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
  ]

  // Journey insights with hover effects
  const journeyInsights = [
    {
      text: `${firstAppointmentRate}% of prospects attend their first appointment`,
      color: "text-amber-400",
      hoverBg: "bg-blue-500/20",
      hoverBorder: "border-blue-500/50",
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

  return (
    <Card
      className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveStep(null)
        setHoveredInsight(null)
      }}
    >
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight group">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200 transition-all duration-300 group-hover:from-amber-200 group-hover:to-white">
              From Event to Engagement: Appointment Trends
            </span>
          </CardTitle>
          <div
            className={`p-2 rounded-lg transition-all duration-300 transform ${
              isHovered ? "bg-amber-500/20 rotate-12 scale-110" : ""
            }`}
          >
            <Calendar className="h-5 w-5 text-amber-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 relative">
        <div className="mb-4 text-sm bg-gray-800/50 p-3 rounded-md border border-gray-700 transition-all duration-300 hover:bg-gray-800/80 hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-900/10 group">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-amber-400 group-hover:animate-pulse" />
            <span className="text-gray-400">
              Overall conversion:{" "}
              <span className="text-amber-400 font-bold group-hover:text-amber-300">{overallConversionRate}%</span> from
              initial contact to second appointment
            </span>
          </div>
        </div>

        {/* Journey Path Visualization */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 transform -translate-y-1/2 z-0">
          {journeySteps.map(
            (step, index) =>
              index < journeySteps.length - 1 && (
                <div
                  key={`connector-${index}`}
                  className={`absolute h-1 transition-all duration-700 ease-out ${step.color}`}
                  style={{
                    left: `${index * 25}%`,
                    width: "25%",
                    opacity: animationComplete ? 1 : 0,
                    transform: animationComplete ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transitionDelay: `${index * 200}ms`,
                  }}
                />
              ),
          )}
        </div>

        <div className="flex justify-between items-end relative h-48 mb-12 z-10">
          {journeySteps.map((step, index) => (
            <div
              key={index}
              className="w-[18%] flex flex-col items-center"
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Bar Chart */}
              <div className="w-full h-full relative flex items-end mb-2">
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ease-out bg-gradient-to-t ${step.gradient} hover:shadow-lg`}
                  style={{
                    height: animationComplete ? `${(step.value / maxValue) * 100}%` : "0%",
                    transitionDelay: `${index * 100}ms`,
                    boxShadow: activeStep === index ? "0 0 20px rgba(255, 255, 255, 0.4)" : "none",
                    transform: activeStep === index ? "scaleY(1.05)" : "scaleY(1)",
                  }}
                >
                  {/* Value Label */}
                  <div
                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-white text-sm font-bold transition-all duration-300 ${
                      activeStep === index ? "opacity-100 scale-110" : "opacity-0 scale-90"
                    }`}
                  >
                    {step.value}
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div
                className={`rounded-full p-2 mb-2 transition-all duration-300 ${
                  activeStep === index
                    ? `${step.color} text-white scale-110 shadow-lg shadow-${step.color}/40`
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                <step.icon className={`h-5 w-5 ${activeStep === index ? "animate-pulse" : ""}`} />
              </div>

              {/* Label */}
              <p
                className={`text-sm font-medium text-center transition-colors duration-300 ${
                  activeStep === index ? "text-white" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {/* Value */}
              <p
                className={`text-xl font-bold transition-all duration-300 ${
                  activeStep === index ? "text-white scale-110" : "text-gray-300"
                }`}
              >
                {step.value}
              </p>

              {/* Description - Only visible when active */}
              <div
                className={`mt-1 text-xs text-center transition-all duration-300 max-w-[120px] ${
                  activeStep === index ? "opacity-100 text-gray-300" : "opacity-0 text-gray-500"
                }`}
              >
                {step.description}
              </div>
            </div>
          ))}
        </div>

        {/* Flow Arrows */}
        <div className="flex justify-between items-center px-10 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <ArrowRight
              key={`arrow-${index}`}
              className={`h-5 w-5 text-gray-600 transition-all duration-300 ${
                activeStep === index || activeStep === index + 1 ? "text-amber-400 scale-125" : ""
              }`}
            />
          ))}
        </div>

        {/* Journey Insights */}
        <div className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700 transition-all duration-300 hover:bg-gray-800/70 hover:border-gray-600">
          <h4 className="text-white font-bold mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-amber-400" />
            Journey Insights
          </h4>
          <div className="text-sm text-gray-300 space-y-3">
            {journeyInsights.map((insight, index) => (
              <div
                key={`insight-${index}`}
                className={`p-2 rounded-md transition-all duration-300 border border-transparent ${
                  hoveredInsight === index ? `${insight.hoverBg} ${insight.hoverBorder}` : ""
                }`}
                onMouseEnter={() => setHoveredInsight(index)}
                onMouseLeave={() => setHoveredInsight(null)}
              >
                <p className="flex items-center">
                  <insight.icon
                    className={`h-4 w-4 mr-2 ${insight.color} ${hoveredInsight === index ? "animate-pulse" : ""}`}
                  />
                  •{" "}
                  <span className={`ml-1 ${hoveredInsight === index ? "text-white" : ""}`}>
                    {insight.text.split(/([\d.]+%)/).map((part, i) =>
                      /[\d.]+%/.test(part) ? (
                        <span key={i} className={insight.color + " font-medium"}>
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
