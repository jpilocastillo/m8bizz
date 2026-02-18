"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

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
  benefits?: string[]
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
      primary: "bg-gray-500",
      secondary: "bg-gray-600",
      text: "text-gray-400",
      light: "bg-gray-500/10",
      border: "border-gray-500/20",
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

  const colorClasses = colorVariants[color] || colorVariants.blue

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className="bg-m8bs-card rounded-lg overflow-hidden shadow-sm relative"
      >
        <CardHeader className="bg-m8bs-card px-4 py-2">
          <CardTitle className="text-base font-extrabold text-white flex items-center tracking-tight">
            <div className={`p-1 rounded-lg mr-2 ${colorClasses.light}`}>{icon}</div>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3">
          <div className="flex flex-col">
            {/* Main count with animation */}
            <div className="flex items-center justify-center mb-2 relative">
              <div className="relative">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
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
                  <span className="text-3xl font-extrabold tracking-tight text-white">{animatedCount.toLocaleString()}</span>
                  <span className={`text-xs font-medium ${colorClasses.text}`}>{
                    title === "AUM Households"
                      ? (animatedCount === 1 ? "Account" : "Accounts")
                      : (animatedCount === 1 ? "Policy" : "Policies")
                  }</span>
                </div>
              </div>
            </div>

            {/* Mini chart */}
            <div className="h-12 mb-2 flex items-end justify-between px-2">
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

            {/* Details section - fixed height for alignment */}
            <div className="min-h-[60px] mb-2 flex flex-col justify-start">
              <div className="space-y-1.5">
                {details
                  .filter(detail => detail.label.toLowerCase() !== 'commission rate')
                  .map((detail, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-white/80 font-medium">{detail.label}</span>
                      <span className="text-white font-extrabold">{detail.value}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Benefits section */}
            {benefits && benefits.length > 0 && (
              <div className="space-y-2 mt-auto">
                <h4 className={`text-xs uppercase font-semibold ${colorClasses.text} mb-2`}>Key Benefits</h4>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 ${colorClasses.text}`} />
                    <span className="text-white/80 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
