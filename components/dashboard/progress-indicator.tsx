"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ProgressIndicatorProps {
  label: string
  value: number
  maxValue?: number
  color?: "blue" | "green" | "red" | "orange" | "purple"
  showPercentage?: boolean
  className?: string
  valueLabel?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function ProgressIndicator({
  label,
  value,
  maxValue = 100,
  color = "blue",
  showPercentage = true,
  className,
  valueLabel,
  size = "md",
  animated = true,
}: ProgressIndicatorProps) {
  // Ensure value and maxValue are valid numbers
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0
  const safeMaxValue = typeof maxValue === "number" && !isNaN(maxValue) && maxValue > 0 ? maxValue : 100

  // For animation
  const [displayPercentage, setDisplayPercentage] = useState(0)

  // Calculate percentage safely
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMaxValue) * 100))

  // Animate the percentage when it changes
  useEffect(() => {
    if (!animated) {
      setDisplayPercentage(percentage)
      return
    }

    const start = 0
    const end = percentage
    const duration = 1000
    const startTime = performance.now()

    const animateValue = (timestamp: number) => {
      const runtime = timestamp - startTime
      const progress = Math.min(runtime / duration, 1)
      const currentValue = progress * (end - start) + start

      setDisplayPercentage(currentValue)

      if (runtime < duration) {
        requestAnimationFrame(animateValue)
      } else {
        setDisplayPercentage(end)
      }
    }

    requestAnimationFrame(animateValue)
  }, [percentage, animated])

  const colorMap = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
  }

  const bgColorMap = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  }

  const heightMap = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">{label}</span>
        {showPercentage && (
          <span className={cn("font-medium", colorMap[color])}>{valueLabel || `${displayPercentage.toFixed(1)}%`}</span>
        )}
      </div>
      <div className={cn("w-full bg-[#1f2037] rounded-full overflow-hidden", heightMap[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            bgColorMap[color],
            size === "lg" && "shadow-[0_0_10px_rgba(59,130,246,0.5)]",
          )}
          style={{ width: `${displayPercentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={label}
        />
      </div>
    </div>
  )
}
