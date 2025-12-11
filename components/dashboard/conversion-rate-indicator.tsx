"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Percent, Users, TrendingUp, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface ConversionRateIndicatorProps {
  attendees: number
  clients: number
  appointmentsBooked: number
  incomeAssets?: string
}

export function ConversionRateIndicator({
  attendees,
  clients,
  appointmentsBooked,
  incomeAssets = "$100,000+",
}: ConversionRateIndicatorProps) {
  // State for hover effects
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [isGaugeHovered, setIsGaugeHovered] = useState(false)

  // Calculate conversion rate
  const conversionRate = attendees > 0 ? (clients / attendees) * 100 : 0
  const lostProspects = attendees - clients
  const lostProspectsPercentage = attendees > 0 ? (lostProspects / attendees) * 100 : 0

  // Extract numeric value from income assets string
  const extractNumericValue = (assetString: string): number => {
    // Remove non-numeric characters except for decimal points
    const numericString = assetString.replace(/[^0-9.]/g, "")
    const value = Number.parseFloat(numericString)

    // If we can extract a number, use it; otherwise return 0
    if (!isNaN(value)) {
      return value
    }

    return 0 // Return 0 instead of hard-coded fallback
  }

  const assetValue = extractNumericValue(incomeAssets)
  const opportunityLost = lostProspects * assetValue

  // Format large numbers
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  // Determine performance level
  const getPerformanceLevel = (rate: number) => {
    if (rate < 5) return { text: "Critical", color: "text-red-400", bgColor: "bg-red-500/20" }
    if (rate < 10) return { text: "Needs Improvement", color: "text-yellow-400", bgColor: "bg-yellow-500/20" }
    if (rate < 15) return { text: "Good", color: "text-gray-400", bgColor: "bg-gray-500/20" }
    return { text: "Excellent", color: "text-green-400", bgColor: "bg-green-500/20" }
  }

  const performance = getPerformanceLevel(conversionRate)

  // Calculate potential improvement
  const improvedRate = Math.min(conversionRate + 5, 100)
  const improvedClients = Math.round(attendees * (improvedRate / 100))
  const additionalClients = improvedClients - clients

  return (
    <Card
      className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
            <Percent className="mr-3 h-6 w-6 text-purple-500" />
            Conversion Rate
          </CardTitle>
          <div className={`p-2 rounded-lg ${performance.bgColor}`}>
            <Percent className={`h-4 w-4 ${performance.color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col">
          {/* Conversion rate display */}
          <div
            className="flex items-center justify-between mb-6"
            onMouseEnter={() => setHoveredSection("rate")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <motion.div
              animate={{
                scale: hoveredSection === "rate" ? 1.03 : 1,
                y: hoveredSection === "rate" ? -2 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-5xl font-extrabold tracking-tight text-white">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm font-medium text-white/80 mt-1 tracking-wide">
                {performance.text}
              </div>
            </motion.div>

            <div
              className="relative w-24 h-24 cursor-pointer"
              onMouseEnter={() => setIsGaugeHovered(true)}
              onMouseLeave={() => setIsGaugeHovered(false)}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation={isGaugeHovered ? "3" : "1"} result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background track */}
                <path
                  d="M 50,50 m -40,0 a 40,40 0 1 1 80,0"
                  stroke={isGaugeHovered ? "#2a2b45" : "#1f2037"}
                  strokeWidth={isGaugeHovered ? "12" : "10"}
                  fill="none"
                  className="transition-all duration-300"
                />

                {/* Colored progress */}
                <motion.path
                  d="M 50,50 m -40,0 a 40,40 0 1 1 80,0"
                  stroke="url(#gaugeGradient)"
                  strokeWidth={isGaugeHovered ? "12" : "10"}
                  fill="none"
                  strokeDasharray="125.6"
                  initial={{ strokeDashoffset: 125.6 }}
                  animate={{
                    strokeDashoffset: 125.6 - (conversionRate / 20) * 125.6,
                    filter: isGaugeHovered ? "url(#glow)" : "none",
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Current position indicator */}
                {isGaugeHovered && (
                  <motion.circle
                    cx="50"
                    cy="10"
                    r="5"
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </svg>

              {/* Hover tooltip */}
              {isGaugeHovered && (
                <motion.div
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {conversionRate < 5
                    ? "Critical Zone"
                    : conversionRate < 10
                      ? "Improvement Zone"
                      : conversionRate < 15
                        ? "Good Zone"
                        : "Excellent Zone"}
                </motion.div>
              )}
            </div>
          </div>

          {/* Lost Prospects Alert */}
          <motion.div
            className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-black/50 hover:border-red-500/60 hover:shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredSection("lost")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <Users className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  {lostProspects}
                </h3>
                <p className="text-sm text-white/80 font-medium">Lost Prospects</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/80 font-medium">Missed Opportunities</span>
                <span className="text-xs font-extrabold text-white">{lostProspectsPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-m8bs-border/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, lostProspectsPercentage)}%`,
                  }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
            </div>

            <p className="text-sm text-white/80 font-medium">
              <span className="text-white font-extrabold">{lostProspects} potential clients</span> walked away without
              converting. Each represents approximately <span className="text-white font-extrabold">{incomeAssets}</span>{" "}
              in potential assets.
            </p>
          </motion.div>

          {/* Potential improvement */}
          {additionalClients > 0 && (
            <motion.div
              className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md"
              onMouseEnter={() => setHoveredSection("improvement")}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-500/20 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-medium text-white/80 tracking-wide">Potential Improvement</h3>
                </div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1">
                  <span>+{additionalClients} clients</span>
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-white/60 font-medium">
                Improving your conversion rate by just 5% would gain you {additionalClients} additional clients from the
                same number of attendees.
              </p>
            </motion.div>
          )}

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 text-center transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md">
              <p className="text-sm text-white/80 font-medium tracking-wide mb-1">Total Attendees</p>
              <p className="text-xl font-extrabold tracking-tight text-white">{attendees}</p>
            </div>
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 text-center transition-all duration-300 hover:bg-black/50 hover:border-amber-500/60 hover:shadow-md">
              <p className="text-sm text-white/80 font-medium tracking-wide mb-1">Appointments Booked</p>
              <p className="text-xl font-extrabold tracking-tight text-white">{appointmentsBooked}</p>
            </div>
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 text-center transition-all duration-300 hover:bg-black/50 hover:border-green-500/60 hover:shadow-md">
              <p className="text-sm text-white/80 font-medium tracking-wide mb-1">Total Clients</p>
              <p className="text-xl font-extrabold tracking-tight text-white">{clients}</p>
            </div>
          </div>

          {/* Improvement tips */}
          <motion.div
            className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mt-4 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60 hover:shadow-md"
            onMouseEnter={() => setHoveredSection("tips")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {conversionRate < 10 && (
              <div className="flex items-start gap-2 mb-2">
                <div className="bg-red-500/20 p-1.5 rounded-lg mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-white/80 font-medium">
                  <span className="text-red-500 font-extrabold">Critical:</span> You're missing {lostProspects} potential
                  clients. Focus on improving your follow-up process immediately.
                </p>
              </div>
            )}
            <p className="text-xs text-white/60 font-medium">
              {conversionRate < 5
                ? "Immediate action required. Review your presentation and client experience to avoid significant client loss."
                : conversionRate < 10
                  ? "Your conversion rate needs attention. Consider implementing a structured follow-up system."
                  : conversionRate < 15
                    ? "You're performing well, but there's room to capture more of the prospects who attend."
                    : "Excellent conversion rate! Consider scaling your marketing to reach more qualified prospects."}
            </p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
