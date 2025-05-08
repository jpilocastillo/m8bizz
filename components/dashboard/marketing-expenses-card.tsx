"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { ProgressBar } from "./progress-bar"

interface MarketingExpensesCardProps {
  advertising: number
  foodVenue: number
}

export function MarketingExpensesCard({ advertising, foodVenue }: MarketingExpensesCardProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [isCardHovered, setIsCardHovered] = useState(false)

  const total = advertising + foodVenue
  const advertisingPercentage = (advertising / total) * 100
  const foodVenuePercentage = (foodVenue / total) * 100

  return (
    <Card
      className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30 group"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-m8bs-card-alt group-hover:to-emerald-900/30">
        <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-300 group-hover:to-emerald-100">
          <DollarSign className="mr-2 h-5 w-5 text-green-400 transition-all duration-300 group-hover:text-emerald-300 group-hover:rotate-12 group-hover:scale-110" />
          Marketing Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className="flex justify-center mb-8 transition-all duration-500"
          onMouseEnter={() => setHoveredSection("donut")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="relative w-48 h-48 transition-all duration-500 group-hover:scale-105">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1f2937"
                strokeWidth="12"
                className="transition-all duration-500"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${(advertising / total) * 251.2} 251.2`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                className={`transition-all duration-500 ${hoveredSection === "advertising" || hoveredSection === "donut" ? "filter-none" : "opacity-80"}`}
                style={{
                  filter:
                    hoveredSection === "advertising" || hoveredSection === "donut"
                      ? "drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))"
                      : "none",
                }}
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray={`${(foodVenue / total) * 251.2} 251.2`}
                strokeDashoffset={`${-(advertising / total) * 251.2}`}
                transform="rotate(-90 50 50)"
                className={`transition-all duration-500 ${hoveredSection === "foodVenue" || hoveredSection === "donut" ? "filter-none" : "opacity-80"}`}
                style={{
                  filter:
                    hoveredSection === "foodVenue" || hoveredSection === "donut"
                      ? "drop-shadow(0 0 3px rgba(16, 185, 129, 0.5))"
                      : "none",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col transition-all duration-500 group-hover:scale-105">
              <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-emerald-300">
                ${total.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 transition-all duration-300 group-hover:text-gray-300">
                Total Expenses
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div
            className="space-y-2 transition-all duration-300 hover:translate-x-1 rounded-lg p-2 hover:bg-blue-900/10"
            onMouseEnter={() => setHoveredSection("advertising")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 transition-all duration-300 group-hover:animate-pulse"></div>
                <span className="text-sm font-medium text-white transition-all duration-300 group-hover:text-blue-300">
                  Advertising Cost
                </span>
              </div>
              <div className="text-white font-bold transition-all duration-300 group-hover:text-blue-300 group-hover:scale-105">
                ${advertising.toLocaleString()}
              </div>
            </div>
            <ProgressBar
              value={advertisingPercentage}
              maxValue={100}
              color="bg-blue-500"
              height="md"
              className="transition-all duration-500 hover:bg-blue-400 hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <div className="text-xs text-gray-400 text-right transition-all duration-300 group-hover:text-blue-300">
              {advertisingPercentage.toFixed(1)}%
            </div>
          </div>

          <div
            className="space-y-2 transition-all duration-300 hover:translate-x-1 rounded-lg p-2 hover:bg-emerald-900/10"
            onMouseEnter={() => setHoveredSection("foodVenue")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 transition-all duration-300 group-hover:animate-pulse"></div>
                <span className="text-sm font-medium text-white transition-all duration-300 group-hover:text-emerald-300">
                  Food/Venue Cost
                </span>
              </div>
              <div className="text-white font-bold transition-all duration-300 group-hover:text-emerald-300 group-hover:scale-105">
                ${foodVenue.toLocaleString()}
              </div>
            </div>
            <ProgressBar
              value={foodVenuePercentage}
              maxValue={100}
              color="bg-emerald-500"
              height="md"
              className="transition-all duration-500 hover:bg-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            />
            <div className="text-xs text-gray-400 text-right transition-all duration-300 group-hover:text-emerald-300">
              {foodVenuePercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
