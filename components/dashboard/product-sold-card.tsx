"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { CheckCircle2, Info, TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductDetail {
  label: string
  value: string
}

interface ProductSoldCardProps {
  title: string
  count: number
  icon: React.ReactNode
  color: "blue" | "red" | "green" | "purple" | "amber" | "cyan"
  details: ProductDetail[]
  benefits: string[]
  chartData: number[]
}

export function ProductSoldCard({ title, count, icon, color, details, benefits, chartData }: ProductSoldCardProps) {
  const [animatedCount, setAnimatedCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const duration = 2000
    const frameDuration = 1000 / 60
    const totalFrames = Math.round(duration / frameDuration)
    let frame = 0

    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentCount = Math.floor(count * progress)

      setAnimatedCount(currentCount)

      if (frame === totalFrames) {
        clearInterval(counter)
        setAnimatedCount(count)
      }
    }, frameDuration)

    return () => clearInterval(counter)
  }, [count])

  const colorVariants = {
    blue: {
      primary: "bg-blue-500",
      secondary: "bg-blue-600",
      text: "text-blue-400",
      light: "bg-blue-500/10",
      border: "border-blue-500/20",
      gradient: "from-blue-500/20 to-blue-600/5",
    },
    red: {
      primary: "bg-red-500",
      secondary: "bg-red-600",
      text: "text-red-400",
      light: "bg-red-500/10",
      border: "border-red-500/20",
      gradient: "from-red-500/20 to-red-600/5",
    },
    green: {
      primary: "bg-emerald-500",
      secondary: "bg-emerald-600",
      text: "text-emerald-400",
      light: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/20 to-emerald-600/5",
    },
    purple: {
      primary: "bg-purple-500",
      secondary: "bg-purple-600",
      text: "text-purple-400",
      light: "bg-purple-500/10",
      border: "border-purple-500/20",
      gradient: "from-purple-500/20 to-purple-600/5",
    },
    amber: {
      primary: "bg-amber-500",
      secondary: "bg-amber-600",
      text: "text-amber-400",
      light: "bg-amber-500/10",
      border: "border-amber-500/20",
      gradient: "from-amber-500/20 to-amber-600/5",
    },
    cyan: {
      primary: "bg-cyan-500",
      secondary: "bg-cyan-600",
      text: "text-cyan-400",
      light: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      gradient: "from-cyan-500/20 to-cyan-600/5",
    },
  }

  const colorClasses = colorVariants[color]

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`bg-[#0c0f1f] border-[#1a1f35] rounded-lg overflow-hidden shadow-lg h-full relative bg-gradient-to-br ${colorClasses.gradient}`}
      >
        {/* Decorative elements */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${colorClasses.primary}`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${colorClasses.secondary}`}
        ></div>

        <CardHeader className="bg-[#0c0f1f]/80 border-b border-[#1a1f35] px-4 py-3 backdrop-blur-sm">
          <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight">
            <div className={`p-1.5 rounded-md mr-2 ${colorClasses.light}`}>{icon}</div>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5">
          <div className="flex flex-col h-full">
            {/* Main count with animation */}
            <div className="flex items-center justify-center mb-4 relative">
              <div className="relative">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />

                  {/* Animated progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={color === "blue" ? "#3b82f6" : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="282.6"
                    strokeDashoffset={isHovered ? "0" : "70.65"}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-out"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="282.6"
                      to="0"
                      dur="2s"
                      fill="freeze"
                      calcMode="spline"
                      keySplines="0.42 0 0.58 1"
                    />
                  </circle>

                  {/* Pulse effect */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={color === "blue" ? "#3b82f6" : "#ef4444"}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    className={isHovered ? "animate-ping" : ""}
                  />
                </svg>

                {/* Centered count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{animatedCount}</span>
                  <span className={`text-sm ${colorClasses.text}`}>{animatedCount === 1 ? "Policy" : "Policies"}</span>
                </div>
              </div>
            </div>

            {/* Mini chart */}
            <div className="h-12 mb-4 flex items-end justify-between px-2">
              {chartData.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8, type: "spring" }}
                  className={`w-2 rounded-t-sm ${colorClasses.primary}`}
                ></motion.div>
              ))}
            </div>

            {/* Details section */}
            <div className="space-y-2 mb-4">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{detail.label}</span>
                  <span className="text-white font-medium">{detail.value}</span>
                </div>
              ))}
            </div>

            {/* Benefits section */}
            <div className="space-y-2 mt-auto">
              <h4 className={`text-xs uppercase font-semibold ${colorClasses.text} mb-2`}>Key Benefits</h4>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${colorClasses.text}`} />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Trend indicator */}
            <div className="mt-4 pt-3 border-t border-[#1a1f35] flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <Info className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500">Performance</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-gray-800">
                    <p className="text-sm">Performance compared to previous events</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${colorClasses.text}`} />
                <span className={`text-xs font-medium ${colorClasses.text}`}>+12% vs last event</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
