"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface ClientAcquisitionCardProps {
  expensePerRegistrant: number
  expensePerConfirmation: number
  expensePerAttendee: number
  expensePerClient: number
  totalCost: number
}

export function ClientAcquisitionCard({
  expensePerRegistrant,
  expensePerConfirmation,
  expensePerAttendee,
  expensePerClient,
  totalCost,
}: ClientAcquisitionCardProps) {
  // State for tracking which section is being hovered
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [isCardHovered, setIsCardHovered] = useState(false)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Determine efficiency levels
  const getEfficiencyLevel = (value: number, type: "registrant" | "confirmation" | "attendee" | "client") => {
    const thresholds = {
      registrant: { good: 100, average: 200 },
      confirmation: { good: 200, average: 400 },
      attendee: { good: 300, average: 600 },
      client: { good: 3000, average: 5000 },
    }

    const threshold = thresholds[type]

    if (value <= threshold.good) return { color: "text-green-400" }
    if (value <= threshold.average) return { color: "text-yellow-400" }
    return { color: "text-red-400" }
  }

  const registrantEfficiency = getEfficiencyLevel(expensePerRegistrant, "registrant")
  const confirmationEfficiency = getEfficiencyLevel(expensePerConfirmation, "confirmation")
  const attendeeEfficiency = getEfficiencyLevel(expensePerAttendee, "attendee")
  const clientEfficiency = getEfficiencyLevel(expensePerClient, "client")

  // Get progress bar color based on section
  const getProgressColor = (section: string) => {
    const isHovered = hoveredSection === section

    switch (section) {
      case "registrant":
        return isHovered ? "bg-gray-400" : "bg-gray-500"
      case "confirmation":
        return isHovered ? "bg-emerald-400" : "bg-emerald-500"
      case "attendee":
        return isHovered ? "bg-amber-400" : "bg-amber-500"
      case "client":
        return isHovered ? "bg-purple-400" : "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="bg-m8bs-card rounded-lg overflow-hidden shadow-sm h-full flex flex-col group">
      <CardHeader className="bg-m8bs-card px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
            <DollarSign className="mr-3 h-6 w-6 text-emerald-500" />
            Client Acquisition Costs
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Per Registrant */}
          <div
            className={`bg-m8bs-card/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "registrant"
                ? "border-gray-500/60 bg-m8bs-card/80 shadow-md shadow-gray-900/20 transform scale-[1.02]"
                : "border-transparent"
            }`}
            onMouseEnter={() => setHoveredSection("registrant")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white/80">Per Registrant</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "registrant"
                    ? `${registrantEfficiency.color} scale-110`
                    : registrantEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
                hoveredSection === "registrant" ? "text-gray-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerRegistrant)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("registrant")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerRegistrant / 500) * 100)}%`,
                  boxShadow: hoveredSection === "registrant" ? "0 0 8px rgba(59, 130, 246, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>

          {/* Per Confirmation */}
          <div
            className={`bg-m8bs-card/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "confirmation"
                ? "border-emerald-500/60 bg-m8bs-card/80 shadow-md shadow-emerald-900/20 transform scale-[1.02]"
                : "border-transparent"
            }`}
            onMouseEnter={() => setHoveredSection("confirmation")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white/80">Per Confirmation</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "confirmation"
                    ? `${confirmationEfficiency.color} scale-110`
                    : confirmationEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
                hoveredSection === "confirmation" ? "text-emerald-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerConfirmation)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("confirmation")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerConfirmation / 1000) * 100)}%`,
                  boxShadow: hoveredSection === "confirmation" ? "0 0 8px rgba(16, 185, 129, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>

          {/* Per Attendee */}
          <div
            className={`bg-m8bs-card/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "attendee"
                ? "border-amber-500/60 bg-m8bs-card/80 shadow-md shadow-amber-900/20 transform scale-[1.02]"
                : "border-transparent"
            }`}
            onMouseEnter={() => setHoveredSection("attendee")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white/80">Per Attendee</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "attendee"
                    ? `${attendeeEfficiency.color} scale-110`
                    : attendeeEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
                hoveredSection === "attendee" ? "text-amber-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerAttendee)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("attendee")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerAttendee / 1500) * 100)}%`,
                  boxShadow: hoveredSection === "attendee" ? "0 0 8px rgba(245, 158, 11, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>

          {/* Per Client */}
          <div
            className={`bg-m8bs-card/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "client"
                ? "border-purple-500/60 bg-m8bs-card/80 shadow-md shadow-purple-900/20 transform scale-[1.02]"
                : "border-transparent"
            }`}
            onMouseEnter={() => setHoveredSection("client")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white/80">Per Client</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "client"
                    ? `${clientEfficiency.color} scale-110`
                    : clientEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
                hoveredSection === "client" ? "text-purple-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerClient)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("client")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerClient / 10000) * 100)}%`,
                  boxShadow: hoveredSection === "client" ? "0 0 8px rgba(168, 85, 247, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Total Cost Section */}
        <div
          className={`bg-m8bs-card/50 p-4 rounded-lg border transition-all duration-300 ${
            hoveredSection === "total"
              ? "border-green-500/60 bg-m8bs-card/80 shadow-md shadow-green-900/20 transform scale-[1.02]"
              : "border-m8bs-border/30 hover:border-m8bs-border/60"
          }`}
          onMouseEnter={() => setHoveredSection("total")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white/80">Total Cost</span>
            <span
              className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                hoveredSection === "total" ? "text-green-400 scale-110" : "text-green-400"
              }`}
            ></span>
          </div>
          <div
            className={`text-xl font-extrabold tracking-tight mb-2 transition-all duration-300 ${
              hoveredSection === "total" ? "text-green-300" : "text-white"
            }`}
          >
            {formatCurrency(totalCost)}
          </div>
          <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor("total")} transition-all duration-300`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (totalCost / 50000) * 100)}%`,
                boxShadow: hoveredSection === "total" ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
              }}
              transition={{ duration: 1 }}
            ></motion.div>
          </div>
        </div>

        {/* Efficiency Insights */}
        <div className="mt-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <TrendingDown
                  className={`h-4 w-4 mr-2 transition-all duration-300 ${
                    hoveredSection === "total" ? "text-green-300 scale-110" : "text-green-400"
                  }`}
                />
                <span className="text-white/80 font-medium">Cost Efficiency Ratio</span>
              </div>
              <span
                className={`font-extrabold transition-all duration-300 ${
                  hoveredSection === "total" ? "text-green-300" : "text-white"
                }`}
              >
                {expensePerClient > 0 ? (totalCost / expensePerClient).toFixed(2) : "N/A"}
              </span>
            </div>

            <div className="text-xs text-white/60 font-medium">
              <p>
                {expensePerClient < 3000
                  ? "Your client acquisition cost is highly efficient."
                  : expensePerClient < 5000
                    ? "Your client acquisition cost is within average ranges."
                    : "Your client acquisition cost is higher than expected. Consider optimizing your marketing strategy."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
