"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Percent, Users, TrendingUp, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface ConversionRateIndicatorProps {
  attendees: number
  clients: number
  incomeAssets?: string
}

export function ConversionRateIndicator({
  attendees,
  clients,
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

    // If we can extract a number, use it; otherwise use a default value
    if (!isNaN(value)) {
      return value
    }

    // Default values based on common ranges
    if (assetString.includes("100,000")) return 100000
    if (assetString.includes("250,000")) return 250000
    if (assetString.includes("500,000")) return 500000
    if (assetString.includes("million") || assetString.includes("1M")) return 1000000

    return 100000 // Default fallback
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
    if (rate < 15) return { text: "Good", color: "text-blue-400", bgColor: "bg-blue-500/20" }
    return { text: "Excellent", color: "text-green-400", bgColor: "bg-green-500/20" }
  }

  const performance = getPerformanceLevel(conversionRate)

  // Calculate potential improvement
  const improvedRate = Math.min(conversionRate + 5, 100)
  const improvedClients = Math.round(attendees * (improvedRate / 100))
  const additionalClients = improvedClients - clients

  return (
    <Card
      className={`bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 ${
        isCardHovered ? "shadow-lg shadow-purple-900/20 border-purple-500/30" : ""
      }`}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader
        className={`bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 ${
          isCardHovered ? "bg-gradient-to-r from-m8bs-card-alt to-purple-900/40" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={`text-xl font-extrabold tracking-tight transition-all duration-300 ${
              isCardHovered ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300" : "text-white"
            }`}
          >
            Conversion Rate
          </CardTitle>
          <motion.div
            className={`p-2 rounded-lg ${performance.bgColor} transition-all duration-300`}
            animate={{
              rotate: isCardHovered ? [0, -5, 5, -5, 5, 0] : 0,
              scale: isCardHovered ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <Percent className={`h-5 w-5 ${performance.color}`} />
          </motion.div>
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
              <div className="text-5xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
              <div
                className={`text-sm font-medium ${performance.color} mt-1 transition-all duration-300 ${
                  hoveredSection === "rate" ? "tracking-wider" : ""
                }`}
              >
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
            className={`bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 transition-all duration-300 ${
              hoveredSection === "lost" ? "bg-red-500/30 border-red-400/50 shadow-md shadow-red-900/20" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setHoveredSection("lost")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{
                  rotate: hoveredSection === "lost" ? [0, -5, 5, -5, 0] : 0,
                  scale: hoveredSection === "lost" ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <Users className="h-8 w-8 text-red-400" />
              </motion.div>
              <div>
                <motion.h3
                  className="text-xl font-bold text-white"
                  animate={{
                    scale: hoveredSection === "lost" ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {lostProspects}
                </motion.h3>
                <p className="text-sm text-red-400 font-medium">Lost Prospects</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Missed Opportunities</span>
                <span className="text-xs text-white">{lostProspectsPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, lostProspectsPercentage)}%`,
                    boxShadow: hoveredSection === "lost" ? "0 0 10px rgba(239, 68, 68, 0.7)" : "none",
                  }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              <span className="text-red-400 font-medium">{lostProspects} potential clients</span> walked away without
              converting. Each represents approximately <span className="text-white font-medium">{incomeAssets}</span>{" "}
              in potential assets.
            </p>
          </motion.div>

          {/* Potential improvement */}
          {additionalClients > 0 && (
            <motion.div
              className={`bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 transition-all duration-300 ${
                hoveredSection === "improvement" ? "bg-blue-500/20 border-blue-400/40 shadow-md shadow-blue-900/20" : ""
              }`}
              onMouseEnter={() => setHoveredSection("improvement")}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: hoveredSection === "improvement" ? [0, 0, 10, 0] : 0,
                      scale: hoveredSection === "improvement" ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: hoveredSection === "improvement" ? Number.POSITIVE_INFINITY : 0,
                      repeatDelay: 2,
                    }}
                  >
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </motion.div>
                  <h3 className="text-sm font-medium text-blue-400">Potential Improvement</h3>
                </div>
                <motion.div
                  className="text-sm font-medium text-white flex items-center gap-1"
                  animate={{
                    scale: hoveredSection === "improvement" ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: hoveredSection === "improvement" ? Number.POSITIVE_INFINITY : 0,
                    repeatDelay: 1.5,
                  }}
                >
                  <span>+{additionalClients} clients</span>
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                </motion.div>
              </div>
              <p className="text-xs text-gray-400">
                Improving your conversion rate by just 5% would gain you {additionalClients} additional clients from the
                same number of attendees.
              </p>
            </motion.div>
          )}

          {/* Attendee/client stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <motion.div
              className={`bg-[#1a1b2e] p-3 rounded border border-m8bs-border/20 transition-all duration-300 ${
                hoveredSection === "attendees" ? "bg-[#1d1e33] border-purple-500/30 shadow-sm" : ""
              }`}
              onMouseEnter={() => setHoveredSection("attendees")}
              onMouseLeave={() => setHoveredSection(null)}
              whileHover={{ y: -2 }}
            >
              <div className="text-xs text-gray-400 mb-1">Total Attendees</div>
              <div className="text-lg font-medium text-white">{attendees}</div>
            </motion.div>

            <motion.div
              className={`bg-[#1a1b2e] p-3 rounded border border-m8bs-border/20 transition-all duration-300 ${
                hoveredSection === "clients" ? "bg-[#1d1e33] border-green-500/30 shadow-sm" : ""
              }`}
              onMouseEnter={() => setHoveredSection("clients")}
              onMouseLeave={() => setHoveredSection(null)}
              whileHover={{ y: -2 }}
            >
              <div className="text-xs text-gray-400 mb-1">Total Clients</div>
              <div className="text-lg font-medium text-white">{clients}</div>
            </motion.div>
          </div>

          {/* Improvement tips */}
          <motion.div
            className={`text-xs text-gray-400 mt-2 p-2 rounded transition-all duration-300 ${
              hoveredSection === "tips" ? "bg-[#1a1b2e] border border-m8bs-border/20" : ""
            }`}
            onMouseEnter={() => setHoveredSection("tips")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {conversionRate < 10 && (
              <div className="flex items-start gap-2 mb-2">
                <motion.div
                  animate={{
                    rotate: hoveredSection === "tips" ? [0, -5, 5, -5, 0] : 0,
                    scale: hoveredSection === "tips" ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <p>
                  <span className="text-red-400 font-medium">Critical:</span> You're missing {lostProspects} potential
                  clients. Focus on improving your follow-up process immediately.
                </p>
              </div>
            )}
            <p className={hoveredSection === "tips" ? "text-white transition-colors duration-300" : ""}>
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
