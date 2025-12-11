"use client"

import React from "react"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"

interface ThreeDMetricCardProps {
  title: string
  value: number
  format?: "percent" | "currency" | "number"
  icon?: React.ReactNode
  description?: string
  color?: "blue" | "green" | "purple" | "amber" | "red" | "cyan"
  className?: string
}

export function ThreeDMetricCard({
  title,
  value,
  format = "number",
  icon,
  description,
  color = "blue",
  className,
}: ThreeDMetricCardProps) {
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

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { bg: "bg-m8bs-card-alt", icon: "text-m8bs-muted" },
      green: { bg: "bg-green-500/20", icon: "text-green-500" },
      purple: { bg: "bg-purple-500/20", icon: "text-purple-500" },
      amber: { bg: "bg-amber-500/20", icon: "text-amber-500" },
      red: { bg: "bg-red-500/20", icon: "text-red-500" },
      cyan: { bg: "bg-cyan-500/20", icon: "text-cyan-500" },
    }
    return colorMap[color as keyof typeof colorMap] || { bg: "bg-gray-500/20", icon: "text-gray-500" }
  }

  const colorClasses = getColorClasses(color)

  return (
    <Card 
      className={cn("bg-m8bs-card border-m8bs-border rounded-lg text-white shadow-md h-full", className)}
      role="article"
      aria-label={`${title}: ${formatValue(value)}`}
    >
      <CardContent className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/80 font-medium tracking-wide">{title}</span>
          {icon && (
            <div className={`${colorClasses.bg} p-2 rounded-lg`} aria-hidden="true">
              {React.isValidElement(icon) 
                ? React.cloneElement(icon as React.ReactElement, { 
                    className: cn("h-4 w-4", colorClasses.icon)
                  })
                : icon
              }
            </div>
          )}
        </div>
        <div className="text-xl font-extrabold tracking-tight text-white mb-1" aria-label={`Value: ${formatValue(value)}`}>
          <AnimatedCounter value={value} formatFn={formatValue} duration={1.5} />
        </div>
        {description && (
          <div className="text-xs text-white/60 mt-auto font-medium" aria-label={`Additional info: ${description}`}>
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
