"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { AnimatedCounter } from "./animated-counter"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedMetricCardProps {
  title: string
  value: number
  format?: "percent" | "currency" | "number"
  icon?: React.ReactNode
  trend?: {
    direction: "up" | "down" | "neutral"
    value: number
    label?: string
  }
  description?: string
  className?: string
  color?: "blue" | "green" | "purple" | "amber" | "red" | "cyan"
  onClick?: () => void
}

export function EnhancedMetricCard({
  title,
  value,
  format = "number",
  icon,
  trend,
  description,
  className,
  color = "blue",
  onClick,
}: EnhancedMetricCardProps) {
  const formatValue = (val: number) => {
    if (format === "percent") {
      return `${val.toFixed(1)}%`
    } else if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(val)
    } else {
      return val.toLocaleString()
    }
  }

  const colorVariants = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 shadow-blue-500/10",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 shadow-green-500/10",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 shadow-purple-500/10",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 shadow-amber-500/10",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 shadow-red-500/10",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 shadow-cyan-500/10",
  }

  const iconColorVariants = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
  }

  const trendColorVariants = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
          >
            <Card
              className={cn(
                "bg-gradient-to-br border rounded-xl overflow-hidden shadow-lg h-full transition-all duration-300",
                colorVariants[color],
                onClick && "cursor-pointer hover:shadow-xl",
                className,
              )}
              onClick={onClick}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
                  {icon && <div className={cn("p-2 rounded-lg", `bg-${color}-500/10`)}>{icon}</div>}
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    <AnimatedCounter value={value} formatFn={formatValue} duration={1.5} />
                  </div>
                  {trend && (
                    <div className={cn("flex items-center text-sm font-medium", trendColorVariants[trend.direction])}>
                      {trend.direction === "up" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : trend.direction === "down" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : null}
                      <span>{trend.value}%</span>
                    </div>
                  )}
                </div>
                {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
                {trend?.label && <p className="text-xs text-gray-500 mt-1">{trend.label}</p>}
              </CardContent>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800 p-3 max-w-xs">
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm text-gray-300 mt-1">{description}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
