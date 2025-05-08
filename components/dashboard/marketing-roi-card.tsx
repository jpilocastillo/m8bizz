"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react"

interface MarketingROICardProps {
  roi: number
  totalIncome: number
  totalCost: number
  className?: string
}

export function MarketingROICard({ roi, totalIncome, totalCost, className }: MarketingROICardProps) {
  const [animatedRoi, setAnimatedRoi] = useState(0)

  // Animate ROI on mount and when roi changes
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const startValue = animatedRoi

    const animateRoi = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smoother animation
      const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4)
      const easedProgress = easeOutQuart(progress)

      setAnimatedRoi(Math.floor(startValue + (roi - startValue) * easedProgress))

      if (progress < 1) {
        requestAnimationFrame(animateRoi)
      }
    }

    requestAnimationFrame(animateRoi)
  }, [roi])

  // Calculate profit
  const profit = totalIncome - totalCost
  const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return (
    <Card
      className={`bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-xl h-full transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-700/50 ${className}`}
    >
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-m8bs-card-alt hover:to-purple-900/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-300 hover:to-indigo-400">
            Marketing ROI
          </CardTitle>
          <div className="p-2 rounded-full bg-purple-500/10 transition-all duration-300 hover:bg-purple-500/20 hover:rotate-12 hover:scale-110">
            <TrendingUp className="h-5 w-5 text-purple-400 transition-all duration-300 hover:text-purple-300" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center relative z-10">
          <div className="relative w-48 h-48 mb-6 group/circle">
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border-8 border-m8bs-card-alt opacity-30 transition-all duration-300 group-hover/circle:opacity-50"></div>

            {/* Pulse effect */}
            <div
              className="absolute inset-0 rounded-full border-2 border-purple-400/30 transition-all duration-300 group-hover/circle:border-purple-400/50 group-hover/circle:animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>

            {/* Background circle with subtle pattern */}
            <div className="absolute inset-0 rounded-full bg-m8bs-card-alt/50 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover/circle:bg-m8bs-card-alt/70">
              <div
                className="absolute inset-0 opacity-10 transition-all duration-300 group-hover/circle:opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #a855f7 0%, transparent 40%), radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 40%)",
                }}
              ></div>
            </div>

            {/* Progress circle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {/* Background track */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(15, 23, 42, 0.6)" strokeWidth="4" opacity="0.5" />

              {/* Animated progress */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#roiGradient)"
                strokeWidth="4"
                strokeDasharray={`${Math.min(animatedRoi / 4, 100) * 2.51} 251.2`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
                className="transition-all duration-300 group-hover/circle:filter group-hover/circle:drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]"
              />

              {/* Glow effect */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#roiGradient)"
                strokeWidth="1"
                strokeDasharray={`${Math.min(animatedRoi / 4, 100) * 2.51} 251.2`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
                filter="blur(4px)"
                opacity="0.6"
                className="transition-all duration-300 group-hover/circle:opacity-0.8"
              />

              <defs>
                <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white flex items-center justify-center transition-all duration-300 group-hover/circle:scale-110">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-violet-400">
                    {animatedRoi}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1 transition-colors duration-300 group-hover/circle:text-gray-300">
                  Return on Investment
                </div>
              </div>
            </div>
          </div>

          {/* Metrics at bottom */}
          <div className="grid grid-cols-2 gap-6 w-full mt-2">
            <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-green-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/metric">
              <div className="flex items-center mb-1">
                <DollarSign className="h-4 w-4 text-green-400 mr-1 transition-all duration-300 group-hover/metric:text-green-300 group-hover/metric:rotate-6" />
                <div className="text-sm text-gray-400 transition-colors duration-300 group-hover/metric:text-gray-300">
                  Total Income
                </div>
              </div>
              <div className="text-xl font-bold text-white transition-colors duration-300 group-hover/metric:text-green-300">
                ${totalIncome.toLocaleString()}
              </div>
              <div className="text-xs text-green-400 mt-1 transition-colors duration-300 group-hover/metric:text-green-300">
                +{profitPercentage.toFixed(1)}% profit margin
              </div>
            </div>

            <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-purple-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/metric">
              <div className="flex items-center mb-1">
                <BarChart3 className="h-4 w-4 text-purple-400 mr-1 transition-all duration-300 group-hover/metric:text-purple-300 group-hover/metric:rotate-6" />
                <div className="text-sm text-gray-400 transition-colors duration-300 group-hover/metric:text-gray-300">
                  Total Cost
                </div>
              </div>
              <div className="text-xl font-bold text-white transition-colors duration-300 group-hover/metric:text-purple-300">
                ${totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-purple-400 mt-1 transition-colors duration-300 group-hover/metric:text-purple-300">
                ${profit.toLocaleString()} net profit
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
