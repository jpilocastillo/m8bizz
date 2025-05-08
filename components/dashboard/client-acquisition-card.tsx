"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface ClientAcquisitionCardProps {
  expensePerBuyingUnit: number
  expensePerAppointment: number
  expensePerClient: number
  totalCost: number
}

export function ClientAcquisitionCard({
  expensePerBuyingUnit,
  expensePerAppointment,
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
  const getEfficiencyLevel = (value: number, type: "buyingUnit" | "appointment" | "client") => {
    const thresholds = {
      buyingUnit: { good: 300, average: 500 },
      appointment: { good: 1500, average: 2500 },
      client: { good: 3000, average: 5000 },
    }

    const threshold = thresholds[type]

    if (value <= threshold.good) return { color: "text-green-400" }
    if (value <= threshold.average) return { color: "text-yellow-400" }
    return { color: "text-red-400" }
  }

  const buyingUnitEfficiency = getEfficiencyLevel(expensePerBuyingUnit, "buyingUnit")
  const appointmentEfficiency = getEfficiencyLevel(expensePerAppointment, "appointment")
  const clientEfficiency = getEfficiencyLevel(expensePerClient, "client")

  // Get progress bar color based on section
  const getProgressColor = (section: string) => {
    const isHovered = hoveredSection === section

    switch (section) {
      case "buyingUnit":
        return isHovered ? "bg-purple-400" : "bg-purple-500"
      case "appointment":
        return isHovered ? "bg-blue-400" : "bg-blue-500"
      case "client":
        return isHovered ? "bg-green-400" : "bg-green-500"
      default:
        return "bg-purple-500"
    }
  }

  return (
    <Card
      className={`bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 ${
        isCardHovered ? "shadow-lg shadow-purple-900/20 border-purple-500/30" : ""
      }`}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader
        className={`transition-all duration-300 ${
          isCardHovered ? "bg-gradient-to-r from-m8bs-card-alt to-purple-900/40" : "bg-m8bs-card-alt"
        } border-b border-m8bs-border px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={`text-xl font-extrabold tracking-tight transition-all duration-300 ${
              isCardHovered ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-white" : "text-white"
            }`}
          >
            Client Acquisition Cost
          </CardTitle>
          <div
            className={`p-2 rounded-lg transition-all duration-300 ${
              isCardHovered ? "bg-purple-500/30 rotate-12" : "bg-purple-500/20"
            }`}
          >
            <DollarSign
              className={`h-5 w-5 transition-all duration-300 ${
                isCardHovered ? "text-purple-300 scale-110" : "text-purple-400"
              }`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Per Buying Unit */}
          <div
            className={`bg-[#1a1b2e]/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "buyingUnit"
                ? "border-purple-500/60 bg-[#1a1b2e]/80 shadow-md shadow-purple-900/20 transform scale-[1.02]"
                : "border-m8bs-border/30 hover:border-m8bs-border/60"
            }`}
            onMouseEnter={() => setHoveredSection("buyingUnit")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white">Per Buying Unit</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "buyingUnit"
                    ? `${buyingUnitEfficiency.color} scale-110`
                    : buyingUnitEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-2xl font-bold mb-2 transition-all duration-300 ${
                hoveredSection === "buyingUnit" ? "text-purple-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerBuyingUnit)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("buyingUnit")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerBuyingUnit / 1000) * 100)}%`,
                  boxShadow: hoveredSection === "buyingUnit" ? "0 0 8px rgba(168, 85, 247, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Cost per attendee at your event</div>
          </div>

          {/* Per Appointment */}
          <div
            className={`bg-[#1a1b2e]/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "appointment"
                ? "border-blue-500/60 bg-[#1a1b2e]/80 shadow-md shadow-blue-900/20 transform scale-[1.02]"
                : "border-m8bs-border/30 hover:border-m8bs-border/60"
            }`}
            onMouseEnter={() => setHoveredSection("appointment")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white">Per Appointment</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "appointment"
                    ? `${appointmentEfficiency.color} scale-110`
                    : appointmentEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-2xl font-bold mb-2 transition-all duration-300 ${
                hoveredSection === "appointment" ? "text-blue-300" : "text-white"
              }`}
            >
              {formatCurrency(expensePerAppointment)}
            </div>
            <div className="h-2 bg-[#1f2037] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor("appointment")} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (expensePerAppointment / 5000) * 100)}%`,
                  boxShadow: hoveredSection === "appointment" ? "0 0 8px rgba(59, 130, 246, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Cost per scheduled appointment</div>
          </div>

          {/* Per Client */}
          <div
            className={`bg-[#1a1b2e]/50 p-4 rounded-lg border transition-all duration-300 ${
              hoveredSection === "client"
                ? "border-green-500/60 bg-[#1a1b2e]/80 shadow-md shadow-green-900/20 transform scale-[1.02]"
                : "border-m8bs-border/30 hover:border-m8bs-border/60"
            }`}
            onMouseEnter={() => setHoveredSection("client")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white">Per Client</span>
              <span
                className={`text-sm font-medium transition-all duration-300 w-3 h-3 rounded-full ${
                  hoveredSection === "client" ? `${clientEfficiency.color} scale-110` : clientEfficiency.color
                }`}
              ></span>
            </div>
            <div
              className={`text-2xl font-bold mb-2 transition-all duration-300 ${
                hoveredSection === "client" ? "text-green-300" : "text-white"
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
                  boxShadow: hoveredSection === "client" ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
                }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Cost per acquired client</div>
          </div>
        </div>

        <div
          className={`bg-[#1a1b2e]/50 p-4 rounded-lg border transition-all duration-300 ${
            hoveredSection === "total"
              ? "border-purple-500/40 bg-[#1a1b2e]/80 shadow-md shadow-purple-900/10"
              : "border-m8bs-border/30"
          }`}
          onMouseEnter={() => setHoveredSection("total")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium text-white">Total Marketing Cost</span>
            <span
              className={`text-xl font-bold transition-all duration-300 ${
                hoveredSection === "total" ? "text-purple-300" : "text-white"
              }`}
            >
              {formatCurrency(totalCost)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <TrendingDown
                  className={`h-4 w-4 mr-2 transition-all duration-300 ${
                    hoveredSection === "total" ? "text-green-300 scale-110" : "text-green-400"
                  }`}
                />
                <span className="text-gray-400">Cost Efficiency Ratio</span>
              </div>
              <span
                className={`font-medium transition-all duration-300 ${
                  hoveredSection === "total" ? "text-green-300" : "text-white"
                }`}
              >
                {expensePerClient > 0 ? (totalCost / expensePerClient).toFixed(2) : "N/A"}
              </span>
            </div>

            <div className="text-xs text-gray-400">
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
